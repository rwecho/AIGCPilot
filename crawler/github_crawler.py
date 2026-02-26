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

GITHUB_API_URL = "https://api.github.com/search/repositories"

def crawl_github_trending():
    print("\n--- Starting GitHub Open-Source AI Crawler ---")
    
    # Query for repositories created in the last 7 days with >50 stars, topic AI/LLM
    # Date logic could be dynamic, but for simplicity we rely on 'sort=stars&order=desc'
    # and a basic keyword search combined with topics.
    query = "topic:llm OR topic:ai OR topic:generative-ai stars:>50"
    params = {
        "q": query,
        "sort": "updated",
        "order": "desc",
        "per_page": 5 # Fetch top 5 recent updates
    }
    
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "AIGCPilot-Crawler/1.0"
    }
    
    # Add token if available to avoid rate limits
    gh_token = os.getenv("GITHUB_TOKEN")
    if gh_token:
        headers["Authorization"] = f"token {gh_token}"
        
    try:
        r = requests.get(GITHUB_API_URL, headers=headers, params=params, timeout=15)
        if r.status_code != 200:
            print(f"GitHub API Error: {r.status_code} - {r.text}")
            return
            
        data = r.json()
        repos = data.get("items", [])
        print(f"Found {len(repos)} trending AI repositories.")
        
        for repo in repos:
            name = repo.get("name")
            owner = repo.get("owner", {}).get("login")
            full_name = f"{owner}/{name}"
            repo_url = repo.get("html_url")
            desc_en = repo.get("description") or "An open-source AI project."
            
            print(f"Processing Repo: {full_name}")
            
            # Use the existing deepseek brain. It expects text and name.
            ai_info = process_tool_content(desc_en, full_name)
            
            # Ensure github urls go into an open-source or dev category
            payload = {
                **ai_info,
                "url": repo_url,
                "logo": repo.get("owner", {}).get("avatar_url"),
                "region": "Global",
                "categorySlug": "coding", # Default mapped to dev/coding
            }
            
            # Post to Next.js API
            inject_headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
            inject_res = requests.post(API_URL, headers=inject_headers, json=payload, timeout=15)
            
            if inject_res.status_code == 200:
                print(f"✅ Success injected GitHub Tool: {full_name}")
            else:
                print(f"❌ Failed to inject tool: {inject_res.status_code}")
                
            time.sleep(3) # Throttle LLM calls
            
    except Exception as e:
        print(f"Failed to crawl GitHub: {e}")

if __name__ == "__main__":
    crawl_github_trending()
