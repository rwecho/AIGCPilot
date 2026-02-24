"use client"

import React, { useState } from "react"
import Image, { ImageProps } from "next/image"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface ProgressiveImageProps extends Omit<ImageProps, "onLoad"> {
  containerClassName?: string
  minHeight?: string | number
}

export function ProgressiveImage({
  src,
  alt,
  className,
  containerClassName,
  minHeight = "200px", // 默认给一个最小高度防止塌陷
  fill,
  ...props
}: ProgressiveImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  return (
    <div 
      className={cn(
        "relative overflow-hidden bg-muted transition-all duration-500",
        fill ? "h-full w-full" : "", 
        containerClassName
      )}
      style={{ minHeight: fill ? undefined : minHeight }}
    >
      {/* 加载中或加载失败时的骨架屏 */}
      {(isLoading || isError) && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted">
          <Skeleton className="h-full w-full animate-pulse" />
          {isError && (
            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground/50 italic p-4 text-center">
              图片加载失败
            </div>
          )}
        </div>
      )}

      <Image
        src={src}
        alt={alt}
        fill={fill}
        className={cn(
          "duration-700 ease-in-out transition-all",
          isLoading 
            ? "scale-105 blur-lg grayscale opacity-0" 
            : "scale-100 blur-0 grayscale-0 opacity-100",
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setIsError(true)
        }}
        {...props}
      />
    </div>
  )
}
