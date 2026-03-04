import { cn } from "@/lib/utils"

export function TopBanner() {
  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-[#e1ebff] via-[#eef4ff] to-[#e6efff] dark:from-blue-950/40 dark:via-blue-900/20 dark:to-blue-950/40 rounded-2xl p-8 md:p-12 mb-6 border border-blue-50 dark:border-blue-900/30 shadow-sm">
      {/* Decorative Abstract background blobs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400/20 blur-3xl rounded-full" />
      <div className="absolute -bottom-24 right-1/4 w-64 h-64 bg-indigo-400/20 blur-3xl rounded-full" />

      {/* Decorative Floating Pills */}
      <div className="absolute right-8 md:right-[15%] top-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center gap-4 z-10 select-none pointer-events-none">
        <div className="relative right-[-20px] top-[-30px] bg-white/50 dark:bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/60 dark:border-white/20 shadow-sm transform -rotate-6">
          <span className="text-blue-700/80 dark:text-blue-300 font-bold text-lg">AI产品</span>
        </div>
        <div className="relative z-20 bg-gradient-to-r from-[#4d88ff] to-[#6b9dff] rounded-full px-12 py-5 shadow-xl shadow-blue-500/20 transform -rotate-2">
          <span className="text-white font-black text-2xl tracking-wider">解决方案</span>
        </div>
        <div className="relative left-[-20px] top-[-20px] bg-white/50 dark:bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/60 dark:border-white/20 shadow-sm transform rotate-3 z-0">
          <span className="text-blue-700/80 dark:text-blue-300 font-bold text-lg">算力市场</span>
        </div>
        <div className="absolute bottom-[-30px] right-[40px] bg-[#6b9dff]/90 backdrop-blur-md rounded-full px-6 py-2.5 shadow-lg transform rotate-6 z-10">
          <span className="text-white font-semibold text-md">AI工具</span>
        </div>
      </div>

      <div className="relative z-20 max-w-xl">
        <h2 className="text-3xl md:text-[42px] leading-[1.2] font-black text-gray-900 dark:text-white tracking-tight mb-8">
          获取最新的人工智能新闻，<br className="hidden md:block" />每天只需5分钟
        </h2>
        
        <div className="inline-flex items-center bg-[#81a9f0] hover:bg-[#729be8] transition-colors cursor-pointer dark:bg-blue-600 text-white font-medium px-6 py-2.5 rounded-[12px] text-lg shadow-sm">
          已有 10000+ 订阅者
        </div>
      </div>
    </div>
  )
}
