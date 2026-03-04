import { ExternalLink, Heart, Share, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import Link from "next/link";

interface ToolDetailHeaderProps {
  tool: any; 
  locale: string;
  title: string;
  categoryName: string;
}

export function ToolDetailHeader({ tool, locale, title, categoryName }: ToolDetailHeaderProps) {
  const homeText = locale === "zh" ? "首页" : "Home";
  const productDbText = locale === "zh" ? "AI产品库" : "AI Products";
  
  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumbs */}
      <nav className="text-sm text-muted-foreground flex items-center space-x-2">
        <Link href={`/${locale}`} className="hover:text-primary transition-colors">
          {homeText}
        </Link>
        <span>/</span>
        <Link href={`/${locale}/category`} className="hover:text-primary transition-colors">
          {productDbText}
        </Link>
        <span>/</span>
        <Link href={`/${locale}/category/${tool.category.slug}`} className="hover:text-primary transition-colors">
          {categoryName}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{title}</span>
      </nav>

      {/* Header Content */}
      <div className="flex flex-col md:flex-row items-start gap-6">
        {/* Logo */}
        <div className="relative h-28 w-28 shrink-0 rounded-2xl border bg-white shadow-sm overflow-hidden flex items-center justify-center p-2">
          {tool.logo ? (
            <ProgressiveImage
              src={tool.logo}
              alt={title}
              fill
              className="object-contain"
            />
          ) : (
            <span className="text-muted-foreground font-semibold text-xl">{title.slice(0, 1)}</span>
          )}
        </div>

        {/* Info Area */}
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            <div className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-md text-sm font-semibold">
              <Star className="h-4 w-4 fill-current" />
              <span>{tool.rate.toFixed(1)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-md font-normal bg-muted text-muted-foreground hover:bg-muted">
              {locale === "zh" ? "免费试用" : "Free Trial"}
            </Badge>
            <Badge variant="outline" className="rounded-md font-normal border-border text-foreground">
              {categoryName}
            </Badge>
            <Badge variant="outline" className="rounded-md font-normal border-border text-foreground">
              {locale === "zh" ? "官方网站" : "Official Website"}
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
          <Button variant="outline" size="sm" className="h-10 px-4 flex items-center gap-2 rounded-full border-muted-foreground/20 hover:bg-muted">
            <Heart className="h-4 w-4" />
            <span>{locale === "zh" ? "收藏" : "Save"}</span>
          </Button>
          <Button variant="outline" size="sm" className="h-10 px-4 flex items-center gap-2 rounded-full border-muted-foreground/20 hover:bg-muted">
            <Share className="h-4 w-4" />
            <span>{locale === "zh" ? "分享" : "Share"}</span>
          </Button>
          <Button asChild className="h-10 px-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-md">
            <a href={tool.url} target="_blank" rel="noopener noreferrer">
              <span>{locale === "zh" ? "访问网站" : "Visit Website"}</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
