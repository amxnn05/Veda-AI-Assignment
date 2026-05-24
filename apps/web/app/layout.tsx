import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { MainLayout } from "@/components/MainLayout";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

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
    <html lang="en">
      <body className={`${bricolageGrotesque.variable} ${bricolageGrotesque.className}`}>
        <MainLayout>
          {children}
        </MainLayout>
      </body>
    </html>
  );
}
