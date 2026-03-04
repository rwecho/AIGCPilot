import { ToolCard } from "@/components/layout/ToolCard";

interface ToolDetailSidebarProps {
  locale: string;
  similarTools: any[];
}

export function ToolDetailSidebar({ locale, similarTools }: ToolDetailSidebarProps) {
  if (!similarTools || similarTools.length === 0) return null;

  return (
    <div id="related" className="space-y-6 scroll-mt-32 sticky top-32">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <div className="w-1.5 h-5 bg-blue-600 rounded-full"></div>
        {locale === "zh" ? "精选产品" : "Featured Products"}
      </h3>
      <div className="flex flex-col gap-4">
        {similarTools.map((t) => (
          <ToolCard key={t.id} tool={t} /> 
        ))}
      </div>
    </div>
  );
}
