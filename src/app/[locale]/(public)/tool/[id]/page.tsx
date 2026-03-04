import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ExternalLink } from "lucide-react";

import { ToolDetailHeader } from "@/components/tool-detail/tool-detail-header";
import { ToolDetailStats } from "@/components/tool-detail/tool-detail-stats";
import { ToolDetailTabs } from "@/components/tool-detail/tool-detail-tabs";
import { ToolDetailContent } from "@/components/tool-detail/tool-detail-content";
import { ToolDetailSidebar } from "@/components/tool-detail/tool-detail-sidebar";
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
    take: 5,
    orderBy: { rate: "desc" },
    include: { category: true },
  });

  const title = locale === "en" ? tool.title_en : tool.title_zh;
  const summary = locale === "en" ? tool.summary_en : tool.summary_zh;
  const content = locale === "en" ? tool.content_en : tool.content_zh;
  const categoryName =
    locale === "en" ? tool.category.name_en : tool.category.name_zh;

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
    <div className="bg-background min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 pt-10 animate-in fade-in duration-500">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <ToolDetailHeader 
          tool={tool} 
          locale={locale} 
          title={title} 
          categoryName={categoryName} 
        />

        <ToolDetailStats 
          locale={locale} 
          categoryName={categoryName} 
        />
      </div>

      <ToolDetailTabs locale={locale} />

      <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row gap-12">
        {/* Main Content Column */}
        <div className="flex-1 w-full lg:max-w-none space-y-12">
          
          <AIQuickActions toolName={title} locale={locale} />
          
          <ToolDetailContent 
            locale={locale} 
            tool={tool} 
            content={content} 
            summary={summary} 
          />
          
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
        </div>

        {/* Sidebar Column */}
        <div className="w-full lg:w-[320px] shrink-0">
          <ToolDetailSidebar locale={locale} similarTools={similarTools} />
        </div>
      </div>
    </div>
  );
}
