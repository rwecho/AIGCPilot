"use client";

import { Tool } from "@prisma/client"
import Link from "next/link"
import { Flame } from "lucide-react"

interface LeaderboardProps {
  tools: Tool[];
  locale: string;
}

export function Leaderboard({ tools, locale }: LeaderboardProps) {
  return (
    <div className="bg-white dark:bg-[#121212] rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <h3 className="font-bold flex items-center text-[15px] text-gray-900 dark:text-gray-100">
          <Flame className="w-4 h-4 mr-1.5 text-orange-500 fill-orange-500" />
          {locale === "zh" ? "本周AI热点排行榜" : "Weekly AI Rankings"}
        </h3>
      </div>
      <div className="p-0">
        {tools.map((tool, index) => (
          <Link 
            key={tool.id} 
            href={`/${locale}/tool/${tool.id}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-muted/50 transition-colors border-b border-gray-50 dark:border-gray-800/50 last:border-b-0 group"
          >
            {/* Rank Number */}
            <div className={`
              text-sm font-bold w-5 h-5 flex flex-shrink-0 items-center justify-center rounded-sm
              ${index === 0 ? 'text-[#FF4A4A]' : 
                index === 1 ? 'text-[#FF7B00]' : 
                index === 2 ? 'text-[#FFA100]' : 
                'text-gray-400 group-hover:text-primary transition-colors'}
            `}>
              {index + 1}
            </div>

            {/* Tool Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-[13px] text-gray-800 dark:text-gray-200 line-clamp-1 group-hover:text-[#0066FF] transition-colors">
                {locale === "zh" ? tool.title_zh : tool.title_en}
              </h4>
            </div>

            {/* View Count (Mocked with Rate for now) */}
            <div className="text-[11px] font-medium text-gray-400 flex-shrink-0 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {Math.floor(Number(tool.rate) * 10000).toLocaleString()}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
