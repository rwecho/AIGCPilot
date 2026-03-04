import { Calendar, Eye } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils/time";
import Image from "next/image";

interface NewsItem {
  id: string;
  title: string;
  content: string | null;
  createdAt: Date;
  coverImage?: string | null;
  views?: number;
}

export function NewsCard({ news, locale }: { news: NewsItem; locale: string }) {
  // Mock views if not available in data
  const views = news.views || Math.floor(Math.random() * 10) + 1 + "K";
  
  // Clean content excerpt
  const excerpt = news.content ? news.content.replace(/[#*`_\[\]]/g, '').substring(0, 150) + '...' : "...";

  return (
    <div className="group flex flex-col sm:flex-row gap-6 py-6 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors px-2 -mx-2 rounded-lg">
      
      {/* Content (Left) */}
      <div className="flex-1 flex flex-col">
        <a href={`/${locale}/news/${news.id}`} className="group/link">
          <h3 className="font-bold text-xl leading-snug mb-3 group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400 transition-colors text-slate-900 dark:text-slate-100">
            {news.title}
          </h3>
          <p className="text-[15px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 md:line-clamp-3 mb-4">
            {excerpt}
          </p>
        </a>

        {/* Metadata */}
        <div className="mt-auto flex items-center gap-6 text-[13px] text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{formatRelativeTime(news.createdAt, locale)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            <span>{views}</span>
          </div>
        </div>
      </div>

      {/* Image (Right) */}
      <a 
        href={`/${locale}/news/${news.id}`} 
        className="w-full sm:w-[240px] shrink-0 aspect-video relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
      >
        <Image
          src={news.coverImage || `https://picsum.photos/seed/${news.id}/480/270`} // Fallback to picsum for now
          alt={news.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, 240px"
        />
      </a>
    </div>
  );
}
