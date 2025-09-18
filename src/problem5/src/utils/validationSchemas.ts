import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email format'),
  score: z.number().int().min(0).max(100).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
  score: z.number().int().min(0).max(100).optional(),
});

export const queryParamsSchema = z.object({
  name: z.string().optional(),
  minScore: z.string().transform((val) => {
    if (!val) return undefined;
    const parsed = parseInt(val, 10);
    if (isNaN(parsed)) {
      throw new z.ZodError([{
        code: z.ZodIssueCode.custom,
        message: 'minScore must be a valid number',
        path: ['minScore']
      }]);
    }
    return parsed;
  }).optional(),
  page: z.string().transform((val) => {
    if (!val) return 1;
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed < 1) {
      throw new z.ZodError([{
        code: z.ZodIssueCode.custom,
        message: 'page must be a positive number',
        path: ['page']
      }]);
    }
    return parsed;
  }).optional(),
  limit: z.string().transform((val) => {
    if (!val) return 10;
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 100) {
      throw new z.ZodError([{
        code: z.ZodIssueCode.custom,
        message: 'limit must be between 1 and 100',
        path: ['limit']
      }]);
    }
    return parsed;
  }).optional(),
  sortBy: z.enum(['name', 'email', 'score', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const uuidSchema = z.string().uuid('Invalid UUID format');

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type QueryParams = z.infer<typeof queryParamsSchema>;