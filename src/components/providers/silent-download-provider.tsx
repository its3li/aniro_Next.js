'use client';

import { useSilentDownloader } from '@/hooks/use-silent-downloader';

/**
 * Silent Download Provider
 * 
 * This component wraps the useSilentDownloader hook to enable
 * background Surah downloading throughout the app lifecycle.
 * 
 * It renders nothing - it's purely a background process.
 */
export function SilentDownloadProvider({ children }: { children: React.ReactNode }) {
    // Start the silent downloader
    useSilentDownloader();

    // Just render children - no UI from this provider
    return <>{children}</>;
}
