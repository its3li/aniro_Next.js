'use client';

import { useLoading } from '@/components/providers/loading-provider';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { useWidgetSync } from '@/hooks/use-widget-sync';

export function AppContent({ children }: { children: React.ReactNode }) {
    const { isColdStart } = useLoading();

    // Sync data to native widget
    useWidgetSync();

    if (isColdStart) {
        return <LoadingScreen />;
    }

    return <>{children}</>;
}
