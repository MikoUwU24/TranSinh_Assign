import dotenv from 'dotenv';
// Load environment variables before importing anything else
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import formRoutes from './routes/form.routes';
import fieldRoutes from './routes/field.routes';
import submissionRoutes from './routes/submission.routes';
import { errorHandler } from './middlewares/error-handler';
import { setupSwagger } from './config/swagger';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

// Middlewares
app.use(cors({
  origin: '*', // Allows connections from Next.js development server
  credentials: true,
}));
app.use(express.json());

// Mount Swagger documentation
setupSwagger(app);

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/forms', formRoutes);
// Nested routes: mergeParams allows field routes to see :id as formId
app.use('/api/forms/:id/fields', fieldRoutes);
app.use('/api/submissions', submissionRoutes);

// Root path check
app.get('/', (_req, res) => {
  res.json({ message: 'Dynamic Form Builder Backend is running' });
});

// Centralized error handler middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
  console.log(`[Docs] Swagger UI is available at http://localhost:${PORT}/api/docs`);
});
