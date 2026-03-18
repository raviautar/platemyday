const isDev = process.env.NODE_ENV !== 'production';

/** Debug logs — only print in development. */
export const logger = {
  log: isDev ? console.log.bind(console) : () => {},
  info: isDev ? console.info.bind(console) : () => {},
  warn: isDev ? console.warn.bind(console) : () => {},
  debug: isDev ? console.debug.bind(console) : () => {},
  /** Errors always log, even in production. */
  error: console.error.bind(console),
};
