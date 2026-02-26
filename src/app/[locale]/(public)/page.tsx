import { prisma } from "@/lib/prisma";
import { ToolCard } from "@/components/layout/ToolCard";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function LocalizedHomePage({ params }: PageProps) {
  const { locale } = await params;

  // 直接在服务端获取热门工具
  const tools = await prisma.tool.findMany({
    where: { isHot: true },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  // 如果热门工具为空，则加载最新收录的
  const displayTools =
    tools.length > 0
      ? tools
      : await prisma.tool.findMany({
          include: { category: true },
          orderBy: { createdAt: "desc" },
          take: 30,
        });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h3 className="text-2xl font-bold tracking-tight">
          {locale === "zh" ? "热门推荐" : "Hot Recommendations"}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayTools.length > 0 ? (
          displayTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)
        ) : (
          <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed rounded-xl">
            {locale === "zh" ? "暂无内容" : "No content available"}
          </div>
        )}
      </div>
    </div>
  );
}
