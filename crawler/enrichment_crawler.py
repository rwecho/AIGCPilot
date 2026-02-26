import os
import requests
import time
from bs4 import BeautifulSoup
from duckduckgo_search import DDGS
from dotenv import load_dotenv
from main import capture, _download_and_upload_media
from llm_processor import client

CRAWLER_ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(CRAWLER_ENV_PATH)

API_URL = os.getenv("CRAWLER_API_URL")
if API_URL:
    ENRICH_API_URL = API_URL.replace("/tools/inject", "/tools/enrich")
else:
    ENRICH_API_URL = "http://localhost:3000/api/admin/tools/enrich"

API_KEY = os.getenv("API_SECRET_KEY")


def deep_process_homepage(url, tool_name):
    """
    Spins up playwright (or requests) to get the REAL text of the homepage,
    searches the web for news/tutorials,
    then asks DeepSeek to rewrite a perfect, deep curation of the tool.
    """
    print(f"  [Deep Scrape] Fetching actual HTML for {tool_name} at {url}...")
    real_text = ""
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    try:
        r = requests.get(url, headers=headers, timeout=15)
        soup = BeautifulSoup(r.text, 'html.parser')
        
        # Kill noise
        for script in soup(["script", "style", "nav", "footer", "header", "noscript"]):
            script.extract()
            
        real_text = soup.get_text(separator=' ', strip=True)[:2500] # Take first 2500 chars of pure homepage text
    except Exception as e:
        print(f"  [Error] Official HP Scrape failed/timed out: {e}")
        real_text = "Homepage text unavailable. Rely strictly on external search data."
        
    # --- EXTERNAL SEARCH FOR ENRICHMENT ---
    print(f"  [Web Search] Searching external reviews and tutorials for {tool_name}...")
    external_context = ""
    try:
        results = DDGS().text(f"{tool_name} AI tool tutorial OR review OR news", max_results=5)
        for res in results:
            external_context += f"- [{res['title']}]({res['href']}): {res['body']}\n"
    except Exception as e:
        print(f"  [Web Search] DDG search failed: {e}")

    try:
        print(f"  [LLM] Feeding {len(real_text)} chars of HP data + web context to DeepSeek...")
        
        prompt = f"""
        你是一个资深的 AIGC 工具导购与评测专家。我现在给你一个 AI 工具的【官方主页真实文本】以及【全网搜索到的第三方评测和新闻摘要】。
        请你仔细阅读，然后用你的专业词汇，重新帮我撰写该工具的介绍、核心价值、使用场景和优缺点。
        并且利用搜索到的第三方资料，用丰富的 Markdown 格式分别写一段全面的中文和英文深度点评文章(`content_zh` 和 `content_en`)。
        
        工具名称: {tool_name}
        该工具官网提取文本(前2500字):
        {real_text}
        
        全网相关评测与新闻资讯(鸭鸭搜索结果):
        {external_context}
        
        请输出严格的 JSON:
        {{
          "summary_zh": "一句精炼的中文摘要 (35字以内)",
          "summary_en": "One concise English summary (18 words max)",
          "coreValue": "该工具最核心的价值体现，一句话概括",
          "useCases": "适用的人群或商业场景。例如：独立开发者起步、自媒体博主分发",
          "prosCons": "优缺点分析。结合全网搜索结果给出客观评价。例如：功能强大，但社区反映有学习门槛。",
          "content_zh": "用 Markdown 格式输出一段全面的中文工具点评文章 (不少于300字)。必须包含「综合评估」、「常见用例」和「相关教程或延伸资料（如果搜索结果里有提到）」。可以插入加粗或列表。",
          "content_en": "A comprehensive English review article in Markdown format (at least 200 words), translating the essence of the Chinese review. Include 'Overall Assessment', 'Common Use Cases', and 'Related Tutorials/Resources'."
        }}
        """
        
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        import json
        
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
            
        return json.loads(content)
        
    except Exception as e:
        print(f"  [Error] Deep Scrape failed: {e}")
        return None


def run_enrichment_cycle(limit=5):
    print(f"\n--- Starting Data Enrichment Engine (Batch: {limit}) ---")
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    
    try:
        # 1. Fetch stale/incomplete jobs from DB
        r = requests.get(f"{ENRICH_API_URL}?limit={limit}", headers=headers, timeout=10)
        r.raise_for_status()
        data = r.json()
        tools = data.get("tools", [])
        
        if not tools:
            print("No tools currently need enrichment. Database is perfectly healthy.")
            return
            
        print(f"Found {len(tools)} tools needing repair or enrichment.")
        
        for t in tools:
            tool_id = t["id"]
            url = t["url"]
            name = t["title_en"] or t["title_zh"]
            
            print(f"\n-> Healing Tool: {name} (ID: {tool_id})")
            patch_payload = {"id": tool_id}
            
            # --- ACTION A: Health Check ---
            try:
                print(f"  [Health] Pinging {url}...")
                ping = requests.head(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=10, allow_redirects=True)
                if ping.status_code >= 400 and ping.status_code != 403: # 403 is often antibot, don't mark offline immediately
                    print(f"  [Health] URL appears dead (Status: {ping.status_code}). Marking OFFLINE.")
                    patch_payload["status"] = "OFFLINE"
                    # Send early patch and skip further enrichment
                    requests.patch(ENRICH_API_URL, headers=headers, json=patch_payload)
                    continue
            except Exception as e:
                print(f"  [Health] Ping failed ({e}). Marking OFFLINE.")
                patch_payload["status"] = "OFFLINE"
                requests.patch(ENRICH_API_URL, headers=headers, json=patch_payload)
                continue
            
            # --- ACTION B: Screenshot Repair ---
            # Note: TBD integrate playwright from main.py if screenshotUrl is missing.
            if not t.get("screenshotUrl"):
                print("  [Visuals] Missing screenshot. Spinning up headless browser...")
                try:
                    shot_path = capture(url, name)
                    if shot_path:
                        shot_url = _download_and_upload_media(shot_path, "screenshots", ".webp")
                        if shot_url:
                            patch_payload["screenshotUrl"] = shot_url
                            print("  [Visuals] Screenshot repaired and uploaded to R2.")
                except Exception as e:
                     print(f"  [Visuals] Screenshot repair failed: {e}")
                     
            
            # --- ACTION C: Deep LLM Rewrite ---
            # If the tool was scraped from somewhere cheap, it won't have the deep fields. Let's send the spider actually into their homepage.
            llm_repairs = deep_process_homepage(url, name)
            if llm_repairs:
                patch_payload.update(llm_repairs)
                print("  [Rewriting] Success. Applied new deep-curation text.")
                
            # Submit repairs
            if len(patch_payload) > 1: # More than just the ID
                print(f"  [Patching] Updating database for {name}...")
                patch_req = requests.patch(ENRICH_API_URL, headers=headers, json=patch_payload, timeout=10)
                if patch_req.status_code == 200:
                    print(f"  [Success] {name} has been fully healed.")
                else:
                    print(f"  [Error] Patch failed: {patch_req.text}")
            else:
                print("  [Skip] No repairs were necessary or possible.")
            
            time.sleep(5) # Cooldown between tools

    except Exception as e:
        print(f"Enrichment Cycle Failed: {e}")

if __name__ == "__main__":
    run_enrichment_cycle()
