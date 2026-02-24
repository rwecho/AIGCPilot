import { prisma } from "@/lib/prisma"
import { MetadataRoute } from "next"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.aigcpilot.com" // 替换为你的真实域名
  const locales = ["zh", "en"]

  // 1. 获取所有工具
  const tools = await prisma.tool.findMany({
    where: { isDeleted: false, status: "PUBLISHED" },
    select: { id: true, updatedAt: true }
  })

  // 2. 获取所有分类
  const categories = await prisma.category.findMany({
    select: { slug: true }
  })

  const sitemap: MetadataRoute.Sitemap = []

  // 为每个语言生成路径
  for (const locale of locales) {
    // 首页
    sitemap.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    })

    // 分类页
    categories.forEach((cat) => {
      sitemap.push({
        url: `${baseUrl}/${locale}/category/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      })
    })

    // 工具详情页
    tools.forEach((tool) => {
      sitemap.push({
        url: `${baseUrl}/${locale}/tool/${tool.id}`,
        lastModified: tool.updatedAt,
        changeFrequency: "monthly",
        priority: 0.6,
      })
    })
  }

  return sitemap
}
