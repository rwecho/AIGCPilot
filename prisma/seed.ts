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
    {
      name_zh: "热门与资讯",
      name_en: "Hot & News",
      slug: "hot",
      icon: "Rocket",
    },
    {
      name_zh: "文本写作",
      name_en: "AI Writing",
      slug: "writing",
      icon: "PenTool",
    },
    {
      name_zh: "图像艺术",
      name_en: "Visual Arts",
      slug: "images",
      icon: "ImageIcon",
    },
    {
      name_zh: "视频创作",
      name_en: "Video & Animation",
      slug: "video",
      icon: "Video",
    },
    {
      name_zh: "音频音乐",
      name_en: "Audio & Music",
      slug: "audio",
      icon: "Music",
    },
    {
      name_zh: "对话助手",
      name_en: "Chat & Agents",
      slug: "chat",
      icon: "MessageSquare",
    },
    {
      name_zh: "商业设计",
      name_en: "Design & Web",
      slug: "design",
      icon: "Palette",
    },
    {
      name_zh: "效率办公",
      name_en: "Productivity",
      slug: "office",
      icon: "Briefcase",
    },
    { name_zh: "编程开发", name_en: "Coding & Dev", slug: "dev", icon: "Code" },
    {
      name_zh: "行业应用",
      name_en: "Industry Apps",
      slug: "industry",
      icon: "Building2",
    },
    {
      name_zh: "资源与认证",
      name_en: "Prompts & Study",
      slug: "resources",
      icon: "BookOpen",
    },
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

  console.log("Seed completed with optimized categories.");
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
