"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Link from "next/link";
import { Clock } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils/time";

export function NewsTicker({
  news,
  locale,
}: {
  news: any[];
  locale: string;
}) {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      orientation="vertical"
      plugins={[plugin.current]}
      className="w-full h-14 relative bg-card/40 border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent className="h-14 mt-0">
        {news.map((item) => (
          <CarouselItem key={item.id} className="pt-0 basis-full">
            <Link
              href={`/${locale}/news/${item.id}`}
              className="flex items-center justify-between px-4 h-full hover:bg-muted/50 transition-colors group"
            >
              <h4 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors flex-1 mr-4">
                {item.title}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-caveat font-medium whitespace-nowrap shrink-0">
                <Clock className="w-3.5 h-3.5" />
                {formatRelativeTime(item.createdAt, locale)}
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
