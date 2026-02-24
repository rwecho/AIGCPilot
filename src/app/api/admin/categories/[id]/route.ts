import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// 更新分类
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const updated = await prisma.category.update({
      where: { id },
      data: body
    })
    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// 删除分类
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // 检查是否有工具关联
    const toolsCount = await prisma.tool.count({ where: { categoryId: id } })
    if (toolsCount > 0) {
      return NextResponse.json({ error: "无法删除：该分类下仍有工具关联" }, { status: 400 })
    }
    await prisma.category.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
