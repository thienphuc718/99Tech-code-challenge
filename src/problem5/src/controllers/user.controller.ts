import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import {
  createUserSchema,
  updateUserSchema,
  queryParamsSchema,
  uuidSchema,
} from '../utils/validationSchemas';

export async function createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validatedData = createUserSchema.parse(req.body);
    const user = await userService.create(validatedData);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = uuidSchema.parse(req.params.id);
    const user = await userService.findById(id);
    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validatedQuery = queryParamsSchema.parse(req.query);
    const result = await userService.findMany(validatedQuery);

    res.json({
      data: result.users,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = uuidSchema.parse(req.params.id);
    const validatedData = updateUserSchema.parse(req.body);
    const user = await userService.update(id, validatedData);
    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = uuidSchema.parse(req.params.id);
    await userService.delete(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}