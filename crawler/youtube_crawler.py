import os
import time
import requests
import feedparser
from dotenv import load_dotenv
from youtube_transcript_api import YouTubeTranscriptApi
from llm_processor import process_youtube_transcript

# Setup Env
CRAWLER_ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(CRAWLER_ENV_PATH)

API_URL = os.getenv("CRAWLER_API_URL")
if API_URL:
    NEWS_API_URL = API_URL.replace("/tools/inject", "/news/inject") # Reuse tool endpoint domain
else:
    NEWS_API_URL = "http://localhost:3000/api/admin/news/inject"

API_KEY = os.getenv("API_SECRET_KEY")

# Proxy setup
http_proxy = os.getenv("HTTP_PROXY") or os.getenv("http_proxy")
https_proxy = os.getenv("HTTPS_PROXY") or os.getenv("https_proxy")

proxies = None
if http_proxy or https_proxy:
    proxies = {}
    if http_proxy: proxies["http"] = http_proxy
    if https_proxy: proxies["https"] = https_proxy

# High signal AI channels (Example: Andrej Karpathy, Two Minute Papers, Yannic Kilcher, OpenAI, etc.)
# You can find the channel_id by viewing the page source of a youtube channel and searching for "channel_id"
YOUTUBE_CHANNELS = {
    "Andrej Karpathy": "UCXUPKJO5MZQN11PqgIvyuvQ",
    "Two Minute Papers": "UCbfYPyITQ-7l4upoX8nvctg",
    "Yannic Kilcher": "UCHmD-oSpV0sNfAUnpYpj8KA",
    "OpenAI": "UCXZCJLdBC09xxGZ6gcdrc6A",
    "Matthew Berman": "UCawZsQWqfGSbCI5yjkdVkTA"
}

def get_channel_rss(channel_id):
    return f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"

def fetch_transcript(video_id):
    try:
        # Tries to get english first, otherwise auto-generated english or chinese
        transcript_list = YouTubeTranscriptApi().list(video_id)
        
        try:
            transcript = transcript_list.find_transcript(['en', 'zh-CN', 'zh-TW', 'zh']).fetch()
        except Exception as transcript_err:
            if "IpBlocked" in str(type(transcript_err)):
                print(f"    [Block Error] YouTube IP ban detected. Please switch your proxy/VPN node: {transcript_err}")
                return None
            
            try:
                # Fallback to translation if it's just a language mismatch
                transcript = transcript_list.find_transcript(['en']).translate('en').fetch()
            except Exception as translate_err:
                print(f"    [Transcript Error] No suitable subtitle track found or translatable: {translate_err}")
                return None
            
        text = " ".join([getattr(t, 'text', '') for t in transcript])
        return text
    except Exception as e:
        if "IpBlocked" in str(type(e)):
            print(f"    [IP Blocked] YouTube has blocked your proxy IP. Switch VPN nodes. ({e})")
        else:
            print(f"    [Transcript Error] Could not fetch subtitles for {video_id}: {e}")
        return None

def crawl_youtube():
    print("\n--- Starting YouTube AI News Crawler ---")
    feedparser.USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    
    # Track to avoid hammering one API endpoint too fast
    for channel_name, channel_id in YOUTUBE_CHANNELS.items():
        feed_url = get_channel_rss(channel_id)
        print(f"\nFetching YouTube RSS: {channel_name} ({feed_url})")
        
        try:
            headers = {"User-Agent": feedparser.USER_AGENT}
            r = requests.get(feed_url, headers=headers, timeout=15, proxies=proxies)
            r.raise_for_status()
            
            feed = feedparser.parse(r.text)
            if not feed.entries:
                print(f"  Empty RSS feed returned for {channel_name}")
                continue

            # Process only the most recent video to save LLM tokens and avoid duplicates
            recent_entry = feed.entries[0]
            video_title = recent_entry.title
            video_link = recent_entry.link
            video_id = recent_entry.yt_videoid
            
            print(f"  > Found latest video: {video_title} (ID: {video_id})")
            
            # Fetch transcript
            print("  > Extracting subtitles...")
            transcript_text = fetch_transcript(video_id)
            
            if not transcript_text:
                print("  > No transcript available. Skipping.")
                continue
                
            print(f"  > Transcript length: {len(transcript_text)} characters. Sending to DeepSeek...")
            
            # LLM Synthesis
            llm_res = process_youtube_transcript(video_title, channel_name, video_link, transcript_text)
            
            # Inject to database
            payload = {
                "title": llm_res.get("title_zh", video_title),
                "content": llm_res.get("content_zh", "Processing failed."),
                "sourceUrl": video_link,
                "status": "PUBLISHED"
            }
            
            headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
            post_res = requests.post(NEWS_API_URL, headers=headers, json=payload, timeout=10)
            
            if post_res.status_code == 200:
                print(f"  ✅ Successfully injected YouTube News: {payload['title']}")
            else:
                print(f"  ❌ Failed to inject news: {post_res.status_code}")
                
        except Exception as e:
            print(f"  ❌ Error processing channel {channel_name}: {e}")
            
        time.sleep(5) # Delay between channels

if __name__ == "__main__":
    crawl_youtube()
