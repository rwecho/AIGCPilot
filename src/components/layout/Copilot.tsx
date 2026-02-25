"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Bot,
  ChevronRight,
  Eraser,
  Loader2,
  Send,
  Sparkles,
  User as UserIcon,
} from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { useAppStore } from "@/lib/store/useAppStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type CopilotMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  parts?: Array<{ type: string; text?: string }>;
};

function getMessageText(message: CopilotMessage): string {
  if (!message.parts?.length) return "";

  return message.parts
    .filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

function ChatMessages({
  messages,
  status,
  error,
}: {
  messages: CopilotMessage[];
  status: "submitted" | "streaming" | "ready" | "error";
  error: Error | undefined;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  return (
    <div ref={listRef} className="flex-1 overflow-y-auto p-4">
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
          连接中断：{error.message}
        </div>
      )}

      {messages.length === 0 && status === "ready" && (
        <div className="flex h-[45vh] flex-col items-center justify-center gap-3 text-center">
          <div className="rounded-2xl bg-primary/10 p-4">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1 px-4">
            <h3 className="text-sm font-bold">Copilot 已就绪</h3>
            <p className="text-xs text-muted-foreground">
              问我工具推荐、场景选型、提示词优化，或者让我们一起把灵感变产品。
            </p>
          </div>
        </div>
      )}

      <div className="space-y-5 pb-2">
        {messages
          .filter((message) => message.role !== "system")
          .map((message) => {
            const text = getMessageText(message);
            if (!text && message.role !== "assistant") return null;

            return (
              <div
                key={message.id}
                className={cn(
                  "flex flex-col gap-1.5",
                  message.role === "user" ? "items-end" : "items-start",
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground",
                    message.role === "user" ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  <span
                    className={cn(
                      "rounded-md p-1",
                      message.role === "user" ? "bg-muted" : "bg-primary/10",
                    )}
                  >
                    {message.role === "user" ? (
                      <UserIcon className="h-3 w-3" />
                    ) : (
                      <Bot className="h-3 w-3 text-primary" />
                    )}
                  </span>
                  <span>{message.role === "user" ? "You" : "Copilot"}</span>
                </div>

                <div
                  className={cn(
                    "max-w-[94%] rounded-2xl border p-3 text-sm leading-relaxed shadow-sm",
                    message.role === "user"
                      ? "border-primary/10 bg-primary text-primary-foreground"
                      : "border-border bg-background",
                  )}
                >
                  <article
                    className={cn(
                      "prose prose-sm max-w-none overflow-hidden text-pretty wrap-break-word",
                      message.role === "user"
                        ? "prose-invert"
                        : "dark:prose-invert",
                    )}
                  >
                    <ReactMarkdown>{text || "..."}</ReactMarkdown>
                  </article>
                </div>
              </div>
            );
          })}

        {(status === "submitted" || status === "streaming") && (
          <div className="w-fit rounded-xl border bg-card p-2.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              正在思考中...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Composer({
  value,
  onChange,
  onSubmit,
  isBusy,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isBusy: boolean;
}) {
  const canSend = value.trim().length > 0 && !isBusy;

  return (
    <div className="border-t bg-muted/10 p-3">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="relative"
      >
        <Input
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
          placeholder="输入问题，按 Enter 发送..."
          className="h-11 rounded-xl border-muted-foreground/20 bg-background pr-11"
          disabled={isBusy}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!canSend}
          className="absolute right-1.5 top-1.5 h-8 w-8 rounded-lg"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
      <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-muted-foreground">
        <span>Powered by DeepSeek</span>
        <span className="font-mono">AI SDK 6</span>
      </div>
    </div>
  );
}

export default function Copilot() {
  const isMobile = useIsMobile();
  const [input, setInput] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { externalInput, setExternalInput } = useAppStore();
  const { messages, sendMessage, status, error, setMessages, clearError } =
    useChat();

  const isBusy = status === "submitted" || status === "streaming";
  const typedMessages = useMemo(() => messages as CopilotMessage[], [messages]);

  useEffect(() => {
    if (!externalInput) return;

    sendMessage({ text: externalInput });
    setExternalInput(null);
  }, [externalInput, sendMessage, setExternalInput]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isBusy) return;

    clearError();
    sendMessage({ text });
    setInput("");
  };

  const handleClear = () => {
    setMessages([]);
    clearError();
  };

  const setCollapsed = (next: boolean) => {
    setIsCollapsed(next);
    localStorage.setItem("copilot-collapsed", String(next));
  };

  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl transition-transform hover:scale-110 active:scale-95"
          >
            <Sparkles className="h-6 w-6" />
          </Button>
        </SheetTrigger>

        <SheetContent
          side="bottom"
          className="flex h-[85vh] flex-col rounded-t-[2rem] border-none p-0 shadow-2xl"
        >
          <SheetHeader className="flex flex-row items-center justify-between border-b bg-muted/20 p-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary p-1.5">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <SheetTitle className="pt-1 text-sm font-bold">
                AIGCPilot 助手
              </SheetTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="h-8 w-8"
            >
              <Eraser className="h-4 w-4" />
            </Button>
          </SheetHeader>

          <ChatMessages
            messages={typedMessages}
            status={status}
            error={error}
          />
          <Composer
            value={input}
            onChange={setInput}
            onSubmit={handleSend}
            isBusy={isBusy}
          />
        </SheetContent>
      </Sheet>
    );
  }

  if (isCollapsed) {
    return (
      <aside
        className="w-12 shrink-0 cursor-pointer border-l bg-card py-6 shadow-xl transition-colors hover:bg-muted/40"
        onClick={() => setCollapsed(false)}
      >
        <div className="flex flex-col items-center gap-6">
          <div className="rounded-full bg-primary/10 p-2">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="[writing-mode:vertical-lr] text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            AIGCPilot
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="relative z-40 flex h-full w-80 shrink-0 flex-col border-l bg-card shadow-2xl">
      <Button
        variant="secondary"
        size="icon"
        className="absolute -left-3 top-1/2 z-50 h-6 w-6 -translate-y-1/2 rounded-full border shadow-md"
        onClick={() => setCollapsed(true)}
      >
        <ChevronRight className="h-3 w-3" />
      </Button>

      <div className="flex items-center justify-between border-b bg-muted/20 p-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary p-1.5 shadow-sm">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-tight">Copilot</div>
            <div className="text-[10px] text-muted-foreground">
              Smart Assistant
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleClear}
        >
          <Eraser className="h-3.5 w-3.5" />
        </Button>
      </div>

      <ChatMessages messages={typedMessages} status={status} error={error} />
      <Composer
        value={input}
        onChange={setInput}
        onSubmit={handleSend}
        isBusy={isBusy}
      />
    </aside>
  );
}
