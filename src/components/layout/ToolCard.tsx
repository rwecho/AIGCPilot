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
  ArrowRight
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
    <Link 
      href={`/${locale}/tool/${tool.id}`}
      className="group flex flex-col h-full bg-white dark:bg-[#121212] rounded-lg border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 shadow-sm hover:shadow-md p-3"
    >
      <div className="flex items-start gap-3 mb-2">
        {/* Logo */}
        {tool.logo ? (
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-100 dark:border-gray-800 bg-white shadow-sm flex items-center justify-center p-0.5">
            <ProgressiveImage
              src={tool.logo}
              alt={title}
              fill
              sizes="48px"
              className="object-contain rounded-lg"
            />
          </div>
        ) : (
          <div className="h-12 w-12 rounded-lg border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-lg font-bold text-primary shrink-0 uppercase shadow-sm">
            {title.charAt(0)}
          </div>
        )}

        {/* Title & Stats */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="text-sm md:text-[15px] font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-primary transition-colors">
              {title}
            </h3>
            {tool.isHot && (
              <Badge className="bg-[#FF4A4A] hover:bg-[#FF4A4A] text-white border-none px-1 py-0 h-4 text-[9px] shadow-sm rounded uppercase shrink-0 tracking-wider">
                Hot
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium">
             <span className="flex items-center gap-0.5">
               <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
               <span className="text-gray-700 dark:text-gray-300">{tool.rate.toFixed(1)}</span>
             </span>
             <span className="w-0.5 h-0.5 rounded-full bg-gray-300 dark:bg-gray-600" />
             <span className="flex items-center gap-0.5">
               <MapPin className="w-2.5 h-2.5 opacity-70" />
               {tool.region === "CN" ? "国内" : tool.region}
             </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-[12px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed flex-1 mt-1 mb-3">
        {summary || "..."}
      </p>

      {/* Footer */}
      <div className="mt-auto pt-2 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
        <span className="text-[11px] text-primary/80 bg-primary/5 border border-primary/10 px-2 py-0.5 rounded-md font-medium tracking-wide">
          {categoryName}
        </span>
        <span className="text-[11px] text-gray-400 font-medium group-hover:text-primary transition-colors flex items-center">
          {locale === "zh" ? "详情" : "Details"} <ArrowRight className="w-3 h-3 ml-1" />
        </span>
      </div>
    </Link>
  );
}
