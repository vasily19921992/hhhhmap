import express from 'express';
import pb from '../utils/pocketbase.js';

const router = express.Router();

// POST /auth/register
router.post('/register', async (req, res) => {
	const { email, password, userType } = req.body;

	if (!email || !password || !userType) {
		return res.status(400).json({ error: 'Email, password, and userType are required' });
	}

	const user = await pb.collection('users').create({
		email,
		password,
		passwordConfirm: password,
		userType,
	});

	res.json({
		id: user.id,
		email: user.email,
		userType: user.userType,
	});
});

// POST /auth/login
router.post('/login', async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ error: 'Email and password are required' });
	}

	const authData = await pb.collection('users').authWithPassword(email, password);

	res.json({
		id: authData.record.id,
		email: authData.record.email,
		userType: authData.record.userType,
		token: authData.token,
	});
});

export default router;