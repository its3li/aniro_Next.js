import { useEffect, useCallback } from 'react';
import { LocalNotifications, Channel, ScheduleOptions } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { useLocation } from './use-location';
import { useSettings } from '@/components/providers/settings-provider';
import { getPrayerTimes, prayerNameMapping, getTotalOffset, PrayerTime } from '@/lib/prayer';

const CHANNEL_ID = 'azan_channel';

/**
 * Check and request all necessary permissions for Azan notifications.
 * 
 * On Android 12+, SCHEDULE_EXACT_ALARM requires special permission granted in Settings.
 * On Android 13+, POST_NOTIFICATIONS requires runtime permission.
 * 
 * @returns Object indicating which permissions are granted
 */
export async function checkAndRequestPermissions(): Promise<{
    notifications: boolean;
    exactAlarm: boolean;
}> {
    const result = { notifications: false, exactAlarm: true };

    // On web, permissions are not applicable
    if (!Capacitor.isNativePlatform()) {
        return { notifications: true, exactAlarm: true };
    }

    try {
        // Check current notification permission status
        let permStatus = await LocalNotifications.checkPermissions();

        // Request if not already granted
        if (permStatus.display !== 'granted') {
            permStatus = await LocalNotifications.requestPermissions();
        }

        result.notifications = permStatus.display === 'granted';

        // Note: SCHEDULE_EXACT_ALARM on Android 12+ is a special permission
        // that users must grant in Settings. The permission is declared in manifest.
        // We can't programmatically request it, only check via platform-specific APIs.
        // For now, we assume it's granted if the user has followed setup instructions.
        // A more robust solution would use a native plugin to check AlarmManager.canScheduleExactAlarms()

        console.log('[AzanScheduler] Permissions check result:', result);
        return result;
    } catch (error) {
        console.error('[AzanScheduler] Permission check failed:', error);
        return result;
    }
}

/**
 * Create the notification channel for Azan notifications.
 * 
 * This is called as a fallback from TypeScript. The primary channel
 * creation happens in MainActivity.java with proper audio attributes.
 */
async function createNotificationChannel(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
        const channel: Channel = {
            id: CHANNEL_ID,
            name: 'Azan Prayer Notifications',
            description: 'Notifications for prayer times with Azan sound',
            importance: 5, // IMPORTANCE_HIGH (5 = max)
            visibility: 1, // VISIBILITY_PUBLIC - show on lock screen
            sound: 'azan.mp3', // References res/raw/azan.mp3
            vibration: true,
            lights: true,
        };

        await LocalNotifications.createChannel(channel);
        console.log('[AzanScheduler] Notification channel created:', CHANNEL_ID);
    } catch (error) {
        // Channel may already exist (created by MainActivity), which is fine
        console.log('[AzanScheduler] Channel creation (may already exist):', error);
    }
}

/**
 * Hook to schedule Azan prayer notifications with exact alarms.
 * 
 * Features:
 * - Schedules notifications for the next 7 days (35 prayer times)
 * - Uses allowWhileIdle for Doze mode support
 * - Automatically reschedules when app resumes
 * - Supports Arabic and English notifications
 */
export function useAzanScheduler() {
    const { coordinates } = useLocation();
    const { settings } = useSettings();
    const { prayerOffset, dstMode, calculationMethod, language, azanMode, includeIshraq } = settings;
    const isArabic = language === 'ar';

    const scheduleAzanAlarms = useCallback(async () => {
        if (!coordinates) {
            console.log('[AzanScheduler] Waiting for coordinates...');
            return;
        }

        // Check permissions first
        const permissions = await checkAndRequestPermissions();
        if (!permissions.notifications) {
            console.warn('[AzanScheduler] Notification permission denied - cannot schedule');
            return;
        }

        // Ensure channel exists (fallback, main creation is in MainActivity)
        await createNotificationChannel();

        try {
            // Cancel all existing scheduled notifications to avoid duplicates
            const pending = await LocalNotifications.getPending();
            if (pending.notifications.length > 0) {
                await LocalNotifications.cancel(pending);
                console.log('[AzanScheduler] Cancelled', pending.notifications.length, 'existing notifications');
            }

            const now = new Date();
            const totalOffset = getTotalOffset(prayerOffset, dstMode);

            // Collect prayers for the next 7 days
            const allPrayers: PrayerTime[] = [];
            for (let day = 0; day < 7; day++) {
                const date = new Date(now);
                date.setDate(date.getDate() + day);
                const dayPrayers = getPrayerTimes(
                    date,
                    coordinates.latitude,
                    coordinates.longitude,
                    totalOffset,
                    calculationMethod,
                    includeIshraq
                );
                allPrayers.push(...dayPrayers);
            }

            // Filter to only upcoming prayers and limit to 35 (5 prayers × 7 days)
            const upcomingPrayers = allPrayers
                .filter(p => p.date.getTime() > now.getTime())
                .slice(0, 35);

            // Build notification objects
            const notifications = upcomingPrayers.map((prayer, index) => {
                const prayerName = prayerNameMapping[prayer.name];
                const title = isArabic
                    ? `حان الآن وقت صلاة ${prayerName.ar}`
                    : `It's time for ${prayerName.en} prayer`;
                const body = isArabic
                    ? (azanMode === 'full' ? 'حي على الصلاة، حي على الفلاح' : 'تذكير بالصلاة')
                    : (azanMode === 'full' ? 'Come to prayer, come to success' : 'Prayer reminder');

                // Skip sound for silent mode, or use default notification sound
                const sound = azanMode === 'full' ? 'azan.mp3' : undefined;
                const channel = azanMode === 'full' ? CHANNEL_ID : 'prayer_reminder';

                return {
                    id: 1000 + index, // Use unique IDs in 1000+ range to avoid conflicts
                    title,
                    body,
                    schedule: {
                        at: prayer.date,
                        allowWhileIdle: true, // CRITICAL: Fire notification during Doze mode
                    },
                    channelId: channel,
                    sound: sound,
                    smallIcon: 'ic_stat_icon_config_sample',
                    largeIcon: 'ic_launcher',
                    ongoing: false,
                    autoCancel: true,
                    extra: {
                        prayerName: prayer.name,
                        prayerTime: prayer.date.toISOString(),
                    },
                };
            });

            if (notifications.length > 0) {
                await LocalNotifications.schedule({ notifications } as ScheduleOptions);
                console.log('[AzanScheduler] Scheduled', notifications.length, 'Azan notifications');
                console.log('[AzanScheduler] Next prayer:', upcomingPrayers[0].name, 'at', upcomingPrayers[0].date.toLocaleTimeString());
            } else {
                console.log('[AzanScheduler] No upcoming prayers to schedule');
            }

        } catch (error) {
            console.error('[AzanScheduler] Failed to schedule notifications:', error);
        }
    }, [coordinates, prayerOffset, dstMode, calculationMethod, isArabic]);

    useEffect(() => {
        // Schedule on mount
        scheduleAzanAlarms();

        // Re-schedule when app resumes from background
        const handleResume = () => {
            console.log('[AzanScheduler] App resumed - rescheduling notifications');
            scheduleAzanAlarms();
        };

        // Listen for Capacitor app resume event
        document.addEventListener('resume', handleResume);

        return () => {
            document.removeEventListener('resume', handleResume);
        };
    }, [scheduleAzanAlarms]);

    return {
        scheduleAzanAlarms,
        checkAndRequestPermissions
    };
}
