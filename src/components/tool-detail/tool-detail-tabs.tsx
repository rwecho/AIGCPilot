"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

interface ToolDetailTabsProps {
  locale: string;
}

export function ToolDetailTabs({ locale }: ToolDetailTabsProps) {
  const [activeTab, setActiveTab] = useState("intro");

  const tabs = [
    { id: "intro", label: locale === "zh" ? "产品介绍" : "Introduction" },
    { id: "traffic", label: locale === "zh" ? "网站流量" : "Traffic" },
    { id: "related", label: locale === "zh" ? "同类产品" : "Related" },
  ];

  const handleScroll = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.pageYOffset - 120;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-md border-y border-border mb-8 mt-8">
      <div className="flex items-center space-x-8 px-2 overflow-x-auto no-scrollbar max-w-7xl mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleScroll(tab.id)}
            className={cn(
              "whitespace-nowrap py-4 text-sm font-medium transition-colors border-b-2",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
