import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { userRouter } from './routes/user.routes';
import { errorHandler } from './middlewares/errorHandler';
import { generalRateLimit } from './middlewares/rateLimiter';
import { swaggerSpec } from './config/swagger';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(generalRateLimit);
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/users', userRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});