'use cache'

import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/contexts/ThemeContext";
import { SessionProvider } from "@/lib/contexts/SessionContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { TRPCProvider } from "@/lib/trpc-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Netflix - Stream Your Favorites",
  description: "Watch TV shows and movies anytime, anywhere.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className="bg-background text-foreground">
        <ErrorBoundary>
          <ThemeProvider defaultTheme="dark">
            <TooltipProvider>
              <TRPCProvider>
                <SessionProvider>
                  {children}
                  <Toaster />
                </SessionProvider>
              </TRPCProvider>
            </TooltipProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
