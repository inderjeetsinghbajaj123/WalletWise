const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investmentController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/portfolio', investmentController.getPortfolio);
router.get('/market', investmentController.getMarketData);
router.post('/trade', investmentController.tradeStock);

module.exports = router;
