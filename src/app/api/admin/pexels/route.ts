import { NextRequest, NextResponse } from "next/server";

const PEXELS_API_URL = "https://api.pexels.com/v1/search";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const page = searchParams.get("page") || "1";

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const accessKey = process.env.PEXELS_API_KEY;
    if (!accessKey) {
      return NextResponse.json(
        { error: "Pexels API key not configured" },
        { status: 500 }
      );
    }

    const res = await fetch(
      `${PEXELS_API_URL}?query=${encodeURIComponent(query)}&page=${page}&per_page=20`,
      {
        headers: {
          Authorization: accessKey,
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Pexels API error: ${res.statusText}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Pexels search error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
