import os
import requests
import json
import time
import re
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
from llm_processor import process_tool_content
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

# --- 全局配置 ---
API_URL = "http://localhost:3000/api/tools"
API_KEY = os.getenv("API_SECRET_KEY", "your-secret-key-for-crawler-auth")
# 硬编码绝对路径，确保在任何环境下都能找到正确文件夹
SCREENSHOT_DIR = "/mnt/extdata/workspace/aigc-portal/public/screenshots"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

# 缓存已存在 URL 列表
EXISTING_URLS = set()

def fetch_existing_urls():
    global EXISTING_URLS
    try:
        r = requests.get(f"{API_URL}?urlsOnly=true", timeout=10)
        if r.status_code == 200:
            EXISTING_URLS = set(r.json())
            print(f"Loaded {len(EXISTING_URLS)} existing tools for deduplication.")
    except Exception as e:
        print(f"Could not fetch existing URLs: {e}")

# 分类映射
CAT_MAP = {
    "写作": ("文本写作", "writing"), "绘画": ("图像艺术", "images"), "视频": ("视频创作", "video"),
    "音频": ("音频音乐", "audio"), "对话": ("对话助手", "chat"), "设计": ("商业设计", "design"),
    "办公": ("效率办公", "office"), "编程": ("编程开发", "dev"), "医疗": ("行业应用", "industry"),
    "金融": ("行业应用", "industry"), "学习": ("资源与认证", "resources")
}

def get_standard_cat(text):
    for k, v in CAT_MAP.items():
        if k in text: return v
    return ("热门与资讯", "hot")

def capture(url, name):
    clean_name = re.sub('[^a-zA-Z0-9]', '', name).lower()
    fname = f"{clean_name}_{int(time.time())}.png"
    fpath = os.path.join(SCREENSHOT_DIR, fname)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # 模拟真实的浏览器视口
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()
        try:
            print(f"  Capturing screenshot for: {url}")
            page.goto(url, timeout=60000, wait_until="networkidle")
            # 额外等待渲染
            time.sleep(3)
            page.screenshot(path=fpath)
            
            # 关键：检查文件是否真的生成了
            if os.path.exists(fpath):
                print(f"  Screenshot saved: {fname}")
                return f"/screenshots/{fname}"
            else:
                return None
        except Exception as e:
            print(f"  Screenshot FAIL {url}: {e}")
            return None
        finally:
            browser.close()

def process_one_item(name, url, desc, logo=None, raw_cat=""):
    if url in EXISTING_URLS:
        print(f"Skipping (Exists): {name}")
        return

    print(f"Processing NEW Tool: {name} ({url})")
    ai_info = process_tool_content(desc, name)
    shot = capture(url, name)
    zh_cat, _ = get_standard_cat(raw_cat + name + desc)
    
    payload = {
        **ai_info, "url": url, "logo": logo, "screenshotUrl": shot,
        "rate": 4.9, "region": "Global", "isHot": True,
        "categoryName_zh": zh_cat, "categoryName_en": zh_cat
    }
    
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    try:
        r = requests.post(API_URL, headers=headers, json=payload, timeout=20)
        if r.status_code == 200:
            print(f"✅ Success: {name}")
            EXISTING_URLS.add(url)
        else:
            print(f"❌ API Error {name}: {r.status_code}")
    except Exception as e:
        print(f"❌ Push error {name}: {e}")

# --- 采集引擎 1: AIGC.CN ---
def run_aigc_cn():
    print("\n--- 全量采集 AIGC.CN ---")
    url = "https://www.aigc.cn/"
    r = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
    soup = BeautifulSoup(r.text, 'html.parser')
    
    # 获取首页所有的工具列表
    cards = soup.select(".url-card")
    print(f"Total potential tools found on AIGC.CN: {len(cards)}")
    for card in cards:
        try:
            # 修改选择器以适应 OneNav 主题
            title_el = card.select_one(".item-title, strong, h4")
            if not title_el: continue
            name = title_el.get_text(strip=True)
            
            link_el = card.select_one("a")
            link = link_el.get('data-url') or link_el.get('href') if link_el else None
            if not link or "javascript" in link: continue
            
            desc_el = card.select_one(".item-desc, .xe-content")
            desc = desc_el.get_text(strip=True) if desc_el else f"{name} AI tool"
            
            img_el = card.select_one("img")
            logo = img_el.get('data-src') or img_el.get('src') if img_el else None
            
            # 推入队列处理
            process_one_item(name, link, desc, logo, raw_cat="AIGC_CN")
            time.sleep(2) # 保护 DeepSeek API
        except Exception as e:
            print(f"Card processing error: {e}")

# --- 采集引擎 2: AIGC.IZZI.CN ---
def run_izzi_cn():
    print("\n--- 全量采集 IZZI.CN ---")
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            page.goto("https://aigc.izzi.cn/", timeout=60000)
            
            # --- 自动滚动到底部以加载全量数据 ---
            last_height = page.evaluate("document.body.scrollHeight")
            while True:
                page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                page.wait_for_timeout(2000) # 等待渲染新卡片
                new_height = page.evaluate("document.body.scrollHeight")
                if new_height == last_height: break
                last_height = new_height
                print("Scrolling for more data...")

            cards = page.query_selector_all(".card")
            print(f"Total potential tools found on IZZI.CN: {len(cards)}")
            for card in cards:
                try:
                    name = card.query_selector(".card-title").inner_text()
                    link = card.query_selector("a").get_attribute("href")
                    desc = card.query_selector(".card-text").inner_text() if card.query_selector(".card-text") else ""
                    
                    process_one_item(name, link, desc, raw_cat="IZZI_CN")
                    time.sleep(2)
                except Exception as e:
                    print(f"IZZI tool error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    fetch_existing_urls()
    run_aigc_cn()
    run_izzi_cn()
