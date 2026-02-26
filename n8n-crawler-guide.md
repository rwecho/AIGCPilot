# 自动化管线搭建指南 (n8n MCP Crawler Workflow)

## 一、系统凭证配置

AIGCPilot 已经为你准备好了安全接收爬虫数据的内部 API 端点。要使用这些 API，你首先需要在你的 `.env` 和 n8n 系统中配置共享密钥。

1. 修改 AIGCPilot 项目的根目录 `.env` 文件，确保包含：
   ```env
   API_SECRET_KEY="your-secret-key-for-crawler-auth"
   ```
2. 在 n8n HTTP Request 节点中，所有向 AIGCPilot 发送的 POST 请求都需要携带同样的 Auth Header：
   - Key: `Authorization`
   - Value: `Bearer your-secret-key-for-crawler-auth`

---

## 二、端点 1：推送收录工具 (`/api/admin/tools/inject`)

用于接收大模型（如 DeepSeek/Claude）解析过的新工具数据。如果评分（`aiScore`）低于 7 分，工具会自动进入 "PENDING"（草稿箱）状态供管理员人工审核。

**请求头 (Headers):**
- Authorization: Bearer <API_SECRET_KEY>
- Content-Type: application/json

**请求体格式 (JSON Body):**
```json
{
  "title_zh": "Next.js AI 工具模板",
  "title_en": "Next.js AI Starter",
  "url": "https://github.com/example/ai-starter",
  "summary_zh": "这是一个用于快速启动 AI 项目的模板工具。",
  "summary_en": "A template tool for fast AI project bootstrapping.",
  "coreValue": "通过整合全生命周期组件，将开发 AI 原生应用的时间从三周缩短至两小时。",
  "useCases": "独立开发者起步、企业内部效能工具、黑客松快速 MVP。",
  "prosCons": "优点：开箱即用、集成顶级资源。缺点：对于不熟悉 React 的人有学习曲线。",
  "categorySlug": "coding",
  "aiScore": 8.5
}
```
*备注：`categorySlug` 必须和数据库中的分类 slug 完全一致（如 `models`, `search`, `coding`, `agents` 等）。*

---

## 三、端点 2：推送行业快讯 (`/api/admin/news/inject`)

用于接收行业内最新的动态新闻，支持直接关联到现有的工具条目。

**请求头 (Headers):** 同上

**请求体格式 (JSON Body):**
```json
{
  "title": "OpenAI 宣布上线 o3 系列推理模型",
  "content": "这是一条长文本 Markdown 内容...阐述 o3 的发布...",
  "sourceUrl": "https://openai.com/news/o3",
  "status": "PUBLISHED",
  "relatedToolUrls": [
    "https://chatgpt.com"
  ]
}
```
*备注：`relatedToolUrls` 是一个由 URL 组成的数组。API 会尝试寻找数据库里匹配该 URL 的工具（比如你存了 ChatGPT），并将这条资讯直接挂靠在该工具的详情页里。*

---

## 四、端点 3：触发健康检查 / 坏链清理 (`/api/admin/system/healthcheck`)

如果你不想配置 Cron，可以每天通过 n8n 触发一次这个 URL 接口。他会自动抽出数据库里最久未被检测的 50 款工具进行 PING。超时或 404 返回的会被标记为 `OFFLINE`。

**请求方式**: `POST`
**请求头**: 同上。没有 Body 负载。

---

## 五、推荐的 n8n 工作流架构

这是一个标准的 “采集 -> 清洗 -> 判别 -> 入库” 的自动化流水线设计：

1. **Trigger (触发器)**: 定时触发器（Schedule Trigger），推荐 `Every 12 hours`。
2. **Fetch (抓取层)**:
   - Node A: `HTTP Request` (GET `https://api.github.com/search/repositories?q=AI+created:>YYYY-MM-DD&sort=stars`)
   - Node B: `RSS Read` (HackerNews Feed)
3. **Parse & Filter (大模型清洗层)**:
   - Node: `AI Agent / Basic LLM Chain` 
   - 载入 `DeepSeek Chat (V3)` 或 `Claude 3.5 Sonnet`。
   - Prompt 设计："你是一个严苛的技术评测员。阅读以下 Github README...提取中文标题、英文标题、核心价值 (coreValue)...如果它只是一个极其简陋的 OpenAI API 套壳 UI，给他打低分（1-4分）。返回 JSON 格式数据。"
4. **Push (注入层)**:
   - Node: `HTTP Request` (POST `https://你的域名/api/admin/tools/inject`)
   - 携带 LLM 吐出的 JSON 变量并使用你的 `API_SECRET_KEY`。
