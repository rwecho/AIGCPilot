"use client"

import { useAppStore } from "@/lib/store/useAppStore"
import { Sparkles, MessageCircle, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function AIQuickActions({ toolName, locale }: { toolName: string, locale: string }) {
  const { setExternalInput } = useAppStore()

  const questions = locale === 'zh' ? [
    `这个 ${toolName} 怎么使用？`,
    `${toolName} 有什么优缺点？`,
    `类似的工具有哪些推荐？`
  ] : [
    `How to use ${toolName}?`,
    `What are the pros and cons of ${toolName}?`,
    `Any similar tools to ${toolName}?`
  ]

  return (
    <Card className="bg-primary/[0.03] border-primary/10 shadow-none mb-8 overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 text-primary mb-4">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-widest">AI 智能导读</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {questions.map((q, i) => (
            <Button 
              key={i} 
              variant="outline" 
              className="justify-between h-auto py-3 px-4 text-xs font-medium bg-background hover:bg-primary hover:text-white transition-all group/btn border-primary/5"
              onClick={() => setExternalInput(q)}
            >
              <span className="truncate mr-2">{q}</span>
              <MessageCircle className="h-3 w-3 shrink-0 opacity-50 group-hover/btn:opacity-100" />
            </Button>
          ))}
        </div>
        
        <div className="mt-4 flex items-center justify-center text-[10px] text-muted-foreground italic gap-1">
          点击上方问题，右侧 Copilot 将立即为您解答 <ArrowRight className="h-2 w-2" />
        </div>
      </CardContent>
    </Card>
  )
}
