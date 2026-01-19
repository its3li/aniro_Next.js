import { DailyWisdomCard } from '@/components/home/daily-wisdom-card';
import { NextPrayerCard } from '@/components/home/next-prayer-card';
import { WelcomeHeader } from '@/components/home/welcome-header';

export default function Home() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-6 animate-fade-slide-in">
      <WelcomeHeader />
      <NextPrayerCard />
      <DailyWisdomCard />
    </div>
  );
}
