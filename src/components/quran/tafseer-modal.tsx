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

interface TafseerModalProps {
  verse: Verse;
  surahName: string;
  surahNumber: number;
  isOpen: boolean;
  onClose: () => void;
}

export function TafseerModal({ verse, surahName, surahNumber, isOpen, onClose }: TafseerModalProps) {
  const { toast } = useToast();
  const [tafseerContent, setTafseerContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && verse) {
      const fetchTafseer = async () => {
        setIsLoading(true);
        setTafseerContent(null);
        try {
          const verseKey = `${surahNumber}:${verse.number.inSurah}`;
          // Using Tafsir Ibn Kathir (id: 169) from quran.com API
          const response = await fetch(`https://api.quran.com/api/v4/quran/tafsirs/169?verse_key=${verseKey}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          
          let tafseerText = data.tafsirs[0]?.text;

          if (!tafseerText) {
            throw new Error("Tafseer not found for this verse.");
          }

          // The text from the API contains HTML, so we strip it for plain text display.
          tafseerText = tafseerText.replace(/<[^>]*>/g, '');

          setTafseerContent(tafseerText);
        } catch (error) {
          console.error("Failed to fetch Tafseer:", error);
          setTafseerContent("Sorry, we couldn't fetch the explanation for this verse at the moment.");
          toast({
            variant: "destructive",
            title: "Tafseer Fetch Failed",
            description: "Please try again later.",
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchTafseer();
    }
  }, [isOpen, verse, surahName, surahNumber, toast]);

  const handleCopy = () => {
    const textToCopy = `${verse.text}\n\n${verse.translation}\n\nTafseer:\n${tafseerContent || ''}\n- Quran, ${surahName} ${verse.number.inSurah}`;
    navigator.clipboard.writeText(textToCopy);
    toast({ title: 'Copied to clipboard!' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background/80 backdrop-blur-2xl border-foreground/20 rounded-3xl">
        <DialogHeader>
          <DialogTitle>
            Tafseer for {surahName}, Verse {verse.number.inSurah}
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
                <span>Fetching explanation...</span>
              </div>
            )}
            {tafseerContent && (
                <>
                    <ScrollArea className="h-48 pr-4">
                      <p className="text-sm">
                          {tafseerContent}
                      </p>
                    </ScrollArea>
                    <p className='text-sm text-muted-foreground'>Source: Tafsir Ibn Kathir (quran.com API)</p>
                </>
            )}
        </div>
        <DialogFooter>
          <Button onClick={handleCopy} variant="outline" disabled={isLoading || !tafseerContent}>
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
