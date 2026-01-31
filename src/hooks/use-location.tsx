import { useState, useEffect, useCallback } from 'react';
import { useSettings } from '@/components/providers/settings-provider';

interface LocationState {
    coordinates: {
        latitude: number;
        longitude: number;
    } | null;
    city: string | null;
    country: string | null;
    error: string | null;
    isLoading: boolean;
}

export function useLocation() {
    const [state, setState] = useState<LocationState>({
        coordinates: null,
        city: null,
        country: null,
        error: null,
        isLoading: true,
    });

    const { setCalculationMethod } = useSettings();

    const getMethodForCountry = (countryCode: string): import('@/lib/prayer').CalculationMethodName => {
        switch (countryCode?.toUpperCase()) {
            case 'EG': return 'egyptian';
            case 'PK': return 'karachi';
            case 'SA': return 'umm_al_qura';
            case 'AE': return 'dubai';
            case 'QA': return 'qatar';
            case 'KW': return 'kuwait';
            case 'SG': return 'singapore';
            case 'US':
            case 'CA': return 'north_america';
            case 'TR': return 'turkey';
            case 'IR': return 'tehran';
            default: return 'muslim_world_league';
        }
    };

    const fetchLocation = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // 1. Try to load from cache first for immediate UI
            const cached = localStorage.getItem('aniro_location');
            if (cached) {
                try {
                    const data = JSON.parse(cached);
                    if (data.latitude && data.longitude) {
                        setState({
                            coordinates: { latitude: data.latitude, longitude: data.longitude },
                            city: data.city,
                            country: data.country,
                            error: null,
                            isLoading: false,
                        });
                        // We still fetch in background to update if needed, or we can just return if we trust cache
                        // For now, let's return to save API calls if we have data
                        return;
                    }
                } catch (e) {
                    console.error('Error parsing cached location:', e);
                }
            }

            // 2. Multi-provider fallback strategy
            const providers = [
                {
                    name: 'ipapi.co',
                    url: 'https://ipapi.co/json/',
                    transform: (data: any) => ({
                        latitude: data.latitude,
                        longitude: data.longitude,
                        city: data.city,
                        country: data.country_name,
                        country_code: data.country_code
                    })
                },
                {
                    name: 'freeipapi',
                    url: 'https://free.freeipapi.com/api/json',
                    transform: (data: any) => ({
                        latitude: data.latitude,
                        longitude: data.longitude,
                        city: data.cityName,
                        country: data.countryName,
                        country_code: data.countryCode
                    })
                },
                {
                    name: 'ipwho.is',
                    url: 'https://ipwho.is/',
                    transform: (data: any) => {
                        if (!data.success) throw new Error(data.message || 'ipwho.is failed');
                        return {
                            latitude: data.latitude,
                            longitude: data.longitude,
                            city: data.city,
                            country: data.country,
                            country_code: data.country_code
                        };
                    }
                }
            ];

            let success = false;
            let lastError = null;

            for (const provider of providers) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout per provider

                    const response = await fetch(provider.url, { signal: controller.signal });
                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        throw new Error(`HTTP error ${response.status}`);
                    }

                    const data = await response.json();
                    const result = provider.transform(data);

                    if (!result.latitude || !result.longitude) {
                        throw new Error('Invalid data format');
                    }

                    // Success!
                    const { latitude, longitude, city, country, country_code } = result;

                    // Save to local storage
                    localStorage.setItem('aniro_location', JSON.stringify({ latitude, longitude, city, country, country_code }));

                    // Update Settings based on country
                    if (country_code) {
                        setCalculationMethod(getMethodForCountry(country_code));
                    }

                    // Update state
                    setState({
                        coordinates: { latitude, longitude },
                        city,
                        country,
                        error: null,
                        isLoading: false,
                    });

                    success = true;
                    break; // Stop loop on success

                } catch (e) {
                    console.warn(`Provider ${provider.name} failed:`, e);
                    lastError = e;
                    continue; // Try next provider
                }
            }

            if (!success) {
                throw lastError || new Error('All location providers failed');
            }

        } catch (error) {
            console.error('All location providers failed:', error);

            // 3. Fallback to Mecca if everything fails
            setState(prev => {
                if (prev.coordinates) return prev; // Keep cache if we have it

                return {
                    coordinates: { latitude: 21.4225, longitude: 39.8262 },
                    city: 'Mecca',
                    country: 'Saudi Arabia',
                    error: 'Could not determine location. Using default (Mecca).',
                    isLoading: false,
                };
            });
        }
    }, [setCalculationMethod]);

    useEffect(() => {
        fetchLocation();
    }, [fetchLocation]);

    return { ...state, refreshLocation: fetchLocation };
}