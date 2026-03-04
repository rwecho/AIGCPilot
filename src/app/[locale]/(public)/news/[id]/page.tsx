import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Calendar, Video } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils/time";

export const revalidate = 300; // 每 5 分钟验证一次缓存
export const preferredRegion = 'sin1';

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, locale } = await params;
  
  const news = await prisma.news.findUnique({
    where: { id },
  });

  if (!news) {
    return { title: "News Not Found" };
  }

  // Use the first 150 characters as the SEO description
  const excerpt = news.content ? news.content.replace(/[#*`_\[\]]/g, '').substring(0, 150) + '...' : news.title;

  return {
    title: `${news.title} | AI News`,
    description: excerpt,
    openGraph: {
      title: news.title,
      description: excerpt,
      type: "article",
      publishedTime: news.createdAt.toISOString(),
      url: `/${locale}/news/${id}`
    },
    twitter: {
      card: "summary_large_image",
      title: news.title,
      description: excerpt,
    }
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { locale, id } = await params;

  const news = await prisma.news.findUnique({
    where: { id },
    include: {
      relatedTools: {
        select: { id: true, title_zh: true, title_en: true, url: true }
      }
    }
  });

  if (!news || news.status !== "PUBLISHED") {
    notFound();
  }

  // Fetch Previous and Next News
  const [prevNews, nextNews, relatedNews] = await Promise.all([
    prisma.news.findFirst({
      where: { status: "PUBLISHED", createdAt: { lt: news.createdAt } },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true }
    }),
    prisma.news.findFirst({
      where: { status: "PUBLISHED", createdAt: { gt: news.createdAt } },
      orderBy: { createdAt: "asc" },
      select: { id: true, title: true }
    }),
    prisma.news.findMany({
      where: { status: "PUBLISHED", id: { not: news.id } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, createdAt: true }
    })
  ]);

  // Generate JSON-LD Structured Data for Google SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://v.0x2a.top/${locale}/news/${id}`
    },
    headline: news.title,
    datePublished: news.createdAt.toISOString(),
    dateModified: news.updatedAt.toISOString(),
    description: news.content ? news.content.replace(/[#*`_\[\]]/g, '').substring(0, 150) + '...' : news.title,
    author: [{
      '@type': 'Organization',
      name: 'AIGCPilot',
      url: 'https://v.0x2a.top'
    }]
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 animate-in fade-in duration-500">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Breadcrumb / Back */}
      <div className="mb-8">
        <Link href={`/${locale}/news`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
           <ArrowLeft className="w-4 h-4 mr-1" />
           {locale === "zh" ? "返回快讯列表" : "Back to News List"}
        </Link>
      </div>

      <article className="space-y-8">
        {/* Header */}
        <header className="space-y-4 border-b pb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-slate-50">
            {news.title}
          </h1>
          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
             <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
               <Calendar className="w-4 h-4" />
               {formatRelativeTime(news.createdAt, locale)}
             </div>
             {news.sourceUrl && (
               <a href={news.sourceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors hover:underline">
                 <ExternalLink className="w-4 h-4" />
                 {locale === "zh" ? "原文链接" : "Source Article"}
               </a>
             )}
          </div>
        </header>

        {/* Dynamic Video Embed for YouTube Sources */}
        {news.sourceUrl?.includes("youtube.com/watch") && (
          <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-lg border">
            <iframe 
              src={`https://www.youtube.com/embed/${new URL(news.sourceUrl).searchParams.get("v")}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        )}

        {/* Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none prose-lg md:prose-xl prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl leading-relaxed">
           {news.content ? (
             <ReactMarkdown>{news.content}</ReactMarkdown>
           ) : (
             <p className="italic text-muted-foreground">Content heavily truncated or missing.</p>
           )}
        </div>

        {/* Related Tools Footer */}
        {news.relatedTools.length > 0 && (
          <footer className="mt-12 pt-8 border-t space-y-4">
             <h3 className="font-bold text-lg">{locale === "zh" ? "相关收录工具" : "Related Indexed Tools"}</h3>
             <div className="flex flex-wrap gap-3">
               {news.relatedTools.map((tool: any) => (
                  <Link href={`/${locale}/tool/${tool.id}`} key={tool.id} className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-lg hover:bg-indigo-100 hover:scale-105 transition-all outline-none font-medium text-sm">
                    {locale === "zh" ? tool.title_zh : tool.title_en}
                    <ExternalLink className="w-3 h-3" />
                  </Link>
               ))}
             </div>
          </footer>
        )}

        {/* Previous / Next Navigation */}
        <nav className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between gap-6">
          {prevNews ? (
             <Link href={`/${locale}/news/${prevNews.id}`} className="group flex-1 flex flex-col items-start gap-1 p-4 rounded-xl border bg-card hover:border-primary/50 transition-colors">
               <span className="text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> {locale === "zh" ? "上一篇" : "Previous"}</span>
               <span className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">{prevNews.title}</span>
             </Link>
          ) : <div className="flex-1" />}
          {nextNews ? (
             <Link href={`/${locale}/news/${nextNews.id}`} className="group flex-1 flex flex-col items-end text-right gap-1 p-4 rounded-xl border bg-card hover:border-primary/50 transition-colors">
               <span className="text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1">{locale === "zh" ? "下一篇" : "Next"} <ArrowLeft className="w-3 h-3 rotate-180" /></span>
               <span className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">{nextNews.title}</span>
             </Link>
          ) : <div className="flex-1" />}
        </nav>

        {/* Related News */}
        {relatedNews.length > 0 && (
          <section className="mt-12 pt-8 border-t space-y-4">
             <h3 className="font-bold text-lg">{locale === "zh" ? "最新资讯" : "More News"}</h3>
             <ul className="space-y-3">
               {relatedNews.map((n: any) => (
                 <li key={n.id}>
                   <Link href={`/${locale}/news/${n.id}`} className="group block">
                     <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                       <span className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1 flex-1">{n.title}</span>
                       <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
                         {new Date(n.createdAt).toLocaleDateString()}
                       </span>
                     </div>
                   </Link>
                 </li>
               ))}
             </ul>
          </section>
        )}
      </article>

    </div>
  );
}
