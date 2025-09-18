import { userService } from '../services/user.service';
import { AppError } from '../utils/AppError';

describe('User Service', () => {
  const userData = {
    name: 'Test User',
    email: 'test@example.com',
  };

  describe('create', () => {
    it('should create a new user', async () => {
      const user = await userService.create(userData);

      expect(user).toHaveProperty('id');
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.score).toBe(0);
    });

    it('should throw error for duplicate email', async () => {
      await userService.create(userData);
      await expect(userService.create(userData)).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const createdUser = await userService.create(userData);
      const user = await userService.findById(createdUser.id);

      expect(user.id).toBe(createdUser.id);
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
    });

    it('should throw AppError for non-existent user', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      await expect(userService.findById(fakeId)).rejects.toThrow(AppError);
    });
  });

  describe('findMany', () => {
    beforeEach(async () => {
      await userService.create({
        name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
      });

      await userService.create({
        name: 'Bob Smith',
        email: 'bob.smith@example.com',
      });
    });

    it('should return paginated users', async () => {
      const result = await userService.findMany({
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty('users');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('limit');
      expect(Array.isArray(result.users)).toBe(true);
      expect(result.total).toBeGreaterThan(0);
    });

    it('should filter users by name', async () => {
      const result = await userService.findMany({
        name: 'alice',
        page: 1,
        limit: 10,
      });

      expect(result.users.length).toBeGreaterThan(0);
      expect(result.users[0].name.toLowerCase()).toContain('alice');
    });

    it('should filter users by minimum score', async () => {
      const createdUser = await userService.create({
        name: 'High Score User',
        email: 'highscore@example.com',
        score: 50,
      });

      const result = await userService.findMany({
        minScore: 40,
        page: 1,
        limit: 10,
      });

      expect(result.users.length).toBeGreaterThan(0);
      result.users.forEach(user => {
        expect(user.score).toBeGreaterThanOrEqual(40);
      });
    });

    it('should sort users', async () => {
      const result = await userService.findMany({
        page: 1,
        limit: 10,
        sortBy: 'name',
        sortOrder: 'asc',
      });

      expect(result.users.length).toBeGreaterThan(1);
      for (let i = 0; i < result.users.length - 1; i++) {
        expect(result.users[i].name.localeCompare(result.users[i + 1].name)).toBeLessThanOrEqual(0);
      }
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const createdUser = await userService.create(userData);
      const updateData = {
        name: 'Updated Name',
        score: 75,
      };

      const updatedUser = await userService.update(createdUser.id, updateData);

      expect(updatedUser.name).toBe(updateData.name);
      expect(updatedUser.score).toBe(updateData.score);
      expect(updatedUser.email).toBe(userData.email);
    });

    it('should throw AppError for non-existent user', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      await expect(userService.update(fakeId, { name: 'Updated' })).rejects.toThrow(AppError);
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      const createdUser = await userService.create(userData);
      await userService.delete(createdUser.id);

      await expect(userService.findById(createdUser.id)).rejects.toThrow(AppError);
    });

    it('should throw AppError for non-existent user', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      await expect(userService.delete(fakeId)).rejects.toThrow(AppError);
    });
  });
});