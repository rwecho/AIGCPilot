import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { NewsCard } from "@/components/news/news-card";
import { NewsSidebar } from "@/components/news/news-sidebar";

export const revalidate = 300; 
export const preferredRegion = 'sin1';

export const metadata: Metadata = {
  title: "AI 快讯 | AIGCPilot",
  description: "每日更新的 AI 行业动态、前沿资讯与开源工具情报。",
};

export default async function NewsPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;

  const newsList = await prisma.news.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 10, // Top 10 per page
    include: {
      relatedTools: {
        select: { id: true, title_zh: true, title_en: true, url: true }
      }
    }
  });

  return (
    <div className="w-full xl:max-w-[1280px] mx-auto py-10 px-4 md:px-8 space-y-8 animate-in fade-in duration-500">
      
      {/* 2-Column Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-10">
        
        {/* Main Content (Left) */}
        <div className="flex flex-col min-w-0">
          <div className="space-y-2 mb-8 border-b pb-4">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {locale === "zh" ? "AI新闻资讯" : "AI News Info"}
            </h1>
          </div>

          <div className="flex flex-col gap-2">
            {newsList.length > 0 ? (
              newsList.map((news) => (
                <NewsCard key={news.id} news={news} locale={locale} />
              ))
            ) : (
              <div className="py-20 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                {locale === "zh" ? "暂无最新快讯，正在抓取中..." : "No news available yet, still fetching..."}
              </div>
            )}
          </div>

          {/* Static Pagination Mockup */}
          {newsList.length > 0 && (
            <div className="mt-10 flex justify-center items-center gap-2">
              <button disabled className="w-10 h-10 flex items-center justify-center rounded border bg-transparent text-gray-400 cursor-not-allowed">
                &lt;
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded border bg-blue-600 text-white font-medium">
                1
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded border bg-white dark:bg-card hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                2
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded border bg-white dark:bg-card hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                3
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded border bg-white dark:bg-card hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                4
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded border bg-white dark:bg-card hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                5
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded border bg-white dark:bg-card hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                6
              </button>
              <span className="w-10 h-10 flex items-center justify-center text-gray-500">
                •••
              </span>
              <button className="w-10 h-10 flex items-center justify-center rounded border bg-white dark:bg-card hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                10
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded border bg-white dark:bg-card hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                &gt;
              </button>
            </div>
          )}
        </div>

        {/* Sidebar (Right) */}
        <NewsSidebar locale={locale} />
        
      </div>
    </div>
  );
}
