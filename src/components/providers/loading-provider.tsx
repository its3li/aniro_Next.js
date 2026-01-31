'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface LoadingContextType {
    isColdStart: boolean;
    setIsColdStart: (value: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
    const [isColdStart, setIsColdStart] = useState(true);

    useEffect(() => {
        // Simulate initial loading or wait for resources
        const timer = setTimeout(() => {
            setIsColdStart(false);
        }, 2000); // Adjust time as needed or tie to actual resource loading

        return () => clearTimeout(timer);
    }, []);

    return (
        <LoadingContext.Provider value={{ isColdStart, setIsColdStart }}>
            {children}
        </LoadingContext.Provider>
    );
}

export function useLoading() {
    const context = useContext(LoadingContext);
    if (context === undefined) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
}
