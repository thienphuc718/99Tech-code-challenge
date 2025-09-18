import winston from 'winston';
import { config } from './environment';

const { combine, timestamp, json, colorize, simple } = winston.format;

const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: combine(
    timestamp(),
    json()
  ),
  defaultMeta: { service: 'user-api' },
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

if (config.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: combine(
      colorize(),
      simple()
    )
  }));
}

export { logger };