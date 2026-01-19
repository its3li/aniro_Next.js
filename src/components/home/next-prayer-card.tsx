'use client';
import { useState, useEffect } from 'react';
import { GlassCard, GlassCardContent, GlassCardHeader } from '../glass-card';
import { getPrayerTimes, Prayer, PrayerTime, getNextPrayer, prayerNameMapping } from '@/lib/prayer';
import { Sun, Sunrise, Sunset, Moon } from 'lucide-react';
import * as Tone from 'tone';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useSettings } from '../providers/settings-provider';

const prayerIcons: { [key: string]: React.ElementType } = {
  Fajr: Sunrise,
  Dhuhr: Sun,
  Asr: Sun,
  Maghrib: Sunset,
  Isha: Moon,
};

export function NextPrayerCard() {
  const { settings } = useSettings();
  const isArabic = settings.language === 'ar';
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [nextPrayer, setNextPrayer] = useState<Prayer | null>(null);
  const [timeToNextPrayer, setTimeToNextPrayer] = useState('');
  const [nextPrayerAzanTime, setNextPrayerAzanTime] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const times = getPrayerTimes(new Date(), settings.prayerOffset);
    setPrayerTimes(times);

    const updateNextPrayer = () => {
      const next = getNextPrayer(settings.prayerOffset);
      setNextPrayer(next);
    };

    updateNextPrayer();
    const intervalId = setInterval(updateNextPrayer, 60000); // Check for next prayer every minute

    return () => clearInterval(intervalId);
  }, [settings.prayerOffset]);

  useEffect(() => {
    if (!nextPrayer) {
      setNextPrayerAzanTime('');
      return;
    };

    const hours = nextPrayer.date.getHours();
    const minutes = nextPrayer.date.getMinutes();
    const ampm = hours >= 12 ? (isArabic ? 'م' : 'PM') : (isArabic ? 'ص' : 'AM');
    let h = hours % 12;
    if (h === 0) h = 12;
    setNextPrayerAzanTime(`${h}:${String(minutes).padStart(2, '0')} ${ampm}`);

    const timer = setInterval(() => {
      const now = new Date();
      const diff = nextPrayer.date.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeToNextPrayer(isArabic ? 'الآن' : 'Now');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeToNextPrayer(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
      );
    }, 1000);

    const playAzanTone = (prayerName: string) => {
      const synth = new Tone.Synth().toDestination();
      const now = Tone.now();
      const prayerDisplayName = isArabic ? prayerNameMapping[nextPrayer.name].ar : prayerNameMapping[nextPrayer.name].en;

      synth.triggerAttackRelease('C4', '8n', now);
      synth.triggerAttackRelease('E4', '8n', now + 0.5);
      synth.triggerAttackRelease('G4', '8n', now + 1);
      toast({
        title: isArabic ? `حان الآن وقت صلاة ${prayerDisplayName}` : `It's time for ${prayerDisplayName} prayer`,
        description: isArabic ? 'تقبل الله طاعتكم.' : 'May your prayers be accepted.',
      });
    };
    
    const timeToPrayerMs = nextPrayer.date.getTime() - new Date().getTime();
    let azanTimeoutId: NodeJS.Timeout | undefined;
    if (timeToPrayerMs > 0) {
      azanTimeoutId = setTimeout(
        () => playAzanTone(nextPrayer.name),
        timeToPrayerMs
      );
    }

    return () => {
      clearInterval(timer);
      if (azanTimeoutId) {
        clearTimeout(azanTimeoutId);
      }
    };
  }, [nextPrayer, toast, isArabic]);


  if (!nextPrayer || prayerTimes.length === 0) {
    return <GlassCard className="p-6 h-64 w-full bg-foreground/10 animate-pulse rounded-3xl" />;
  }
  
  const Icon = prayerIcons[nextPrayer.name] || Sun;
  const nextPrayerName = isArabic ? prayerNameMapping[nextPrayer.name].ar : prayerNameMapping[nextPrayer.name].en;

  return (
    <GlassCard>
      <GlassCardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold font-headline">{nextPrayerName}</h2>
            <p className="text-muted-foreground">{isArabic ? 'الصلاة التالية بعد' : 'Next prayer in'}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary font-mono">{timeToNextPrayer}</p>
            {nextPrayerAzanTime && <p className="text-sm font-medium text-muted-foreground -mt-1">{isArabic ? 'في' : 'at'} {nextPrayerAzanTime}</p>}
          </div>
        </div>
      </GlassCardHeader>
      <GlassCardContent>
        <div className="flex justify-between items-end pt-4">
            {prayerTimes.map((prayer, index) => {
                const IsNext = prayer.name === nextPrayer.name;
                const PrayerIcon = prayerIcons[prayer.name];
                const prayerDisplayName = isArabic ? prayerNameMapping[prayer.name].ar : prayerNameMapping[prayer.name].en;
                return (
                    <div key={index} className="flex flex-col items-center gap-2 text-center">
                        <p className={cn("text-xs font-medium", IsNext ? "text-primary" : "text-muted-foreground")}>{prayerDisplayName}</p>
                        <div className={cn("flex items-center justify-center w-12 h-12 rounded-full", IsNext ? "bg-primary/10" : "bg-foreground/5")}>
                            <PrayerIcon className={cn("w-6 h-6", IsNext ? "text-primary" : "text-muted-foreground")} />
                        </div>
                        <p className={cn("text-xs font-semibold font-mono", IsNext ? "text-primary" : "text-muted-foreground")}>{prayer.time}</p>
                    </div>
                )
            })}
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
