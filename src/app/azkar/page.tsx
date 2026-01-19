
'use client';

import { useState } from 'react';
import { CategoryGrid } from '@/components/azkar/category-grid';
import { azkarData, type AzkarCategory, type AzkarItem } from '@/lib/azkar';
import { ZikrList } from '@/components/azkar/zikr-list';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useSettings } from '@/components/providers/settings-provider';

export default function AzkarPage() {
  const [navigationStack, setNavigationStack] = useState<AzkarCategory[]>([azkarData]);
  const { settings } = useSettings();
  const isArabic = settings.language === 'ar';

  const currentLevel = navigationStack[navigationStack.length - 1];
  const parentLevel = navigationStack.length > 1 ? navigationStack[navigationStack.length - 2] : null;

  const handleSelect = (item: AzkarCategory | AzkarItem) => {
    if ('subCategories' in item || 'items' in item) {
      setNavigationStack(prev => [...prev, item as AzkarCategory]);
    }
  };

  const handleBack = () => {
    if (navigationStack.length > 1) {
      setNavigationStack(prev => prev.slice(0, -1));
    }
  };

  const hasSubcategories = currentLevel.subCategories && currentLevel.subCategories.length > 0;
  const hasItems = currentLevel.items && currentLevel.items.length > 0;

  return (
    <div className="p-4 md:p-6 animate-fade-slide-in">
      <div className="flex items-center gap-4 mb-6">
        {navigationStack.length > 1 && (
          <Button variant="ghost" size="icon" onClick={handleBack} className="bg-foreground/5 backdrop-blur-lg border border-foreground/10 h-12 w-12 rounded-2xl">
            <ArrowLeft />
          </Button>
        )}
        <div>
          <h1 className="text-3xl font-bold font-headline">{isArabic && currentLevel.id === 'root' ? 'الأذكار' : currentLevel.name}</h1>
          {parentLevel && <p className="text-muted-foreground">{parentLevel.name}</p>}
        </div>
      </div>
      
      {hasSubcategories && (
        <CategoryGrid categories={currentLevel.subCategories!} onSelect={handleSelect} />
      )}
      
      {hasItems && (
        <ZikrList items={currentLevel.items!} />
      )}
    </div>
  );
}
