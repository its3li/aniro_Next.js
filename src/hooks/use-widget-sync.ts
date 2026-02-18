import { useEffect } from 'react';
import { registerPlugin } from '@capacitor/core';
import { useLocation } from './use-location';
import { useSettings } from '@/components/providers/settings-provider';

interface WidgetDataPlugin {
    updateData(options: {
        latitude: number;
        longitude: number;
        calculationMethod: string;
        prayerOffset: number;
        dstMode: string;
        widgetTheme: string;
    }): Promise<void>;
}

const WidgetData = registerPlugin<WidgetDataPlugin>('WidgetData');

export function useWidgetSync() {
    const { coordinates } = useLocation();
    const { settings } = useSettings();
    const { calculationMethod, prayerOffset, dstMode, widgetTheme } = settings;

    useEffect(() => {
        if (coordinates) {
            WidgetData.updateData({
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
                calculationMethod,
                prayerOffset,
                dstMode,
                widgetTheme,
            }).catch(err => console.error('Failed to sync widget data:', err));
        }
    }, [coordinates, calculationMethod, prayerOffset, dstMode, widgetTheme]);
}
