import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const secretKey = process.env.API_SECRET_KEY;
    
    if (!secretKey || authHeader !== `Bearer ${secretKey}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { 
      title, 
      content,
      sourceUrl, 
      relatedToolUrls, // Array of URLs to link to existing tools
      status = "PUBLISHED"
    } = body;

    if (!title) {
      return new NextResponse("Missing required field (title)", { status: 400 });
    }

    // Attempt to link to existing tools if URLs are provided by the LLM
    const connectTools = [];
    if (relatedToolUrls && Array.isArray(relatedToolUrls)) {
      for (const url of relatedToolUrls) {
        const tool = await prisma.tool.findUnique({ where: { url } });
        if (tool) {
          connectTools.push({ id: tool.id });
        }
      }
    }

    const newsData: any = {
      title,
      content,
      sourceUrl,
      status
    };

    if (connectTools.length > 0) {
      newsData.relatedTools = { connect: connectTools };
    }

    const news = await prisma.news.create({
      data: newsData,
      include: {
        relatedTools: { select: { id: true, title_zh: true } }
      }
    });

    return NextResponse.json({ success: true, news });

  } catch (error: any) {
    console.error("News Injection Error:", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
