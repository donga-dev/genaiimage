import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Aurora } from "@/components/Aurora";
import { BRAND } from "@/lib/brand";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${BRAND.name} — Image generate`,
  description: BRAND.description,
  applicationName: BRAND.name,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="relative min-h-full">
        <Aurora />
        <div className="relative z-10 min-h-full">{children}</div>
      </body>
    </html>
  );
}
