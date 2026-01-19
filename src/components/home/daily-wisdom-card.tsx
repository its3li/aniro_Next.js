'use client';
import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard, GlassCardContent, GlassCardHeader } from '../glass-card';
import { getRandomWisdom, type Wisdom } from '@/lib/wisdom';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '../providers/settings-provider';

export function DailyWisdomCard() {
  const [wisdom, setWisdom] = useState<Wisdom | null>(null);
  const { settings } = useSettings();
  const isArabic = settings.language === 'ar';

  const fetchWisdom = () => {
    setWisdom(getRandomWisdom());
  };

  useEffect(() => {
    fetchWisdom();
  }, []);

  if (!wisdom) {
    return (
        <GlassCard className="p-6">
            <div className="h-32 w-full bg-foreground/10 animate-pulse rounded-2xl" />
        </GlassCard>
    );
  }

  const wisdomType = isArabic ? (wisdom.type === 'Quran' ? 'قرآن' : 'حديث') : wisdom.type;

  return (
    <GlassCard className="transition-transform active:scale-[1.0]">
      <GlassCardHeader className='flex flex-row items-center justify-between'>
        <h2 className="text-xl font-bold font-headline">{isArabic ? 'حكمة اليوم' : 'Daily Wisdom'}</h2>
        <Button variant="ghost" size="icon" onClick={fetchWisdom} aria-label={isArabic ? 'تحديث الحكمة' : 'Refresh wisdom'}>
          <RefreshCw className="h-5 w-5" />
        </Button>
      </GlassCardHeader>
      <GlassCardContent>
        <div className="flex flex-col gap-4">
          <p className="font-quran text-2xl leading-relaxed text-right">{wisdom.arabic}</p>
          <p className="text-muted-foreground leading-relaxed italic">"{wisdom.english}"</p>
          <div className="flex justify-between items-center">
            <Badge variant="secondary">{wisdomType}</Badge>
            <p className="text-sm font-medium text-primary">{wisdom.reference}</p>
          </div>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
