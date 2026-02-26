import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getSession();
  const authHeader = request.headers.get("authorization");

  const isValidKey =
    process.env.API_SECRET_KEY &&
    authHeader === `Bearer ${process.env.API_SECRET_KEY}`;

  if (!session && !isValidKey) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const paths: string[] = Array.isArray(body?.paths)
    ? body.paths
    : ["/zh", "/en", "/sitemap.xml"];
  const tags: string[] = Array.isArray(body?.tags) ? body.tags : ["categories"];

  for (const path of paths) {
    try {
      revalidatePath(path);
    } catch (e) {
      console.error(`Failed to revalidate path: ${path}`, e);
    }
  }

  for (const tag of tags) {
    try {
      revalidateTag(tag, "max");
    } catch (e) {
      console.error(`Failed to revalidate tag: ${tag}`, e);
    }
  }

  return NextResponse.json({ ok: true, paths, tags });
}
