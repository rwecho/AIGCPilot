"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function RevalidateButton() {
  const [loading, setLoading] = useState(false);

  const handleRevalidate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/revalidate", {
        method: "POST",
      });
      if (!res.ok) throw new Error("刷新失败");
      toast.success("缓存已刷新");
    } catch (e) {
      toast.error("刷新失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRevalidate}
      disabled={loading}
      className="gap-2"
    >
      <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
      刷新缓存
    </Button>
  );
}
