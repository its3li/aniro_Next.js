export const prayerNameMapping = {
    Fajr: { en: 'Fajr', ar: 'الفجر' },
    Dhuhr: { en: 'Dhuhr', ar: 'الظهر' },
    Asr: { en: 'Asr', ar: 'العصر' },
    Maghrib: { en: 'Maghrib', ar: 'المغرب' },
    Isha: { en: 'Isha', ar: 'العشاء' },
};
export type PrayerName = keyof typeof prayerNameMapping;

export interface PrayerTime {
    name: PrayerName;
    time: string;
}

export interface Prayer {
    name: PrayerName;
    date: Date;
}
  
const mockPrayerTimes: { name: PrayerName; time: string }[] = [
    { name: 'Fajr', time: '04:30' },
    { name: 'Dhuhr', time: '12:30' },
    { name: 'Asr', time: '16:00' },
    { name: 'Maghrib', time: '18:45' },
    { name: 'Isha', time: '20:15' },
];
  
export function getPrayerTimes(date: Date, offset: number = 0): PrayerTime[] {
    return mockPrayerTimes.map(pt => {
        const [hours, minutes] = pt.time.split(':').map(Number);
        const newHours = (hours + offset + 24) % 24;
        
        let h = newHours % 12;
        if (h === 0) h = 12; // the hour '0' should be '12'

        return {
            ...pt,
            time: `${h}:${String(minutes).padStart(2, '0')}`,
        };
    });
}
  
function parseTimeToDate(time: string, date: Date, offset: number = 0): Date {
    const newDate = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    const newHours = (hours + offset + 24) % 24;
    newDate.setHours(newHours, minutes, 0, 0);
    return newDate;
}

export function getNextPrayer(offset: number = 0): Prayer | null {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const prayers: Prayer[] = mockPrayerTimes.map(pt => ({
        name: pt.name,
        date: parseTimeToDate(pt.time, today, offset),
    }));

    let nextPrayer = prayers.find(p => p.date > now);

    if (nextPrayer) {
        return nextPrayer;
    }

    // If no prayer is left for today, the next prayer is Fajr of the next day
    const fajrTime = mockPrayerTimes.find(pt => pt.name === 'Fajr');
    if (fajrTime) {
        return {
            name: 'Fajr',
            date: parseTimeToDate(fajrTime.time, tomorrow, offset)
        };
    }
    
    return null;
}
