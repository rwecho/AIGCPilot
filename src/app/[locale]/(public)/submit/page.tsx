"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Rocket, Send, ShieldCheck, FileText, Clock, Mail, AlertCircle, Info } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export default function SubmitPage() {
  const params = useParams()
  const router = useRouter()
  const locale = (params?.locale as string) || 'zh'
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    // 模拟提交逻辑
    await new Promise(resolve => setTimeout(resolve, 1500))
    toast.success(locale === 'zh' ? "提交成功！我们将于 7-10 个工作日内完成审核。" : "Success! Review will be completed in 7-10 business days.")
    router.push(`/${locale}`)
    setLoading(false)
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 左侧：说明与准则 */}
        <div className="lg:col-span-5 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Rocket className="h-8 w-8" />
              <h1 className="text-3xl font-extrabold tracking-tight">免费收录 AI 工具</h1>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              欢迎 AI 工具开发者提交工具地址。平台严格遵守生成式 AI 服务管理规定，所有提交需符合法律法规。
            </p>
          </section>

          <Card className="bg-muted/30 border-none shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                提交准则
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <div className="flex gap-3">
                <Badge variant="outline" className="shrink-0 h-5">合法合规</Badge>
                <p>确保工具符合法律法规，不接受任何非法应用。</p>
              </div>
              <div className="flex gap-3">
                <Badge variant="outline" className="shrink-0 h-5">提交材料</Badge>
                <p>请准备好：名称、链接、标签、简介、ICP备案。</p>
              </div>
              <div className="flex gap-3">
                <Badge variant="outline" className="shrink-0 h-5">审核流程</Badge>
                <p>我们将一一审核备案情况，请耐心等待。</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                提交示例
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2 font-mono text-muted-foreground">
              <p><span className="text-foreground font-bold">应用名称：</span>AIGC工具导航【带4-6字小标题】</p>
              <p><span className="text-foreground font-bold">工具链接：</span>https://www.aigc.cn</p>
              <p><span className="text-foreground font-bold">应用简介：</span>一句话简介，控制在16-20个字。</p>
              <p><span className="text-foreground font-bold">备案信息：</span>某ICP备2024012345号</p>
            </CardContent>
          </Card>

          <div className="space-y-4 p-4 rounded-xl border bg-orange-50/50 dark:bg-orange-950/10 border-orange-200 dark:border-orange-900">
            <h4 className="font-bold flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <Clock className="h-4 w-4" /> 审核告知
            </h4>
            <p className="text-xs leading-relaxed text-orange-800/80 dark:text-orange-300/80">
              无论是否通过均会反馈结果。通常 7-10 个工作日处理。如需催更或有疑问，请发送邮件至：
              <span className="font-bold block mt-2 text-foreground underline decoration-orange-300">87932088@qq.com</span>
            </p>
          </div>
        </div>

        {/* 右侧：提交表单 */}
        <div className="lg:col-span-7">
          <Card className="shadow-2xl border-2">
            <CardHeader>
              <CardTitle>填写申请表单</CardTitle>
              <CardDescription>请务必填写准确的备案信息以确保审核通过</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="title" className="flex items-center gap-1">
                    应用名称 <span className="text-destructive">*</span>
                  </Label>
                  <Input id="title" name="title" placeholder="例如: AIGC导航 – 发现智能未来" required />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="url" className="flex items-center gap-1">
                    工具链接 <span className="text-destructive">*</span>
                  </Label>
                  <Input id="url" name="url" type="url" placeholder="https://www.example.com" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">分类建议</Label>
                  <Input id="category" name="category" placeholder="如: AI写作 – 写作工具" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icp" className="flex items-center gap-1">
                    备案信息 <span className="text-destructive">*</span>
                  </Label>
                  <Input id="icp" name="icp" placeholder="京ICP备..." required />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="summary" className="flex items-center gap-1">
                    应用简介 <span className="text-destructive">*</span>
                  </Label>
                  <Input id="summary" name="summary" placeholder="16-20个字的一句话介绍" required maxLength={30} />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="content">详细描述 (选填)</Label>
                  <Textarea 
                    id="content" 
                    name="content" 
                    placeholder="包含工具特色、使用教程、常见问题等..." 
                    className="h-32 resize-none"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="contact" className="flex items-center gap-1">
                    联系方式 <span className="text-destructive">*</span>
                  </Label>
                  <Input id="contact" name="contact" placeholder="电话、邮箱或微信" required />
                </div>

                <div className="md:col-span-2 pt-4">
                  <div className="flex items-start gap-2 p-3 bg-muted rounded-lg mb-6">
                    <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="text-[10px] text-muted-foreground">
                      点击提交即代表您同意我们的收录协议，并保证所提供信息的真实性与合规性。
                    </p>
                  </div>
                  <Button type="submit" className="w-full h-12 text-lg font-bold gap-2" disabled={loading}>
                    {loading ? "提交中..." : (
                      <>
                        <Send className="h-5 w-5" />
                        立即申请免费收录
                      </>
                    )}
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
