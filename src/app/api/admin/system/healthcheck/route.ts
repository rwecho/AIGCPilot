import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import axios from "axios";

export const maxDuration = 300; // Allows up to 5 min execution for health checks on Vercel Pro, ignored on hobby

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const secretKey = process.env.API_SECRET_KEY;
    
    // Auth Check
    if (!secretKey || authHeader !== `Bearer ${secretKey}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Grab 50 oldest updated published tools to check rotationally
    const toolsToCheck = await prisma.tool.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { updatedAt: "asc" },
      take: 50
    });

    const results = {
      totalChecked: toolsToCheck.length,
      offlineCount: 0,
      offlineTools: [] as string[]
    };

    for (const tool of toolsToCheck) {
      try {
        const response = await axios.get(tool.url, { 
          timeout: 10000,
          headers: {
            "User-Agent": "AIGCPilot HealthBot/1.0"
          }
        });
        
        // Touch the tool to bump its updatedAt so it drops to the back of the queue
        if (response.status >= 200 && response.status < 400) {
          await prisma.tool.update({ 
            where: { id: tool.id }, 
            data: { updatedAt: new Date() } // Force touch
          });
        }
      } catch (err: any) {
        // If timeout or 404/500, mark as OFFLINE
        await prisma.tool.update({
          where: { id: tool.id },
          data: { status: "OFFLINE", updatedAt: new Date() }
        });
        results.offlineCount++;
        results.offlineTools.push(tool.title_zh);
      }
    }

    // Log the health check job
    await prisma.crawlerLog.create({
      data: {
        status: "SUCCESS",
        message: `Health Check completed. Checked ${results.totalChecked} items. Found ${results.offlineCount} offline.`
      }
    });

    return NextResponse.json({ success: true, ...results });

  } catch (error: any) {
    console.error("Health Check Error:", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
