import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export function handleJsonParseError(error: Error, req: Request, res: Response, next: NextFunction): void {
  if (error instanceof SyntaxError && 'body' in error) {
    throw new AppError('Invalid JSON format', 400);
  }
  next(error);
}