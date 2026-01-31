
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { cn } from '@/lib/utils';
import { SettingsProvider } from '@/components/providers/settings-provider';
import { AuroraBackground } from '@/components/aurora-background';
import { Toaster } from "@/components/ui/toaster";
import { AudioPlayerProvider } from '@/components/providers/audio-player-provider';
import { GlobalPlayer } from '@/components/global-player';
import { LoadingProvider } from '@/components/providers/loading-provider';
import { AppContent } from '@/components/providers/app-content';
import { SilentDownloadProvider } from '@/components/providers/silent-download-provider';

export const metadata: Metadata = {
  title: 'Aniro',
  description: 'An elegant Islamic lifestyle application.',
};

import { AzanPlayer } from '@/components/providers/azan-player';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased')}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SettingsProvider>
            <LoadingProvider>
              <AudioPlayerProvider>
                <SilentDownloadProvider>
                  <AppContent>
                    <AuroraBackground>
                      <main className="pb-28">{children}</main>
                    </AuroraBackground>
                    <GlobalPlayer />
                    <AzanPlayer />
                    <Toaster />
                  </AppContent>
                </SilentDownloadProvider>
              </AudioPlayerProvider>
            </LoadingProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
