import type { AzkarCategory, AzkarItem } from "@/lib/azkar";
import {
  ArrowRight,
  Bed,
  BookOpen,
  Building2,
  Calendar,
  PersonStanding,
  Sunrise,
  Sunset,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Map icon names to components
const icons: { [key:string]: React.ElementType } = {
  Sunrise,
  Sunset,
  PersonStanding,
  Bed,
  Calendar,
  BookOpen,
  Building2,
  Default: ArrowRight,
};

interface CategoryGridProps {
  categories: AzkarCategory[];
  onSelect: (item: AzkarCategory | AzkarItem) => void;
}

export function CategoryGrid({ categories, onSelect }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {categories.map((category) => {
        const Icon = icons[category.icon] || icons.Default;
        return (
          <div
            key={category.id}
            onClick={() => onSelect(category)}
            className={cn(
              "aspect-square flex flex-col justify-center items-center text-center p-4 cursor-pointer transition-transform active:scale-95 hover:scale-[1.02] rounded-3xl text-white bg-gradient-to-br shadow-lg",
              category.color
            )}
          >
            <Icon className="w-1/3 h-1/3 drop-shadow-md" />
            <h3 className="font-bold text-lg mt-2 font-headline drop-shadow-md">{category.name}</h3>
          </div>
        );
      })}
    </div>
  );
}
