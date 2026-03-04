"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Search } from "lucide-react"

interface PexelsPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string, alt: string) => void;
}

export function PexelsPicker({ open, onOpenChange, onSelect }: PexelsPickerProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/admin/pexels?query=${encodeURIComponent(query)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Search failed")
      setResults(data.photos || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (photo: any) => {
    // Pexels large image format 
    const url = photo.src.large;
    const alt = photo.alt || "Pexels Image"
    onSelect(url, alt)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Pexels</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 mb-4">
          <Input 
            placeholder="Search for high-resolution photos..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
        
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {results.map((photo) => (
              <div 
                key={photo.id} 
                className="relative group cursor-pointer rounded-md overflow-hidden bg-muted aspect-video"
                onClick={() => handleSelect(photo)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={photo.src.medium} 
                  alt={photo.alt || ""}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <span className="text-white text-xs truncate max-w-full">
                    By {photo.photographer}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {!loading && results.length === 0 && query && (
             <div className="text-center py-10 text-muted-foreground w-full">No results found</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
