
'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Verse } from '@/lib/quran';
import { Copy, Loader2 } from 'lucide-react';
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
      <DialogContent className="bg-background/80 backdrop-blur-2xl border-foreground/20 rounded-3xl" dir={isArabic ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>
            {isArabic ? `تفسير الآية ${verse.number.inSurah} من سورة ${surahName}` : `Tafseer for ${surahName}, Verse ${verse.number.inSurah}`}
          </DialogTitle>
          <DialogDescription className='font-quran text-lg text-right text-foreground pt-4'>
            {verse.text}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 min-h-[150px]">
            <p className="text-muted-foreground italic">"{verse.translation}"</p>
            {isLoading && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{isArabic ? 'جاري جلب التفسير...' : 'Fetching explanation...'}</span>
              </div>
            )}
            {tafseerContent && (
                <>
                    <ScrollArea className="h-48 pr-4">
                      <p className="text-sm">
                          {tafseerContent}
                      </p>
                    </ScrollArea>
                    <p className='text-sm text-muted-foreground'>{isArabic ? 'المصدر:' : 'Source:'} {sourceName} (AlQuran.cloud API)</p>
                </>
            )}
        </div>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button onClick={handleCopy} variant="outline" disabled={isLoading || !tafseerContent}>
            <Copy className="mr-2 h-4 w-4" />
            {isArabic ? 'نسخ' : 'Copy'}
          </Button>
          <Button onClick={onClose}>{isArabic ? 'إغلاق' : 'Close'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
