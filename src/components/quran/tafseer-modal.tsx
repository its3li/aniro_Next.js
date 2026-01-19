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
import { generateTafseer } from '@/ai/flows/tafseer-flow';

interface TafseerModalProps {
  verse: Verse;
  surahName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TafseerModal({ verse, surahName, isOpen, onClose }: TafseerModalProps) {
  const { toast } = useToast();
  const [tafseerContent, setTafseerContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && verse) {
      const fetchTafseer = async () => {
        setIsLoading(true);
        setTafseerContent(null);
        try {
          const result = await generateTafseer({
            surahName,
            verseNumber: verse.number.inSurah,
            verseText: verse.text,
            verseTranslation: verse.translation,
          });
          setTafseerContent(result.tafseer);
        } catch (error) {
          console.error("Failed to generate Tafseer:", error);
          setTafseerContent("Sorry, we couldn't generate the explanation for this verse at the moment.");
          toast({
            variant: "destructive",
            title: "Tafseer Generation Failed",
            description: "Please try again later.",
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchTafseer();
    }
  }, [isOpen, verse, surahName, toast]);

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
                <span>Generating explanation...</span>
              </div>
            )}
            {tafseerContent && (
                <>
                    <p>
                        {tafseerContent}
                    </p>
                    <p className='text-sm text-muted-foreground'>Powered by AI</p>
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
