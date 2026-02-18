import { useEffect } from 'react';
import { useLocation } from './use-location';
import { useSettings } from '@/components/providers/settings-provider';
import { LocalNotifications } from '@capacitor/local-notifications';
import { getPrayerTimes, getNextPrayer, prayerNameMapping, getTotalOffset } from '@/lib/prayer';

export function usePrayerNotifications() {
    const { coordinates } = useLocation();
    const { settings } = useSettings();
    const { prayerOffset, dstMode, calculationMethod, language } = settings;
    const isArabic = language === 'ar';

    useEffect(() => {
        const scheduleNotifications = async () => {
            if (!coordinates) return;

            try {
                // Request permissions first
                const permStatus = await LocalNotifications.requestPermissions();
                if (permStatus.display !== 'granted') return;

                // Cancel existing notifications to avoid duplicates
                const pending = await LocalNotifications.getPending();
                if (pending.notifications.length > 0) {
                    await LocalNotifications.cancel(pending);
                }

                const now = new Date();
                const totalOffset = getTotalOffset(prayerOffset, dstMode);
                // Get prayers for today and tomorrow to ensure we have upcoming ones
                const todayPrayers = getPrayerTimes(now, coordinates.latitude, coordinates.longitude, totalOffset, calculationMethod);
                const tomorrow = new Date(now);
                tomorrow.setDate(tomorrow.getDate() + 1);
                const tomorrowPrayers = getPrayerTimes(tomorrow, coordinates.latitude, coordinates.longitude, totalOffset, calculationMethod);

                const allPrayers = [...todayPrayers, ...tomorrowPrayers];
                const upcomingPrayers = allPrayers.filter(p => p.date.getTime() > now.getTime()).slice(0, 5); // Schedule next 5

                const notifications = upcomingPrayers.map((prayer, index) => {
                    const prayerName = prayerNameMapping[prayer.name];
                    const title = isArabic
                        ? `حان الآن وقت صلاة ${prayerName.ar}`
                        : `It's time for ${prayerName.en} prayer`;
                    const body = isArabic
                        ? 'حي على الصلاة، حي على الفلاح'
                        : 'Come to prayer, come to success';

                    return {
                        title,
                        body,
                        id: index + 1, // Simple ID generation
                        schedule: { at: prayer.date },
                        sound: 'azan.mp3', // References res/raw/azan.mp3 on Android
                        channelId: 'azan-channel',
                        smallIcon: 'ic_stat_icon_config_sample', // Default or custom icon
                        actionTypeId: '',
                        extra: null
                    };
                });

                if (notifications.length > 0) {
                    await LocalNotifications.schedule({ notifications });
                    console.log('Scheduled notifications:', notifications.length);
                }

            } catch (error) {
                console.error('Error scheduling notifications:', error);
            }
        };

        scheduleNotifications();
    }, [coordinates, prayerOffset, dstMode, calculationMethod, language, isArabic]);
}
