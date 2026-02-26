import os
import requests
import time
from dotenv import load_dotenv
from llm_processor import process_tool_content

CRAWLER_ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(CRAWLER_ENV_PATH)

API_URL = os.getenv("CRAWLER_API_URL")
if not API_URL:
    API_URL = "http://localhost:3000/api/admin/tools/inject"

API_KEY = os.getenv("API_SECRET_KEY")

# Simple GraphQL endpoint for ProductHunt. No auth token required for basic query (though they heavily rate limit without it, we'll spoof user-agent & stick to homepage lists).
# If block occurs, we fallback to public RSS or a scraper. Usually their public frontend gql is accessible.
PH_GQL_URL = "https://www.producthunt.com/frontend/graphql"

def crawl_producthunt_ai():
    print("\n--- Starting Premium Source: ProductHunt AI Crawler ---")
    
    # We use a known public GQL query structure commonly open to anonymous traffic to get daily lists.
    # To be extremely safe from bot-blocking, we'll grab the standard PH RSS feed which includes top active products of the day.
    # PH Official RSS: https://www.producthunt.com/feed
    
    import feedparser
    feed = feedparser.parse("https://www.producthunt.com/feed")
    
    if not feed.entries:
        print("Empty RSS from ProductHunt.")
        return
        
    ai_entries = []
    # Keywords to filter AI products on PH
    keywords = ["ai", "gpt", "model", "llm", "deepseek", "claude", "generate", "agent"]
    
    for entry in feed.entries:
        desc_lower = entry.get('description', '').lower()
        title_lower = entry.title.lower()
        
        if any(kw in title_lower for kw in keywords) or any(kw in desc_lower for kw in keywords):
            ai_entries.append(entry)
            
    print(f"Found {len(ai_entries)} premium AI products on ProductHunt today.")
    
    for entry in ai_entries[:5]: # Take top 5 to avoid API spamming
        name = entry.title.split("-")[0].strip() if "-" in entry.title else entry.title
        link = entry.link
        desc_raw = entry.get('description', 'A trending AI product from ProductHunt.')
        
        print(f"Processing Premium Tool: {name} | {link}")
        
        # We strip HTML from the description if present
        import re
        clean_desc = re.sub('<[^<]+>', '', desc_raw).strip()
        
        # DeepSeek processes the english abstract
        ai_info = process_tool_content(clean_desc, name)
        
        payload = {
            **ai_info,
            "url": link,
            "region": "Global",
            "categorySlug": "hot", # Let's throw PH into hot or let admin re-categorize in Sandbox
        }
        
        headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
        try:
            r = requests.post(API_URL, headers=headers, json=payload, timeout=15)
            if r.status_code == 200:
                print(f"✅ Auto-Sandboxed: {name} -> PENDING")
            else:
                print(f"❌ Failed to sandbox {name}: {r.status_code}")
        except Exception as e:
            print(f"❌ API Request failed: {e}")
            
        time.sleep(3)

if __name__ == "__main__":
    crawl_producthunt_ai()
