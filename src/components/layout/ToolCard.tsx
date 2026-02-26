"use client";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  PlayCircle,
  Star,
  Info,
  MapPin,
  Clapperboard,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ProgressiveImage } from "@/components/ui/progressive-image";

interface Tool {
  id: string;
  logo?: string | null;
  title_zh: string;
  title_en: string;
  summary_zh?: string | null;
  summary_en?: string | null;
  url: string;
  screenshotUrl?: string | null;
  videoUrl?: string | null;
  rate: number;
  region: string;
  isHot: boolean;
  category: { name_zh: string; name_en: string };
}

export function ToolCard({ tool }: { tool: Tool }) {
  const params = useParams();
  const locale = (params?.locale as string) || "zh";

  const title = locale === "zh" ? tool.title_zh : tool.title_en;
  const summary = locale === "zh" ? tool.summary_zh : tool.summary_en;
  const categoryName =
    locale === "zh" ? tool.category.name_zh : tool.category.name_en;

  // 处理没有截图的情况
  const hasScreenshot = tool.screenshotUrl && tool.screenshotUrl.trim() !== "";
  const hasVideo = tool.videoUrl && tool.videoUrl.trim() !== "";

  return (
    <Card className="overflow-hidden group py-0 border-border/60 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-0.5 flex flex-col h-full bg-card/90 backdrop-blur">
      <Link href={`/${locale}/tool/${tool.id}`}>
        <div className="relative aspect-video bg-muted cursor-pointer overflow-hidden">
          {hasVideo ? (
            <video
              src={tool.videoUrl!}
              poster={tool.screenshotUrl || undefined}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              muted
              autoPlay
              loop
              playsInline
              preload="metadata"
            />
          ) : hasScreenshot ? (
            <ProgressiveImage
              src={tool.screenshotUrl!}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-muted to-muted-foreground/10 text-muted-foreground/30 italic text-xs p-6 text-center">
              {locale === "zh" ? "预览图生成中..." : "Preview Generating..."}
            </div>
          )}

          <div className="absolute top-2 left-2 flex gap-2 z-20">
            {tool.isHot && (
              <Badge className="bg-orange-500 hover:bg-orange-600 border-none px-1.5 py-0 h-5 text-[10px] shadow-sm">
                <Star className="h-3 w-3 mr-1 fill-current" />
                HOT
              </Badge>
            )}
            <Badge
              variant="secondary"
              className="px-1.5 py-0 h-5 text-[10px] bg-black/50 text-white border-none backdrop-blur-sm shadow-sm"
            >
              <MapPin className="h-2.5 w-2.5 mr-1" />
              {tool.region}
            </Badge>
          </div>
          <div className="absolute bottom-2 right-2 z-20 bg-yellow-400 text-yellow-950 font-bold px-1.5 py-0.5 rounded text-[10px] flex items-center shadow-md">
            {tool.rate.toFixed(1)}
          </div>

          {hasVideo && (
            <div className="absolute bottom-2 left-2 z-20 rounded-md bg-black/55 text-white text-[10px] px-1.5 py-0.5 backdrop-blur-sm flex items-center gap-1">
              <Clapperboard className="h-3 w-3" />
              {locale === "zh" ? "视频" : "Video"}
            </div>
          )}
        </div>
      </Link>

      <CardHeader className="p-4 pb-2 space-y-4">
        <div className="flex flex-col gap-3">
          {/* Logo and Title block */}
          <div className="flex items-center gap-3">
            {tool.logo ? (
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border bg-white p-0.5">
                <ProgressiveImage
                  src={tool.logo}
                  alt="logo"
                  fill
                  sizes="44px"
                  className="object-contain rounded-full"
                />
              </div>
            ) : (
              <div className="h-11 w-11 rounded-full border bg-muted flex items-center justify-center text-[11px] font-medium text-muted-foreground shrink-0">
                Logo
              </div>
            )}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <Link href={`/${locale}/tool/${tool.id}`}>
                <CardTitle className="text-[15px] line-clamp-1 hover:text-primary cursor-pointer transition-colors font-bold tracking-tight">
                  {title}
                </CardTitle>
              </Link>
              <div className="text-[11px] text-muted-foreground font-medium mt-0.5">
                {categoryName}
              </div>
            </div>
          </div>
          {/* Summary block */}
          <CardDescription className="line-clamp-2 text-xs min-h-[32px] leading-relaxed">
            {summary || "..."}
          </CardDescription>
        </div>
      </CardHeader>

      <div className="flex-1" />

      <CardFooter className="p-4 pt-0 mb-1 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-[3] h-9 text-xs gap-1 font-medium hover:bg-primary/5 rounded-lg"
          asChild
        >
          <a href={tool.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5" />
            {locale === "zh" ? "访问" : "Visit"}
          </a>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-[1.2] h-9 text-xs gap-1 font-medium bg-secondary/60 hover:bg-secondary rounded-lg"
          asChild
        >
          <Link href={`/${locale}/tool/${tool.id}`}>
            {hasVideo ? (
              <PlayCircle className="h-3 w-3" />
            ) : (
              <Info className="h-3 w-3" />
            )}
            {hasVideo
              ? locale === "zh"
                ? "演示"
                : "Demo"
              : locale === "zh"
                ? "详情"
                : "Detail"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
