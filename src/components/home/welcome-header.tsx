'use client';

import { useSettings } from '../providers/settings-provider';
import { useLocation } from '@/hooks/use-location';

export function WelcomeHeader() {
  const { settings } = useSettings();
  const isArabic = settings.language === 'ar';

  const hijriDate = new Intl.DateTimeFormat(settings.language === 'ar' ? 'ar-SA' : 'en-US-u-ca-islamic-umalqura', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    calendar: 'islamic-umalqura',
  }).format(new Date());

  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-bold text-primary font-headline tracking-tight">
          {isArabic ? 'انيروا' : 'Aniro'}
        </h1>
        <p className="text-muted-foreground text-lg">
          {isArabic ? 'السلام عليكم' : 'Salam, Believer'}
        </p>
      </div>
      <div className="text-right pt-1">
        <p className="text-lg font-bold font-headline text-primary/80 rotate-[-2deg] origin-bottom-right">
          {hijriDate}
        </p>
      </div>
    </div>
  );
}