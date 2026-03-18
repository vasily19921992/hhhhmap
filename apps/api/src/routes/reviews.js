import express from 'express';
import pb from '../utils/pocketbase.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// POST /reviews (protected)
router.post('/', authMiddleware, async (req, res) => {
	const { masterId, rating, text } = req.body;
	const clientId = req.user.id;

	if (!masterId || rating === undefined || !text) {
		return res.status(400).json({ error: 'masterId, rating, and text are required' });
	}

	if (rating < 1 || rating > 5) {
		return res.status(400).json({ error: 'Rating must be between 1 and 5' });
	}

	const review = await pb.collection('reviews').create({
		masterId,
		clientId,
		rating,
		text,
	});

	res.json({
		id: review.id,
		...review,
	});
});

// GET /reviews/:masterId
router.get('/:masterId', async (req, res) => {
	const { masterId } = req.params;

	const reviews = await pb.collection('reviews').getFullList({
		filter: `masterId="${masterId}"`,
		sort: '-created',
	});

	const reviewsWithClientName = await Promise.all(
		reviews.map(async (review) => {
			try {
				const client = await pb.collection('users').getOne(review.clientId);
				return {
					...review,
					clientName: client.email,
				};
			} catch (error) {
				return {
					...review,
					clientName: 'Anonymous',
				};
			}
		})
	);

	res.json(reviewsWithClientName);
});

export default router;