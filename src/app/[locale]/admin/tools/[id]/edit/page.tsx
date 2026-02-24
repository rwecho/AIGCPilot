"use client"

import { useEffect, useState, use } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ChevronLeft, Save, Globe, Eye, 
  Type, AlignLeft, Layout, 
  Loader2, CheckCircle2
} from "lucide-react"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"

export default function ToolEditPage({ params: paramsPromise }: { params: Promise<{ id: string, locale: string }> }) {
  const params = use(paramsPromise)
  const router = useRouter()
  const [tool, setTool] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    fetch(`/api/tools`) // 这里由于目前 API 没提供单查，我们先从列表找，后续可优化
      .then(res => res.json())
      .then(data => {
        const found = data.find((t: any) => t.id === params.id)
        if (found) setTool(found)
        setLoading(false)
      })
  }, [params.id])

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch(`/api/admin/tools/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tool)
    })
    if (res.ok) {
      toast.success("保存成功")
      router.refresh()
    } else {
      toast.error("保存失败")
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  if (!tool) return <div className="p-20 text-center">未找到工具信息</div>

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-background">
      {/* 顶部操作栏 */}
      <header className="border-b px-6 py-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4 mr-1" /> 返回列表
          </Button>
          <div className="h-4 w-px bg-border mx-2" />
          <h2 className="font-bold truncate max-w-[300px]">编辑: {tool.title_zh}</h2>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
            {previewMode ? <Type className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {previewMode ? "退出预览" : "预览效果"}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            保存修改
          </Button>
        </div>
      </header>

      {/* 编辑区域 */}
      <main className="flex-1 overflow-hidden flex flex-col p-6 space-y-6">
        <Tabs defaultValue="zh" className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="zh" className="gap-2"><Globe className="h-3 w-3" /> 中文内容 (ZH)</TabsTrigger>
              <TabsTrigger value="en" className="gap-2"><Globe className="h-3 w-3 text-muted-foreground" /> 英文内容 (EN)</TabsTrigger>
              <TabsTrigger value="settings" className="gap-2"><Layout className="h-3 w-3" /> 基础配置</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            {/* 中文编辑 */}
            <TabsContent value="zh" className="h-full mt-0 focus-visible:ring-0">
              <div className={previewMode ? "grid grid-cols-2 gap-6 h-full" : "h-full"}>
                <div className="space-y-4 flex flex-col h-full">
                  <div className="space-y-2">
                    <Label>应用名称 (ZH)</Label>
                    <Input value={tool.title_zh} onChange={e => setTool({...tool, title_zh: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>简短摘要 (ZH)</Label>
                    <Input value={tool.summary_zh || ""} onChange={e => setTool({...tool, summary_zh: e.target.value})} />
                  </div>
                  <div className="space-y-2 flex-1 flex flex-col">
                    <Label>详细介绍 (Markdown ZH)</Label>
                    <Textarea 
                      className="flex-1 font-mono text-sm resize-none p-4 leading-relaxed" 
                      value={tool.content_zh || ""} 
                      onChange={e => setTool({...tool, content_zh: e.target.value})} 
                    />
                  </div>
                </div>
                {previewMode && (
                  <div className="border rounded-lg bg-muted/10 overflow-auto p-8 prose prose-neutral dark:prose-invert max-w-none">
                    <h1 className="text-3xl font-bold mb-4">{tool.title_zh}</h1>
                    <p className="text-muted-foreground italic mb-8 border-l-4 pl-4">{tool.summary_zh}</p>
                    <ReactMarkdown>{tool.content_zh}</ReactMarkdown>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* 英文编辑 */}
            <TabsContent value="en" className="h-full mt-0 focus-visible:ring-0">
              <div className={previewMode ? "grid grid-cols-2 gap-6 h-full" : "h-full"}>
                <div className="space-y-4 flex flex-col h-full">
                  <div className="space-y-2">
                    <Label>Tool Name (EN)</Label>
                    <Input value={tool.title_en} onChange={e => setTool({...tool, title_en: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Summary (EN)</Label>
                    <Input value={tool.summary_en || ""} onChange={e => setTool({...tool, summary_en: e.target.value})} />
                  </div>
                  <div className="space-y-2 flex-1 flex flex-col">
                    <Label>Description (Markdown EN)</Label>
                    <Textarea 
                      className="flex-1 font-mono text-sm resize-none p-4 leading-relaxed" 
                      value={tool.content_en || ""} 
                      onChange={e => setTool({...tool, content_en: e.target.value})} 
                    />
                  </div>
                </div>
                {previewMode && (
                  <div className="border rounded-lg bg-muted/10 overflow-auto p-8 prose prose-neutral dark:prose-invert max-w-none">
                    <h1 className="text-3xl font-bold mb-4">{tool.title_en}</h1>
                    <p className="text-muted-foreground italic mb-8 border-l-4 pl-4">{tool.summary_en}</p>
                    <ReactMarkdown>{tool.content_en}</ReactMarkdown>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* 基础设置 */}
            <TabsContent value="settings" className="space-y-6 max-w-2xl py-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>官网 URL</Label>
                  <Input value={tool.url} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Logo 地址</Label>
                  <Input value={tool.logo || ""} onChange={e => setTool({...tool, logo: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>截图预览</Label>
                  <Input value={tool.screenshotUrl || ""} onChange={e => setTool({...tool, screenshotUrl: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>视频演示</Label>
                  <Input value={tool.videoUrl || ""} onChange={e => setTool({...tool, videoUrl: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>权重评分 (0-5.0)</Label>
                  <Input type="number" step="0.1" value={tool.rate} onChange={e => setTool({...tool, rate: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>归属地区</Label>
                  <Input value={tool.region} onChange={e => setTool({...tool, region: e.target.value})} />
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  )
}
