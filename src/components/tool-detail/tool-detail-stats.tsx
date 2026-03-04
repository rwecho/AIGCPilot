export function ToolDetailStats({ locale, categoryName }: { locale: string; categoryName: string }) {
  const stats = [
    { label: locale === "zh" ? "月总访问量" : "Monthly Visits", value: "37.59M" },
    { label: locale === "zh" ? "跳出率" : "Bounce Rate", value: "11.83%" },
    { label: locale === "zh" ? "访问时长" : "Avg Duration", value: "00:10:48" },
    { label: locale === "zh" ? "访问页数" : "Pages/Visit", value: "6.60" },
    { label: locale === "zh" ? "全球排名" : "Global Rank", value: "#12,456" },
    { label: locale === "zh" ? "所属品类" : "Category", value: categoryName },
    { label: locale === "zh" ? "支持终端" : "Platforms", value: "Web, Mac, Win" },
    { label: locale === "zh" ? "定价模式" : "Pricing", value: "Freemium" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      {stats.map((stat, i) => (
        <div key={i} className="flex flex-col items-center justify-center p-4 rounded-xl bg-muted/30 border border-muted/50 hover:bg-muted/50 transition-colors">
          <div className="text-xl font-bold text-foreground mb-1">{stat.value}</div>
          <div className="text-sm text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
