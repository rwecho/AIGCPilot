import Link from "next/link";

interface DailyItem {
  id: string;
  title: string;
  rank: number;
}

// Mock top 10 list
const DUMMY_DAILY_LIST: DailyItem[] = [
  { id: "1", rank: 1, title: "万亿参数大杀器！DeepSeek V4 细节曝光：100 万上下文 + 原生多模态" },
  { id: "2", rank: 2, title: "DeepSeek V4下周发布:原生支持影音图文生成，适配国产算力" },
  { id: "3", rank: 3, title: "打破“全家桶”依赖！阿里云百炼首推“多模型自由切换”: Qwen3.5、GLM-5 等顶尖开源大模..." },
  { id: "4", rank: 4, title: "Agent 成本炸穿?阿里云 Coding Plan 祭出“7.9元全家桶”破局" },
  { id: "5", rank: 5, title: "估值突破 120 亿美元！月之暗面再获 7 亿美金融资：K2.5 模型变现力惊人，杨植麟称“短期..." },
  { id: "6", rank: 6, title: "拜年图惊现脏话!腾讯元宝深陷 AI 异常输出争议，官方紧急致歉校正" },
  { id: "7", rank: 7, title: "字节调整 Seedance2.0视频生成服务，应对迪士尼等版权侵权指控" },
  { id: "8", rank: 8, title: "2026春招风口:AI岗位需求激增14倍，大模型研发迈入“百万年薪”时代" },
  { id: "9", rank: 9, title: "从“炸裂 Demo”到“生产工具”：万兴剧厂全链路平台发布，联手生数科技攻克 AI 视频“随机性..." },
  { id: "10", rank: 10, title: "DeepSeek V4 即将上线！全新多模态模型将颠覆AI界" },
];

function getRankColor(rank: number) {
  switch (rank) {
    case 1:
      return "text-amber-500 font-bold text-lg";
    case 2:
      return "text-blue-500 font-bold text-lg";
    case 3:
      return "text-emerald-500 font-bold text-lg";
    default:
      return "text-gray-400 font-semibold text-base";
  }
}

export function NewsSidebar({ locale }: { locale: string }) {
  return (
    <div className="w-full xl:w-[320px] shrink-0 space-y-6">
      
      {/* Target Title: 最新AI日报 */}
      <div className="space-y-4">
        <h2 className="text-[22px] font-bold text-slate-900 dark:text-slate-100">
          {locale === "zh" ? "最新AI日报" : "Latest AI Daily"}
        </h2>
        
        <div className="flex flex-col gap-3">
          {DUMMY_DAILY_LIST.map((item) => (
            <Link 
              key={item.id} 
              href={`/${locale}/news/${item.id}`}
              className="flex gap-4 p-4 rounded-xl border bg-card/50 hover:bg-card hover:shadow-sm transition-all group"
            >
              <span className={`shrink-0 ${getRankColor(item.rank)} w-6 text-center`}>
                #{item.rank}
              </span>
              <span className="text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 transition-colors">
                {item.title}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Ad Placeholder Box */}
      <div className="mt-8 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <img 
          src="https://news.aibase.com/images/ad-placeholder-1.jpg" // We need a real ad banner or we can build one visually. I will use a generated placeholder or build with CSS
          alt="Site Ads"
          className="w-full h-auto object-cover hidden" // Wait, I will generate a cool CSS banner instead of dead image link
        />
        
        {/* CSS mockup of the given ad banner (purple gradient, QR code) */}
        <div className="w-full aspect-square bg-gradient-to-br from-pink-100 via-purple-50 to-purple-200 dark:from-purple-900/40 dark:via-purple-800/20 dark:to-pink-900/20 p-6 flex flex-col justify-between relative overflow-hidden group cursor-pointer">
          <div className="absolute top-0 right-0 bg-white/50 dark:bg-black/50 text-[10px] px-1 text-gray-400">广告</div>
          
          <div className="z-10 mt-2 space-y-4">
            <h3 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100">站长团购</h3>
            <div className="text-sm font-bold text-pink-600 dark:text-pink-400 leading-snug">
              汇聚海量AI系统<br/>
              各大爆款AI产品<br/>
              应有尽有
            </div>
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow-sm self-end z-10 w-32 h-32 ml-auto mb-2 relative">
            <div className="absolute inset-2 border border-dashed border-gray-300 rounded flex items-center justify-center">
               <span className="text-xs text-gray-400 font-medium">QR Code</span>
            </div>
            {/* The little Z icon */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 rounded flex items-center justify-center w-6 h-6">
              <span className="text-white font-bold text-[10px]">Z</span>
            </div>
          </div>
          
          <div className="text-[11px] text-gray-500 z-10 self-end mt-2">
            联系客服 · 获取<span className="text-red-500 font-bold">更多优惠</span>
          </div>

          {/* Decorative shapes */}
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-300/30 rounded-full blur-2xl"></div>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-300/30 rounded-full blur-2xl"></div>
        </div>
      </div>
    </div>
  );
}
