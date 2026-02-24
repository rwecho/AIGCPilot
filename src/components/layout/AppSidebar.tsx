'use client'

import * as React from "react"
import { 
  Rocket, Video, Paintbrush, Code, Database, Globe, 
  MoreHorizontal, PenTool, ImageIcon, Music, MessageSquare, 
  Palette, Briefcase, Building2, BookOpen, Plus, User, LogOut,
  ChevronRight,
  ChevronLeft
} from "lucide-react"
import { useParams } from "next/navigation"
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAppStore } from "@/lib/store/useAppStore"
import { cn } from "@/lib/utils"

const ICON_MAP: Record<string, any> = {
  "hot": Rocket,
  "writing": PenTool,
  "images": ImageIcon,
  "video": Video,
  "audio": Music,
  "chat": MessageSquare,
  "design": Palette,
  "office": Briefcase,
  "dev": Code,
  "industry": Building2,
  "resources": BookOpen,
}

export function AppSidebar() {
  const { categories, setCategories, user, setUser } = useAppStore()
  const params = useParams()
  const locale = (params?.locale as string) || 'zh'
  const currentSlug = params?.slug as string | undefined
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  // 挂载时获取分类数据
  React.useEffect(() => {
    if (categories.length === 0) {
      fetch('/api/categories')
        .then(res => res.json())
        .then(data => setCategories(data))
    }
  }, [categories.length, setCategories])

  const filteredCategories = categories.filter(c => c.slug !== 'hot')

  const performLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    window.location.href = '/'
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b h-16 flex items-center justify-center">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              size="lg" 
              asChild 
              tooltip="AIGCPilot"
              className={cn(isCollapsed ? "justify-center" : "")}
            >
              <Link href={`/${locale}`} className="flex items-center gap-3">
                <div className="relative bg-primary p-1.5 rounded-lg text-primary-foreground shrink-0 shadow-lg flex items-center justify-center overflow-hidden group/logo">
                  <Rocket className="h-5 w-5 relative z-10" />
                  {/* 扫光层 */}
                  <div className="absolute inset-0 z-20 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shine pointer-events-none" />
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-black text-lg tracking-tighter bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-none">
                      AIGCPilot
                    </span>
                    <span className="text-[8px] text-muted-foreground font-medium uppercase tracking-[0.2em] mt-1">
                      Navi & Copilot
                    </span>
                  </div>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent className="px-2 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={!currentSlug}
              tooltip={locale === 'zh' ? '热门与资讯' : 'Hot & News'}
              className={cn(!currentSlug && "bg-primary/10 text-primary font-bold")}
            >
              <Link href={`/${locale}`}>
                <Rocket />
                <span>{locale === 'zh' ? '热门与资讯' : 'Hot & News'}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <div className="h-px bg-muted my-2 mx-2" />

          {filteredCategories.map((cat) => {
            const Icon = ICON_MAP[cat.slug] || MoreHorizontal
            const isActive = currentSlug === cat.slug
            return (
              <SidebarMenuItem key={cat.id}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={locale === 'zh' ? cat.name_zh : cat.name_en}
                  className={cn(isActive && "bg-muted font-bold")}
                >
                  <Link href={`/${locale}/category/${cat.slug}`}>
                    <Icon className={isActive ? "text-primary" : "text-muted-foreground"} />
                    <span>{locale === 'zh' ? cat.name_zh : cat.name_en}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t bg-muted/20 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={locale === 'zh' ? '提交 AIGC' : 'Submit AIGC'}>
              <Link href={`/${locale}/submit`}>
                <Plus className="text-primary" />
                <span>{locale === 'zh' ? '提交 AIGC' : 'Submit AIGC'}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {user ? (
            <SidebarMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <SidebarMenuButton 
                    tooltip={locale === 'zh' ? '账号设置 / 退出' : 'Settings / Logout'} 
                    className="hover:bg-muted"
                  >
                    <User className="text-primary" />
                    <span className="flex flex-1 justify-between items-center font-medium overflow-hidden">
                      <span className="truncate">{user.username}</span>
                      <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter shrink-0 ml-2">Admin</span>
                    </span>
                    <LogOut className="h-3 w-3 text-muted-foreground ml-auto shrink-0" />
                  </SidebarMenuButton>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{locale === 'zh' ? "确认退出登录？" : "Confirm Logout"}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {locale === 'zh' 
                        ? "退出后您将需要重新验证凭据才能访问管理后台。" 
                        : "You will need to re-authenticate to access the admin area after logging out."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{locale === 'zh' ? "取消" : "Cancel"}</AlertDialogCancel>
                    <AlertDialogAction onClick={performLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      {locale === 'zh' ? "退出登录" : "Logout"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </SidebarMenuItem>
          ) : (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={locale === 'zh' ? '登录管理' : 'Admin Login'}>
                <Link href={`/${locale}/login`}>
                  <User />
                  <span>{locale === 'zh' ? '登录管理' : 'Admin Login'}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
