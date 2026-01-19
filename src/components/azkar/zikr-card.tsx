import type { AzkarItem } from "@/lib/azkar";
import { GlassCard, GlassCardContent } from "../glass-card";

interface ZikrCardProps {
  item: AzkarItem;
}

export function ZikrCard({ item }: ZikrCardProps) {
  return (
    <GlassCard>
      <GlassCardContent className="pt-6">
        <div className="flex flex-col gap-6">
          <p className="text-2xl leading-relaxed text-right font-quran">{item.arabic}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{item.translation}</p>
          {item.repetitions && (
             <div className="text-center">
                <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                  Recite {item.repetitions} time{item.repetitions > 1 ? 's' : ''}
                </span>
            </div>
          )}
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
