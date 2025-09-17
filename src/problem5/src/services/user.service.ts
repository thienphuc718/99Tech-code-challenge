import { User, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { CreateUserInput, UpdateUserInput, QueryParams } from '../utils/validationSchemas';

export class UserService {
  async create(data: CreateUserInput): Promise<User> {
    try {
      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
        },
      });
      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new AppError('Email already exists', 409);
        }
      }
      throw error;
    }
  }

  async findById(id: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  async findMany(params: QueryParams): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    const { name, minScore, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(name && { name: { contains: name } }),
      ...(minScore !== undefined && { score: { gte: minScore } }),
    };

    const orderBy: Prisma.UserOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      limit,
    };
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    await this.findById(id);

    if (Object.keys(data).length === 0) {
      throw new AppError('At least one field must be provided for update', 400);
    }

    try {
      const user = await prisma.user.update({
        where: { id },
        data,
      });
      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new AppError('Email already exists', 409);
        }
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);

    await prisma.user.delete({
      where: { id },
    });
  }
}

export const userService = new UserService();