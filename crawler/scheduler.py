import schedule
import time
import datetime
from main import fetch_existing_urls, run_aigc_cn, run_izzi_cn
from github_crawler import crawl_github_trending
from news_crawler import crawl_news
from ph_crawler import crawl_producthunt_ai
from enrichment_crawler import run_enrichment_cycle

def job_main_tools_crawler():
    print(f"\n--- [{datetime.datetime.now()}] Running Main Tools Crawler ---")
    fetch_existing_urls()
    run_aigc_cn()
    run_izzi_cn()
    print(f"--- Finished Main Tools Crawler ---")

def job_github_crawler():
    print(f"\n--- [{datetime.datetime.now()}] Running GitHub Trending Crawler ---")
    crawl_github_trending()
    print(f"--- Finished GitHub Trending Crawler ---")

def job_news_crawler():
    print(f"\n--- [{datetime.datetime.now()}] Running AI News Crawler ---")
    crawl_news()
    print(f"--- Finished AI News Crawler ---")

def job_ph_crawler():
    print(f"\n--- [{datetime.datetime.now()}] Running ProductHunt Crawler ---")
    try:
        crawl_producthunt_ai()
    except Exception as e:
        print(f"ProductHunt crawler failed: {e}")
    print(f"--- Finished ProductHunt Crawler ---")

def job_enrich_crawler():
    print(f"\n--- [{datetime.datetime.now()}] Running DB Enrichment Crawler ---")
    try:
        run_enrichment_cycle()
    except Exception as e:
        print(f"Enrichment crawler failed: {e}")
    print(f"--- Finished DB Enrichment Crawler ---")

if __name__ == "__main__":
    print("AIGCPilot Autonomous Scheduler Started.")
    print("1. Main tools crawler runs every 24 hours.")
    print("2. ProductHunt AI crawler runs every 24 hours.")
    print("3. GitHub trending crawler runs every 12 hours.")
    print("4. Enrichment/Healer crawler runs every 6 hours.")
    print("5. News crawler runs every 4 hours.")
    
    # Setup intervals
    schedule.every(24).hours.do(job_main_tools_crawler)
    schedule.every(24).hours.do(job_ph_crawler)
    schedule.every(12).hours.do(job_github_crawler)
    schedule.every(6).hours.do(job_enrich_crawler)
    schedule.every(4).hours.do(job_news_crawler)

    # Immediately run news and premium on startup (optional but helpful for testing)
    job_news_crawler()
    job_ph_crawler()
    job_enrich_crawler()

    # Keep running forever
    try:
        while True:
            schedule.run_pending()
            time.sleep(60) # check every minute
    except KeyboardInterrupt:
        print("\nScheduler stopped.")
