"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Plus, RefreshCcw, Trash2 } from "lucide-react"

export default function AdminPage() {
  const [tools, setTools] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTools = async () => {
    setLoading(true)
    const res = await fetch('/api/tools')
    const data = await res.json()
    setTools(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchTools()
  }, [])

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">工具管理</h1>
          <p className="text-muted-foreground">管理导航站收录的所有 AI 应用</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchTools}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            刷新
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新增工具
          </Button>
        </div>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">加载中...</TableCell>
              </TableRow>
            ) : tools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">暂无数据</TableCell>
              </TableRow>
            ) : (
              tools.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{tool.name}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1">{tool.url}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{tool.category.name}</Badge>
                  </TableCell>
                  <TableCell>
                    {tool.isHot && <Badge className="bg-orange-500">热门</Badge>}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(tool.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <a href={tool.url} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
