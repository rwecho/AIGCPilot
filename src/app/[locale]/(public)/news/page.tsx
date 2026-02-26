import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { Calendar, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";

export const revalidate = 3600;
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
    take: 50,
    include: {
      relatedTools: {
        select: { id: true, title_zh: true, title_en: true, url: true }
      }
    }
  });

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">
          {locale === "zh" ? "⚡️ 行业快讯" : "⚡️ Latest AI News"}
        </h1>
        <p className="text-muted-foreground text-lg">
          {locale === "zh" 
            ? "追踪最新的大模型发布、GitHub 开源趋势以及工具迭代情报。"
            : "Tracking the latest LLM releases, GitHub open-source trends, and tool updates."}
        </p>
      </div>

      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
        {newsList.length > 0 ? (
          newsList.map((news) => (
            <div key={news.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              
              {/* Timeline dot */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-emerald-500 text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <Calendar className="h-4 w-4" />
              </div>

              {/* Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl shadow-sm border bg-card">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100">{news.title}</div>
                  <time className="font-caveat font-medium text-emerald-500">
                    {new Date(news.createdAt).toLocaleDateString()}
                  </time>
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-sm prose prose-sm dark:prose-invert line-clamp-3 mb-2">
                  {news.content && <ReactMarkdown>{news.content}</ReactMarkdown>}
                </div>
                
                {/* CTA / Read More */}
                <a href={`/${locale}/news/${news.id}`} className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium text-sm hover:underline mt-1 mb-3">
                  {locale === "zh" ? "阅读全文" : "Read Full Article"} <span className="ml-1">→</span>
                </a>
                
                {/* Related Tools / Links */}
                <div className="mt-3 flex flex-col gap-2">
                  {news.sourceUrl && (
                    <a href={news.sourceUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-xs flex items-center gap-1">
                      {locale === "zh" ? "阅读原文" : "Source Link"} <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {news.relatedTools.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {news.relatedTools.map(tool => (
                         <a href={`/${locale}/tool/${tool.id}`} key={tool.id} className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-full hover:bg-indigo-100 transition-colors">
                           {locale === "zh" ? tool.title_zh : tool.title_en} 🔗
                         </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="py-20 text-center text-muted-foreground w-full">
            {locale === "zh" ? "暂无最新快讯，正在抓取中..." : "No news available yet, still fetching..."}
          </div>
        )}
      </div>
    </div>
  );
}
