import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email format'),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
});

export const queryParamsSchema = z.object({
  name: z.string().optional(),
  minScore: z.string().transform((val) => val ? parseInt(val, 10) : undefined).optional(),
  page: z.string().transform((val) => val ? parseInt(val, 10) : 1).optional(),
  limit: z.string().transform((val) => val ? parseInt(val, 10) : 10).optional(),
  sortBy: z.enum(['name', 'email', 'score', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const uuidSchema = z.string().uuid('Invalid UUID format');

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type QueryParams = z.infer<typeof queryParamsSchema>;