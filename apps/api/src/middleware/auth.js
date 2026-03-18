import pb from '../utils/pocketbase.js';
import logger from '../utils/logger.js';

export const authMiddleware = async (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'Missing or invalid authorization header' });
	}

	const token = authHeader.substring(7);

	try {
		pb.authStore.save(token);
		const authData = pb.authStore.record;

		if (!authData) {
			return res.status(401).json({ error: 'Invalid token' });
		}

		req.user = authData;
		next();
	} catch (error) {
		logger.error('Auth middleware error:', error.message);
		return res.status(401).json({ error: 'Invalid token' });
	}
};