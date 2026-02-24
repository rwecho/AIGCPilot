import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ToolCard } from "@/components/layout/ToolCard"
import { Metadata } from "next"

interface PageProps {
  params: Promise<{ locale: string, slug: string }>
}

// 预渲染所有分类页
export async function generateStaticParams() {
  const categories = await prisma.category.findMany({ select: { slug: true } })
  const locales = ['zh', 'en']
  const params: any[] = []
  
  categories.forEach(cat => {
    locales.forEach(loc => {
      params.push({ locale: loc, slug: cat.slug })
    })
  })
  return params
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const category = await prisma.category.findUnique({ where: { slug } })
  
  if (!category) return { title: "Category Not Found" }

  const name = locale === 'en' ? category.name_en : category.name_zh
  return {
    title: `${name} - AIGC 工具分类`,
    description: `浏览最全的 ${name} 相关的 AI 工具、应用与资源。`,
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { locale, slug } = await params
  const category = await prisma.category.findUnique({ 
    where: { slug },
    include: {
      tools: {
        include: { category: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!category) notFound()

  const name = locale === 'en' ? category.name_en : category.name_zh

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h3 className="text-2xl font-bold tracking-tight">
          {name}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {category.tools.length > 0 ? (
          category.tools.map((tool: any) => (
            <ToolCard key={tool.id} tool={tool} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed rounded-xl">
            {locale === 'zh' ? "该分类下暂无内容" : "No tools found in this category"}
          </div>
        )}
      </div>
    </div>
  )
}
