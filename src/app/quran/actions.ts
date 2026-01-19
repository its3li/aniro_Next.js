
'use server';

import { getQfConfig } from '@/lib/qf-config';

interface VerseTajweed {
    id: number;
    verse_key: string;
    text_uthmani_tajweed: string;
}

// A simple in-memory cache for the auth token
let authToken: { token: string; expiry: number } | null = null;

async function getQfAuthToken() {
    if (authToken && authToken.expiry > Date.now()) {
        return authToken.token;
    }

    const config = await getQfConfig();
    
    const credentials = `${config.clientId}:${config.clientSecret}`;
    const encodedCredentials = Buffer.from(credentials).toString('base64');

    const body = new URLSearchParams({
        grant_type: 'client_credentials',
    });

    const response = await fetch(`${config.authBaseUrl}/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${encodedCredentials}`
        },
        body: body.toString(),
        cache: 'no-store'
    });

    if (!response.ok) {
        console.error("Failed to get Quran Foundation auth token", await response.text());
        throw new Error('Failed to get Quran Foundation auth token');
    }

    const data = await response.json();
    // The token is usually valid for 1 hour (3600 seconds). Let's refresh it after 55 mins.
    authToken = {
        token: data.access_token,
        expiry: Date.now() + (data.expires_in - 300) * 1000,
    };

    return authToken.token;
}

export async function getSurahTajweed(chapterNumber: number): Promise<VerseTajweed[]> {
    const config = await getQfConfig();
    const token = await getQfAuthToken();

    const response = await fetch(`${config.apiBaseUrl}/content/api/v4/quran/verses/uthmani_tajweed?chapter_number=${chapterNumber}`, {
        headers: {
            'Accept': 'application/json',
            'x-auth-token': token,
            'x-client-id': config.clientId,
        },
        next: { revalidate: 3600 } // Revalidate once per hour
    });

    if (!response.ok) {
        console.error("Failed to fetch Tajweed surah", await response.text());
        throw new Error(`Failed to fetch Tajweed surah from Quran Foundation: ${response.statusText}`);
    }

    const data = await response.json();
    return data.verses;
}
