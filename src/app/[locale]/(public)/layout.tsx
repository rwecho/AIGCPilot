import { AppSidebar } from "@/components/layout/AppSidebar";
import Copilot from "@/components/layout/Copilot";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { AppSidebarProvider } from "@/components/layout/AppSidebarProvider";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getCachedCategories } from "@/lib/categories";
import { Bot, ListOrdered, CloudUpload, Navigation } from "lucide-react";

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const categories = await getCachedCategories();

  return (
    <AppSidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        {/* Main Content (Full Width) */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          <header className="h-14 border-b flex items-center px-4 md:px-8 sticky top-0 bg-white dark:bg-[#0a0a0a] z-50 justify-between transition-all">
            {/* Left: Logo */}
            <div className="flex items-center gap-3 w-1/4">
              <a href={`/${locale}/`} className="flex items-center gap-2 cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-lg">
                  A
                </div>
                <h2 className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                  AIGCPilot
                </h2>
              </a>
            </div>

            {/* Center: Navigation Links */}
            <nav className="hidden md:flex items-center justify-center gap-8 w-2/4">
              <a href={`/${locale}/`} className="text-[15px] font-medium text-[#0066FF] transition-colors">
                {locale === "zh" ? "首页" : "Home"}
              </a>
              <a href={`/${locale}/news`} className="text-[15px] font-medium text-[#4B5563] dark:text-gray-300 hover:text-[#0066FF] transition-colors">
                {locale === "zh" ? "AI资讯" : "News"}
              </a>
              
              {/* Dropdown Link */}
              <div className="relative group flex items-center h-full">
                <a href={`/${locale}/category/all`} className="text-[15px] font-medium text-[#4B5563] dark:text-gray-300 hover:text-[#0066FF] transition-colors flex items-center gap-1 group-hover:text-[#0066FF] py-4">
                  {locale === "zh" ? "AI产品库" : "AI Tools"}
                  <svg className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
                
                {/* Complex Dropdown Menu Content */}
                <div className="absolute top-[56px] left-1/2 -translate-x-1/2 w-[600px] bg-white dark:bg-gray-900 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top overflow-hidden">
                  <div className="p-6">
                    {/* Section 1: 信息 */}
                    <div className="mb-2">
                      <h4 className="text-[13px] font-bold text-gray-400 dark:text-gray-500 mb-3 px-2">信息</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <a href={`/${locale}/category/all`} className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group/item">
                          <div className="mt-0.5 text-gray-400 group-hover/item:text-blue-500 transition-colors">
                            <Bot className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-[15px] font-bold text-gray-900 dark:text-gray-100 mb-1 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors">
                              AI 商用·开源产品库
                            </div>
                            <div className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">
                              精准筛选产品，多维度产品调研
                            </div>
                          </div>
                        </a>
                        <a href={`/${locale}/`} className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group/item">
                          <div className="mt-0.5 text-gray-400 group-hover/item:text-blue-500 transition-colors">
                            <ListOrdered className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-[15px] font-bold text-gray-900 dark:text-gray-100 mb-1 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors">
                              AI产品排行榜
                            </div>
                            <div className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">
                              热门AI产品实力、热度、年/月/日排行
                            </div>
                          </div>
                        </a>
                        <a href={`/${locale}/submit`} className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group/item">
                          <div className="mt-0.5 text-gray-400 group-hover/item:text-blue-500 transition-colors">
                            <CloudUpload className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-[15px] font-bold text-gray-900 dark:text-gray-100 mb-1 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors">
                              AI产品提交
                            </div>
                            <div className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">
                              提交AI产品信息，助力产品推广和用户转化
                            </div>
                          </div>
                        </a>
                      </div>
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-gray-800 my-4 mx-2"></div>

                    {/* Section 2: 工具 */}
                    <div>
                      <h4 className="text-[13px] font-bold text-gray-400 dark:text-gray-500 mb-3 px-2">工具</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <a href={`/${locale}/category/all`} className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group/item">
                          <div className="mt-0.5 text-gray-400 group-hover/item:text-blue-500 transition-colors">
                            <Navigation className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-[15px] font-bold text-gray-900 dark:text-gray-100 mb-1 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors">
                              AI工具导航
                            </div>
                            <div className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">
                              一站式AI工具指南，快速找到你需要的工具
                            </div>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <a href={`/${locale}/category/models`} className="text-[15px] font-medium text-[#4B5563] dark:text-gray-300 hover:text-[#0066FF] transition-colors">
                {locale === "zh" ? "模型广场" : "Models"}
              </a>
              <a href={`/${locale}/category/mcp`} className="text-[15px] font-medium text-[#4B5563] dark:text-gray-300 hover:text-[#0066FF] transition-colors">
                {locale === "zh" ? "MCP服务" : "MCP"}
              </a>
            </nav>

            {/* Right: Search & Actions */}
            <div className="flex items-center justify-end gap-3 md:gap-4 shrink-0">
              {/* Search Pill */}
              <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-text group">
                <svg className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  placeholder={locale === "zh" ? "搜索AI应用、资讯..." : "Search tools..."} 
                  className="bg-transparent border-none outline-none text-sm w-32 focus:w-48 transition-all text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
                />
              </div>

              <LanguageSwitcher />
              
              <a href={`/${locale}/submit`} className="hidden md:flex items-center text-[14px] font-medium bg-[#0066FF] hover:bg-[#0052CC] text-white px-4 py-1.5 rounded-full transition-colors shadow-sm whitespace-nowrap">
                {locale === "zh" ? "提交" : "Submit"}
              </a>

              <a href={`/${locale}/login`} className="hidden md:flex items-center text-sm font-medium text-[#4B5563] hover:text-[#0066FF] transition-colors whitespace-nowrap">
                {locale === "zh" ? "登录 / 注册" : "Sign In"}
              </a>
            </div>
          </header>

          {/* 滚动内容区 */}
          <div className="flex-1 overflow-auto bg-muted/5 flex flex-col">
            <div className="flex-1 p-4 md:p-8">
              <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 md:pb-8">
                {children}
              </div>
            </div>

            {/* Minimalist 4-column Footer */}
            <footer className="border-t bg-white dark:bg-[#0a0a0a]">
              <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 lg:py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
                  <div className="col-span-2 md:col-span-1 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-primary text-white flex items-center justify-center font-bold text-xs">
                        A
                      </div>
                      <h3 className="font-extrabold text-lg tracking-tight text-gray-900 dark:text-gray-100">
                        AIGCPilot
                      </h3>
                    </div>
                    <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
                      {locale === "zh" 
                        ? "发现并连接最先进的 AI 工具与创作者。" 
                        : "Discover and connect with cutting-edge AI tools."}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-4 text-sm">{locale === "zh" ? "产品发现" : "Products"}</h4>
                    <ul className="space-y-3 text-[13px] text-gray-500 font-medium">
                      <li><a href={`/${locale}/`} className="hover:text-primary transition-colors">{locale === "zh" ? "热门工具" : "Hot Tools"}</a></li>
                      <li><a href={`/${locale}/category/design`} className="hover:text-primary transition-colors">{locale === "zh" ? "AI 绘画" : "Image AI"}</a></li>
                      <li><a href={`/${locale}/category/chat`} className="hover:text-primary transition-colors">{locale === "zh" ? "对话大模型" : "LLMs"}</a></li>
                      <li><a href={`/${locale}/category/video`} className="hover:text-primary transition-colors">{locale === "zh" ? "视频生成" : "Video Generation"}</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-4 text-sm">{locale === "zh" ? "开发者" : "Developers"}</h4>
                    <ul className="space-y-3 text-[13px] text-gray-500 font-medium">
                      <li><a href={`/${locale}/news`} className="hover:text-primary transition-colors">{locale === "zh" ? "行业快讯" : "News"}</a></li>
                      <li><a href={`/${locale}/articles`} className="hover:text-primary transition-colors">{locale === "zh" ? "深度阅读" : "Articles"}</a></li>
                      <li><a href={`/${locale}/category/mcp`} className="hover:text-primary transition-colors">{locale === "zh" ? "MCP 资源" : "MCP Hub"}</a></li>
                      <li><a href={`/${locale}/submit`} className="hover:text-primary transition-colors">{locale === "zh" ? "提交工具" : "Submit Tool"}</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-4 text-sm">{locale === "zh" ? "生态合作" : "Ecosystem"}</h4>
                    <ul className="space-y-3 text-[13px] text-gray-500 font-medium">
                      <li><a href="https://github.com/rwecho" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">GitHub</a></li>
                      <li><a href="mailto:rwecho@live.com" className="hover:text-primary transition-colors">{locale === "zh" ? "联系我们" : "Contact Us"}</a></li>
                      <li><a href="#" className="hover:text-primary transition-colors">{locale === "zh" ? "关于我们" : "About"}</a></li>
                    </ul>
                  </div>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-gray-400 font-medium">
                  <div className="flex items-center gap-4">
                    <p>© 2026 AIGCPilot. {locale === "zh" ? "保留所有权利。" : "All rights reserved."}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>{locale === "zh" ? "构建于 Next.js 15 & DeepSeek V3" : "Built with Next.js 15 & DeepSeek"}</span>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </main>

        {/* Right Copilot Panel (Responsive) */}
        <Copilot />
      </div>
    </AppSidebarProvider>
  );
}
