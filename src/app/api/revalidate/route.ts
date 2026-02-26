import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.API_SECRET_KEY}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const paths: string[] = Array.isArray(body?.paths)
    ? body.paths
    : ["/zh", "/en", "/sitemap.xml"];
  const tags: string[] = Array.isArray(body?.tags) ? body.tags : ["categories"];

  for (const path of paths) {
    revalidatePath(path);
  }

  for (const tag of tags) {
    revalidateTag(tag);
  }

  return NextResponse.json({ ok: true, paths, tags });
}
