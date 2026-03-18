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

			// Check if error is retryable (rate limit or network error)
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

// POST /verify-payment (protected)
router.post('/', authMiddleware, async (req, res) => {
	const { txHash, masterId } = req.body;

	// Validate input
	if (!txHash || !masterId) {
		return res.status(400).json({ error: 'txHash and masterId are required' });
	}

	// Validate TX hash format
	if (!TX_HASH_REGEX.test(txHash)) {
		return res.status(400).json({ error: 'Invalid TX hash format' });
	}

	logger.info(`Verifying payment for TX hash: ${txHash}, masterId: ${masterId}`);

	// Verify masterId exists
	const master = await pb.collection('masters').getOne(masterId);
	if (!master) {
		return res.status(400).json({ error: 'Master not found' });
	}

	// Check for duplicate subscription
	try {
		const existingSubscription = await pb
			.collection('subscriptions')
			.getFirstListItem(`txHash="${txHash}"`);

		if (existingSubscription) {
			logger.warn(`Duplicate subscription attempt for TX: ${txHash}`);
			throw new Error('TX уже использован для активации подписки');
		}
	} catch (error) {
		// If error is not "no items found", re-throw
		if (!error.message.includes('no items found')) {
			throw error;
		}
	}

	// Fetch current block number
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
	logger.info(`Current block number: ${currentBlockNumber}`);

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
		throw new Error('TX hash не найден в блокчейне');
	}

	const tx = txResponse.data.result;

	// Verify transaction has at least 1 confirmation
	if (!tx.blockNumber) {
		logger.warn(`TX not confirmed yet: ${txHash}`);
		throw new Error('TX еще не подтвержден');
	}

	const txBlockNumber = parseInt(tx.blockNumber, 16);
	const confirmations = currentBlockNumber - txBlockNumber;

	if (confirmations < 1) {
		logger.warn(`TX has insufficient confirmations: ${confirmations}`);
		throw new Error('TX еще не подтвержден');
	}

	logger.info(`TX has ${confirmations} confirmations`);

	// Verify USDT transfer using token transfer API
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
		throw new Error('TX не найден в истории переводов USDT');
	}

	// Find the matching transaction
	const matchingTokenTx = tokenTxResponse.data.result.find(
		t => t.hash.toLowerCase() === txHash.toLowerCase()
	);

	if (!matchingTokenTx) {
		logger.warn(`TX not found in USDT transfers: ${txHash}`);
		throw new Error('TX не является переводом USDT');
	}

	// Verify recipient
	if (matchingTokenTx.to.toLowerCase() !== USDT_WALLET.toLowerCase()) {
		logger.warn(`USDT transferred to wrong wallet: ${matchingTokenTx.to}`);
		throw new Error('Неверный адрес получателя');
	}

	// Verify amount (USDT has 6 decimals)
	const transferAmount = parseInt(matchingTokenTx.value);
	if (transferAmount < USDT_AMOUNT_WEI) {
		logger.warn(
			`Insufficient USDT amount: ${transferAmount} < ${USDT_AMOUNT_WEI}`
		);
		throw new Error('Неверная сумма (ожидается 10 USDT)');
	}

	// Verify contract address
	if (matchingTokenTx.contractAddress.toLowerCase() !== USDT_CONTRACT.toLowerCase()) {
		logger.warn(`Wrong token contract: ${matchingTokenTx.contractAddress}`);
		throw new Error('TX на неправильной сети');
	}

	logger.info(`Payment verified for TX: ${txHash}`);

	// Calculate subscription dates
	const verificationDate = new Date();
	const expiryDate = new Date(verificationDate);
	expiryDate.setDate(expiryDate.getDate() + 30);

	// Create subscription record
	const subscription = await pb.collection('subscriptions').create({
		masterId,
		txHash,
		amount: USDT_AMOUNT,
		token: 'USDT',
		network: 'ERC20',
		verificationStatus: 'verified',
		verificationDate: verificationDate.toISOString(),
		expiryDate: expiryDate.toISOString(),
	});

	logger.info(`Subscription record created: ${subscription.id}`);

	// Update master subscription status
	await pb.collection('masters').update(masterId, {
		subscriptionStatus: 'active',
		subscriptionExpiryDate: expiryDate.toISOString(),
	});

	logger.info(`Master subscription activated: ${masterId}`);

	res.json({
		success: true,
		expiryDate: expiryDate.toISOString(),
		message: 'Subscription activated',
	});
});

export default router;