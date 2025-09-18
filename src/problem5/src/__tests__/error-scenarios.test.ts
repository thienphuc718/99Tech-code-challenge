import request from 'supertest';
import express from 'express';
import { userRouter } from '../routes/user.routes';
import { errorHandler } from '../middlewares/errorHandler';
import { handleJsonParseError } from '../middlewares/jsonParser';

process.env.NODE_ENV = 'test';

const app = express();
app.use(express.json());
app.use(handleJsonParseError);
app.use('/users', userRouter);
app.use(errorHandler);

describe('Error Scenarios', () => {
  describe('Validation Errors', () => {
    it('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/users')
        .send({})
        .expect(400);

      expect(response.body.message).toBe('Validation Error');
      expect(response.body.errors).toBeDefined();
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('should handle invalid data types', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          name: 123,
          email: 'valid@example.com',
        })
        .expect(400);

      expect(response.body.message).toBe('Validation Error');
    });

    it('should handle invalid email format', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          name: 'Test User',
          email: 'invalid-email-format',
        })
        .expect(400);

      expect(response.body.message).toBe('Validation Error');
    });

    it('should handle invalid score range', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          score: -10,
        })
        .expect(400);

      expect(response.body.message).toBe('Validation Error');
    });

    it('should handle score over maximum', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          name: 'Test User',
          email: 'test2@example.com',
          score: 150,
        })
        .expect(400);

      expect(response.body.message).toBe('Validation Error');
    });
  });

  describe('Database Errors', () => {
    let userId: string;

    beforeEach(async () => {
      const user = await request(app)
        .post('/users')
        .send({
          name: 'Test User',
          email: 'test@example.com',
        });
      userId = user.body.id;
    });

    it('should handle duplicate email constraint', async () => {
      await request(app)
        .post('/users')
        .send({
          name: 'First User',
          email: 'duplicate@example.com',
        })
        .expect(201);

      const response = await request(app)
        .post('/users')
        .send({
          name: 'Another User',
          email: 'duplicate@example.com',
        })
        .expect(409);

      expect(response.body.message).toBe('Email already exists');
    });

    it('should handle non-existent user update', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      const response = await request(app)
        .put(`/users/${fakeId}`)
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });

    it('should handle non-existent user deletion', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      const response = await request(app)
        .delete(`/users/${fakeId}`)
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });

    it('should handle non-existent user retrieval', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      const response = await request(app)
        .get(`/users/${fakeId}`)
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });
  });

  describe('Malformed Requests', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/users')
        .set('Content-Type', 'application/json')
        .send('{"name": "Test", "email":}')
        .expect(400);
    });

    it('should handle empty request body', async () => {
      const response = await request(app)
        .post('/users')
        .set('Content-Type', 'application/json')
        .send('')
        .expect(400);
    });

    it('should handle invalid UUID format in params', async () => {
      const response = await request(app)
        .get('/users/not-a-uuid')
        .expect(400);

      expect(response.body.message).toBe('Validation Error');
    });

    it('should handle invalid query parameters', async () => {
      await request(app)
        .get('/users?page=invalid&limit=not-a-number')
        .expect(400);
    });
  });

  describe('Content Type Errors', () => {
    it('should handle missing content-type header', async () => {
      const response = await request(app)
        .post('/users')
        .send('name=Test&email=test@example.com')
        .expect(400);
    });

    it('should handle wrong content-type', async () => {
      const response = await request(app)
        .post('/users')
        .set('Content-Type', 'text/plain')
        .send('some text data')
        .expect(400);
    });
  });

  describe('Edge Cases', () => {
    it('should handle extremely long name', async () => {
      const longName = 'a'.repeat(1000);
      const response = await request(app)
        .post('/users')
        .send({
          name: longName,
          email: 'test@example.com',
        })
        .expect(400);

      expect(response.body.message).toBe('Validation Error');
    });

    it('should handle special characters in name', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          name: '!@#$%^&*()',
          email: 'test@example.com',
        })
        .expect(201);

      expect(response.body.name).toBe('!@#$%^&*()');
    });

    it('should handle unicode characters in name', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          name: '测试用户',
          email: 'unicode@example.com',
        })
        .expect(201);

      expect(response.body.name).toBe('测试用户');
    });
  });
});