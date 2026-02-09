import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const outfit = Outfit({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "HastDu - Technik Marktplatz",
  description: "Kaufe und verkaufe Technik-Produkte in deiner Nähe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={outfit.variable}>
      <body className="antialiased min-h-screen bg-background">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
