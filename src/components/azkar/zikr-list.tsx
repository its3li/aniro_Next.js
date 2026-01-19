import type { AzkarItem } from "@/lib/azkar";
import { ZikrCard } from "./zikr-card";

interface ZikrListProps {
  items: AzkarItem[];
}

export function ZikrList({ items }: ZikrListProps) {
  return (
    <div className="flex flex-col gap-4">
      {items.map((item, index) => (
        <ZikrCard key={index} item={item} />
      ))}
    </div>
  );
}
