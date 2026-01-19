import type { AzkarCategory, AzkarItem } from "@/lib/azkar";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowRight } from "lucide-react";
import { GlassCard } from "../glass-card";

interface CategoryGridProps {
  categories: AzkarCategory[];
  onSelect: (item: AzkarCategory | AzkarItem) => void;
}

export function CategoryGrid({ categories, onSelect }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {categories.map((category) => {
        const placeholder = PlaceHolderImages.find(p => p.id === category.id);
        return (
          <GlassCard
            key={category.id}
            onClick={() => onSelect(category)}
            className="aspect-square flex flex-col justify-end p-4 relative overflow-hidden cursor-pointer transition-transform active:scale-95 hover:scale-[1.02]"
          >
            {placeholder && (
              <Image
                src={placeholder.imageUrl}
                alt={category.name}
                fill
                className="object-cover z-0 opacity-20 dark:opacity-10"
                data-ai-hint={placeholder.imageHint}
              />
            )}
            <div className="relative z-10">
              <h3 className="font-bold text-lg font-headline">{category.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center">
                View
                <ArrowRight className="w-4 h-4 ml-1" />
              </p>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
