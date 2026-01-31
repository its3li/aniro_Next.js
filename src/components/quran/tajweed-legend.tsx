import { tajweedRulesMap } from "@/lib/tajweed";
import { useSettings } from "../providers/settings-provider";
import { cn } from "@/lib/utils";

export function TajweedLegend() {
    const { settings } = useSettings();
    const isArabic = settings.language === 'ar';

    return (
        <div
            className="w-full overflow-x-auto whitespace-nowrap py-2 px-4 bg-background/95 backdrop-blur-md border-t border-border/50 flex items-center gap-4 no-scrollbar"
            dir={isArabic ? 'rtl' : 'ltr'}
        >
            {Object.entries(tajweedRulesMap).map(([key, rule]) => (
                <div key={key} className="flex items-center gap-2 flex-shrink-0">
                    <div
                        className={cn(
                            "w-2.5 h-2.5 rounded-full bg-current",
                            rule.className
                        )}
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                        {isArabic ? rule.descriptionAr : rule.description}
                    </span>
                </div>
            ))}
        </div>
    );
}
