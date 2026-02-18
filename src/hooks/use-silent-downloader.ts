'use client';

import { useEffect, useRef, useCallback } from 'react';
import { get, set } from 'idb-keyval';
import { Preferences } from '@capacitor/preferences';
import { App, AppState } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

// Constants
const TOTAL_SURAHS = 114;
const LAST_DOWNLOADED_KEY = 'last_downloaded_surah';
const SURAH_DATA_PREFIX = 'surah_';

// API endpoint for Surah data - adjust to your actual API
const SURAH_API_BASE = 'https://api.alquran.cloud/v1/surah';

interface SurahData {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: string;
    numberOfAyahs: number;
    ayahs: unknown[];
}

/**
 * Get the last downloaded Surah ID from persistent storage.
 * Returns 0 if none have been downloaded yet.
 */
async function getLastDownloadedSurah(): Promise<number> {
    try {
        if (Capacitor.isNativePlatform()) {
            const result = await Preferences.get({ key: LAST_DOWNLOADED_KEY });
            return result.value ? parseInt(result.value, 10) : 0;
        } else {
            // Fallback to localStorage for web
            const value = localStorage.getItem(LAST_DOWNLOADED_KEY);
            return value ? parseInt(value, 10) : 0;
        }
    } catch (error) {
        console.error('[SilentDownloader] Error getting last downloaded Surah:', error);
        return 0;
    }
}

/**
 * Save the last downloaded Surah ID to persistent storage.
 */
async function setLastDownloadedSurah(surahId: number): Promise<void> {
    try {
        if (Capacitor.isNativePlatform()) {
            await Preferences.set({
                key: LAST_DOWNLOADED_KEY,
                value: surahId.toString(),
            });
        } else {
            localStorage.setItem(LAST_DOWNLOADED_KEY, surahId.toString());
        }
    } catch (error) {
        console.error('[SilentDownloader] Error saving last downloaded Surah:', error);
    }
}

/**
 * Check if a Surah is already downloaded in IndexedDB.
 */
async function isSurahDownloaded(surahId: number): Promise<boolean> {
    try {
        const data = await get(`${SURAH_DATA_PREFIX}${surahId}`);
        return data !== undefined;
    } catch {
        return false;
    }
}

/**
 * Download a single Surah from the API and save to IndexedDB.
 */
async function downloadAndSaveSurah(surahId: number): Promise<boolean> {
    try {
        // Check if already downloaded
        if (await isSurahDownloaded(surahId)) {
            console.log(`[SilentDownloader] Surah ${surahId} already downloaded, skipping`);
            return true;
        }

        // Fetch from API
        const response = await fetch(`${SURAH_API_BASE}/${surahId}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const json = await response.json();
        if (json.code !== 200 || !json.data) {
            throw new Error('Invalid API response');
        }

        const surahData: SurahData = json.data;

        // Save to IndexedDB
        await set(`${SURAH_DATA_PREFIX}${surahId}`, surahData);

        // Update last downloaded marker
        await setLastDownloadedSurah(surahId);

        console.log(`[SilentDownloader] Downloaded and saved Surah ${surahId}: ${surahData.englishName}`);
        return true;
    } catch (error) {
        console.error(`[SilentDownloader] Failed to download Surah ${surahId}:`, error);
        return false;
    }
}

/**
 * Silent Background Surah Downloader Hook
 * 
 * Features:
 * - Auto-starts on mount
 * - Smart resume: Remembers last downloaded Surah
 * - Persistent storage with IndexedDB (via idb-keyval)
 * - Background support: Continues downloading when app is minimized
 * - Retry logic on network failure
 */
export function useSilentDownloader() {
    const isDownloadingRef = useRef(false);
    const shouldContinueRef = useRef(true);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    /**
     * Main download loop - downloads Surahs sequentially
     */
    const startDownloadLoop = useCallback(async () => {
        // Prevent multiple loops from running
        if (isDownloadingRef.current) {
            console.log('[SilentDownloader] Download loop already running');
            return;
        }

        isDownloadingRef.current = true;
        shouldContinueRef.current = true;

        console.log('[SilentDownloader] Starting download loop...');

        try {
            // Get the last downloaded Surah to resume from
            const lastDownloaded = await getLastDownloadedSurah();
            const startFrom = lastDownloaded + 1;

            console.log(`[SilentDownloader] Resuming from Surah ${startFrom}`);

            if (startFrom > TOTAL_SURAHS) {
                console.log('[SilentDownloader] All Surahs already downloaded!');
                isDownloadingRef.current = false;
                return;
            }

            // Sequential download loop
            for (let surahId = startFrom; surahId <= TOTAL_SURAHS; surahId++) {
                // Check if we should stop (app closed, etc.)
                if (!shouldContinueRef.current) {
                    console.log('[SilentDownloader] Download loop stopped');
                    break;
                }

                const success = await downloadAndSaveSurah(surahId);

                if (!success) {
                    // Network error - wait and retry
                    console.log(`[SilentDownloader] Will retry Surah ${surahId} in 5 seconds...`);

                    await new Promise<void>((resolve) => {
                        retryTimeoutRef.current = setTimeout(() => {
                            resolve();
                        }, 5000);
                    });

                    // Retry the same Surah
                    surahId--; // Decrement to retry the same index
                    continue;
                }

                // Small delay between downloads to avoid hammering the API
                await new Promise((resolve) => setTimeout(resolve, 200));
            }

            console.log('[SilentDownloader] Download loop completed');
        } catch (error) {
            console.error('[SilentDownloader] Download loop error:', error);
        } finally {
            isDownloadingRef.current = false;
        }
    }, []);

    /**
     * Stop the download loop gracefully
     */
    const stopDownloadLoop = useCallback(() => {
        shouldContinueRef.current = false;
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }
    }, []);

    // Main effect - starts on mount
    useEffect(() => {
        // Start downloading on mount
        startDownloadLoop();

        // Handle app state changes (foreground/background)
        let appStateListener: { remove: () => void } | null = null;

        if (Capacitor.isNativePlatform()) {
            App.addListener('appStateChange', (state: AppState) => {
                console.log('[SilentDownloader] App state changed:', state.isActive ? 'FOREGROUND' : 'BACKGROUND');

                if (state.isActive) {
                    // App came to foreground - resume downloading
                    if (!isDownloadingRef.current) {
                        startDownloadLoop();
                    }
                }
                // Note: We DON'T stop in background - let it continue as long as possible
            }).then((listener) => {
                appStateListener = listener;
            });
        }

        // Handle online/offline events
        const handleOnline = () => {
            console.log('[SilentDownloader] Network restored - resuming download');
            if (!isDownloadingRef.current) {
                startDownloadLoop();
            }
        };

        const handleOffline = () => {
            console.log('[SilentDownloader] Network lost - pausing download');
            stopDownloadLoop();
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Cleanup on unmount
        return () => {
            stopDownloadLoop();
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            if (appStateListener) {
                appStateListener.remove();
            }
        };
    }, [startDownloadLoop, stopDownloadLoop]);

    // This hook returns nothing - it's silent and runs in the background
    return null;
}

/**
 * Utility function to get a downloaded Surah from IndexedDB.
 * Use this in your Quran reader components.
 */
export async function getDownloadedSurah(surahId: number): Promise<SurahData | null> {
    try {
        const data = await get(`${SURAH_DATA_PREFIX}${surahId}`);
        return data || null;
    } catch {
        return null;
    }
}

/**
 * Utility function to check download progress.
 */
export async function getDownloadProgress(): Promise<{ downloaded: number; total: number; percentage: number }> {
    const lastDownloaded = await getLastDownloadedSurah();
    return {
        downloaded: lastDownloaded,
        total: TOTAL_SURAHS,
        percentage: Math.round((lastDownloaded / TOTAL_SURAHS) * 100),
    };
}

/**
 * Utility function to reset download progress (for testing/debugging).
 */
export async function resetDownloadProgress(): Promise<void> {
    await setLastDownloadedSurah(0);
    console.log('[SilentDownloader] Download progress reset');
}
