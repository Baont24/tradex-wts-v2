import config from 'config';

export const prefixAccount = () => {
  return config.usernamePrefix.ignoreChar;
};
