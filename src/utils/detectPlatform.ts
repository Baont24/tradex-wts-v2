import config from 'config';

export function detectPlatform() {
  return config.htsEnv?.enable ? 'hts' : 'web';
}
