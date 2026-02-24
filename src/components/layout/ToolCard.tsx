"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, PlayCircle, Star, Info, Globe, MapPin } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ProgressiveImage } from "@/components/ui/progressive-image"

interface Tool {
  id: string
  logo?: string
  title_zh: string
  title_en: string
  summary_zh?: string
  summary_en?: string
  url: string
  screenshotUrl?: string
  videoUrl?: string
  rate: number
  region: string
  isHot: boolean
  category: { name_zh: string, name_en: string }
}

export function ToolCard({ tool }: { tool: Tool }) {
  const params = useParams()
  const locale = (params?.locale as string) || 'zh'
  
  const title = locale === 'zh' ? tool.title_zh : tool.title_en
  const summary = locale === 'zh' ? tool.summary_zh : tool.summary_en
  const categoryName = locale === 'zh' ? tool.category.name_zh : tool.category.name_en

  // 处理没有截图的情况
  const hasScreenshot = tool.screenshotUrl && tool.screenshotUrl.trim() !== ""

  return (
    <Card className="overflow-hidden group hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col h-full bg-card">
      <Link href={`/${locale}/tool/${tool.id}`}>
        <div className="relative aspect-video bg-muted cursor-pointer overflow-hidden">
          {hasScreenshot ? (
            <ProgressiveImage
              src={tool.screenshotUrl!}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10 text-muted-foreground/30 italic text-xs p-6 text-center">
              {locale === 'zh' ? "预览图生成中..." : "Preview Generating..."}
            </div>
          )}
          
          <div className="absolute top-2 left-2 flex gap-2 z-20">
            {tool.isHot && (
              <Badge className="bg-orange-500 hover:bg-orange-600 border-none px-1.5 py-0 h-5 text-[10px] shadow-sm">
                <Star className="h-3 w-3 mr-1 fill-current" />
                HOT
              </Badge>
            )}
            <Badge variant="secondary" className="px-1.5 py-0 h-5 text-[10px] bg-black/50 text-white border-none backdrop-blur-sm shadow-sm">
              <MapPin className="h-2.5 w-2.5 mr-1" />
              {tool.region}
            </Badge>
          </div>
          <div className="absolute bottom-2 right-2 z-20 bg-yellow-400 text-yellow-950 font-bold px-1.5 py-0.5 rounded text-[10px] flex items-center shadow-md">
            {tool.rate.toFixed(1)}
          </div>
        </div>
      </Link>
      
      <CardHeader className="p-4 pb-2 space-y-3">
        <div className="flex items-center gap-3">
          {tool.logo ? (
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border bg-white p-1">
              <ProgressiveImage 
                src={tool.logo} 
                alt="logo" 
                fill
                sizes="40px"
                className="object-contain" 
              />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-xl border bg-muted flex items-center justify-center text-[10px] text-muted-foreground shrink-0">
              Logo
            </div>
          )}
          <div className="flex-1 min-w-0">
            <Link href={`/${locale}/tool/${tool.id}`}>
              <CardTitle className="text-base line-clamp-1 hover:text-primary cursor-pointer transition-colors font-bold tracking-tight">
                {title}
              </CardTitle>
            </Link>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              {categoryName}
            </div>
          </div>
        </div>
        <CardDescription className="line-clamp-2 text-xs min-h-[32px] leading-relaxed">
          {summary || "..."}
        </CardDescription>
      </CardHeader>

      <div className="flex-1" />

      <CardFooter className="p-4 pt-2 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 h-8 text-xs gap-1 font-medium hover:bg-primary/5" asChild>
          <a href={tool.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3 w-3" />
            {locale === 'zh' ? '访问' : 'Visit'}
          </a>
        </Button>
        <Button variant="secondary" size="sm" className="h-8 text-xs gap-1 font-medium" asChild>
          <Link href={`/${locale}/tool/${tool.id}`}>
            <Info className="h-3 w-3" />
            {locale === 'zh' ? '详情' : 'Detail'}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
