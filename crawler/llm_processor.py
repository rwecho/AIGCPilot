import os
import json
from openai import OpenAI
from dotenv import load_dotenv

# 加载 .env 文件中的环境变量
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

# --- 配置 DeepSeek (使用 OpenAI v1.0+ 语法) ---
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
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
      "content_zh": "## 功能特性\n- 特性1\n- 特性2\n\n## 使用场景\n- 场景1\n- 场景2\n\n## 专家评价\n这里写一段深入的中文 Markdown 评测...",
      "content_en": "## Key Features\n- Feature 1\n- Feature 2\n\n## Use Cases\n- Case 1\n- Case 2\n\n## Expert Review\nProvide a detailed English Markdown review here..."
    }}
    """
    
    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
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
            "content_zh": f"# {tool_name}\n\n{raw_description}\n\n(AI 解析失败，保留原始描述)",
            "content_en": f"# {tool_name}\n\n{raw_description}\n\n(AI generation failed, raw desc preserved)"
        }
