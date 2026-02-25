import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import StockGraph from '../components/Investment/StockGraph';
import api from '../api/client';
import toast from 'react-hot-toast';
import { Loader2, TrendingUp, TrendingDown, DollarSign, Briefcase } from 'lucide-react';
import './InvestmentSimulator.css';

const InvestmentSimulator = () => {
    const { user } = useAuth();
    const [market, setMarket] = useState([]);
    const [portfolio, setPortfolio] = useState(null);
    const [selectedStock, setSelectedStock] = useState(null);
    const [tradeShares, setTradeShares] = useState(1);
    const [loading, setLoading] = useState(true);
    const [tradeLoading, setTradeLoading] = useState(false);

    const isDarkMode = user?.theme === 'dark';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [marketRes, portfolioRes] = await Promise.all([
                api.get('/api/investments/market'),
                api.get('/api/investments/portfolio')
            ]);

            setMarket(marketRes.data.data);
            setPortfolio(portfolioRes.data.data);

            if (!selectedStock && marketRes.data.data.length > 0) {
                setSelectedStock(marketRes.data.data[0]);
            }
        } catch (error) {
            console.error("Failed to fetch investment data:", error);
            toast.error("Could not load market data");
        } finally {
            setLoading(false);
        }
    };

    const handleTrade = async (action) => {
        if (!selectedStock) return;
        if (tradeShares <= 0) {
            toast.error("Please enter a valid number of shares");
            return;
        }

        setTradeLoading(true);
        try {
            await api.post('/api/investments/trade', {
                symbol: selectedStock.symbol,
                action,
                shares: parseInt(tradeShares)
            });

            toast.success(`Successfully ${action === 'buy' ? 'bought' : 'sold'} ${tradeShares} shares of ${selectedStock.symbol}`);
            setTradeShares(1);
            await fetchData();
        } catch (error) {
            console.error(`Trade ${action} failed:`, error);
        } finally {
            setTradeLoading(false);
        }
    };

    if (loading && !market.length) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin size-10 text-primary" />
            </div>
        );
    }

    const ownedShares = portfolio?.investments?.find(i => i.symbol === selectedStock?.symbol)?.shares || 0;
    const currentPrice = selectedStock?.currentPrice || 0;
    const totalCostEstimate = currentPrice * tradeShares;

    return (
        <div className={`simulator-wrapper ${isDarkMode ? 'dark' : 'light'} min-h-screen bg-gray-50 dark:bg-gray-900`}>
            <header className="px-6 py-4 bg-white dark:bg-gray-800 shadow-sm flex items-center mb-6">
                <Link to="/dashboard" className="flex items-center text-gray-500 hover:text-black dark:hover:text-white transition-colors mr-6">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                </Link>
                <h1 className="text-xl font-bold m-0 p-0 text-black dark:text-white">Micro-Investment Simulator</h1>
            </header>

            <main className="simulator-main-content px-6 pb-6 max-w-7xl mx-auto w-full">
                <header className="mb-8 hidden">
                    <h1 className="text-3xl font-bold mb-2">Micro-Investment Simulator</h1>
                    <p className="text-gray-500 max-w-2xl">
                        Learn how to invest risk-free. Use your virtual WalletWise Coins (WWC) to buy and sell mock stocks.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="stat-card glass flex flex-col items-center justify-center p-6 rounded-2xl shadow-sm border">
                        <div className="flex items-center text-gray-500 mb-2">
                            <DollarSign size={20} className="mr-2 text-green-500" />
                            <span className="font-semibold uppercase tracking-wider text-sm">Available Cash (WWC)</span>
                        </div>
                        <h2 className="text-4xl font-black">{portfolio?.wwcBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                    </div>
                    <div className="stat-card glass flex flex-col items-center justify-center p-6 rounded-2xl shadow-sm border">
                        <div className="flex items-center text-gray-500 mb-2">
                            <Briefcase size={20} className="mr-2 text-blue-500" />
                            <span className="font-semibold uppercase tracking-wider text-sm">Total Investments</span>
                        </div>
                        <h2 className="text-4xl font-black">{portfolio?.totalInvestmentValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                    </div>
                    <div className="stat-card glass flex flex-col items-center justify-center p-6 rounded-2xl shadow-sm border">
                        <div className="flex items-center text-gray-500 mb-2">
                            <TrendingUp size={20} className="mr-2 text-purple-500" />
                            <span className="font-semibold uppercase tracking-wider text-sm">Total Net Worth</span>
                        </div>
                        <h2 className="text-4xl font-black">{portfolio?.netWorth?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">

                        <div className="glass rounded-2xl border overflow-hidden">
                            <div className="p-4 border-b bg-opacity-50 font-bold bg-gray-50/50 dark:bg-gray-800/50">Market Overview</div>
                            <div className="max-h-80 overflow-y-auto">
                                {market.map(stock => {
                                    const todayPrice = stock.history[stock.history.length - 1].price;
                                    const yesterdayPrice = stock.history[stock.history.length - 2]?.price || todayPrice;
                                    const isUp = todayPrice >= yesterdayPrice;

                                    return (
                                        <div
                                            key={stock.symbol}
                                            onClick={() => setSelectedStock(stock)}
                                            className={`p-4 border-b cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5 flex justify-between items-center ${selectedStock?.symbol === stock.symbol ? 'bg-primary/10 border-l-4 border-l-primary' : ''}`}
                                        >
                                            <div>
                                                <div className="font-bold flex items-center">
                                                    {stock.symbol}
                                                    {isUp ? <TrendingUp size={14} className="text-green-500 ml-2" /> : <TrendingDown size={14} className="text-red-500 ml-2" />}
                                                </div>
                                                <div className="text-xs text-gray-500 truncate w-32">{stock.name}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold">${stock.currentPrice.toFixed(2)}</div>
                                                <div className={`text-xs ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                                                    {isUp ? '+' : ''}{((todayPrice - yesterdayPrice) / yesterdayPrice * 100).toFixed(2)}%
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {selectedStock && (
                            <div className="glass rounded-2xl border p-6 shadow-md transition-all">
                                <h3 className="text-xl font-bold mb-1">Trade {selectedStock.symbol}</h3>
                                <p className="text-sm text-gray-500 mb-6">{selectedStock.name} • ${currentPrice.toFixed(2)} / share</p>

                                <div className="mb-4">
                                    <label className="block text-sm font-semibold mb-2">Shares to Trade</label>
                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        className="w-full p-3 rounded-lg border bg-transparent focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        value={tradeShares}
                                        onChange={(e) => setTradeShares(e.target.value)}
                                    />
                                </div>

                                <div className="flex justify-between items-center text-sm mb-6 px-1">
                                    <span className="text-gray-500">Estimated Cost:</span>
                                    <span className="font-bold">${totalCostEstimate.toFixed(2)}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleTrade('buy')}
                                        disabled={tradeLoading || portfolio?.wwcBalance < totalCostEstimate}
                                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                                    >
                                        {tradeLoading ? <Loader2 className="animate-spin size-5" /> : 'Buy'}
                                    </button>
                                    <button
                                        onClick={() => handleTrade('sell')}
                                        disabled={tradeLoading || ownedShares < tradeShares}
                                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                                    >
                                        {tradeLoading ? <Loader2 className="animate-spin size-5" /> : 'Sell'}
                                    </button>
                                </div>

                                <div className="mt-4 text-center text-xs text-gray-500">
                                    You currently own <span className="font-bold">{ownedShares}</span> shares.
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass rounded-2xl border p-6 h-[400px] flex flex-col relative w-full overflow-hidden">
                            <h3 className="font-bold text-lg mb-4">{selectedStock?.name} ({selectedStock?.symbol}) - 7 Day Trend</h3>
                            <div className="flex-1 w-full relative min-h-[300px]">
                                <StockGraph stockData={selectedStock} />
                            </div>
                        </div>

                        <div className="glass rounded-2xl border overflow-hidden">
                            <div className="p-4 border-b bg-opacity-50 font-bold bg-gray-50/50 dark:bg-gray-800/50">Your Portfolio Holdings</div>
                            <div className="overflow-x-auto">
                                {portfolio?.investments?.length > 0 ? (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b text-sm text-gray-500">
                                                <th className="p-4 font-semibold">Asset</th>
                                                <th className="p-4 font-semibold text-right">Shares</th>
                                                <th className="p-4 font-semibold text-right">Avg Cost</th>
                                                <th className="p-4 font-semibold text-right">Current Price</th>
                                                <th className="p-4 font-semibold text-right">Total Value</th>
                                                <th className="p-4 font-semibold text-right">Return</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {portfolio.investments.map(inv => {
                                                const isProfit = inv.totalReturn >= 0;
                                                return (
                                                    <tr key={inv.symbol} className="border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                                        <td className="p-4">
                                                            <div className="font-bold">{inv.symbol}</div>
                                                            <div className="text-xs text-gray-500">{inv.companyName}</div>
                                                        </td>
                                                        <td className="p-4 text-right">{inv.shares}</td>
                                                        <td className="p-4 text-right">${inv.averageCost.toFixed(2)}</td>
                                                        <td className="p-4 text-right font-semibold">${inv.currentPrice.toFixed(2)}</td>
                                                        <td className="p-4 text-right font-bold">${inv.currentValue.toFixed(2)}</td>
                                                        <td className={`p-4 text-right font-bold ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                                                            {isProfit ? '+' : ''}${inv.totalReturn.toFixed(2)} <br />
                                                            <span className="text-xs opacity-80">({inv.returnPercent}%)</span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center">
                                        <Briefcase size={48} className="mb-4 opacity-20" />
                                        <p>You don't own any stocks yet.</p>
                                        <p className="text-sm">Select a stock from the market and click "Buy" to get started!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default InvestmentSimulator;
