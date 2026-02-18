'use client';

import { useLastRead } from '@/hooks/use-last-read';
import { useSettings } from '../providers/settings-provider';
import { GlassCard } from '../glass-card';
import { BookOpen, ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export function LastReadCard() {
    const { lastRead } = useLastRead();
    const { settings } = useSettings();
    const isArabic = settings.language === 'ar';

    if (!lastRead) return null;

    const surahName = isArabic ? lastRead.surahNameAr : lastRead.surahName;
    const juzLabel = isArabic ? `الجزء ${lastRead.juzNumber}` : `Juz ${lastRead.juzNumber}`;
    const pageLabel = isArabic ? `صفحة ${lastRead.pageNumber}` : `Page ${lastRead.pageNumber}`;

    return (
        <Link href={`/quran?surah=${lastRead.surahNumber}&ayah=${lastRead.verseNumber}`} className="block">
            <GlassCard className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <BookOpen className="w-6 h-6" />
                        </div>

                        <div className="flex flex-col gap-0.5">
                            <span className="text-sm text-muted-foreground font-medium">
                                {isArabic ? 'تابِع القراءة' : 'Continue Reading'}
                            </span>
                            <span className="text-lg font-bold">{surahName}</span>
                            <span className="text-xs text-muted-foreground">
                                {isArabic ? `الآية ${lastRead.verseNumber}` : `Ayah ${lastRead.verseNumber}`} • {juzLabel} • {pageLabel}
                            </span>
                        </div>
                    </div>

                    <div className="shrink-0 rounded-xl h-10 w-10 flex items-center justify-center text-muted-foreground">
                        {isArabic ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                    </div>
                </div>
            </GlassCard>
        </Link>
    );
}
