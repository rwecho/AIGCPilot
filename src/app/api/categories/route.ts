import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name_zh: 'asc' }
  })
  return NextResponse.json(categories)
}
