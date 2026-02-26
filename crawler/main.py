import os
import requests
import time
import re
import mimetypes
import sys
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
from llm_processor import process_tool_content
from dotenv import load_dotenv

try:
    import boto3
except ImportError:
    boto3 = None

CRAWLER_ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")

if not os.path.exists(CRAWLER_ENV_PATH):
    print(f"Startup aborted: crawler env file not found: {CRAWLER_ENV_PATH}")
    sys.exit(1)

load_dotenv(CRAWLER_ENV_PATH)


def _require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


# --- 全局配置 ---
try:
    API_URL = _require_env("CRAWLER_API_URL")
    API_KEY = _require_env("API_SECRET_KEY")

    # Cloudflare R2 (S3 Compatible)
    R2_ENDPOINT_URL = _require_env("R2_ENDPOINT_URL")
    R2_ACCESS_KEY_ID = _require_env("R2_ACCESS_KEY_ID")
    R2_SECRET_ACCESS_KEY = _require_env("R2_SECRET_ACCESS_KEY")
    R2_BUCKET_NAME = _require_env("R2_BUCKET_NAME")
    R2_REGION = _require_env("R2_REGION")
    R2_PUBLIC_URL = _require_env("R2_PUBLIC_URL").rstrip("/")

    if boto3 is None:
        raise RuntimeError(
            "boto3 is required for Cloudflare R2 uploads. Install with: pip install boto3"
        )

    s3 = boto3.client(
        "s3",
        endpoint_url=R2_ENDPOINT_URL,
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
        region_name=R2_REGION,
    )
except RuntimeError as e:
    print(f"Startup aborted: {e}")
    sys.exit(1)

print(f"R2 enabled. Uploading media to bucket: {R2_BUCKET_NAME}")

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
    "写作": ("文本写作", "writing"),
    "绘画": ("图像艺术", "images"),
    "视频": ("视频创作", "video"),
    "音频": ("音频音乐", "audio"),
    "对话": ("对话助手", "chat"),
    "设计": ("商业设计", "design"),
    "办公": ("效率办公", "office"),
    "编程": ("编程开发", "dev"),
    "医疗": ("行业应用", "industry"),
    "金融": ("行业应用", "industry"),
    "学习": ("资源与认证", "resources"),
}


def get_standard_cat(text):
    for k, v in CAT_MAP.items():
        if k in text:
            return v
    return ("热门与资讯", "hot")


def _clean_filename(name: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9_-]", "", name).lower()
    return cleaned[:80] if cleaned else "tool"


def _build_public_url(key: str) -> str:
    return f"{R2_PUBLIC_URL}/{key}"


def _upload_bytes_to_r2(data: bytes, key: str, content_type: str) -> str | None:
    try:
        s3.put_object(
            Bucket=R2_BUCKET_NAME,
            Key=key,
            Body=data,
            ContentType=content_type,
            CacheControl="public, max-age=31536000",
        )
        return _build_public_url(key)
    except Exception as e:
        print(f"  R2 upload failed ({key}): {e}")
        return None


def _download_and_upload_media(
    url: str | None, folder: str, fallback_ext: str = ".bin"
) -> str | None:
    if not url:
        return None

    if R2_PUBLIC_URL and url.startswith(R2_PUBLIC_URL):
        return url

    try:
        resp = requests.get(url, timeout=20, headers={"User-Agent": "Mozilla/5.0"})
        if resp.status_code != 200 or not resp.content:
            print(f"  Skip upload ({url}): status={resp.status_code}")
            return None

        content_type = resp.headers.get(
            "content-type", "application/octet-stream"
        ).split(";")[0]
        ext = mimetypes.guess_extension(content_type) or fallback_ext
        key = f"{folder}/{int(time.time())}_{abs(hash(url))}{ext}"
        uploaded = _upload_bytes_to_r2(resp.content, key, content_type)
        return uploaded
    except Exception as e:
        print(f"  Media download/upload failed ({url}): {e}")
        return None


def capture(url, name):
    clean_name = _clean_filename(name)
    fname = f"{clean_name}_{int(time.time())}.png"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # 模拟真实的浏览器视口
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()
        try:
            print(f"  Capturing screenshot for: {url}")
            page.goto(url, timeout=60000, wait_until="networkidle")
            # 额外等待渲染
            time.sleep(3)
            screenshot_bytes = page.screenshot(type="png")

            r2_key = f"screenshots/{fname}"
            uploaded_url = _upload_bytes_to_r2(screenshot_bytes, r2_key, "image/png")
            if uploaded_url:
                print(f"  Screenshot uploaded to R2: {uploaded_url}")
            return uploaded_url
        except Exception as e:
            print(f"  Screenshot FAIL {url}: {e}")
            return None
        finally:
            browser.close()


def process_one_item(name, url, desc, logo=None, video=None, raw_cat=""):
    if url in EXISTING_URLS:
        print(f"Skipping (Exists): {name}")
        return

    print(f"Processing NEW Tool: {name} ({url})")
    ai_info = process_tool_content(desc, name)
    shot = capture(url, name)
    logo_url = _download_and_upload_media(logo, "logos", ".png")
    video_url = _download_and_upload_media(video, "videos", ".mp4")
    zh_cat, slug = get_standard_cat(raw_cat + name + desc)

    payload = {
        **ai_info,
        "url": url,
        "logo": logo_url,
        "screenshotUrl": shot,
        "videoUrl": video_url,
        "region": "Global",
        "categorySlug": slug,
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
    soup = BeautifulSoup(r.text, "html.parser")

    # 获取首页所有的工具列表
    cards = soup.select(".url-card")
    print(f"Total potential tools found on AIGC.CN: {len(cards)}")
    for card in cards:
        try:
            # 修改选择器以适应 OneNav 主题
            title_el = card.select_one(".item-title, strong, h4")
            if not title_el:
                continue
            name = title_el.get_text(strip=True)

            link_el = card.select_one("a")
            link = link_el.get("data-url") or link_el.get("href") if link_el else None
            if not link or "javascript" in link:
                continue

            desc_el = card.select_one(".item-desc, .xe-content")
            desc = desc_el.get_text(strip=True) if desc_el else f"{name} AI tool"

            img_el = card.select_one("img")
            logo = img_el.get("data-src") or img_el.get("src") if img_el else None

            # 推入队列处理
            process_one_item(name, link, desc, logo, raw_cat="AIGC_CN")
            time.sleep(2)  # 保护 DeepSeek API
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
                page.wait_for_timeout(2000)  # 等待渲染新卡片
                new_height = page.evaluate("document.body.scrollHeight")
                if new_height == last_height:
                    break
                last_height = new_height
                print("Scrolling for more data...")

            cards = page.query_selector_all(".card")
            print(f"Total potential tools found on IZZI.CN: {len(cards)}")
            for card in cards:
                try:
                    name = card.query_selector(".card-title").inner_text()
                    link = card.query_selector("a").get_attribute("href")
                    desc = (
                        card.query_selector(".card-text").inner_text()
                        if card.query_selector(".card-text")
                        else ""
                    )

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
