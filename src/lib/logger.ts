/**
 * Logger utility that respects NODE_ENV
 * Only logs in development, silent in production
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

const isDevelopment = process.env.NODE_ENV === 'development';

function createLogger() {
  return {
    /**
     * Log general information (development only)
     */
    log: (...args: any[]) => {
      if (isDevelopment) {
        console.log(...args);
      }
    },

    /**
     * Log informational messages (development only)
     */
    info: (...args: any[]) => {
      if (isDevelopment) {
        console.info(...args);
      }
    },

    /**
     * Log warnings (always shown)
     */
    warn: (...args: any[]) => {
      console.warn(...args);
    },

    /**
     * Log errors (always shown)
     */
    error: (...args: any[]) => {
      console.error(...args);
    },

    /**
     * Log debug information (development only)
     */
    debug: (...args: any[]) => {
      if (isDevelopment) {
        console.debug(...args);
      }
    },
  };
}

export const logger = createLogger();
