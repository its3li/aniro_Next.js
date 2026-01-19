'use server';

type QuranFoundationEnv = 'production' | 'pre-production';

interface QuranFoundationConfig {
  env: QuranFoundationEnv;
  clientId: string;
  clientSecret: string;
  authBaseUrl: string;
  apiBaseUrl: string;
}

const configMap: Record<QuranFoundationEnv, { authBaseUrl: string; apiBaseUrl: string }> = {
  'pre-production': {
    authBaseUrl: 'https://prelive-oauth2.quran.foundation',
    apiBaseUrl: 'https://apis-prelive.quran.foundation',
  },
  production: {
    authBaseUrl: 'https://oauth2.quran.foundation',
    apiBaseUrl: 'https://apis.quran.foundation',
  },
};

let cachedConfig: QuranFoundationConfig | null = null;

export function getQfConfig(): QuranFoundationConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const clientId = process.env.QF_CLIENT_ID;
  const clientSecret = process.env.QF_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'Missing Quran Foundation API credentials. Request access: https://api-docs.quran.foundation/request-access'
    );
  }

  const env = (process.env.QF_ENV as QuranFoundationEnv) || 'production';

  if (!configMap[env]) {
      throw new Error(`Invalid QF_ENV specified: ${env}. Must be one of ${Object.keys(configMap).join(', ')}`);
  }

  const { authBaseUrl, apiBaseUrl } = configMap[env];

  cachedConfig = {
    env,
    clientId,
    clientSecret,
    authBaseUrl,
    apiBaseUrl,
  };

  return cachedConfig;
}
