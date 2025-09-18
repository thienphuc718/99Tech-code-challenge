import rateLimit from 'express-rate-limit';
import { config } from '../config/environment';

const isTest = config.NODE_ENV === 'test';

export const generalRateLimit = rateLimit({
  windowMs: isTest ? 1000 : config.RATE_LIMIT_WINDOW_MS,
  max: isTest ? 1000 : config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictRateLimit = rateLimit({
  windowMs: isTest ? 1000 : config.RATE_LIMIT_WINDOW_MS,
  max: isTest ? 1000 : config.RATE_LIMIT_STRICT_MAX,
  message: {
    error: 'Too many requests for this operation, please try again later.',
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const createUserRateLimit = rateLimit({
  windowMs: isTest ? 1000 : 60 * 60 * 1000,
  max: isTest ? 1000 : config.RATE_LIMIT_CREATE_USER_MAX,
  message: {
    error: 'Too many user creation attempts, please try again later.',
    retryAfter: 60 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});