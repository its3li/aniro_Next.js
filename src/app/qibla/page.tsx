'use client';

import { QiblaCompass } from '@/components/qibla/qibla-compass';
import { useSettings } from '@/components/providers/settings-provider';

export default function QiblaPage() {
    const { settings } = useSettings();
    const isArabic = settings.language === 'ar';

    return (
        <div className="px-4 pt-4 animate-fade-in">
            <h1 className="text-xl font-semibold mb-4">{isArabic ? 'القبلة' : 'Qibla'}</h1>
            <QiblaCompass />
        </div>
    );
}
