import os
import json
import sys
from openai import OpenAI
from dotenv import load_dotenv

# 加载 .env 文件中的环境变量
CRAWLER_ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")

if not os.path.exists(CRAWLER_ENV_PATH):
    print(f"Startup aborted: crawler env file not found: {CRAWLER_ENV_PATH}")
    sys.exit(1)

load_dotenv(CRAWLER_ENV_PATH)

# --- 配置 DeepSeek (使用 OpenAI v1.0+ 语法) ---
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")

if not DEEPSEEK_API_KEY:
    print("Startup aborted: Missing required environment variable: DEEPSEEK_API_KEY")
    sys.exit(1)

client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url="https://api.deepseek.com")


def process_tool_content(raw_description, tool_name):
    """
    使用 OpenAI 库 (v1.0+) 调用 DeepSeek API。
    """
    print(f"DeepSeek (v1.0+) is analyzing: {tool_name}...")

    prompt = f"""
    你是一个全球领先的 AIGC 工具评测专家。请根据以下工具的基本信息，生成一个标准的 JSON 格式响应。
    
    工具名称: {tool_name}
    原始描述: {raw_description}
    
    输出要求 (严格遵循 JSON 格式):
    {{
      "title_zh": "中文工具名",
      "title_en": "English Tool Name",
      "summary_zh": "一句精炼的中文摘要 (35字以内)",
      "summary_en": "One concise English summary (18 words max)",
      "coreValue": "该工具最核心的价值体现，一句话概括",
      "useCases": "适用的人群或商业场景。例如：独立开发者起步、自媒体博主分发",
      "prosCons": "优缺点分析。例如：优点：功能强大。缺点：有学习门槛，费用昂贵。",
      "aiScore": 8.5,
      "content_zh": "## 功能特性\n- 特性1\n- 特性2\n\n## 专家评价\n这里写一段深入的中文 Markdown 评测...",
      "content_en": "## Key Features\n- Feature 1\n- Feature 2\n\n## Expert Review\nProvide a detailed English Markdown review here..."
    }}
    备注：考虑到你是一个严苛的评测员，请在 aiScore 字段给出一个 1 到 10 的客观评分。大部分普通工具应当在 5-7 分左右。如果是极具创新或者不可替代的神器，再给 8-10分。如果纯粹套壳毫无新意，给 1-4分。
    """

    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content

        # 兼容性处理：如果返回的内容带了 Markdown 代码块
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        return json.loads(content)
    except Exception as e:
        print(f"DeepSeek Processing Error: {e}")
        # 降级方案
        return {
            "title_zh": tool_name,
            "title_en": tool_name,
            "summary_zh": raw_description[:50],
            "summary_en": "AI-powered innovation tool for creative workflows.",
            "coreValue": "暂无",
            "useCases": "通用",
            "prosCons": "待评测",
            "aiScore": 5.0,
            "content_zh": f"# {tool_name}\n\n{raw_description}\n\n(AI 解析失败，保留原始描述)",
            "content_en": f"# {tool_name}\n\n{raw_description}\n\n(AI generation failed, raw desc preserved)",
        }


def process_news_content(title_en, link, description_en="", external_context=""):
    """
    专门处理英文科技快讯的 LLM 函数，结合外部搜索情报，生成 AI 搜索 (GEO) 优化的结构化 Markdown 文章。
    """
    print(f"DeepSeek is deeply analyzing News: {title_en}...")

    prompt = f"""
    你是一个资深的全球 AI 科技专栏作者。请将以下抓取到的新闻线索与全网背景情报结合，撰写一篇高质量的、适合 AI 搜索优化 (GEO) 的【中文科技深度总结】（约 300-500 字）。
    这篇内容将被用于网站的专属新闻详情页，因此需要逻辑严密，并且使用结构化的 Markdown 排版。
    
    原始英文标题: {title_en}
    新闻链接: {link}
    部分线索摘要: {description_en}
    
    全网背景补充情报(鸭鸭外挂搜索结果):
    {external_context}
    
    输出要求 (严格遵循 JSON 格式):
    {{
      "title_zh": "一个极具病毒传播力且包含核心关键字的中文标题（如：Oasis AI：首个完全去中心化的强化学习大模型开源）",
      "content_zh": "这里输出一篇 300-500 字的结构化 Markdown 文章。必须包含以下层次：\n\n## 核心定义\n（前 1-2 段必须非常清晰、直接地定义这个事件或工具是什么，解决了什么问题，非常重要，用于 AI Overview 抓取）\n\n## 关键细节与突破\n（分析到底发生了什么，结合 external_context 的补充细节，使用列表 `<ul>` 提炼要点）\n\n## 行业影响及用例\n（如果是工具，普通人怎么用？如果是大模型，对行业什么影响？）\n\n要求：不要写废话，信息密度必须极高。使用规范的 H2 `##` 标签分割段落，适当加粗重点名词。"
    }}
    """

    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content

        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        return json.loads(content)
    except Exception as e:
        print(f"DeepSeek News Processing Error: {e}")
        return {
            "title_zh": f"[自动翻译失败] {title_en}",
            "content_zh": f"AI 新闻解析失败。原始链接: {link}\n摘要: {description_en}"
        }


def process_youtube_transcript(title_en, channel_name, video_url, transcript_text):
    """
    处理 YouTube 视频的原始字幕，提取核心信息并转化为深度科技新闻/总结文章。
    """
    print(f"DeepSeek is deeply analyzing YouTube Transcript: {title_en} from {channel_name}...")

    # Substring transcript to avoid context window explosion (e.g. max 15000 chars)
    transcript_text = transcript_text[:15000]

    prompt = f"""
    你是一个风格幽默、见解犀利的硅谷资深科技博主（类似 The Verge 或 Marques Brownlee 的文字风格）。请阅读以下 YouTube AI 视频的【原始机器字幕】，从中提取最硬核的技术细节、情报或教程步骤，写一篇引人入胜的【中文科技深度长文】（约 600-800 字）。
    
    视频标题: {title_en}
    频道: {channel_name}
    视频链接: {video_url}
    
    原始字幕:
    {transcript_text}
    
    输出要求 (严格遵循 JSON 格式):
    {{
      "title_zh": "一个极具网感、吸引眼球的中文标题（如：Andrej Karpathy 亲自下场教你写代码！万字硬核笔记）",
      "content_zh": "这里输出一篇 600-800 字的详细文章。必须使用【纯 Markdown】格式，绝对禁止使用任何 HTML 标签（如 <ul>, <li>, <strong> 等）。\n\n必须包含以下要素，并且每个标题前后必须有空行：\n\n## 导语与核心看点\n（用极其口语化、接地气的方式介绍这个视频为什么值得看，不要用“本视频探讨了”这种机器味十足的废话。直接给读者放猛料，介绍最牛逼的点。）\n\n## 硬核细节提炼\n（深入字幕提取具体的数据、算法名词、工具名称或者教程的详细步骤。使用标准的 Markdown 无序列表 `- `。要多写细节，不要泛泛而谈。保留原汁原味的技术深度。）\n\n## 个人神评与行业启发\n（以主观的博主视角，锐评一下这个技术/教程的优缺点，或者是对普通人和开发者的实际建议。语言要犀利、有态度。）\n\n注意：请确保使用 `\\n\\n` 来换行，保证排版在前端可以正确渲染。加粗请使用 `**文本**`，禁止使用 HTML 标签！"
    }}
    """
    
    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "You are a professional AI tech journalist."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content

        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        return json.loads(content, strict=False)
    except Exception as e:
        print(f"DeepSeek YouTube Transcript Error: {e}")
        return {
            "title_zh": f"[视频解析] {title_en}",
            "content_zh": f"This is an automated extraction from YouTube channel {channel_name}.\n\nSource: {video_url}\n\n*Transcript was successfully pulled but the AI abstraction agent timed out or failed.*"
        }
