import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const getCachedCategories = unstable_cache(
  async () => {
    return prisma.category.findMany({
      orderBy: { name_zh: "asc" },
    });
  },
  ["categories:list"],
  { revalidate: 300, tags: ["categories"] },
);
