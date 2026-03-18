import { Router } from 'express';
import healthCheck from './health-check.js';
import authRouter from './auth.js';
import mastersRouter from './masters.js';
import reviewsRouter from './reviews.js';
import paymentsRouter from './payments.js';

const router = Router();

export default () => {
	router.get('/health', healthCheck);
	router.use('/auth', authRouter);
	router.use('/masters', mastersRouter);
	router.use('/reviews', reviewsRouter);
	router.use('/verify-payment', paymentsRouter);

	return router;
};