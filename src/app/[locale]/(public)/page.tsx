import { prisma } from "@/lib/prisma";
import { ToolCard } from "@/components/layout/ToolCard";
import { NewsTicker } from "@/components/layout/NewsTicker";
import { Leaderboard } from "@/components/layout/Leaderboard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Flame, Rocket, Layers } from "lucide-react";
import { TopBanner } from "@/components/home/top-banner";

export const revalidate = 3600;
export const preferredRegion = 'sin1'; 

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function LocalizedHomePage({ params }: PageProps) {
  const { locale } = await params;
  const isZh = locale === "zh";

  // 1. Fetch Top Tools for "Featured/Hot" Grid
  const topTools = await prisma.tool.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { rate: "desc" },
    take: 6,
    include: { category: true }
  });

  // 2. Fetch Latest News for Ticker
  const recentNews = await prisma.news.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  // 4. Fetch Hot Categories for Thematic Rows
  const categories = await prisma.category.findMany({
    where: {
      tools: { some: { status: "PUBLISHED" } }
    },
    take: 5,
    include: {
      tools: {
        where: { status: "PUBLISHED" },
        orderBy: { rate: "desc" },
        take: 12,
        include: { category: true }
      }
    }
  });

  return (
    <>
      <TopBanner />
      
      <div className="flex flex-col lg:flex-row gap-6 relative items-start">
        {/* Main Content Area */}
        <div className="flex-1 space-y-10 lg:space-y-14 min-w-0">
        
        {/* Top Banner: News Ticker */}
        {recentNews.length > 0 && (
          <section className="mb-2">
            <NewsTicker news={recentNews} locale={locale} />
          </section>
        )}

        {/* Hero Section: Featured Tools (4-Column Grid) */}
        <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black tracking-tight flex items-center text-gray-900 dark:text-white">
            <Flame className="w-6 h-6 mr-2 text-orange-500 fill-orange-500" />
            {isZh ? "近期热门推荐" : "Trending Now"}
          </h2>
          <Button variant="ghost" className="text-muted-foreground hover:text-primary font-medium" asChild>
            <Link href={`/${locale}/category/all`}>
              {isZh ? "发现更多" : "Discover More"} <ArrowRight className="w-4 h-4 mr-2" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {topTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* Thematic Category Rows */}
      {categories.map((cat, index) => {
        // Alternate icons for visual interest
        const RowIcon = index === 0 ? Rocket : index === 1 ? Sparkles : Layers;
        const iconColors = ["text-blue-500", "text-emerald-500", "text-purple-500", "text-pink-500", "text-yellow-500"];
        
        return (
          <section key={cat.id} className="pt-6 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl md:text-2xl font-bold tracking-tight flex items-center text-gray-900 dark:text-white">
                <RowIcon className={`w-6 h-6 mr-2 ${iconColors[index % iconColors.length]}`} />
                {isZh ? cat.name_zh : cat.name_en}
              </h3>
              <Button variant="ghost" className="text-muted-foreground hover:text-primary font-medium text-sm" asChild>
                <Link href={`/${locale}/category/${cat.slug}`}>
                  {isZh ? "查看全部" : "View All"} <ArrowRight className="w-4 h-4 mr-2" />
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {cat.tools.length > 0 ? (
                cat.tools.map((tool) => <ToolCard key={tool.id} tool={tool} />)
              ) : (
                <div className="col-span-full py-10 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                  {isZh ? "暂无工具" : "No tools"}
                </div>
              )}
            </div>
          </section>
        )
      })}

        {/* Bottom Promo / Submit Banner */}
        <section className="pt-8 mb-4">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/10 rounded-2xl p-8 md:p-12 text-center md:text-left shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-extrabold text-2xl md:text-3xl mb-3 text-gray-900 dark:text-gray-100 tracking-tight">
                {isZh ? "提交你的优质 AI 产品" : "Submit Your AI Product"}
              </h4>
              <p className="text-base text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed">
                {isZh 
                  ? "让千万用户发现你的优秀 AI 工具和应用。加入我们，获取更多曝光机会。" 
                  : "Let millions of users discover your amazing AI tools and apps. Join us and gain more traction."}
              </p>
            </div>
            <Button size="lg" className="rounded-xl shadow-lg font-bold px-8 bg-[#0066FF] hover:bg-[#0052CC]" asChild>
              <Link href={`/${locale}/submit`}>
                {isZh ? "立即免费发布" : "Submit for Free"} <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </section>

      </div>

      {/* Right Sidebar (Rankings & Promo) */}
      <aside className="hidden lg:block w-[320px] shrink-0 space-y-6 sticky top-20">
        <Leaderboard tools={topTools} locale={locale} />
        
        {/* Ad Space / Extra Widget */}
        <div className="bg-gradient-to-br from-[#0066FF]/10 to-transparent border rounded-xl p-6 text-center">
          <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">
            {isZh ? "企业品牌营销" : "Enterprise Marketing"}
          </h4>
          <p className="text-sm text-gray-500 mb-4">
            {isZh ? "实时追踪品牌曝光度，洞察竞争对手动态" : "Track brand exposure in real-time"}
          </p>
          <Button variant="outline" className="w-full border-[#0066FF] text-[#0066FF] hover:bg-[#0066FF] hover:text-white transition-colors" asChild>
            <Link href={`/${locale}/login`}>
              {isZh ? "开始试用" : "Start Trial"}
            </Link>
          </Button>
        </div>
      </aside>

    </div>
    </>
  );
}
