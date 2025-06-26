import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Sidebar from "../Components/Sidebar";
import axios from "axios";
import { useUser } from "../../Context/UserContext";
import toast, { Toaster } from "react-hot-toast";

// Initialize Socket.IO connection
const socket = io("https://backendcrypto.onrender.com", {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

const Portfolio = () => {
  const { uid } = useUser();
  const [portfolio, setPortfolio] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [currentPrices, setCurrentPrices] = useState({});
  const [totalInvested, setTotalInvested] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const [totalProfitLoss, setTotalProfitLoss] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch portfolio
  const fetchPortfolio = async () => {
    try {
      const response = await axios.get(`https://backendcrypto.onrender.com/api/portfolio/${uid}`);
      const data = response.data;
      setPortfolio(data.length > 0 ? data : []);
      if (data.length === 0) {
        setTotalInvested(0);
        setCurrentValue(0);
        setTotalProfitLoss(0);
        toast.info("Your portfolio is empty. Start trading to add cryptocurrencies.");
      } else {
        const symbols = data.map((coin) => coin.crypto_symbol.toUpperCase());
        socket.emit("subscribe", symbols);
        console.log("Subscribed to symbols:", symbols);
      }
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      setPortfolio([]);
      toast.error("Failed to fetch portfolio.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`https://backendcrypto.onrender.com/api/transactions/${uid}`);
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to fetch transaction history.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals and P/L
  const calculateTotals = (portfolioData, priceMap) => {
    let invested = 0;
    let value = 0;
    let profitLoss = 0;

    portfolioData.forEach((coin) => {
      const avgPrice = parseFloat(coin.average_buy_price) || 0;
      const currentPrice = priceMap[coin.crypto_symbol.toLowerCase()]?.usd || 0;
      const quantity = parseFloat(coin.quantity) || 0;
      invested += avgPrice * quantity;
      value += currentPrice * quantity;
      profitLoss += (currentPrice - avgPrice) * quantity;
    });

    setTotalInvested(invested);
    setCurrentValue(value);
    setTotalProfitLoss(profitLoss);
  };

  // Sell coins
  const handleSell = async (coin) => {
    const quantityToSell = prompt(`Enter quantity to sell for ${coin.crypto_symbol}:`);
    if (!quantityToSell || isNaN(quantityToSell) || parseFloat(quantityToSell) <= 0) {
      toast.error("Please enter a valid quantity.");
      return;
    }

    const quantity = parseFloat(quantityToSell);
    if (quantity > coin.quantity) {
      toast.error("Insufficient quantity to sell.");
      return;
    }

    try {
      const currentPrice = currentPrices[coin.crypto_symbol.toLowerCase()]?.usd || 0;
      const response = await axios.post("https://backendcrypto.onrender.com/api/sell", {
        user_id: uid,
        crypto_symbol: coin.crypto_symbol,
        quantity,
        price: currentPrice,
      });
      toast.success(response.data.message);
      await Promise.all([fetchPortfolio(), fetchTransactions()]);
    } catch (error) {
      console.error("Error selling coin:", error);
      toast.error(error.response?.data?.error || "Failed to sell coin.");
    }
  };

  // Load on mount
  useEffect(() => {
    setLoading(true);
    fetchPortfolio();
    fetchTransactions();

    socket.on("priceUpdate", (data) => {
      if (data.prices) {
        setCurrentPrices((prev) => ({
          ...prev,
          ...data.prices,
        }));
      }
    });

    socket.on("error", (error) => {
      console.error("Socket.IO error:", error.message);
      toast.error(error.message);
    });

    socket.on("connect", () => {
      console.log("Socket.IO connected");
      if (portfolio.length > 0) {
        const symbols = portfolio.map((coin) => coin.crypto_symbol.toUpperCase());
        socket.emit("subscribe", symbols);
      }
    });

    return () => {
      socket.off("priceUpdate");
      socket.off("error");
      socket.off("connect");
    };
  }, [uid]);

  // Recalculate whenever prices or portfolio update
  useEffect(() => {
    if (portfolio.length > 0 && Object.keys(currentPrices).length > 0) {
      calculateTotals(portfolio, currentPrices);
    }
  }, [portfolio, currentPrices]);

  return (
    <>
      <Sidebar />
      <Toaster />
      <div className="container mx-auto p-6 ml-18">
        {loading ? (
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            <p className="ml-4 text-lg text-gray-600">Loading portfolio...</p>
          </div>
        ) : (
          <>
            <h1 className="text-4xl font-bold text-center text-gray-900 mb-6">My Portfolio</h1>

            {/* Portfolio Summary */}
            <div className="bg-white shadow-lg rounded-lg p-6 mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-600">Total Invested</h2>
                <p className="text-2xl font-bold text-blue-600">${totalInvested.toFixed(2)}</p>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-600">Current Value</h2>
                <p className="text-2xl font-bold text-green-600">${currentValue.toFixed(2)}</p>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-600">Total Profit/Loss</h2>
                <p
                  className={`text-2xl font-bold ${
                    totalProfitLoss >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ${totalProfitLoss.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Portfolio Coin List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolio.length === 0 ? (
                <p className="text-center text-gray-500 col-span-full">
                  Your portfolio is empty. Start trading to add cryptocurrencies!
                </p>
              ) : (
                portfolio
                  .filter((coin) => coin.quantity > 0)
                  .map((coin, index) => {
                    const avgPrice = parseFloat(coin.average_buy_price) || 0;
                    const currentPrice = currentPrices[coin.crypto_symbol.toLowerCase()]?.usd || 0;
                    const quantity = parseFloat(coin.quantity) || 0;
                    const coinInvested = avgPrice * quantity;
                    const coinValue = currentPrice * quantity;
                    const coinProfitLoss = coinValue - coinInvested;

                    return (
                      <div
                        key={index}
                        className="bg-white shadow-xl rounded-lg p-6 hover:shadow-2xl transition duration-300 ease-in-out"
                      >
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">{coin.crypto_symbol}</h2>
                        <p className="text-gray-500 mb-2">Quantity: {quantity}</p>
                        <p className="text-gray-600 mb-2">
                          Avg Buy Price: ${isNaN(avgPrice) ? "N/A" : avgPrice.toFixed(2)}
                        </p>
                        <p className="text-gray-600 mb-2">
                          Current Price: ${currentPrice > 0 ? currentPrice.toFixed(2) : "Fetching..."}
                        </p>
                        <p className="text-gray-600 mb-2">Invested: ${coinInvested.toFixed(2)}</p>
                        <p className="text-gray-600 mb-2">Value: ${coinValue.toFixed(2)}</p>
                        <p
                          className={`font-semibold mb-4 ${
                            coinProfitLoss >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          Profit/Loss: ${coinProfitLoss.toFixed(2)}
                        </p>
                        <button
                          className="bg-red-500 text-white px-6 py-2 rounded-lg shadow-lg hover:bg-red-700 transition w-full"
                          onClick={() => handleSell(coin)}
                          disabled={quantity <= 0}
                        >
                          {quantity > 0 ? "Sell" : "No coins available"}
                        </button>
                      </div>
                    );
                  })
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Portfolio;
