import express from 'express';
import axios from 'axios';
import pb from '../utils/pocketbase.js';
import { authMiddleware } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();
const USDT_WALLET = '0xc0689212690d7fC1B3aD89B1147063F190403Ab6';
const USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const USDT_AMOUNT = 10;
const USDT_AMOUNT_WEI = 10000000; // 10 USDT with 6 decimals
const TX_HASH_REGEX = /^0x[a-fA-F0-9]{64}$/;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper function to retry API calls with exponential backoff
async function retryApiCall(fn, retries = MAX_RETRIES) {
	for (let i = 0; i < retries; i++) {
		try {
			return await fn();
		} catch (error) {
			if (i === retries - 1) throw error;

			const isRetryable =
				error.response?.status === 429 || // Rate limit
				error.code === 'ECONNREFUSED' ||
				error.code === 'ETIMEDOUT' ||
				error.code === 'ENOTFOUND';

			if (!isRetryable) throw error;

			const delay = RETRY_DELAY * Math.pow(2, i);
			logger.warn(`API call failed, retrying in ${delay}ms (attempt ${i + 1}/${retries})`);
			await new Promise(resolve => setTimeout(resolve, delay));
		}
	}
}

// POST /masters/verify-payment (protected)
router.post('/verify-payment', authMiddleware, async (req, res) => {
	const { txHash } = req.body;

	if (!txHash) {
		return res.status(400).json({ success: false, error: 'TX hash is required' });
	}

	// Validate TX hash format
	if (!TX_HASH_REGEX.test(txHash)) {
		return res.status(400).json({ success: false, error: 'Invalid TX hash format' });
	}

	try {
		logger.info(`Verifying payment for TX hash: ${txHash}`);

		// Fetch current block number to calculate confirmations
		const blockNumberResponse = await retryApiCall(() =>
			axios.get('https://api.etherscan.io/api', {
				params: {
					module: 'proxy',
					action: 'eth_blockNumber',
					apikey: process.env.ETHERSCAN_API_KEY,
				},
				timeout: 10000,
			})
		);

		const currentBlockNumber = parseInt(blockNumberResponse.data.result, 16);

		// Fetch transaction details
		const txResponse = await retryApiCall(() =>
			axios.get('https://api.etherscan.io/api', {
				params: {
					module: 'proxy',
					action: 'eth_getTransactionByHash',
					txhash: txHash,
					apikey: process.env.ETHERSCAN_API_KEY,
				},
				timeout: 10000,
			})
		);

		if (!txResponse.data.result) {
			logger.warn(`TX not found: ${txHash}`);
			return res.status(400).json({ success: false, error: 'TX hash not found on Ethereum' });
		}

		const tx = txResponse.data.result;
		if (!tx.blockNumber) {
			logger.warn(`TX not confirmed yet: ${txHash}`);
			return res.status(400).json({ success: false, error: 'TX is not confirmed yet' });
		}

		const txBlockNumber = parseInt(tx.blockNumber, 16);
		const confirmations = currentBlockNumber - txBlockNumber;
		if (confirmations < 1) {
			logger.warn(`TX has insufficient confirmations: ${confirmations}`);
			return res.status(400).json({ success: false, error: 'TX is not confirmed yet' });
		}

		// Verify USDT transfer by token transfer history instead of tx input decoding.
		// This supports smart wallets/proxy transactions where tx.input is not transfer().
		const tokenTxResponse = await retryApiCall(() =>
			axios.get('https://api.etherscan.io/api', {
				params: {
					module: 'account',
					action: 'tokentx',
					contractaddress: USDT_CONTRACT,
					address: USDT_WALLET,
					apikey: process.env.ETHERSCAN_API_KEY,
				},
				timeout: 10000,
			})
		);

		if (!tokenTxResponse.data.result || !Array.isArray(tokenTxResponse.data.result)) {
			logger.warn(`No token transfers found for wallet: ${USDT_WALLET}`);
			return res.status(400).json({ success: false, error: 'TX is not found in USDT transfer history' });
		}

		const matchingTokenTx = tokenTxResponse.data.result.find(
			t => t.hash.toLowerCase() === txHash.toLowerCase()
		);

		if (!matchingTokenTx) {
			logger.warn(`TX not found in USDT transfers: ${txHash}`);
			return res.status(400).json({
				success: false,
				error: 'TX is not an ERC20 USDT transfer to the payment wallet',
			});
		}

		if (matchingTokenTx.to.toLowerCase() !== USDT_WALLET.toLowerCase()) {
			logger.warn(`USDT transferred to wrong wallet: ${matchingTokenTx.to}`);
			return res.status(400).json({ success: false, error: 'Wrong recipient wallet' });
		}

		const transferAmount = parseInt(matchingTokenTx.value);
		if (transferAmount < USDT_AMOUNT_WEI) {
			logger.warn(`Insufficient USDT amount: ${transferAmount} < ${USDT_AMOUNT_WEI}`);
			return res.status(400).json({ success: false, error: 'Wrong amount (expected at least 10 USDT)' });
		}

		if (matchingTokenTx.contractAddress.toLowerCase() !== USDT_CONTRACT.toLowerCase()) {
			logger.warn(`Wrong token contract: ${matchingTokenTx.contractAddress}`);
			return res.status(400).json({ success: false, error: 'Wrong network or token contract' });
		}

		// Calculate subscription expiry date (30 days from now)
		const expiryDate = new Date();
		expiryDate.setDate(expiryDate.getDate() + 30);

		const master = await pb.collection('masters').getFirstListItem(`userId="${req.user.id}"`);
		await pb.collection('masters').update(master.id, {
			subscriptionStatus: 'active',
			subscriptionExpiryDate: expiryDate.toISOString(),
		});
		logger.info(`Subscription activated for master: ${master.id}`);

		return res.json({
			success: true,
			message: 'Payment verified',
			subscriptionExpiryDate: expiryDate.toISOString(),
		});
	} catch (error) {
		logger.error(`Payment verification failed: ${error.message}`);
		return res.status(500).json({
			success: false,
			error: 'Failed to verify payment. Please try again later.',
		});
	}
});

// GET /masters/nearby
router.get('/nearby', async (req, res) => {
	const { lat, lng, category, minRating, maxPrice } = req.query;

	if (!lat || !lng) {
		return res.status(400).json({ error: 'Latitude and longitude are required' });
	}

	const latitude = parseFloat(lat);
	const longitude = parseFloat(lng);
	const minRatingVal = minRating ? parseFloat(minRating) : 0;
	const maxPriceVal = maxPrice ? parseFloat(maxPrice) : Infinity;

	let filter = 'subscriptionStatus="active"';

	if (category) {
		filter += ` && categories~"${category}"`;
	}

	const masters = await pb.collection('masters').getFullList({
		filter,
	});

	const nearbyMasters = masters
		.map(master => {
			const [masterLat, masterLng] = master.serviceLocation || [0, 0];
			const distance = calculateDistance(latitude, longitude, masterLat, masterLng);

			const primaryService = master.services?.find(s => s.isPrimary === true);
			const price = primaryService?.price || 0;

			return {
				...master,
				distance,
			};
		})
		.filter(master => {
			const rating = master.rating || 0;
			const primaryService = master.services?.find(s => s.isPrimary === true);
			const price = primaryService?.price || 0;
			return rating >= minRatingVal && price <= maxPriceVal;
		})
		.sort((a, b) => a.distance - b.distance);

	res.json(nearbyMasters);
});

// GET /masters/:id
router.get('/:id', async (req, res) => {
	const { id } = req.params;

	const master = await pb.collection('masters').getOne(id);

	const reviews = await pb.collection('reviews').getFullList({
		filter: `masterId="${id}"`,
	});

	const rating = reviews.length > 0
		? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)
		: 0;

	res.json({
		...master,
		rating: parseFloat(rating),
		reviews: reviews.length,
	});
});

// GET /masters/:id/subscription-status
router.get('/:id/subscription-status', async (req, res) => {
	const { id } = req.params;

	const master = await pb.collection('masters').getOne(id);

	const expiryDate = master.subscriptionExpiryDate ? new Date(master.subscriptionExpiryDate) : null;
	const now = new Date();
	const daysRemaining = expiryDate ? Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)) : null;

	res.json({
		status: master.subscriptionStatus,
		expiryDate: expiryDate ? expiryDate.toISOString() : null,
		daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
	});
});

function calculateDistance(lat1, lon1, lat2, lon2) {
	const R = 6371;
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

export default router;