import os
import requests
import time
import feedparser
from duckduckgo_search import DDGS
from dotenv import load_dotenv
from llm_processor import process_news_content

# Setup Env
CRAWLER_ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(CRAWLER_ENV_PATH)

API_URL = os.getenv("CRAWLER_API_URL")
if API_URL:
    NEWS_API_URL = API_URL.replace("/tools/inject", "/news/inject")
else:
    NEWS_API_URL = "http://localhost:3000/api/admin/news/inject"

API_KEY = os.getenv("API_SECRET_KEY")

# RSS Feeds targeting AI News
RSS_FEEDS = [
    "https://hnrss.org/newest",
    "https://techcrunch.com/category/artificial-intelligence/feed/",
    "https://www.reddit.com/r/artificial/.rss",
    "https://www.reddit.com/r/MachineLearning/.rss"
]

KEYWORDS = ["ai", "llm", "openai", "chatgpt", "deepseek", "claude", "midjourney", "gemini", "anthropic", "llama", "artificial intelligence", "machine learning"]

def crawl_news():
    print("\n--- Starting Multi-Source AI News Crawler ---")
    
    # Reddit and some RSS endpoints block default python user-agents
    feedparser.USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    
    ai_entries = []

    for feed_url in RSS_FEEDS:
        print(f"Fetching RSS: {feed_url}")
        try:
            # Use requests to fetch the content first as feedparser struggles with CDNs/Cloudflare
            headers = {"User-Agent": feedparser.USER_AGENT}
            r = requests.get(feed_url, headers=headers, timeout=15)
            r.raise_for_status()
            
            feed = feedparser.parse(r.text)
            if not feed.entries:
                print(f"  Empty RSS feed returned from {feed_url}")
                continue

            # Filter entries
            for entry in feed.entries:
                title_lower = entry.title.lower()
                if any(kw in title_lower for kw in KEYWORDS):
                    ai_entries.append(entry)
        except Exception as e:
            print(f"  Error fetching {feed_url}: {e}")

    print(f"Found {len(ai_entries)} recent AI-related news items across all sources.")
    
    # Process up to Top 8 items to avoid rate limits but ensure fresh content
    for entry in ai_entries[:8]:
        title_en = entry.title
        link = entry.link
        desc_en = entry.get("description", "")[:200]
        
        print(f"Processing News: {title_en}")
        
        # --- Gather Deep Context via DDGS ---
        print(f"  [Web Search] Gathering deep background info for: {title_en}...")
        external_context = ""
        try:
             # Search for recent news and discussions about this topic
             results = DDGS().text(f"{title_en} AI technology news OR review", max_results=4)
             for res in results:
                 external_context += f"- [{res['title']}]({res['href']}): {res['body']}\n"
        except Exception as e:
             print(f"  [Web Search] DDG search failed: {e}")
             
        # Call deepseek brain with deep context
        llm_res = process_news_content(title_en, link, desc_en, external_context)
        
        payload = {
            "title": llm_res.get("title_zh", title_en),
            "content": llm_res.get("content_zh", f"Source: {link}\n{desc_en}"),
            "sourceUrl": link,
            "status": "PUBLISHED"
        }
        
        headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
        try:
            r = requests.post(NEWS_API_URL, headers=headers, json=payload, timeout=10)
            if r.status_code == 200:
                print(f"✅ Success injected News: {payload['title']}")
            else:
                print(f"❌ Failed to inject news: {r.status_code}")
        except Exception as e:
            print(f"❌ API Request failed: {e}")
            
        time.sleep(3)


if __name__ == "__main__":
    crawl_news()
