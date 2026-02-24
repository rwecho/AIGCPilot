import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Calendar, Tag, Star, MapPin } from "lucide-react"
import { Metadata } from "next"
import { ProgressiveImage } from "@/components/ui/progressive-image"
import { AIQuickActions } from "@/components/layout/AIQuickActions"

interface PageProps {
  params: Promise<{ locale: string, id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, locale } = await params
  const tool = await prisma.tool.findUnique({
    where: { id },
    include: { category: true }
  })

  if (!tool) return { title: "Tool Not Found" }

  const title = locale === 'en' ? tool.title_en : tool.title_zh
  const summary = locale === 'en' ? tool.summary_en : tool.summary_zh
  const categoryName = locale === 'en' ? tool.category.name_en : tool.category.name_zh

  return {
    title: `${title} - AIGCPilot`,
    description: summary || `${title} detailed guide.`,
    keywords: `${title}, ${categoryName}, AI Tools, AIGC`,
  }
}

export default async function ToolDetailPage({ params }: PageProps) {
  const { id, locale } = await params
  const tool = await prisma.tool.findUnique({
    where: { id },
    include: { category: true }
  })

  if (!tool) notFound()

  const title = locale === 'en' ? tool.title_en : tool.title_zh
  const summary = locale === 'en' ? tool.summary_en : tool.summary_zh
  const content = locale === 'en' ? tool.content_en : tool.content_zh
  const categoryName = locale === 'en' ? tool.category.name_en : tool.category.name_zh

  // 构建 JSON-LD 结构化数据
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": title,
    "description": summary,
    "applicationCategory": categoryName,
    "operatingSystem": "Web",
    "url": tool.url,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": tool.rate,
      "ratingCount": "100"
    },
    "author": {
      "@type": "Organization",
      "name": "AIGCPilot"
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8 animate-in fade-in duration-500">
      {/* 插入 JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Tool Info Header */}
      <div className="flex items-start gap-6">
        {tool.logo ? (
          <div className="relative h-20 w-20 shrink-0 rounded-2xl border bg-white p-2 shadow-sm overflow-hidden">
            <ProgressiveImage src={tool.logo} alt="logo" fill className="object-contain" />
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
        <Button size="lg" className="hidden md:flex gap-2" asChild>
          <a href={tool.url} target="_blank" rel="noopener noreferrer">
            {locale === 'zh' ? '立即访问' : 'Visit Now'}
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>

      <p className="text-xl text-muted-foreground leading-relaxed border-l-4 border-primary pl-4 italic">
        {summary}
      </p>

      {/* AI 引导问答卡片 */}
      <AIQuickActions toolName={title} locale={locale} />

      {/* Screenshot */}
      {tool.screenshotUrl && (
        <div className="relative aspect-video rounded-3xl overflow-hidden border shadow-2xl bg-muted">
          <ProgressiveImage 
            src={tool.screenshotUrl} 
            alt={`${title} screenshot`}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="bg-card border rounded-3xl p-8 md:p-12 shadow-sm">
        <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary">
          {content ? (
            <ReactMarkdown>{content}</ReactMarkdown>
          ) : (
            <div className="text-muted-foreground italic py-10 text-center">
              {locale === 'zh' ? '正在撰写中...' : 'Drafting...'}
            </div>
          )}
        </article>
      </div>

      <div className="flex md:hidden justify-center pb-10">
        <Button size="lg" className="w-full gap-2" asChild>
          <a href={tool.url} target="_blank" rel="noopener noreferrer">
            {locale === 'zh' ? '访问官方网站' : 'Visit Website'}
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  )
}
