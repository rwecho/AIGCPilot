import { MetadataRoute } from 'next';
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Try to use environment variable, fallback to default domain
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://v.0x2a.top';

  // Fetch all published news
  const news = await prisma.news.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' }
  });

  // Fetch all published tools
  const tools = await prisma.tool.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  });

  const newsUrls: MetadataRoute.Sitemap = news.map((n) => ({
    url: `${baseUrl}/zh/news/${n.id}`,
    lastModified: n.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const toolUrls: MetadataRoute.Sitemap = tools.map((t) => ({
    url: `${baseUrl}/zh/tool/${t.id}`,
    lastModified: t.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    {
      url: `${baseUrl}/zh`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/zh/news`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/en/news`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    ...newsUrls,
    ...toolUrls,
  ];
}
