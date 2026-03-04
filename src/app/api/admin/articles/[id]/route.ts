import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const article = await prisma.article.findUnique({ where: { id } })
    if (!article) return NextResponse.json({ error: "Not Found" }, { status: 404 })
    return NextResponse.json(article)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const updatedArticle = await prisma.article.update({
      where: { id },
      data: body
    })
    
    // Revalidate public path on update
    revalidatePath(`/article/${updatedArticle.slug}`)
    revalidatePath(`/articles`)

    return NextResponse.json(updatedArticle)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await prisma.article.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
