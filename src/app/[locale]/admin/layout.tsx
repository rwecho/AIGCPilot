import { ReactNode } from "react";
import { Sidebar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { RevalidateButton } from "@/components/layout/RevalidateButton";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      {/* Admin Top Navigation */}
      <header className="h-16 border-b bg-background flex items-center px-8 justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
              <Sidebar className="h-5 w-5" />
            </div>
            <span className="font-bold tracking-tight text-lg">AIGC Admin</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" asChild size="sm">
              <Link href="/admin">工具管理</Link>
            </Button>
            <Button variant="ghost" asChild size="sm">
              <Link href="/admin/categories">分类维护</Link>
            </Button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <RevalidateButton />
          <Button variant="outline" size="sm" asChild>
            <Link href="/">返回首页</Link>
          </Button>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold">
            AD
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="flex-1 overflow-auto">{children}</main>
      <Toaster position="top-right" />
    </div>
  );
}
