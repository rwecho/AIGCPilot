import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  try {
    // Increment viewCount
    const article = await prisma.article.update({
      where: { slug },
      data: { viewCount: { increment: 1 } }
    })
    
    if (!article || article.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Not Found" }, { status: 404 })
    }
    
    return NextResponse.json(article)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
