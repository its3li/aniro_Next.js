'use client';
import { useState, useEffect } from 'react';
import { GlassCard, GlassCardContent, GlassCardHeader } from '../glass-card';
import { getPrayerTimes, Prayer, PrayerTime, getNextPrayer } from '@/lib/prayer';
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
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [nextPrayer, setNextPrayer] = useState<Prayer | null>(null);
  const [timeToNextPrayer, setTimeToNextPrayer] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const times = getPrayerTimes(new Date(), settings.prayerOffset);
    setPrayerTimes(times);
    
    const playAzanTone = (prayerName: string) => {
        const synth = new Tone.Synth().toDestination();
        const now = Tone.now();
        synth.triggerAttackRelease("C4", "8n", now);
        synth.triggerAttackRelease("E4", "8n", now + 0.5);
        synth.triggerAttackRelease("G4", "8n", now + 1);
        toast({
            title: `It's time for ${prayerName} prayer`,
            description: "May your prayers be accepted.",
        });
    }

    const updateNextPrayer = () => {
      const next = getNextPrayer(settings.prayerOffset);
      setNextPrayer(next);

      if (next) {
        // Set up timeout for Azan tone
        const timeToPrayerMs = next.date.getTime() - new Date().getTime();
        if (timeToPrayerMs > 0) {
          const timeoutId = setTimeout(() => playAzanTone(next.name), timeToPrayerMs);
          return () => clearTimeout(timeoutId);
        }
      }
    };
    
    updateNextPrayer();
    const intervalId = setInterval(updateNextPrayer, 60000); // Check for next prayer every minute

    return () => clearInterval(intervalId);
  }, [settings.prayerOffset, toast]);

  useEffect(() => {
    if (!nextPrayer) return;
    
    const timer = setInterval(() => {
      const now = new Date();
      const diff = nextPrayer.date.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeToNextPrayer('Now');
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeToNextPrayer(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [nextPrayer]);

  if (!nextPrayer || prayerTimes.length === 0) {
    return <GlassCard className="p-6 h-64 w-full bg-foreground/10 animate-pulse rounded-3xl" />;
  }
  
  const Icon = prayerIcons[nextPrayer.name] || Sun;

  return (
    <GlassCard>
      <GlassCardHeader>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold font-headline">{nextPrayer.name}</h2>
            <p className="text-muted-foreground">Next prayer in</p>
          </div>
          <p className="text-3xl font-bold text-primary font-mono">{timeToNextPrayer}</p>
        </div>
      </GlassCardHeader>
      <GlassCardContent>
        <div className="flex justify-between items-end pt-4">
            {prayerTimes.map((prayer, index) => {
                const IsNext = prayer.name === nextPrayer.name;
                const PrayerIcon = prayerIcons[prayer.name];
                return (
                    <div key={index} className="flex flex-col items-center gap-2 text-center">
                        <p className={cn("text-xs font-medium", IsNext ? "text-primary" : "text-muted-foreground")}>{prayer.name}</p>
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
