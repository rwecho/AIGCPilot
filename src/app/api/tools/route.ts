import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get('categoryId')
  const hot = searchParams.get('hot') === 'true'
  const urlsOnly = searchParams.get('urlsOnly') === 'true'

  if (urlsOnly) {
    const tools = await prisma.tool.findMany({ select: { url: true } })
    return NextResponse.json(tools.map(t => t.url))
  }

  const tools = await prisma.tool.findMany({
    where: {
      isDeleted: false,
      ...(categoryId ? { categoryId } : {}),
      ...(hot ? { isHot: true } : {}),
    },
    include: {
      category: { select: { name_zh: true, name_en: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(tools)
}

export async function POST(request: NextRequest) {
  // Simple auth for crawler
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.API_SECRET_KEY}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const data = await request.json()
  const { 
    url, 
    logo,
    screenshotUrl, 
    videoUrl, 
    rate = 5.0,
    region = "Global",
    isHot = false,
    title_zh,
    title_en,
    summary_zh,
    summary_en,
    content_zh,
    content_en,
    categoryName_zh,
    categoryName_en
  } = data

  // Find or create category
  const category = await prisma.category.upsert({
    where: { name_zh: categoryName_zh },
    update: {},
    create: { 
      name_zh: categoryName_zh,
      name_en: categoryName_en || categoryName_zh,
      slug: (categoryName_en || categoryName_zh).toLowerCase().replace(/\s+/g, '-')
    }
  })

  const tool = await prisma.tool.upsert({
    where: { url },
    update: {
      logo,
      screenshotUrl,
      videoUrl,
      rate,
      region,
      isHot,
      title_zh,
      title_en,
      summary_zh,
      summary_en,
      content_zh,
      content_en,
      categoryId: category.id
    },
    create: {
      url,
      logo,
      screenshotUrl,
      videoUrl,
      rate,
      region,
      isHot,
      title_zh,
      title_en,
      summary_zh,
      summary_en,
      content_zh,
      content_en,
      categoryId: category.id
    }
  })

  return NextResponse.json(tool)
}
