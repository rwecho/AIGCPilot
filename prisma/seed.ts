import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set. Cannot run prisma seed.");
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const categories = [
    { name_zh: "基座大模型", name_en: "Foundation Models", slug: "models", icon: "Rocket" },
    { name_zh: "AI 搜索", name_en: "AI Search", slug: "search", icon: "Search" },
    { name_zh: "对话助手", name_en: "Chat Assistants", slug: "chat", icon: "MessageSquare" },
    { name_zh: "智能体与工作流", name_en: "Agents & Workflows", slug: "agents", icon: "Briefcase" },
    { name_zh: "文本写作", name_en: "AI Writing", slug: "writing", icon: "PenTool" },
    { name_zh: "图像与设计", name_en: "Images & Design", slug: "images", icon: "ImageIcon" },
    { name_zh: "视频与3D", name_en: "Video & 3D", slug: "video", icon: "Video" },
    { name_zh: "音频音乐", name_en: "Audio & Music", slug: "audio", icon: "Music" },
    { name_zh: "AI 编程", name_en: "AI Coding", slug: "coding", icon: "Code" },
    { name_zh: "效率办公", name_en: "Productivity", slug: "office", icon: "BookOpen" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name_zh: cat.name_zh,
        name_en: cat.name_en,
        icon: cat.icon,
      },
      create: cat,
    });
  }

  // Pre-seed 30+ top-tier tools
  const tools = [
    // --- Foundation Models ---
    {
      title_zh: "DeepSeek",
      title_en: "DeepSeek",
      url: "https://chat.deepseek.com",
      summary_zh: "首屈一指的开源高性价比大模型系列（含 V3, R1 满血版）。",
      summary_en: "Top-tier open-weight models including V3 and R1.",
      categorySlug: "models",
      isHot: true,
      rate: 5.0,
      region: "China"
    },
    {
      title_zh: "ChatGPT",
      title_en: "ChatGPT",
      url: "https://chatgpt.com",
      summary_zh: "OpenAI 的旗舰产品，目前公卫最强大的多模态底座大模型。",
      summary_en: "OpenAI's flagship AI chat model supporting o1, o3, GPT-4o.",
      categorySlug: "models",
      isHot: true,
      rate: 5.0,
      region: "Global"
    },
    {
      title_zh: "Claude",
      title_en: "Claude",
      url: "https://claude.ai",
      summary_zh: "Anthropic 打造的顶级模型，逻辑分析、代码、长文本处理顶尖。",
      summary_en: "Top-tier AI by Anthropic. Excellent at coding and writing.",
      categorySlug: "models",
      isHot: true,
      rate: 5.0,
      region: "Global"
    },
    {
      title_zh: "Gemini",
      title_en: "Gemini",
      url: "https://gemini.google.com",
      summary_zh: "Google 推出的多模态原生大语言模型，反应速度极快。",
      summary_en: "Google's deeply integrated multimodal AI model.",
      categorySlug: "models",
      isHot: true,
      rate: 4.8,
      region: "Global"
    },
    {
      title_zh: "Kimi",
      title_en: "Kimi",
      url: "https://kimi.moonshot.cn",
      summary_zh: "月之暗面推出，专注超长文本处理（支持 200万字）。",
      summary_en: "LLM by Moonshot AI, perfect for mega-long document context.",
      categorySlug: "models",
      isHot: true,
      rate: 4.8,
      region: "China"
    },

    // --- AI Search ---
    {
      title_zh: "Perplexity AI",
      title_en: "Perplexity AI",
      url: "https://www.perplexity.ai",
      summary_zh: "全球体验最佳的 AI 搜索引擎，自带可验证的信息溯源。",
      summary_en: "The best AI search engine with precise source citations.",
      categorySlug: "search",
      isHot: true,
      rate: 5.0,
      region: "Global"
    },
    {
      title_zh: "Devv",
      title_en: "Devv AI",
      url: "https://devv.ai",
      summary_zh: "专为程序员量身定制的新一代 AI 搜索引擎。",
      summary_en: "AI search engine optimized specifically for developers.",
      categorySlug: "search",
      isHot: true,
      rate: 4.9,
      region: "Global"
    },
    {
      title_zh: "Genspark",
      title_en: "Genspark",
      url: "https://www.genspark.ai",
      summary_zh: "能自动生成专属的、结构化研究报告的新生代搜索。",
      summary_en: "AI engine generating custom structured Spark reports.",
      categorySlug: "search",
      isHot: true,
      rate: 4.8,
      region: "Global"
    },

    // --- AI Coding ---
    {
      title_zh: "Cursor",
      title_en: "Cursor",
      url: "https://cursor.sh",
      summary_zh: "最火的 AI 原生代码编辑器，极强的文件级修改支持。",
      summary_en: "The most powerful AI-native code IDE currently.",
      categorySlug: "coding",
      isHot: true,
      rate: 5.0,
      region: "Global"
    },
    {
      title_zh: "Windsurf",
      title_en: "Windsurf",
      url: "https://codeium.com/windsurf",
      summary_zh: "Codeium 发布的智能体优先 IDE，体验直追 Cursor。",
      summary_en: "Agent-first AI IDE by Codeium.",
      categorySlug: "coding",
      isHot: true,
      rate: 4.9,
      region: "Global"
    },
    {
      title_zh: "v0",
      title_en: "v0.dev",
      url: "https://v0.dev",
      summary_zh: "Vercel 出品的通过自然语言生成高复杂度 UI 组件的神器。",
      summary_en: "Generative UI tool by Vercel for React/Tailwind.",
      categorySlug: "coding",
      isHot: true,
      rate: 4.9,
      region: "Global"
    },
    {
      title_zh: "Trae",
      title_en: "Trae",
      url: "https://www.trae.ai",
      summary_zh: "字节跳动出品的免费强力 AI 开发助手 IDE。",
      summary_en: "Next-gen AI IDE by ByteDance.",
      categorySlug: "coding",
      isHot: true,
      rate: 4.8,
      region: "Global"
    },
    {
      title_zh: "Lovable",
      title_en: "Lovable",
      url: "https://lovable.dev",
      summary_zh: "新一代的全栈代码生成和快速原型构建超级平台。",
      summary_en: "Full-stack code generation and prototyping tool.",
      categorySlug: "coding",
      isHot: true,
      rate: 4.9,
      region: "Global"
    },
    {
      title_zh: "Bolt.new",
      title_en: "Bolt.new",
      url: "https://bolt.new",
      summary_zh: "直接在浏览器中构建、启动并部署全栈应用的 AI 工具。",
      summary_en: "Build full-stack apps natively in browser via AI.",
      categorySlug: "coding",
      isHot: true,
      rate: 4.9,
      region: "Global"
    },

    // --- Agents & Workflows ---
    {
      title_zh: "Coze",
      title_en: "Coze",
      url: "https://www.coze.com",
      summary_zh: "字节跳动系 AI Bot/Agent 无代码可视化构建平台。",
      summary_en: "Visual platform for creating powerful AI agents.",
      categorySlug: "agents",
      isHot: true,
      rate: 4.8,
      region: "Global"
    },
    {
      title_zh: "Dify",
      title_en: "Dify",
      url: "https://dify.ai",
      summary_zh: "开源LLM应用开发、编排平台（全球极客最爱）。",
      summary_en: "Open-source deep automation and LLM application orchestrator.",
      categorySlug: "agents",
      isHot: true,
      rate: 4.9,
      region: "Global"
    },
    {
      title_zh: "n8n",
      title_en: "n8n",
      url: "https://n8n.io",
      summary_zh: "开源的自动化工作流，原生支持绝大多数 AI 节点。",
      summary_en: "Advanced AI-centric workflow automation.",
      categorySlug: "agents",
      isHot: true,
      rate: 4.9,
      region: "Global"
    },

    // --- Image & Design ---
    {
      title_zh: "Midjourney",
      title_en: "Midjourney",
      url: "https://www.midjourney.com",
      summary_zh: "效果最震撼、艺术感顶级的 AI 绘画平台。",
      summary_en: "The industry standard for artistic, stunning AI imagery.",
      categorySlug: "images",
      isHot: true,
      rate: 5.0,
      region: "Global"
    },
    {
      title_zh: "FLUX.1 (Black Forest Labs)",
      title_en: "FLUX",
      url: "https://blackforestlabs.ai",
      summary_zh: "目前被认为效果和遵循极强的开源/闭源同体模型生态。",
      summary_en: "High-compliance and gorgeous open-weight art model AI.",
      categorySlug: "images",
      isHot: true,
      rate: 4.9,
      region: "Global"
    },
    {
      title_zh: "Leonardo.ai",
      title_en: "Leonardo Ai",
      url: "https://leonardo.ai",
      summary_zh: "为游戏资产和设计而生的一体机 AI 图像引擎。",
      summary_en: "Complete AI art suite fine-tuned for assets.",
      categorySlug: "images",
      isHot: true,
      rate: 4.8,
      region: "Global"
    },

    // --- Video & 3D ---
    {
      title_zh: "Sora (OpenAI)",
      title_en: "Sora",
      url: "https://openai.com/sora",
      summary_zh: "OpenAI 的世界级超逼真视频生成模型。",
      summary_en: "OpenAI's groundbreaking video generation model.",
      categorySlug: "video",
      isHot: true,
      rate: 5.0,
      region: "Global"
    },
    {
      title_zh: "可灵 (Kling AI)",
      title_en: "Kling AI",
      url: "https://klingai.com",
      summary_zh: "快手推出的电影级物理仿真视频大模型（效果拔群）。",
      summary_en: "Cinema-grade AI video model by Kuaishou.",
      categorySlug: "video",
      isHot: true,
      rate: 4.9,
      region: "Global"
    },
    {
      title_zh: "Runway Gen-3",
      title_en: "Runway ML",
      url: "https://runwayml.com",
      summary_zh: "AI 视频生成行业的先行者，Gen-3 Alpha 效果惊人。",
      summary_en: "Pioneer in creative AI video synthesis.",
      categorySlug: "video",
      isHot: true,
      rate: 4.8,
      region: "Global"
    },
    {
      title_zh: "海螺 AI 视频 (Hailuo)",
      title_en: "MiniMax Video",
      url: "https://hailuoai.com/video",
      summary_zh: "MiniMax 推出的免费且高质感视频模型，极其懂梗。",
      summary_en: "A surprisingly fast and capable Chinese video GenAI.",
      categorySlug: "video",
      isHot: true,
      rate: 4.8,
      region: "China"
    },
    
    // --- Audio & Music ---
    {
      title_zh: "Suno",
      title_en: "Suno AI",
      url: "https://suno.com",
      summary_zh: "最火爆的 AI 音乐生成神器，几秒钟就能生成一首流行歌。",
      summary_en: "Viral AI music creation; make a song in seconds.",
      categorySlug: "audio",
      isHot: true,
      rate: 4.9,
      region: "Global"
    },
    {
      title_zh: "Udio",
      title_en: "Udio",
      url: "https://www.udio.com",
      summary_zh: "另一款殿堂级的音乐生成 AI，音质极其逼真细腻。",
      summary_en: "High-fidelity AI music engine with incredible emotional range.",
      categorySlug: "audio",
      isHot: true,
      rate: 4.9,
      region: "Global"
    },
    {
      title_zh: "十一语 (ElevenLabs)",
      title_en: "ElevenLabs",
      url: "https://elevenlabs.io",
      summary_zh: "全球最顶级的 AI 语音合成（TTS）和克隆工具。",
      summary_en: "The best text-to-speech and voice cloning software.",
      categorySlug: "audio",
      isHot: true,
      rate: 5.0,
      region: "Global"
    },

    // --- Writing ---
    {
      title_zh: "秘塔 AI 写作",
      title_en: "Metaso",
      url: "https://metaso.cn",
      summary_zh: "主攻研究、写作、论文处理的本土 AI 工具集。",
      summary_en: "Profound toolset for research papers and structured writing.",
      categorySlug: "writing",
      isHot: false,
      rate: 4.7,
      region: "China"
    },

    // --- Productivity ---
    {
      title_zh: "Notion AI",
      title_en: "Notion AI",
      url: "https://www.notion.so",
      summary_zh: "将最强的 AI 功能无缝融合入全世界最热门笔记工具。",
      summary_en: "Notion's deeply integrated AI assistant block.",
      categorySlug: "office",
      isHot: true,
      rate: 4.8,
      region: "Global"
    },
    {
      title_zh: "Gamma",
      title_en: "Gamma App",
      url: "https://gamma.app",
      summary_zh: "只用一句话就能排版出极为漂亮的演示文稿（PPT）。",
      summary_en: "Generate beautiful presentation slides magically.",
      categorySlug: "office",
      isHot: true,
      rate: 4.9,
      region: "Global"
    }
  ];

  for (const item of tools) {
    const category = await prisma.category.findUnique({
      where: { slug: item.categorySlug },
    });
    
    if (category) {
      await prisma.tool.upsert({
        where: { url: item.url },
        update: {
          title_zh: item.title_zh,
          title_en: item.title_en,
          summary_zh: item.summary_zh,
          summary_en: item.summary_en,
          categoryId: category.id,
          isHot: item.isHot,
          rate: item.rate,
          region: item.region,
          status: "PUBLISHED"
        },
        create: {
          title_zh: item.title_zh,
          title_en: item.title_en,
          summary_zh: item.summary_zh,
          summary_en: item.summary_en,
          categoryId: category.id,
          url: item.url,
          isHot: item.isHot,
          rate: item.rate,
          region: item.region,
          status: "PUBLISHED"
        }
      });
    }
  }

  console.log("Seed completed with optimized categories and 30 top-tier top-quality tools.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
