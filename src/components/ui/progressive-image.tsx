"use client"

import React, { useState } from "react"
import Image, { ImageProps } from "next/image"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface ProgressiveImageProps extends Omit<ImageProps, "onLoad"> {
  containerClassName?: string
}

export function ProgressiveImage({
  src,
  alt,
  className,
  containerClassName,
  ...props
}: ProgressiveImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={cn("relative overflow-hidden bg-muted", containerClassName)}>
      {/* 当图片正在加载时，显示一个底层的模糊占位效果或 Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted animate-pulse">
          <Skeleton className="h-full w-full" />
        </div>
      )}

      <Image
        src={src}
        alt={alt}
        className={cn(
          "duration-700 ease-in-out transition-all",
          isLoading 
            ? "scale-110 blur-2xl grayscale" 
            : "scale-100 blur-0 grayscale-0",
          className
        )}
        onLoad={() => setIsLoading(false)}
        {...props}
      />
    </div>
  )
}
