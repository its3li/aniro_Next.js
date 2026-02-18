'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface CompassState {
    /** Device heading in degrees (0-360, 0 = North). null if unavailable. */
    heading: number | null;
    /** Whether the device compass sensor is supported. */
    isSupported: boolean;
    /** Whether permission has been granted (relevant for iOS 13+). */
    hasPermission: boolean;
    /** Error message if any. */
    error: string | null;
}

/**
 * Hook to access the device compass heading via the DeviceOrientationEvent API.
 * Handles iOS permission requests and Android auto-fire.
 */
export function useCompass() {
    const [state, setState] = useState<CompassState>({
        heading: null,
        isSupported: false,
        hasPermission: false,
        error: null,
    });

    // Track if we are receiving absolute events to ignore relative ones
    const isAbsoluteRef = useRef(false);

    const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
        let heading: number | null = null;
        const isAbsoluteEvent = (event.type === 'deviceorientationabsolute');

        if (isAbsoluteEvent) {
            isAbsoluteRef.current = true;
        }

        // iOS - True North
        if ((event as any).webkitCompassHeading !== undefined) {
            heading = (event as any).webkitCompassHeading;
            // iOS events are usually consistent, no need to flag absolute ref unless needed
        }
        // Android - Absolute North
        else if (isAbsoluteEvent && event.alpha !== null) {
            heading = 360 - event.alpha;
        }
        // Fallback - Relative North
        // Only use if we haven't established absolute support
        else if (!isAbsoluteRef.current && event.alpha !== null) {
            heading = 360 - event.alpha;
        }

        if (heading !== null) {
            // Normalize to 0-360
            heading = (heading % 360 + 360) % 360;

            setState(prev => ({
                ...prev,
                heading: Math.round(heading!),
                isSupported: true,
                hasPermission: true,
                error: null,
            }));
        }
    }, []);

    const requestPermission = useCallback(async () => {
        try {
            // iOS 13+ requires explicit permission request
            if (
                typeof (DeviceOrientationEvent as any).requestPermission === 'function'
            ) {
                const permission = await (
                    DeviceOrientationEvent as any
                ).requestPermission();
                if (permission === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation, true);
                    setState(prev => ({ ...prev, hasPermission: true, isSupported: true }));
                } else {
                    setState(prev => ({
                        ...prev,
                        hasPermission: false,
                        error: 'Compass permission denied',
                    }));
                }
            } else {
                // Android / desktop — just add listener
                // Listen for both standard and absolute events
                window.addEventListener('deviceorientationabsolute' as any, handleOrientation, true);
                window.addEventListener('deviceorientation', handleOrientation, true);
                setState(prev => ({ ...prev, hasPermission: true }));
            }
        } catch (err) {
            setState(prev => ({
                ...prev,
                error: 'Failed to request compass permission',
            }));
        }
    }, [handleOrientation]);

    useEffect(() => {
        // Check if the API exists at all
        if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
            setState(prev => ({
                ...prev,
                isSupported: false,
                error: 'Compass not available on this device',
            }));
            return;
        }

        // On Android / non-iOS, the event fires without permission
        if (
            typeof (DeviceOrientationEvent as any).requestPermission !== 'function'
        ) {
            // Test if we actually receive events
            let received = false;
            const testHandler = (e: DeviceOrientationEvent) => {
                if (e.alpha !== null) {
                    received = true;
                    setState(prev => ({ ...prev, isSupported: true, hasPermission: true }));
                    handleOrientation(e);
                }
            };

            window.addEventListener('deviceorientationabsolute' as any, testHandler, true);
            window.addEventListener('deviceorientation', testHandler, true);

            // After a short timeout, check if we received events
            const timeout = setTimeout(() => {
                window.removeEventListener('deviceorientationabsolute' as any, testHandler, true);
                window.removeEventListener('deviceorientation', testHandler, true);
                if (!received) {
                    setState(prev => ({
                        ...prev,
                        isSupported: false,
                        error: 'Compass not available on this device',
                    }));
                } else {
                    // Keep listening with the real handler
                    window.addEventListener('deviceorientationabsolute' as any, handleOrientation, true);
                    window.addEventListener('deviceorientation', handleOrientation, true);
                }
            }, 1000);

            return () => {
                clearTimeout(timeout);
                window.removeEventListener('deviceorientation', testHandler, true);
                window.removeEventListener('deviceorientation', handleOrientation, true);
                window.removeEventListener('deviceorientationabsolute' as any, handleOrientation, true);
            };
        } else {
            // iOS — need user gesture to request permission
            setState(prev => ({ ...prev, isSupported: true, hasPermission: false }));
        }
    }, [handleOrientation]);

    return { ...state, requestPermission };
}
