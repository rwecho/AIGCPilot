import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch tools that need enrichment (e.g., missing deep curation fields or screenshots)
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const secretKey = process.env.API_SECRET_KEY;
    
    if (!secretKey || authHeader !== `Bearer ${secretKey}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "5", 10);

    // Prioritize tools that literally have no coreValue, or no screenshot, or are sitting in PENDING.
    const toolsToEnrich = await prisma.tool.findMany({
      where: {
        OR: [
          { screenshotUrl: null },
          { coreValue: null },
          { useCases: null }
        ],
        // Do not enrich tools we've already marked as permanently dead/rejected
        status: {
          notIn: ["REJECTED", "OFFLINE"]
        }
      },
      orderBy: { updatedAt: 'asc' }, // Get the oldest touched records first
      take: limit,
      select: {
        id: true,
        url: true,
        title_en: true,
        title_zh: true,
        summary_en: true,
        summary_zh: true,
        screenshotUrl: true,
        status: true
      }
    });

    return NextResponse.json({ success: true, count: toolsToEnrich.length, tools: toolsToEnrich });

  } catch (error: any) {
    console.error("Enrichment Fetch Error:", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}

// PATCH: Receive enriched data from Python crawler and update the database
export async function PATCH(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const secretKey = process.env.API_SECRET_KEY;
    
    if (!secretKey || authHeader !== `Bearer ${secretKey}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { id, title_zh, title_en, summary_zh, summary_en, content_zh, content_en, coreValue, useCases, prosCons, screenshotUrl, status } = body;

    if (!id) {
       return new NextResponse("Missing Tool ID for enrichment", { status: 400 });
    }

    // Only update fields that are strictly provided (except status checks below)
    const updateData: any = {};
    if (title_zh !== undefined) updateData.title_zh = title_zh;
    if (title_en !== undefined) updateData.title_en = title_en;
    if (summary_zh !== undefined) updateData.summary_zh = summary_zh;
    if (summary_en !== undefined) updateData.summary_en = summary_en;
    if (content_zh !== undefined) updateData.content_zh = content_zh;
    if (content_en !== undefined) updateData.content_en = content_en;
    if (coreValue !== undefined) updateData.coreValue = coreValue;
    if (useCases !== undefined) updateData.useCases = useCases;
    if (prosCons !== undefined) updateData.prosCons = prosCons;
    if (screenshotUrl !== undefined) updateData.screenshotUrl = screenshotUrl;
    
    // If the crawler determined the site is completely dead
    if (status === "OFFLINE") {
        updateData.status = "OFFLINE";
    }

    const updatedTool = await prisma.tool.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, tool: updatedTool });

  } catch (error: any) {
    console.error("Enrichment PATCH Error:", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
