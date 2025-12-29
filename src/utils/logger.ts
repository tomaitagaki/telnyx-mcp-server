import winston from 'winston';

const logLevel = process.env.LOG_LEVEL || 'info';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, label, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${label || 'app'}] ${level}: ${message} ${metaStr}`;
  })
);

export function createLogger(label: string) {
  return winston.createLogger({
    level: logLevel,
    format: logFormat,
    defaultMeta: { label },
    transports: [
      new winston.transports.Console({
        format: consoleFormat,
      }),
    ],
  });
}

export const logger = createLogger('app');
