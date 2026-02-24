"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, Edit3, Trash2, Tag, 
  RefreshCcw, FolderTree, ChevronRight
} from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CategoriesManager() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [currentCat, setCurrentCat] = useState<any>(null)

  const fetchCats = async () => {
    setLoading(true)
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data)
    setLoading(false)
  }

  useEffect(() => { fetchCats() }, [])

  const handleUpdate = async () => {
    const res = await fetch(`/api/admin/categories/${currentCat.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name_zh: currentCat.name_zh,
        name_en: currentCat.name_en,
        slug: currentCat.slug,
        icon: currentCat.icon
      })
    })
    if (res.ok) {
      toast.success("分类已更新")
      fetchCats()
      setEditOpen(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除此分类吗？")) return
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success("删除成功")
      fetchCats()
    } else {
      const err = await res.json()
      toast.error(err.error || "删除失败")
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <FolderTree className="h-8 w-8 text-primary" />
            分类管理
          </h1>
          <p className="text-muted-foreground mt-1">维护导航站的层级结构与分类名称</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> 新增分类
        </Button>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>图标</TableHead>
              <TableHead>中文名称</TableHead>
              <TableHead>英文名称</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10">加载中...</TableCell></TableRow>
            ) : categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell><Badge variant="secondary" className="h-8 w-8 p-0 flex items-center justify-center rounded-lg">{cat.icon || '?'}</Badge></TableCell>
                <TableCell className="font-bold">{cat.name_zh}</TableCell>
                <TableCell className="text-muted-foreground">{cat.name_en}</TableCell>
                <TableCell className="font-mono text-xs">{cat.slug}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => { setCurrentCat(cat); setEditOpen(true); }}><Edit3 className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(cat.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑分类</DialogTitle>
          </DialogHeader>
          {currentCat && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>中文名称</Label>
                  <Input value={currentCat.name_zh} onChange={e => setCurrentCat({...currentCat, name_zh: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>英文名称</Label>
                  <Input value={currentCat.name_en} onChange={e => setCurrentCat({...currentCat, name_en: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Slug (唯一路径标识)</Label>
                <Input value={currentCat.slug} onChange={e => setCurrentCat({...currentCat, slug: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>图标类名 (Lucide Name)</Label>
                <Input value={currentCat.icon || ""} onChange={e => setCurrentCat({...currentCat, icon: e.target.value})} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>取消</Button>
            <Button onClick={handleUpdate}>保存修改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
