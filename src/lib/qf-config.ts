
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

export async function getQfConfig(): Promise<QuranFoundationConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  // Hardcoded for testing as requested
  const clientId = 'c081ba90-0334-4fe5-915f-ce3ccac847b9';
  const clientSecret = 'lc3dnxTvesF7uLK-4PmovZ7g44';
  const env: QuranFoundationEnv = 'production';

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
