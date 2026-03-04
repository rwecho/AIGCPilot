import ReactMarkdown from "react-markdown";
import { ProgressiveImage } from "@/components/ui/progressive-image";

interface ToolDetailContentProps {
  locale: string;
  tool: any;
  content: string | null;
  summary: string | null;
}

export function ToolDetailContent({ locale, tool, content, summary }: ToolDetailContentProps) {
  return (
    <div className="space-y-12">
      {/* Intro Section */}
      <section id="intro" className="space-y-6 scroll-mt-32">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
          {locale === "zh" ? "产品介绍" : "Introduction"}
        </h2>
        
        {summary && (
          <p className="text-muted-foreground leading-relaxed text-base">
            {summary}
          </p>
        )}

        {/* Screenshot */}
        {tool.screenshotUrl && (
          <div className="relative aspect-video rounded-2xl overflow-hidden border shadow-sm bg-muted max-w-3xl">
            <ProgressiveImage
              src={tool.screenshotUrl}
              alt="screenshot"
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Video */}
        {tool.videoUrl && (
          <div className="relative aspect-video rounded-2xl overflow-hidden border shadow-sm bg-black max-w-3xl">
            <video
              src={tool.videoUrl}
              poster={tool.screenshotUrl || undefined}
              controls
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Markdown content */}
        {content ? (
          <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-foreground prose-a:text-blue-600 prose-img:rounded-xl">
            <ReactMarkdown>{content}</ReactMarkdown>
          </article>
        ) : (
          <div className="text-muted-foreground italic py-4">
            {locale === "zh" ? "暂无详细介绍..." : "No detailed description yet..."}
          </div>
        )}
      </section>

      {/* Traffic Section (Mock) */}
      <section id="traffic" className="space-y-6 scroll-mt-32">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
          {locale === "zh" ? "网站流量" : "Traffic"}
        </h2>
        <div className="h-64 rounded-2xl border bg-muted/20 flex items-center justify-center text-muted-foreground">
          {locale === "zh" ? "流量图表数据展示区" : "Traffic Chart Area"}
        </div>
      </section>
    </div>
  );
}
