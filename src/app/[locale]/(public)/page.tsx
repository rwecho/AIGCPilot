import { prisma } from "@/lib/prisma";
import { ToolCard } from "@/components/layout/ToolCard";
import { Newspaper, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

export const revalidate = 3600;
export const preferredRegion = 'sin1'; // 靠近中国大陆的 Vercel 节点 (新加坡)

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function LocalizedHomePage({ params }: PageProps) {
  const { locale } = await params;

  // 直接在服务端获取热门工具
  const tools = await prisma.tool.findMany({
    where: { isHot: true },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  // 如果热门工具为空，则加载最新收录的
  const displayTools =
    tools.length > 0
      ? tools
      : await prisma.tool.findMany({
          include: { category: true },
          orderBy: { createdAt: "desc" },
          take: 30,
        });

  // 抓取最新 3 条新闻展示
  const recentNews = await prisma.news.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <div className="space-y-10">
      
      {/* Latest News Section */}
      {recentNews.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-xl font-bold flex items-center gap-2">
               <div className="bg-primary/10 p-1.5 rounded-md">
                 <Newspaper className="w-5 h-5 text-primary" />
               </div>
              {locale === "zh" ? "行业快讯" : "Latest AI News"}
            </h3>
            <Link href={`/${locale}/news`} className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
              {locale === "zh" ? "阅读全部" : "View All"} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentNews.map(news => (
              <Link href={`/${locale}/news`} key={news.id} className="block group">
                <div className="p-4 rounded-xl border bg-card hover:border-primary/50 hover:shadow-md transition-all h-full flex flex-col justify-between">
                  <h4 className="font-semibold text-sm line-clamp-2 md:line-clamp-3 leading-relaxed group-hover:text-primary transition-colors">{news.title}</h4>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3 font-caveat font-medium">
                    <Clock className="w-3 h-3" />
                    {new Date(news.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Hot Tools Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="text-xl font-bold tracking-tight">
            {locale === "zh" ? "热门推荐" : "Hot Recommendations"}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayTools.length > 0 ? (
            displayTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)
          ) : (
            <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed rounded-xl">
              {locale === "zh" ? "暂无内容" : "No content available"}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
