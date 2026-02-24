"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import Cookies from "js-cookie"

export function LanguageSwitcher() {
  const pathname = usePathname()
  const params = useParams()
  const locale = (params?.locale as string) || 'zh'

  // 将当前路径中的 /zh/... 替换为 /en/... 并写入 Cookie
  const handleToggle = (newLocale: string) => {
    Cookies.set('NEXT_LOCALE', newLocale, { expires: 365 })
  }

  const getRedirectPath = (newLocale: string) => {
    if (!pathname) return '/'
    const segments = pathname.split('/')
    segments[1] = newLocale
    return segments.join('/')
  }

  return (
    <div className="flex items-center gap-1 border rounded-full p-1 bg-muted/30">
      <Button 
        asChild
        variant={locale === 'zh' ? "secondary" : "ghost"} 
        size="sm" 
        className="h-7 px-3 text-[10px] font-bold rounded-full"
        onClick={() => handleToggle('zh')}
      >
        <Link href={getRedirectPath('zh')}>中文</Link>
      </Button>
      <Button 
        asChild
        variant={locale === 'en' ? "secondary" : "ghost"} 
        size="sm" 
        className="h-7 px-3 text-[10px] font-bold rounded-full"
        onClick={() => handleToggle('en')}
      >
        <Link href={getRedirectPath('en')}>EN</Link>
      </Button>
    </div>
  )
}
