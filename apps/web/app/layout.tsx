import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { MainLayout } from "@/components/MainLayout";
import SmoothScroll from "@/components/SmoothScroll";

const bricolageGrotesque = localFont({
  src: "./fonts/BricolageGrotesque.woff2",
  variable: "--font-bricolage",
  weight: "200 800",
});

const themeInitScript = `
  try {
    const savedTheme = window.localStorage.getItem('veda-theme');
    document.documentElement.dataset.theme = savedTheme === 'dark' ? 'dark' : 'light';
  } catch {
    document.documentElement.dataset.theme = 'light';
  }
`;

export const metadata: Metadata = {
  title: "VedaAI - AI Powered Teaching Assistant",
  description: "Create assignments and question papers with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={bricolageGrotesque.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${bricolageGrotesque.className} antialiased`}>
        <SmoothScroll>
          <MainLayout>
            {children}
          </MainLayout>
        </SmoothScroll>
      </body>
    </html>
  );
}
