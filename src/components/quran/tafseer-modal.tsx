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
import { Copy } from 'lucide-react';

interface TafseerModalProps {
  verse: Verse;
  surahName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TafseerModal({ verse, surahName, isOpen, onClose }: TafseerModalProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    const textToCopy = `${verse.text}\n\n${verse.translation}\n- Quran, ${surahName} ${verse.number.inSurah}`;
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
        <div className="space-y-4 py-4">
            <p className="text-muted-foreground italic">"{verse.translation}"</p>
            <p>
                (Tafseer content for this verse would be displayed here. This is a placeholder as a full Tafseer API is not available.)
            </p>
            <p className='text-sm text-muted-foreground'>Tafseer Ibn Kathir (example)</p>
        </div>
        <DialogFooter>
          <Button onClick={handleCopy} variant="outline">
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
