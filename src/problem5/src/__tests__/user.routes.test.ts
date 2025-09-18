import request from 'supertest';
import express from 'express';
import { userRouter } from '../routes/user.routes';
import { errorHandler } from '../middlewares/errorHandler';

process.env.NODE_ENV = 'test';

const app = express();
app.use(express.json());
app.use('/users', userRouter);
app.use(errorHandler);

describe('User Routes', () => {
  describe('POST /users', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(userData.name);
      expect(response.body.email).toBe(userData.email);
      expect(response.body.score).toBe(0);
    });

    it('should return 400 for invalid email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
      };

      await request(app)
        .post('/users')
        .send(userData)
        .expect(400);
    });

    it('should return 409 for duplicate email', async () => {
      await request(app)
        .post('/users')
        .send({
          name: 'First User',
          email: 'duplicate@example.com',
        })
        .expect(201);

      await request(app)
        .post('/users')
        .send({
          name: 'Second User',
          email: 'duplicate@example.com',
        })
        .expect(409);
    });
  });

  describe('GET /users/:id', () => {
    it('should get user by id', async () => {
      const createResponse = await request(app)
        .post('/users')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
        });

      const userId = createResponse.body.id;
      const response = await request(app)
        .get(`/users/${userId}`)
        .expect(200);

      expect(response.body.id).toBe(userId);
      expect(response.body.name).toBe('John Doe');
      expect(response.body.email).toBe('john@example.com');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      await request(app)
        .get(`/users/${fakeId}`)
        .expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app)
        .get('/users/invalid-id')
        .expect(400);
    });
  });

  describe('GET /users', () => {
    beforeEach(async () => {
      await request(app)
        .post('/users')
        .send({ name: 'Alice Smith', email: 'alice@example.com' });

      await request(app)
        .post('/users')
        .send({ name: 'Bob Johnson', email: 'bob@example.com' });
    });

    it('should list all users with pagination', async () => {
      const response = await request(app)
        .get('/users')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter users by name', async () => {
      const response = await request(app)
        .get('/users?name=Alice')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].name).toContain('Alice');
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/users?page=1&limit=2')
        .expect(200);

      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user', async () => {
      const createResponse = await request(app)
        .post('/users')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
        });

      const userId = createResponse.body.id;
      const updateData = {
        name: 'John Updated',
        score: 100,
      };

      const response = await request(app)
        .put(`/users/${userId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe('John Updated');
      expect(response.body.score).toBe(100);
      expect(response.body.email).toBe('john@example.com');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      await request(app)
        .put(`/users/${fakeId}`)
        .send({ name: 'Updated' })
        .expect(404);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user', async () => {
      const createResponse = await request(app)
        .post('/users')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
        });

      const userId = createResponse.body.id;
      await request(app)
        .delete(`/users/${userId}`)
        .expect(204);

      await request(app)
        .get(`/users/${userId}`)
        .expect(404);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      await request(app)
        .delete(`/users/${fakeId}`)
        .expect(404);
    });
  });
});