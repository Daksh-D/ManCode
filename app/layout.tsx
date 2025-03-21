//File: app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import ClientWrapper from "@/components/ClientWrapper";
import AppContent from "@/components/AppContent";

const inter = Inter({ subsets: ["latin"] });

export const metadata = { //Added metadata
    title: 'ManCode',
    description: 'E-commerce website for mens fashion.',
  }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ClientWrapper>
            <AppContent>{children}</AppContent>
          </ClientWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}