const isDev = import.meta.env.DEV;

export const logger = {
  debug(prefix: string, ...args: unknown[]) {
    if (isDev) console.log(`[${prefix}]`, ...args);
  },
  info(prefix: string, ...args: unknown[]) {
    if (isDev) console.info(`[${prefix}]`, ...args);
  },
  warn(prefix: string, ...args: unknown[]) {
    console.warn(`[${prefix}]`, ...args);
  },
  error(prefix: string, ...args: unknown[]) {
    console.error(`[${prefix}]`, ...args);
  },
};
