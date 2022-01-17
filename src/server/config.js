const env = process.env;
export default {
  port: env.PORT || 1234,
  host: env.HOST || '0.0.0.0',
  isDev: env.NODE_ENV !== 'production',
  isBrowser: typeof window !== 'undefined',
};
