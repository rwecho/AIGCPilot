"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CheckCircle, XCircle, Trash2, ExternalLink, 
  Edit3, LayoutDashboard, Database, ShieldAlert,
  Loader2, MoreVertical, Flame, ArrowUpCircle, ArrowDownCircle
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function AdminDashboard() {
  const params = useParams()
  const locale = (params?.locale as string) || 'zh'
  const [tools, setTools] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, pending: 0, published: 0 })

  const fetchTools = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tools')
      const data = await res.json()
      setTools(data)
      const pending = data.filter((t: any) => t.status === 'PENDING').length
      const published = data.filter((t: any) => t.status === 'PUBLISHED').length
      setStats({ total: data.length, pending, published })
    } catch (e) {
      toast.error("获取数据失败")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTools() }, [])

  const handleUpdate = async (id: string, payload: any) => {
    const res = await fetch(`/api/admin/tools/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (res.ok) {
      toast.success("操作成功")
      fetchTools()
    } else {
      toast.error("操作失败")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除此工具吗？（执行软删除，数据保留在数据库中）")) return
    const res = await fetch(`/api/admin/tools/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success("已移至回收站")
      fetchTools()
    }
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-2xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary"><Database className="h-6 w-6" /></div>
          <div>
            <div className="text-sm text-muted-foreground">总计收录</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
        </div>
        <div className="bg-card p-6 rounded-2xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-xl"><Loader2 className="h-6 w-6" /></div>
          <div>
            <div className="text-sm text-muted-foreground">待审核申请</div>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </div>
        </div>
        <div className="bg-card p-6 rounded-2xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-xl"><CheckCircle className="h-6 w-6" /></div>
          <div>
            <div className="text-sm text-muted-foreground">已上架工具</div>
            <div className="text-2xl font-bold">{stats.published}</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="pending">待审核</TabsTrigger>
            <TabsTrigger value="published">已上架</TabsTrigger>
          </TabsList>
          <Button onClick={fetchTools} variant="outline" size="sm" className="gap-2">
            <Loader2 className={cn("h-4 w-4", loading ? "animate-spin" : "")} /> 刷新
          </Button>
        </div>

        <TabsContent value="all" className="mt-0">
          <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>工具信息</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>热门</TableHead>
                  <TableHead className="text-right">管理操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tools.map((tool) => (
                  <TableRow key={tool.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img src={tool.logo || ""} className="h-10 w-10 rounded-lg border bg-white p-1 object-contain" alt="logo" />
                        <div className="max-w-[300px]">
                          <div className="font-bold truncate">{tool.title_zh}</div>
                          <div className="text-[10px] text-muted-foreground truncate">{tool.url}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="font-normal">{tool.category.name_zh}</Badge></TableCell>
                    <TableCell>
                      {tool.status === 'PUBLISHED' ? <Badge className="bg-green-500">已上架</Badge> : <Badge variant="secondary">待审核/下架</Badge>}
                    </TableCell>
                    <TableCell>
                      {tool.isHot ? <Flame className="h-4 w-4 text-orange-500 fill-current animate-pulse" /> : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" asChild title="独立页面编辑">
                          <Link href={`/${locale}/admin/tools/${tool.id}/edit`}>
                            <Edit3 className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>状态操作</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleUpdate(tool.id, { isHot: !tool.isHot })}>
                              <Flame className="mr-2 h-4 w-4 text-orange-500" /> {tool.isHot ? "取消热门" : "设为热门"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdate(tool.id, { status: tool.status === 'PUBLISHED' ? 'PENDING' : 'PUBLISHED' })}>
                              {tool.status === 'PUBLISHED' ? <ArrowDownCircle className="mr-2 h-4 w-4" /> : <ArrowUpCircle className="mr-2 h-4 w-4" />}
                              {tool.status === 'PUBLISHED' ? "下架工具" : "上架发布"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive font-medium" onClick={() => handleDelete(tool.id)}><Trash2 className="mr-2 h-4 w-4" /> 软删除记录</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
