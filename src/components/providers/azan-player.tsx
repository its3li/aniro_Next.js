'use client';

import { useEffect, useRef } from 'react';
import { useSettings } from './settings-provider';
import { getPrayerTimes, PrayerTime, getTotalOffset } from '@/lib/prayer';
import { useLocation } from '@/hooks/use-location';

export function AzanPlayer() {
    const { settings } = useSettings();
    const { coordinates } = useLocation();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const lastPlayedPrayerRef = useRef<string | null>(null);

    useEffect(() => {
        // Initialize audio element
        if (!audioRef.current) {
            audioRef.current = new Audio('/azan.mp3');
        }

        const checkPrayerTime = () => {
            const now = new Date();
            // Use location if available, otherwise defaults (Mecca)
            const lat = coordinates?.latitude;
            const lng = coordinates?.longitude;

            const totalOffset = getTotalOffset(settings.prayerOffset, settings.dstMode);
            const prayers = getPrayerTimes(now, lat, lng, totalOffset, settings.calculationMethod);

            const currentPrayer = prayers.find(p => {
                const prayerTime = p.date;
                const diff = Math.abs(now.getTime() - prayerTime.getTime());
                // Check if within 1 minute of prayer time
                return diff < 60000;
            });

            if (currentPrayer && lastPlayedPrayerRef.current !== currentPrayer.name) {
                // Play Azan
                if (audioRef.current) {
                    audioRef.current.play().catch(e => console.error("Error playing Azan:", e));
                    lastPlayedPrayerRef.current = currentPrayer.name;
                }
            }
        };

        const intervalId = setInterval(checkPrayerTime, 10000); // Check every 10 seconds

        return () => {
            clearInterval(intervalId);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [settings.prayerOffset, settings.dstMode, coordinates, settings.calculationMethod]);

    return null; // This component doesn't render anything
}
