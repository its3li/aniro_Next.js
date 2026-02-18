import { Coordinates, CalculationMethod, PrayerTimes, Prayer } from 'adhan';

export const prayerNameMapping = {
    fajr: { en: 'Fajr', ar: 'الفجر' },
    dhuhr: { en: 'Dhuhr', ar: 'الظهر' },
    asr: { en: 'Asr', ar: 'العصر' },
    maghrib: { en: 'Maghrib', ar: 'المغرب' },
    isha: { en: 'Isha', ar: 'العشاء' },
};

export type PrayerName = keyof typeof prayerNameMapping;

export interface PrayerTime {
    name: PrayerName;
    time: string;
    date: Date;
}

export interface NextPrayer {
    name: PrayerName;
    date: Date;
    remaining: string;
}

export const calculationMethods = {
    muslim_world_league: "Muslim World League",
    egyptian: "Egyptian General Authority of Survey",
    karachi: "University of Islamic Sciences, Karachi",
    umm_al_qura: "Umm al-Qura University, Makkah",
    dubai: "Dubai",
    qatar: "Qatar",
    kuwait: "Kuwait",
    moonsighting_committee: "Moonsighting Committee",
    singapore: "Singapore",
    north_america: "ISNA (North America)",
    turkey: "Turkey",
    tehran: "Tehran",
    other: "Other",
};

export const calculationMethodsArabic = {
    muslim_world_league: "رابطة العالم الإسلامي",
    egyptian: "الهيئة العامة للمساحة المصرية",
    karachi: "جامعة العلوم الإسلامية، كراتشي",
    umm_al_qura: "جامعة أم القرى، مكة المكرمة",
    dubai: "دبي",
    qatar: "قطر",
    kuwait: "الكويت",
    moonsighting_committee: "لجنة رؤية الهلال",
    singapore: "سنغافورة",
    north_america: "ISNA (أمريكا الشمالية)",
    turkey: "تركيا",
    tehran: "طهران",
    other: "أخرى",
};

export type CalculationMethodName = keyof typeof calculationMethods;

function getCalculationParams(method: CalculationMethodName) {
    switch (method) {
        case 'muslim_world_league': return CalculationMethod.MuslimWorldLeague();
        case 'egyptian': return CalculationMethod.Egyptian();
        case 'karachi': return CalculationMethod.Karachi();
        case 'umm_al_qura': return CalculationMethod.UmmAlQura();
        case 'dubai': return CalculationMethod.Dubai();
        case 'qatar': return CalculationMethod.Qatar();
        case 'kuwait': return CalculationMethod.Kuwait();
        case 'moonsighting_committee': return CalculationMethod.MoonsightingCommittee();
        case 'singapore': return CalculationMethod.Singapore();
        case 'north_america': return CalculationMethod.NorthAmerica();
        case 'turkey': return CalculationMethod.Turkey();
        case 'tehran': return CalculationMethod.Tehran();
        case 'other': return CalculationMethod.Other();
        default: return CalculationMethod.MuslimWorldLeague();
    }
}

// Default location (Mecca) if no location provided
const DEFAULT_LAT = 21.4225;
const DEFAULT_LNG = 39.8262;

export function getPrayerTimes(date: Date, lat: number = DEFAULT_LAT, lng: number = DEFAULT_LNG, offsetHours: number = 0, method: CalculationMethodName = 'muslim_world_league'): PrayerTime[] {
    const coordinates = new Coordinates(lat, lng);
    const params = getCalculationParams(method);
    const prayerTimes = new PrayerTimes(coordinates, date, params);

    const formatTime = (d: Date) => {
        // Apply offset
        const adjustedDate = new Date(d.getTime() + offsetHours * 60 * 60 * 1000);
        return adjustedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const getAdjustedDate = (d: Date) => {
        return new Date(d.getTime() + offsetHours * 60 * 60 * 1000);
    }

    return [
        { name: 'fajr', time: formatTime(prayerTimes.fajr), date: getAdjustedDate(prayerTimes.fajr) },
        { name: 'dhuhr', time: formatTime(prayerTimes.dhuhr), date: getAdjustedDate(prayerTimes.dhuhr) },
        { name: 'asr', time: formatTime(prayerTimes.asr), date: getAdjustedDate(prayerTimes.asr) },
        { name: 'maghrib', time: formatTime(prayerTimes.maghrib), date: getAdjustedDate(prayerTimes.maghrib) },
        { name: 'isha', time: formatTime(prayerTimes.isha), date: getAdjustedDate(prayerTimes.isha) },
    ];
}

export function getNextPrayer(lat: number = DEFAULT_LAT, lng: number = DEFAULT_LNG, offsetHours: number = 0, method: CalculationMethodName = 'muslim_world_league'): NextPrayer | null {
    const now = new Date();
    const coordinates = new Coordinates(lat, lng);
    const params = getCalculationParams(method);

    // We need to calculate prayer times for today and tomorrow to find the next prayer
    // But we must apply the offset to the prayer times BEFORE comparing with 'now'

    // Helper to apply offset
    const applyOffset = (d: Date) => new Date(d.getTime() + offsetHours * 60 * 60 * 1000);

    let prayerTimes = new PrayerTimes(coordinates, now, params);

    // Get all prayers for today with offset applied
    const todayPrayers = [
        { name: Prayer.Fajr, time: applyOffset(prayerTimes.fajr) },
        { name: Prayer.Dhuhr, time: applyOffset(prayerTimes.dhuhr) },
        { name: Prayer.Asr, time: applyOffset(prayerTimes.asr) },
        { name: Prayer.Maghrib, time: applyOffset(prayerTimes.maghrib) },
        { name: Prayer.Isha, time: applyOffset(prayerTimes.isha) },
    ];

    // Find the first prayer that is in the future
    let nextPrayerObj = todayPrayers.find(p => p.time > now);
    let nextPrayerDate = nextPrayerObj?.time;
    let nextPrayerName = nextPrayerObj ? prayerFromAdhan(nextPrayerObj.name) : null;

    // If no prayer found for today (after Isha), check tomorrow's Fajr
    if (!nextPrayerObj) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowPrayerTimes = new PrayerTimes(coordinates, tomorrow, params);
        nextPrayerDate = applyOffset(tomorrowPrayerTimes.fajr);
        nextPrayerName = 'fajr';
    }

    if (!nextPrayerDate || !nextPrayerName) return null;

    const diffMs = nextPrayerDate.getTime() - now.getTime();
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);

    return {
        name: nextPrayerName,
        date: nextPrayerDate,
        remaining: `${diffHrs}h ${diffMins}m`,
    };
}

function prayerFromAdhan(p: any): PrayerName | null {
    switch (p) {
        case Prayer.Fajr: return 'fajr';
        case Prayer.Dhuhr: return 'dhuhr';
        case Prayer.Asr: return 'asr';
        case Prayer.Maghrib: return 'maghrib';
        case Prayer.Isha: return 'isha';
        default: return null;
    }
}

export type DSTMode = 'auto' | 'on' | 'off';

export function getTotalOffset(baseOffset: number, dstMode: DSTMode): number {
    switch (dstMode) {
        case 'on': return baseOffset + 1;
        case 'off': return baseOffset;
        case 'auto': return baseOffset; // In auto mode, we rely on the system time/adhan to be correct, so no extra offset.
        default: return baseOffset;
    }
}

export function getPrayerTimesForRange(
    startDate: Date,
    days: number,
    lat: number = DEFAULT_LAT,
    lng: number = DEFAULT_LNG,
    offsetHours: number = 0,
    method: CalculationMethodName = 'muslim_world_league'
): { date: Date; prayers: PrayerTime[] }[] {
    const results = [];
    for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        results.push({
            date: date,
            prayers: getPrayerTimes(date, lat, lng, offsetHours, method)
        });
    }
    return results;
}
