'use client';

import { useSettings } from '../providers/settings-provider';

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
    <div className="flex justify-between items-center py-2">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          {isArabic ? 'انيروا' : 'Aniro'}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isArabic ? 'السلام عليكم' : 'Salam, Believer'}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-primary">
          {hijriDate}
        </p>
      </div>
    </div>
  );
}