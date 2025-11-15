import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'OpenNana 提示词图库',
  description: '浏览、筛选模型提示词案例库，快速复制提示词，探索灵感。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body className="min-h-screen bg-gradient-dark">{children}</body>
    </html>
  )
}