import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Calendar, ExternalLink, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

export const revalidate = 3600;
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
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 font-caveat font-medium">
             <div className="flex items-center gap-1.5">
               <Calendar className="w-4 h-4" />
               <time dateTime={news.createdAt.toISOString()}>
                 {new Date(news.createdAt).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
               </time>
             </div>
             {news.sourceUrl && (
                <a href={news.sourceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  {locale === "zh" ? "新闻源" : "Source"}
                </a>
             )}
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none prose-lg md:prose-xl prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl">
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
               {news.relatedTools.map(tool => (
                  <Link href={`/${locale}/tool/${tool.id}`} key={tool.id} className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-lg hover:bg-indigo-100 hover:scale-105 transition-all outline-none font-medium text-sm">
                    {locale === "zh" ? tool.title_zh : tool.title_en}
                    <ExternalLink className="w-3 h-3" />
                  </Link>
               ))}
             </div>
          </footer>
        )}
      </article>

    </div>
  );
}
