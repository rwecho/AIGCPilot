import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { ToolCard } from "@/components/layout/ToolCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Calendar,
  Tag,
  Star,
  MapPin,
  Clapperboard,
} from "lucide-react";
import { Metadata } from "next";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import { AIQuickActions } from "@/components/layout/AIQuickActions";

export const revalidate = 3600;
export const preferredRegion = 'sin1';

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id, locale } = await params;
  const tool = await prisma.tool.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!tool) return { title: "Tool Not Found" };

  const title = locale === "en" ? tool.title_en : tool.title_zh;
  const summary = locale === "en" ? tool.summary_en : tool.summary_zh;
  const categoryName = locale === "en" ? tool.category.name_en : tool.category.name_zh;

  return {
    title: `${title} - ${categoryName} | 0x2a 导航`,
    description: (tool as any).coreValue || summary || `${title} detailed guide.`,
    keywords: `${title}, ${categoryName}, AI Tools, AIGC`,
  };
}

export default async function ToolDetailPage({ params }: PageProps) {
  const { id, locale } = await params;
  const tool = await prisma.tool.findUnique({
    where: { id },
    include: { 
      category: true,
      news: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        take: 3
      }
    },
  });

  if (!tool) notFound();

  const similarTools = await prisma.tool.findMany({
    where: { categoryId: tool.categoryId, id: { not: tool.id } },
    take: 3,
    orderBy: { rate: "desc" },
    include: { category: true },
  });

  const title = locale === "en" ? tool.title_en : tool.title_zh;
  const summary = locale === "en" ? tool.summary_en : tool.summary_zh;
  const content = locale === "en" ? tool.content_en : tool.content_zh;
  const categoryName =
    locale === "en" ? tool.category.name_en : tool.category.name_zh;

  // 构建 JSON-LD 结构化数据
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: title,
    description: summary,
    applicationCategory: categoryName,
    operatingSystem: "Web",
    url: tool.url,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: tool.rate,
      ratingCount: "100",
    },
    author: {
      "@type": "Organization",
      name: "AIGCPilot",
    },
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8 animate-in fade-in duration-500">
      {/* Breadcrumbs */}
      <nav className="text-sm text-muted-foreground flex items-center space-x-2">
        <a href={`/${locale}`} className="hover:text-primary transition-colors">
          {locale === "zh" ? "首页" : "Home"}
        </a>
        <span>/</span>
        <a href={`/${locale}/category/${tool.category.slug}`} className="hover:text-primary transition-colors">
          {categoryName}
        </a>
        <span>/</span>
        <span className="text-foreground font-medium">{title}</span>
      </nav>

      {/* 插入 JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Tool Info Header */}
      <div className="flex items-start gap-6 rounded-3xl border bg-linear-to-br from-card to-muted/20 p-6 md:p-8 shadow-sm">
        {tool.logo ? (
          <div className="relative h-20 w-20 shrink-0 rounded-2xl border bg-white p-2 shadow-sm overflow-hidden">
            <ProgressiveImage
              src={tool.logo}
              alt="logo"
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <div className="h-20 w-20 rounded-2xl border bg-muted flex items-center justify-center text-muted-foreground text-xs">
            LOGO
          </div>
        )}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Tag className="h-4 w-4" />
            <span>{categoryName}</span>
            <span className="mx-1">•</span>
            <Calendar className="h-4 w-4" />
            <span>{new Date(tool.updatedAt).toLocaleDateString()}</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">{title}</h1>
          <div className="flex items-center gap-4 py-1">
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-bold text-lg">{tool.rate.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <MapPin className="h-4 w-4" />
              <span>{tool.region}</span>
            </div>
          </div>
        </div>
        <Button size="lg" className="hidden md:flex gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5" asChild>
          <a href={tool.url} target="_blank" rel="noopener noreferrer">
            {locale === "zh" ? "立即访问" : "Visit Now"}
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>

      <p className="text-xl text-muted-foreground leading-relaxed border-l-4 border-primary pl-4 italic">
        {summary}
      </p>

      {/* AI 引导问答卡片 */}
      <AIQuickActions toolName={title} locale={locale} />

      {/* Demo Video */}
      {tool.videoUrl && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground/90">
            <Clapperboard className="h-4 w-4 text-primary" />
            {locale === "zh" ? "产品演示视频" : "Product Demo Video"}
          </div>
          <div className="relative aspect-video rounded-3xl overflow-hidden border shadow-2xl bg-black">
            <video
              src={tool.videoUrl}
              poster={tool.screenshotUrl || undefined}
              controls
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
            />
          </div>
        </section>
      )}

      {/* Screenshot */}
      {tool.screenshotUrl && (
        <section className="space-y-3">
          <div className="text-sm font-semibold text-foreground/90">
            {locale === "zh" ? "界面预览" : "Interface Preview"}
          </div>
          <div className="relative aspect-video rounded-3xl overflow-hidden border shadow-2xl bg-muted">
            <ProgressiveImage
              src={tool.screenshotUrl}
              alt={`${title} screenshot`}
              fill
              className="object-cover"
            />
          </div>
        </section>
      )}

      {/* Content */}
      <div className="bg-card border rounded-3xl p-8 md:p-12 shadow-sm">
        <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary">
          {content ? (
            <ReactMarkdown>{content}</ReactMarkdown>
          ) : (
            <div className="text-muted-foreground italic py-10 text-center">
              {locale === "zh" ? "正在撰写中..." : "Drafting..."}
            </div>
          )}
        </article>
      </div>

      <div className="flex md:hidden justify-center pb-10 fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-50">
        <Button size="lg" className="w-full gap-2 rounded-full shadow-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white" asChild>
          <a href={tool.url} target="_blank" rel="noopener noreferrer">
            {locale === "zh" ? "立即访问" : "Visit Website"}
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>

      {/* Related News Section */}
      {tool.news && tool.news.length > 0 && (
        <section className="pt-10 border-t mt-16 mb-8">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>{locale === "zh" ? "相关快讯" : "Related News"}</span>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </h3>
          <div className="space-y-4">
            {tool.news.map((item) => (
              <div key={item.id} className="p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-lg">{item.title}</h4>
                  <time className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </time>
                </div>
                {item.content && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {item.content}
                  </p>
                )}
                {item.sourceUrl && (
                  <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex mt-3 text-xs text-blue-500 hover:text-blue-600 items-center gap-1 font-medium">
                    {locale === "zh" ? "阅读原文" : "Read More"} <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Similar Tools Section */}
      {similarTools.length > 0 && (
        <section className="pt-10 border-t mt-16">
          <h3 className="text-2xl font-bold mb-6">
            {locale === "zh" ? "相关同类工具" : "Similar Tools"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarTools.map((t) => (
              <ToolCard key={t.id} tool={t as any} /> 
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
