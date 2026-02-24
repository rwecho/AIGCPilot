import { AppSidebar } from "@/components/layout/AppSidebar";
import { Copilot } from "@/components/layout/Copilot";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { AppSidebarProvider } from "@/components/layout/AppSidebarProvider";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default async function PublicLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <AppSidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        {/* Left Sidebar */}
        <AppSidebar />

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          <header className="h-14 md:h-16 border-b flex items-center px-4 md:px-6 sticky top-0 bg-background/80 backdrop-blur-md z-50 justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <SidebarTrigger className="h-8 w-8 md:h-9 md:w-9" />
              <h2 className="text-base md:text-lg font-black tracking-tighter">AIGCPilot</h2>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <LanguageSwitcher />
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-full font-bold uppercase">
                  {locale === 'zh' ? '每日更新' : 'Daily'}
                </span>
              </div>
            </div>
          </header>

          {/* 滚动内容区 */}
          <div className="flex-1 overflow-auto bg-muted/5 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 md:pb-8">
              {children}
            </div>
          </div>

          <footer className="hidden md:flex h-10 border-t bg-background items-center justify-center px-6 text-[9px] text-muted-foreground uppercase tracking-widest shrink-0">
            © 2026 AIGCPilot • SEO & SGO Optimized
          </footer>
        </main>

        {/* Right Copilot Panel (Responsive) */}
        <Copilot />
      </div>
    </AppSidebarProvider>
  );
}
