import type { Metadata } from "next";
import { Almarai } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { AppShell } from "@/components/layout/AppShell";
import { Providers } from "@/app/providers";
import "./globals.css";

const almarai = Almarai({
  weight: ["300", "400", "700", "800"],
  variable: "--font-almarai",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "CMA Bel Arabi",
  description:
    "منصة تعلم ذكية لدارسي CMA بالعربية مع محتوى إنجليزي تفاعلي.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${almarai.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased font-almarai bg-[#FDFDFD] dark:bg-[#0A0A0A]" suppressHydrationWarning>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <AppShell>
              {children}
            </AppShell>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
