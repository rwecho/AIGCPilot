"use client"

import { useEffect, useState, use } from "react"
import ArticleEditor from "@/components/admin/ArticleEditor"

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/articles/${id}`)
      .then(res => res.json())
      .then(data => {
        setArticle(data)
        setLoading(false)
      })
  }, [id])

  if (loading) return <div className="p-8">加载中...</div>
  if (!article) return <div className="p-8">未找到文章</div>

  return (
    <div className="p-8">
      <ArticleEditor initialData={article} />
    </div>
  )
}
