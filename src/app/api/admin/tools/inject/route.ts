import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // 1. Simple Secret Key Check
    const authHeader = req.headers.get("authorization");
    const secretKey = process.env.API_SECRET_KEY;
    
    if (!secretKey || authHeader !== `Bearer ${secretKey}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { 
      title_zh, 
      title_en,
      url, 
      summary_zh, 
      summary_en,
      coreValue, 
      useCases, 
      prosCons, 
      categorySlug,
      aiScore // The n8n LLM node should provide a score between 1-10
    } = body;

    // Validate essential fields
    if (!title_zh || !url || !categorySlug) {
      return new NextResponse("Missing required fields (title, url, categorySlug)", { status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: { slug: categorySlug }
    });

    if (!category) {
      return new NextResponse(`Category ${categorySlug} not found`, { status: 404 });
    }

    // Auto-curation logic based on AI score
    // Force ALL incoming tools to PENDING so they act as a Draft Sandbox.
    // The admin must manually review and change status to PUBLISHED.
    const finalScore = aiScore ? parseFloat(aiScore) : 0;
    const computedStatus = "PENDING";

    const tool = await prisma.tool.upsert({
      where: { url },
      update: {
        title_zh,
        title_en: title_en || title_zh, // Fallback
        summary_zh,
        summary_en,
        coreValue,
        useCases,
        prosCons,
        status: computedStatus,
      },
      create: {
        url,
        title_zh,
        title_en: title_en || title_zh,
        summary_zh,
        summary_en,
        coreValue,
        useCases,
        prosCons,
        categoryId: category.id,
        status: computedStatus,
        rate: finalScore > 0 ? (finalScore / 2) : 5.0 // Translate 10-point scale to 5-star optionally
      }
    });

    return NextResponse.json({ success: true, status: computedStatus, tool });

  } catch (error: any) {
    console.error("Tool Injection Error:", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
