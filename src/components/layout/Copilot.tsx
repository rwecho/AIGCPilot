'use client'

import { useChat } from '@ai-sdk/react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  MessageSquare,
  Send,
  Sparkles,
  ChevronRight,
  Bot,
  User as UserIcon,
  Eraser,
  Loader2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import { useAppStore } from '@/lib/store/useAppStore'
import { useIsMobile } from '@/hooks/use-mobile'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

// --- 子组件：聊天区域 ---
function ChatArea({ messages, isLoading, error, scrollRef, setMessages }: any) {
  return (
    <ScrollArea className='flex-1 p-4' ref={scrollRef}>
      {error && (
        <div className='p-3 mb-4 text-[10px] text-destructive bg-destructive/5 border border-destructive/10 rounded-lg'>
          连接中断: {error.message}
        </div>
      )}

      {messages.length === 0 && !isLoading && (
        <div className='flex flex-col items-center justify-center h-[50vh] text-center p-6 space-y-4'>
          <div className='bg-primary/5 p-5 rounded-3xl'>
            <MessageSquare className='h-8 w-8 text-primary/40' />
          </div>
          <div className='space-y-1 px-4'>
            <h3 className='font-bold text-sm'>领航员已就绪</h3>
            <p className='text-[11px] text-muted-foreground leading-relaxed'>
              我是您的 AI 助手，可以为您解答站内工具的使用方法或推荐最适合您的 AIGC 应用。
            </p>
          </div>
        </div>
      )}

      <div className='space-y-6 pb-6'>
        {messages.map((m: any) => (
          <div key={m.id} className={cn('flex flex-col gap-2', m.role === 'user' ? 'items-end' : 'items-start')}>
            <div className={cn('flex items-center gap-2 mb-1', m.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
              <div className={cn('p-1 rounded-md shadow-sm', m.role === 'user' ? 'bg-muted' : 'bg-primary/10')}>
                {m.role === 'user' ? <UserIcon className='h-3 w-3 text-foreground/70' /> : <Bot className='h-3 w-3 text-primary' />}
              </div>
              <span className='text-[9px] font-bold text-muted-foreground uppercase tracking-wider'>
                {m.role === 'user' ? 'You' : 'Copilot'}
              </span>
            </div>
            <div className={cn(
              'p-3.5 rounded-2xl text-[13px] leading-relaxed max-w-[95%] shadow-sm border transition-all',
              m.role === 'user' ? 'bg-primary text-primary-foreground border-primary/20' : 'bg-background border-border text-foreground/90'
            )}>
              <article className={cn('prose prose-sm max-w-none break-words overflow-hidden leading-relaxed', m.role === 'user' ? 'prose-invert text-white' : 'dark:prose-invert')}>
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </article>
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div className="p-3 rounded-2xl bg-card border flex items-center gap-2 shadow-sm">
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <span className="text-[11px] text-muted-foreground font-medium">思考中...</span>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}

// --- 子组件：输入区域 ---
function InputArea({ input, handleInputChange, handleSubmit, isLoading }: any) {
  return (
    <div className='p-4 bg-muted/5 border-t backdrop-blur-sm'>
      <form onSubmit={handleSubmit} className='relative group'>
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder='输入您的问题...'
          className='pr-10 h-11 bg-background border-muted-foreground/20 rounded-xl focus-visible:ring-primary/30 shadow-inner'
        />
        <Button
          type='submit'
          size='icon'
          disabled={isLoading || !input?.trim()}
          className={cn(
            'absolute right-1.5 top-1.5 h-8 w-8 rounded-lg transition-all transform',
            input?.trim() ? 'bg-primary opacity-100 scale-100' : 'bg-muted opacity-0 scale-90'
          )}
        >
          <Send className='h-4 w-4 text-white' />
        </Button>
      </form>
      <div className="mt-3 flex items-center justify-between px-1">
        <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">Supported by DeepSeek</span>
        <div className="text-[9px] text-muted-foreground/40 font-mono italic">v4.0.0</div>
      </div>
    </div>
  )
}

export function Copilot() {
  const isMobile = useIsMobile()
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, append, setMessages } = useChat({
    api: '/api/chat',
  })

  const { externalInput, setExternalInput } = useAppStore()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('copilot-collapsed')
    if (saved !== null) setIsCollapsed(saved === 'true')
    setMounted(true)
  }, [])

  const toggleCollapse = (val: boolean) => {
    setIsCollapsed(val)
    localStorage.setItem('copilot-collapsed', String(val))
  }

  useEffect(() => {
    if (externalInput && mounted) {
      if (isMobile) setMobileOpen(true)
      else if (isCollapsed) toggleCollapse(false)
      append({ role: 'user', content: externalInput })
      setExternalInput(null)
    }
  }, [externalInput, isCollapsed, mounted, append, setExternalInput, isMobile])

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (viewport) viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' })
    }
  }, [messages, isLoading])

  if (!mounted) return null

  // 移动端：悬浮球 + 底部抽屉
  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button 
            size="icon" 
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl z-[100] bg-primary text-white hover:scale-110 transition-transform active:scale-95"
          >
            <Sparkles className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] p-0 rounded-t-[2rem] flex flex-col border-none shadow-2xl">
          <SheetHeader className="p-4 border-b bg-muted/20 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-lg"><Bot className="h-4 w-4 text-white" /></div>
              <SheetTitle className="text-sm font-bold pt-1.5">AIGCPilot 助手</SheetTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setMessages([])} className="h-8 w-8"><Eraser className="h-4 w-4" /></Button>
          </SheetHeader>
          <ChatArea messages={messages} isLoading={isLoading} error={error} scrollRef={scrollRef} setMessages={setMessages} />
          <InputArea input={input} handleInputChange={handleInputChange} handleSubmit={handleSubmit} isLoading={isLoading} />
        </SheetContent>
      </Sheet>
    )
  }

  // 桌面端逻辑保持原样
  if (isCollapsed) {
    return (
      <div 
        className='w-12 border-l bg-card flex flex-col items-center py-6 cursor-pointer hover:bg-muted/50 transition-all shadow-xl shrink-0'
        onClick={() => toggleCollapse(false)}
      >
        <div className='bg-primary/10 p-2 rounded-full mb-6'><Sparkles className='h-4 w-4 text-primary' /></div>
        <div className='[writing-mode:vertical-lr] text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase opacity-50'>AIGCPilot</div>
      </div>
    )
  }

  return (
    <aside className='w-80 border-l bg-card flex flex-col h-full shadow-2xl shrink-0 transition-all relative z-40'>
      <Button variant='secondary' size='icon' className='absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full border shadow-md z-50 scale-110 hover:bg-primary hover:text-white transition-all' onClick={() => toggleCollapse(true)}>
        <ChevronRight className='h-3 w-3' />
      </Button>
      <div className='p-4 border-b bg-muted/20 backdrop-blur-md flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div className='bg-primary p-1.5 rounded-lg shadow-sm'><Bot className='h-4 w-4 text-white' /></div>
          <div><div className='font-bold text-xs tracking-tight'>Copilot</div><div className='text-[9px] text-muted-foreground leading-none font-medium'>Smart Assistant</div></div>
        </div>
        <Button variant='ghost' size='icon' className='h-7 w-7' onClick={() => setMessages([])}><Eraser className='h-3.5 w-3.5' /></Button>
      </div>
      <ChatArea messages={messages} isLoading={isLoading} error={error} scrollRef={scrollRef} setMessages={setMessages} />
      <InputArea input={input} handleInputChange={handleInputChange} handleSubmit={handleSubmit} isLoading={isLoading} />
    </aside>
  )
}
