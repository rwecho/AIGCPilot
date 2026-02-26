import { getCachedCategories } from "@/lib/categories";
import { NextResponse } from "next/server";

export async function GET() {
  const categories = await getCachedCategories();
  return NextResponse.json(categories);
}
