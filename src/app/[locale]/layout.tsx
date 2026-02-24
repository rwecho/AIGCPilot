import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/layout/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return [{ locale: 'zh' }, { locale: 'en' }]
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const siteName = "AIGCPilot"
  const title = locale === 'zh' 
    ? "AIGCPilot | 领航 AI 时代，你的智能决策助手" 
    : "AIGCPilot | Navigate the AI Era, Your Intelligent Decision Copilot"
  const description = locale === 'zh' 
    ? "AIGCPilot 汇集全球顶级 AI 工具、视频、设计与开发应用。内置智能 Copilot，助您精准发现生产力利器。" 
    : "AIGCPilot curates top-tier global AI tools. With built-in AI Copilot to help you discover the perfect productivity weapons."

  return {
    title,
    description,
    keywords: "AIGCPilot, AIGC 导航, AI 工具, Copilot 助手, AI 生产力",
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'zh-CN': '/zh',
        'en-US': '/en',
      },
    },
    openGraph: {
      title,
      description,
      siteName,
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
