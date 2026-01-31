'use client';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Verse } from '@/lib/quran';
import { Copy, Loader2, BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { useSettings } from '../providers/settings-provider';
import { stripTajweed } from '@/lib/tajweed';

interface TafseerModalProps {
  verse: Verse;
  surahName: string;
  surahNumber: number;
  isOpen: boolean;
  onClose: () => void;
}

export function TafseerModal({ verse, surahName, surahNumber, isOpen, onClose }: TafseerModalProps) {
  const { toast } = useToast();
  const { settings } = useSettings();
  const isArabic = settings.language === 'ar';
  const [tafseerContent, setTafseerContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && verse) {
      const fetchTafseer = async () => {
        setIsLoading(true);
        setTafseerContent(null);
        try {
          const verseRef = `${surahNumber}:${verse.number.inSurah}`;
          const tafsirEdition = isArabic ? 'ar.muyassar' : 'en.kathir';
          const response = await fetch(`https://api.alquran.cloud/v1/ayah/${verseRef}/${tafsirEdition}`);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();

          if (data.code !== 200 || !data.data) {
            throw new Error("Tafseer not found for this verse.");
          }

          const tafseerText = data.data.text;

          if (!tafseerText) {
            throw new Error("Tafseer content is empty.");
          }

          setTafseerContent(tafseerText);
        } catch (error) {
          console.error("Failed to fetch Tafseer:", error);
          setTafseerContent(isArabic ? "عذراً، لم نتمكن من جلب تفسير هذه الآية في الوقت الحالي." : "Sorry, we couldn't fetch the explanation for this verse at the moment.");
          toast({
            variant: "destructive",
            title: isArabic ? "فشل جلب التفسير" : "Tafseer Fetch Failed",
            description: isArabic ? "يرجى المحاولة مرة أخرى لاحقًا." : "Please try again later.",
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchTafseer();
    }
  }, [isOpen, verse, surahName, surahNumber, toast, isArabic]);

  const handleCopy = () => {
    const pureText = stripTajweed(verse.text);
    const textToCopy = `${pureText} (${surahName}:${verse.number.inSurah})`;
    navigator.clipboard.writeText(textToCopy);
    toast({ title: isArabic ? 'تم النسخ إلى الحافظة!' : 'Copied to clipboard!' });
  };

  const sourceName = isArabic ? 'تفسير الميسر' : 'Tafsir Ibn Kathir';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[90vw] sm:max-w-lg mx-auto p-0 bg-background border-foreground/10 rounded-3xl overflow-hidden shadow-2xl [&>button]:hidden"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {/* Header with centered icon */}
        <div className="bg-primary/10 p-6 pb-4">
          <div className="flex flex-col items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-primary/20">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold">
                {isArabic ? 'التفسير' : 'Tafseer'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isArabic
                  ? `${surahName} - الآية ${verse.number.inSurah}`
                  : `${surahName} - Verse ${verse.number.inSurah}`}
              </p>
            </div>
          </div>

          {/* Verse text */}
          <div className="p-4 rounded-2xl bg-background/50 backdrop-blur-sm">
            <p className="font-quran text-xl text-center leading-loose">
              {stripTajweed(verse.text)}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pt-4 space-y-4">
          {/* Translation */}
          <div className="p-3 rounded-xl bg-foreground/5 border border-foreground/5">
            <p className="text-sm text-muted-foreground italic text-center">
              "{verse.translation}"
            </p>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center gap-3 py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-muted-foreground">
                {isArabic ? 'جاري جلب التفسير...' : 'Fetching explanation...'}
              </span>
            </div>
          )}

          {/* Tafseer content */}
          {tafseerContent && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center justify-center gap-2">
                <span className="w-1 h-4 bg-primary rounded-full"></span>
                {isArabic ? 'التفسير' : 'Explanation'}
              </h3>
              <ScrollArea className="h-48">
                <p className="text-sm leading-relaxed px-2">
                  {tafseerContent}
                </p>
              </ScrollArea>
              <p className="text-xs text-muted-foreground text-center pt-2 border-t border-foreground/5">
                {isArabic ? 'المصدر:' : 'Source:'} {sourceName}
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 pt-0 flex gap-3">
          <Button
            onClick={onClose}
            className="flex-1 rounded-xl h-12"
          >
            {isArabic ? 'إغلاق' : 'Close'}
          </Button>
          <Button
            onClick={handleCopy}
            variant="outline"
            disabled={isLoading}
            className="flex-1 rounded-xl h-12 gap-2"
          >
            <Copy className="h-4 w-4" />
            {isArabic ? 'نسخ' : 'Copy'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
