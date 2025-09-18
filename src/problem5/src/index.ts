import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { userRouter } from './routes/user.routes';
import { errorHandler } from './middlewares/errorHandler';
import { generalRateLimit } from './middlewares/rateLimiter';
import { requestLogger } from './middlewares/requestLogger';
import { handleJsonParseError } from './middlewares/jsonParser';
import { swaggerSpec } from './config/swagger';
import { logger } from './config/logger';
import { config } from './config/environment';

const app = express();

app.use(generalRateLimit);
app.use(requestLogger);
app.use(express.json());
app.use(handleJsonParseError);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/users', userRouter);

app.use(errorHandler);

app.listen(config.PORT, () => {
  logger.info(`Server started on port ${config.PORT}`, {
    port: config.PORT,
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});