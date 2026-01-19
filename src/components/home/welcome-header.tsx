
'use client';
import { useSettings } from '../providers/settings-provider';

export function WelcomeHeader() {
    const { settings } = useSettings();
    const isArabic = settings.language === 'ar';

    return (
      <div>
        <h1 className="text-3xl font-bold text-primary font-headline tracking-tight">
          {isArabic ? 'انيروا' : 'Aniro'}
        </h1>
        <p className="text-muted-foreground text-lg">
          {isArabic ? 'السلام عليكم' : 'Salam, Believer'}
        </p>
      </div>
    );
  }
  