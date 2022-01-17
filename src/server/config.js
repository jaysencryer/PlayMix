const env = process.env;
console.log(env);
export default {
  port: env.PORT || 1234,
  host: env.HOST || 'localhost',
  isDev: env.NODE_ENV !== 'production',
  isBrowser: typeof window !== 'undefined',
};
