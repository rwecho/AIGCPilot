import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

export const revalidate = 3600;

interface ArticlePageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug },
  });

  if (!article || article.status !== "PUBLISHED") {
    return { title: "Not Found" };
  }

  return {
    title: `${article.title} | AIGC Pilot`,
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;

  // Increment view count directly or just fetch
  // Here we just fetch. View count happens via API or we can update directly.
  await prisma.article.update({
    where: { slug },
    data: { viewCount: { increment: 1 } },
  }).catch(() => null);

  const article = await prisma.article.findUnique({
    where: { slug },
  });

  if (!article || article.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <div className="max-w-[850px] mx-auto py-12 px-5 sm:px-8 bg-background">
      <header className="space-y-6 mb-12 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-[40px] font-black tracking-tight leading-tight text-gray-900 dark:text-gray-100">
          {article.title}
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground font-medium">
          {article.author && (
            <span className="flex items-center text-primary bg-primary/10 px-2.5 py-0.5 rounded-md">
              {article.author}
            </span>
          )}
          <span>{new Date(article.createdAt).toLocaleDateString()}</span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {article.viewCount} 阅读
          </span>
        </div>
      </header>
      
      {article.coverImage && (
        <div className="mb-12 rounded-2xl overflow-hidden shadow-md border bg-muted aspect-video relative">
          <img 
            src={article.coverImage} 
            alt={article.title} 
            className="w-full h-full object-cover" 
          />
        </div>
      )}

      <article className="prose prose-lg md:prose-xl dark:prose-invert max-w-none 
          prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900 dark:prose-headings:text-gray-100
          prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-img:rounded-2xl prose-img:shadow-sm prose-img:border
          marker:text-primary prose-li:text-gray-700 dark:prose-li:text-gray-300
          prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:px-6 prose-blockquote:py-2 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
          prose-code:text-emerald-600 dark:prose-code:text-emerald-400 prose-code:bg-emerald-50 dark:prose-code:bg-emerald-900/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none"
      >
        <ReactMarkdown>{article.content}</ReactMarkdown>
      </article>
      
      <div className="mt-16 pt-8 border-t flex justify-center">
        <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-full">
          —— 完 ——
        </div>
      </div>
    </div>
  );
}
