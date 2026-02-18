'use client';
import { GlassCard } from '@/components/glass-card';
import { cn } from '@/lib/utils';
import { useSettings } from '../providers/settings-provider';
import { AzkarCategory } from "@/lib/azkar";
import { Sunrise, Sunset, BookOpen, Moon, Heart, Star, Calendar, Shield, Sun } from 'lucide-react';

// Enhanced category styling with solid cohesive colors instead of gradients
const categoryStyles: Record<string, { bg: string, text: string, iconColor: string }> = {
  'morning-azkar': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-900 dark:text-amber-100', iconColor: 'text-amber-600 dark:text-amber-400' },
  'evening-azkar': { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-900 dark:text-indigo-100', iconColor: 'text-indigo-600 dark:text-indigo-400' },
  'after-prayer-azkar': { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-900 dark:text-emerald-100', iconColor: 'text-emerald-600 dark:text-emerald-400' },
  'sleep-dreams': { bg: 'bg-slate-100 dark:bg-slate-800/50', text: 'text-slate-900 dark:text-slate-100', iconColor: 'text-slate-600 dark:text-slate-400' },
  'special-prayers': { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-900 dark:text-rose-100', iconColor: 'text-rose-600 dark:text-rose-400' },
  'hardship-relief': { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-900 dark:text-teal-100', iconColor: 'text-teal-600 dark:text-teal-400' },
  'daily-duas': { bg: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-900 dark:text-sky-100', iconColor: 'text-sky-600 dark:text-sky-400' },
  'quranic-duas': { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-900 dark:text-violet-100', iconColor: 'text-violet-600 dark:text-violet-400' },
};

const iconMap: Record<string, any> = {
  'Sunrise': Sunrise,
  'Sunset': Sunset,
  'PersonStanding': UserPrayerIcon, // Custom simple icon below
  'Bed': Moon,
  'Star': Star,
  'HeartPulse': Heart,
  'Calendar': Calendar,
  'Building2': Shield, // Using Shield for mosque/protection metaphor
  'BookOpen': BookOpen,
};

function UserPrayerIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="5" r="1" />
      <path d="M9 20a4 4 0 0 1 6 0" />
      <path d="M5 8l7-3 7 3" />
      <path d="M12 5v10" />
    </svg>
  )
}

interface CategoryGridProps {
  categories: AzkarCategory[];
  onSelect: (item: any) => void;
}

export function CategoryGrid({ categories, onSelect }: CategoryGridProps) {
  const { settings } = useSettings();
  const isArabic = settings.language === 'ar';

  return (
    <div className="grid grid-cols-2 gap-3 pb-8">
      {categories.map((category) => {
        const style = categoryStyles[category.id] || { bg: 'bg-muted/50', text: 'text-foreground', iconColor: 'text-primary' };
        const Icon = iconMap[category.icon] || Star;
        const name = isArabic ? category.nameAr : category.name;

        return (
          <div
            key={category.id}
            onClick={() => onSelect(category)}
            className={cn(
              "group relative flex flex-col items-center justify-center p-5 rounded-2xl cursor-pointer transition-all duration-200 active:scale-[0.97]",
              "bg-card border border-border/50 hover:border-primary/20",
            )}
          >
            {/* Icon Container with specific cohesive background */}
            <div className={cn("w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors", style.bg)}>
              <Icon className={cn("w-7 h-7", style.iconColor)} strokeWidth={1.5} />
            </div>

            <h3 className="font-semibold text-center text-sm leading-tight text-foreground/90 group-hover:text-primary transition-colors">
              {name}
            </h3>
          </div>
        );
      })}
    </div>
  );
}
