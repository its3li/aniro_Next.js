'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { GlassCard, GlassCardContent } from '@/components/glass-card';

export default function TasbeehPage() {
  const [count, setCount] = useState(0);

  const handleTap = () => {
    setCount(c => c + 1);
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleReset = () => {
    setCount(0);
  };
  
  const fontSize = Math.max(3, 8 - String(count).length * 0.7) + 'rem';

  return (
    <div className="p-4 md:p-6 animate-fade-slide-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold font-headline">Tasbeeh</h1>
        <Button variant="ghost" size="icon" onClick={handleReset} aria-label="Reset count">
          <RotateCcw />
        </Button>
      </div>

      <GlassCard
        onClick={handleTap}
        className="aspect-square flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
      >
        <GlassCardContent className="p-0">
           <p 
                className="font-mono font-bold text-primary transition-all duration-200 text-center"
                style={{ fontSize }}
            >
                {count}
            </p>
        </GlassCardContent>
      </GlassCard>
      
      <p className="text-center text-muted-foreground mt-4 text-sm">Tap the card to count.</p>
    </div>
  );
}
