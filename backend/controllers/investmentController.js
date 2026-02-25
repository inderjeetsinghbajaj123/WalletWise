const User = require('../models/User');
const Investment = require('../models/Investment');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Helper to generate a deterministic "fluctuation" based on a seed (e.g., date)
function pseudoRandom(seed) {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Fixed list of mock stocks with base prices
const MOCK_STOCKS = [
  { symbol: 'WWTC', name: 'WalletWise Tech', basePrice: 150 },
  { symbol: 'EGRN', name: 'EarthGreen Energy', basePrice: 45 },
  { symbol: 'GLDB', name: 'Global Bank Inc.', basePrice: 85 },
  { symbol: 'HLTH', name: 'MediCare Solutions', basePrice: 120 },
  { symbol: 'VLTY', name: 'Volatile Crypto ETF', basePrice: 300 }
];

// Generate market data for today (and historical for charting)
const generateMarketData = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day
  const timestampSeed = today.getTime();

  // History for the past 7 days
  const historyDays = 7;
  
  return MOCK_STOCKS.map(stock => {
    // Generate history points
    const history = [];
    let currentPrice = stock.basePrice;

    for (let i = historyDays; i >= 0; i--) {
        const daySeed = timestampSeed - (i * 86400000); // subtract days
        // Generate a swing between -5% and +5%
        const dailyChangePercent = (pseudoRandom(daySeed + stock.symbol.charCodeAt(0)) * 0.1) - 0.05;
        
        // Volatile ETF swings harder (-15% to +15%)
        const volatilityMultiplier = stock.symbol === 'VLTY' ? 3 : 1;
        
        currentPrice = currentPrice * (1 + (dailyChangePercent * volatilityMultiplier));
        
        history.push({
            date: new Date(daySeed).toISOString().split('T')[0],
            price: Number(currentPrice.toFixed(2))
        });
    }

    return {
      symbol: stock.symbol,
      name: stock.name,
      currentPrice: history[history.length - 1].price,
      history: history
    };
  });
};

const getPortfolio = catchAsync(async (req, res) => {
    const userId = req.userId;
    
    // Ensure User exists and has a wwcBalance
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    // Initialize WWC if it somehow doesn't exist (handle legacy accounts)
    if (user.wwcBalance === undefined) {
        user.wwcBalance = 10000;
        await user.save();
    }

    const investments = await Investment.find({ userId });

    // Calculate total portfolio value based on CURRENT market prices
    const market = generateMarketData();
    let totalInvestmentValue = 0;

    const enrichedInvestments = investments.map(inv => {
        const marketData = market.find(m => m.symbol === inv.symbol);
        const currentPrice = marketData ? marketData.currentPrice : inv.averageCost;
        const currentValue = currentPrice * inv.shares;
        totalInvestmentValue += currentValue;
        
        return {
            ...inv.toObject(),
            currentPrice,
            currentValue: Number(currentValue.toFixed(2)),
            totalReturn: Number((currentValue - (inv.averageCost * inv.shares)).toFixed(2)),
            returnPercent: Number((((currentPrice - inv.averageCost) / inv.averageCost) * 100).toFixed(2))
        };
    });

    res.json({
        success: true,
        data: {
            wwcBalance: Number(user.wwcBalance.toFixed(2)),
            totalInvestmentValue: Number(totalInvestmentValue.toFixed(2)),
            netWorth: Number((user.wwcBalance + totalInvestmentValue).toFixed(2)),
            investments: enrichedInvestments
        }
    });
});

const getMarketData = catchAsync(async (req, res) => {
    const market = generateMarketData();
    res.json({
        success: true,
        data: market
    });
});

const tradeStock = catchAsync(async (req, res) => {
    const userId = req.userId;
    const { symbol, action, shares } = req.body; // action = 'buy' | 'sell'

    if (!symbol || !action || !shares || shares <= 0) {
        throw new AppError('Invalid trade parameters', 400);
    }

    const market = generateMarketData();
    const stockData = market.find(s => s.symbol === symbol.toUpperCase());

    if (!stockData) {
        throw new AppError('Stock symbol not found in mock market', 404);
    }

    const currentPrice = stockData.currentPrice;
    const totalCost = currentPrice * shares;

    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    if (action === 'buy') {
        if (user.wwcBalance < totalCost) {
            throw new AppError('Insufficient WalletWise Coins (WWC) for this purchase', 400);
        }

        user.wwcBalance -= totalCost;

        // Upsert Investment
        let investment = await Investment.findOne({ userId, symbol: stockData.symbol });
        
        if (investment) {
            // Recalculate average cost
            const oldTotalValue = investment.shares * investment.averageCost;
            investment.shares += shares;
            investment.averageCost = (oldTotalValue + totalCost) / investment.shares;
            await investment.save();
        } else {
            await Investment.create({
                userId,
                symbol: stockData.symbol,
                companyName: stockData.name,
                shares: shares,
                averageCost: currentPrice
            });
        }
    } else if (action === 'sell') {
        let investment = await Investment.findOne({ userId, symbol: stockData.symbol });

        if (!investment || investment.shares < shares) {
            throw new AppError('Insufficient shares to sell', 400);
        }

        user.wwcBalance += totalCost;
        investment.shares -= shares;

        if (investment.shares === 0) {
            await Investment.findByIdAndDelete(investment._id);
        } else {
            await investment.save();
        }
    } else {
        throw new AppError("Action must be 'buy' or 'sell'", 400);
    }

    await user.save();

    res.json({
        success: true,
        message: `Successfully ${action === 'buy' ? 'bought' : 'sold'} ${shares} shares of ${stockData.symbol}`,
        data: {
            wwcBalance: Number(user.wwcBalance.toFixed(2))
        }
    });
});

module.exports = {
    getPortfolio,
    getMarketData,
    tradeStock
};
