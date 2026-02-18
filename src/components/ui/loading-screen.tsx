'use client';

import { LoaderCircle } from 'lucide-react';

export function LoadingScreen() {
    // Fixed text to avoid hydration issues - no language dependency during load
    return (
        <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
            suppressHydrationWarning
        >
            <div
                className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-card/50 border border-white/10 shadow-xl backdrop-blur-md"
                suppressHydrationWarning
            >
                <LoaderCircle className="w-12 h-12 text-primary animate-spin" />
                <p
                    className="text-lg font-medium text-muted-foreground animate-pulse"
                    suppressHydrationWarning
                >
                    صل علي النبي
                </p>
            </div>
        </div>
    );
}
