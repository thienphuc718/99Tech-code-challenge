import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { userRouter } from './routes/user.routes';
import { errorHandler } from './middlewares/errorHandler';
import { generalRateLimit } from './middlewares/rateLimiter';
import { requestLogger } from './middlewares/requestLogger';
import { swaggerSpec } from './config/swagger';
import { logger } from './config/logger';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(generalRateLimit);
app.use(requestLogger);
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/users', userRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});