import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import Link from "next/link";
import { ProgressiveImage } from "@/components/ui/progressive-image";

export const revalidate = 3600;
export const preferredRegion = 'sin1';

export const metadata: Metadata = {
  title: "AI 深度阅读 | AIGCPilot",
  description: "精选 AI 行业深度好文与教程评测。",
};

export default async function ArticlesPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;

  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 60, 
  });

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">
          {locale === "zh" ? "深度阅读" : "Deep Insights"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {locale === "zh" 
            ? "追踪最新的大模型深度解析、评测与教程。"
            : "Tracking the latest LLM reviews, tutorials, and deep dives."}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {articles.length > 0 ? (
          articles.map((article) => (
            <Link 
              href={`/${locale}/article/${article.slug}`} 
              key={article.id}
              className="group flex flex-col h-full bg-card rounded-xl border hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1 overflow-hidden"
            >
              <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                {article.coverImage ? (
                  <ProgressiveImage
                    src={article.coverImage}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/20 flex items-center justify-center p-4">
                    <span className="text-xl text-primary/30 font-bold">AIGCPilot</span>
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-[15px] leading-tight line-clamp-2 group-hover:text-primary transition-colors text-gray-900 dark:text-gray-100 mb-2">
                  {article.title}
                </h3>
                <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                  <span>{article.viewCount} {locale === "zh" ? "阅读" : "Views"}</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed rounded-xl">
            {locale === "zh" ? "暂无文章" : "No articles available yet"}
          </div>
        )}
      </div>
    </div>
  );
}
