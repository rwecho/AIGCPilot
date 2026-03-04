"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ImageIcon, Save, Image as ImageIconRegular, Camera } from "lucide-react"
import dynamic from "next/dynamic"
import { UnsplashPicker } from "./UnsplashPicker"
import { PexelsPicker } from "./PexelsPicker"
import { pinyin } from "pinyin-pro"
import { commands } from "@uiw/react-md-editor"

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor"),
  { ssr: false }
)

export default function ArticleEditor({ initialData = null }: { initialData?: any }) {
  const router = useRouter()
  
  // Ensure the content starts with the title if editing
  const initialContent = initialData 
    ? (initialData.content.startsWith("# ") ? initialData.content : `# ${initialData.title}\n\n${initialData.content}`)
    : ""

  const [content, setContent] = useState(initialContent)
  const [status, setStatus] = useState(initialData?.status || "DRAFT")
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [unsplashOpen, setUnsplashOpen] = useState(false)
  const [pexelsOpen, setPexelsOpen] = useState(false)

  const handleSave = async () => {
    if (!content) {
      alert("请填写文章内容")
      return
    }

    const titleMatch = content.match(/^\s*#\s+(.+)$/m)
    if (!titleMatch) {
      alert("请在文章开头使用 '# 标题' 格式设置大标题")
      return
    }

    const title = titleMatch[1].trim()
    
    // Auto-generate slug from title
    const generatedSlug = pinyin(title, { toneType: 'none', nonZh: 'consecutive', type: 'array' })
      .join('-')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
    
    const trimmedSlug = generatedSlug.replace(/-+/g, '-').replace(/^-|-$/g, '')
    const slug = initialData?.slug || trimmedSlug

    if (!slug) {
      alert("Slug生成失败，请检查标题")
      return
    }

    // Extract first image as coverImage
    const imageMatch = content.match(/!\[.*?\]\((.*?)\)/);
    const coverImage = imageMatch ? imageMatch[1] : null;

    setSaving(true)
    const isNew = !initialData
    const url = isNew ? "/api/admin/articles" : `/api/admin/articles/${initialData.id}`
    const method = isNew ? "POST" : "PATCH"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, content, status, coverImage })
      })
      if (!res.ok) throw new Error("Save failed")
      
      router.push("/admin/articles")
      router.refresh()
    } catch (e) {
      alert("保存失败")
      setSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData
      })
      const data = await res.json()
      if (data.success) {
        setContent((prev: string) => prev + `\n![${file.name}](${data.url})\n`)
      } else {
        alert("上传失败: " + data.error)
      }
    } catch (e) {
      alert("上传出错")
    }
    
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const localUploadCommand = {
    name: "localUpload",
    keyCommand: "localUpload",
    buttonProps: { "aria-label": "Local Upload", title: "本地上传" },
    icon: <ImageIcon className="w-4 h-4" />,
    execute: () => {
      fileInputRef.current?.click();
    }
  }

  const unsplashCommand = {
    name: "unsplash",
    keyCommand: "unsplash",
    buttonProps: { "aria-label": "Unsplash", title: "Unsplash图库" },
    icon: <ImageIconRegular className="w-4 h-4" />,
    execute: () => {
      setUnsplashOpen(true);
    }
  }

  const pexelsCommand = {
    name: "pexels",
    keyCommand: "pexels",
    buttonProps: { "aria-label": "Pexels", title: "Pexels图库" },
    icon: <Camera className="w-4 h-4" />,
    execute: () => {
      setPexelsOpen(true);
    }
  }

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{initialData ? "编辑文章" : "发布新文章"}</h2>
        <div className="flex gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Switch 
              checked={status === "PUBLISHED"}
              onCheckedChange={(c) => setStatus(c ? "PUBLISHED" : "DRAFT")}
            />
            <Label>已发布</Label>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "保存中..." : "保存"}
          </Button>
        </div>
      </div>

      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
      />
      
      <UnsplashPicker 
        open={unsplashOpen} 
        onOpenChange={setUnsplashOpen} 
        onSelect={(url, alt) => setContent((prev: string) => prev + `\n![${alt}](${url})\n`)} 
      />

      <PexelsPicker 
        open={pexelsOpen} 
        onOpenChange={setPexelsOpen} 
        onSelect={(url, alt) => setContent((prev: string) => prev + `\n![${alt}](${url})\n`)} 
      />

      <div className="flex-1 overflow-hidden min-h-0" data-color-mode="light">
        <MDEditor
          value={content}
          onChange={(val) => setContent(val || "")}
          height="100%"
          className="h-full"
          commands={[
            ...commands.getCommands(),
            commands.divider,
            localUploadCommand,
            unsplashCommand,
            pexelsCommand
          ]}
        />
      </div>
    </div>
  )
}
