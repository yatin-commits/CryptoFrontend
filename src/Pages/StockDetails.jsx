import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Sidebar from "../Components/Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark, faHourglassStart } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import CommentSection from "../Components/CommentSection";
import { useUser } from "../../Context/UserContext";

const API_URL = "http://localhost:3000";

const StockDetails = () => {
  const { email, walletBalance, setWalletBalance, uid } = useUser();
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [price, setPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(null);
  const [coinImage, setCoinImage] = useState("/images/default.png");
  const [coinName, setCoinName] = useState(symbol.toUpperCase());
  const [quantity, setQuantity] = useState("");
  const [portfolioData, setPortfolioData] = useState(null);
  const [sellQuantity, setSellQuantity] = useState("");
  const [showSellModal, setShowSellModal] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const socketRef = useRef(null);

  // Fetch coin data from CryptoCompare
  const fetchCoinData = async () => {
    try {
      const response = await axios.get("https://min-api.cryptocompare.com/data/all/coinlist");
      const coinData = response.data.Data;
      const upperSymbol = symbol.toUpperCase();

      if (coinData[upperSymbol]) {
        setCoinName(coinData[upperSymbol].FullName);
        setCoinImage(`https://www.cryptocompare.com${coinData[upperSymbol].ImageUrl}`);
      } else {
        setCoinName(upperSymbol);
        setCoinImage("https://via.placeholder.com/32");
      }
    } catch (err) {
      console.error("Error fetching coin data:", err.message);
      toast.error("Failed to load coin information.");
    }
  };
useEffect(() => {
  if (!uid) {
    navigate("/login");
    return;
  }

  console.log("Initializing socket for symbol:", symbol); // Debug log

  const socket = io(API_URL, {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socketRef.current = socket;

  socket.on("connect", () => {
    console.log("WebSocket connected. Subscribing to:", symbol.toUpperCase()); // Debug log
    socket.emit("subscribe", [symbol.toUpperCase()]);
  });

  socket.on("priceUpdate", (data) => {
    console.log("Received priceUpdate:", data); // Debug log
    if (data.prices && data.prices[symbol.toLowerCase()]?.usd) {
      console.log("Updating price for:", symbol, "New price:", data.prices[symbol.toLowerCase()].usd); // Debug log
      setPrice(data.prices[symbol.toLowerCase()].usd);
    } else {
      console.warn("Invalid price update format for symbol:", symbol, "Data:", data); // Debug log
    }
  });

  // ... rest of your socket handlers ...

  return () => {
    socket.disconnect();
  };
}, [symbol, uid, navigate]);
  // Fetch wallet balance
  const fetchWalletBalance = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/wallet/${uid}`);
    const balance = parseFloat(response.data.wallet_balance);
    if (isNaN(balance)) throw new Error("Invalid wallet balance");  // Added missing parenthesis
    setWalletBalance(balance);
  } catch (error) {
    console.error("Error fetching wallet balance:", error.message);
    setWalletBalance(0);
    toast.error("Failed to fetch wallet balance.");
  }
};

  // Check watchlist status
  const fetchWatchlistStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/wishlist/${uid}`);
      const watchlist = response.data || [];
      setIsInWatchlist(watchlist.some(coin => coin.symbol.toLowerCase() === symbol.toLowerCase()));
    } catch (error) {
      console.error("Error fetching watchlist:", error.message);
    }
  };

  // Toggle watchlist status
  const handleToggleWatchlist = async () => {
    try {
      const response = isInWatchlist
        ? await axios.delete(`${API_URL}/api/wishlist/remove/${uid}/${symbol}`)
        : await axios.post(`${API_URL}/api/wishlist/add/${uid}`, {
            coin_name: coinName,
            symbol,
          });
      
      if (response.status === 200) {
        toast.success(isInWatchlist ? "Removed from watchlist!" : "Added to watchlist!");
        setIsInWatchlist(!isInWatchlist);
      }
    } catch (error) {
      console.error("Failed to toggle watchlist:", error.message);
      toast.error("Failed to update watchlist.");
    }
  };

  // Fetch portfolio data
  const fetchPortfolioData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/portfolio/${uid}`);
      const coinData = response.data.find(
        coin => coin.crypto_symbol.toLowerCase() === symbol.toLowerCase()
      );
      
      if (coinData) {
        const qty = parseFloat(coinData.quantity);
        const avgPrice = parseFloat(coinData.average_buy_price);
        setPortfolioData({ 
          quantity: isNaN(qty) ? 0 : qty,
          average_buy_price: isNaN(avgPrice) ? 0 : avgPrice
        });
      } else {
        setPortfolioData({ quantity: 0, average_buy_price: 0 });
      }
    } catch (error) {
      console.error("Error fetching portfolio data:", error.message);
      setPortfolioData({ quantity: 0, average_buy_price: 0 });
    }
  };

  // Handle buy transaction
  const handleBuy = async () => {
    setProcessing(true);
    const qty = Number(quantity);
    
    if (!qty || qty <= 0) {
      toast.error("Please enter a valid quantity");
      setProcessing(false);
      return;
    }

    if (!price) {
      toast.error("Price data not available");
      setProcessing(false);
      return;
    }

    const totalCost = price * qty;
    if (totalCost > walletBalance) {
      toast.error("Insufficient funds");
      setProcessing(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/buy`, {
        user_id: uid,
        coin_symbol: symbol.toUpperCase(),
        quantity: qty,
        price,
      });

      if (response.status === 200) {
        toast.success("Purchase successful!");
        await fetchWalletBalance();
        await fetchPortfolioData();
        setQuantity("");
      }
    } catch (error) {
      console.error("Error processing buy:", error.message);
      toast.error(error.response?.data?.error || "Failed to process buy");
    } finally {
      setProcessing(false);
    }
  };

  // Handle sell transaction
  const handleSell = async () => {
    setProcessing(true);
    const qty = Number(sellQuantity);
    
    if (!qty || qty <= 0) {
      toast.error("Please enter a valid quantity");
      setProcessing(false);
      return;
    }

    if (qty > (portfolioData?.quantity || 0)) {
      toast.error("Not enough coins to sell");
      setProcessing(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/sell`, {
        user_id: uid,
        crypto_symbol: symbol.toUpperCase(),
        quantity: qty,
        price,
      });

      if (response.status === 200) {
        toast.success("Sale successful!");
        await fetchWalletBalance();
        await fetchPortfolioData();
        setShowSellModal(false);
        setSellQuantity("");
      }
    } catch (error) {
      console.error("Error processing sell:", error.message);
      toast.error(error.response?.data?.error || "Failed to process sell");
    } finally {
      setProcessing(false);
    }
  };

  // Calculate profit/loss
  const calculateProfitLoss = () => {
    if (!portfolioData || !price) return { isProfit: false, amount: 0 };
    
    const currentValue = portfolioData.quantity * price;
    const buyValue = portfolioData.quantity * portfolioData.average_buy_price;
    const isProfit = currentValue >= buyValue;
    const amount = Math.abs(currentValue - buyValue);
    
    return { isProfit, amount };
  };

  // Initialize socket and data fetching
  useEffect(() => {
    if (!uid) {
      navigate("/login");
      return;
    }

    const fetchInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchCoinData(),
          fetchWalletBalance(),
          fetchPortfolioData(),
          fetchWatchlistStatus(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // Initialize socket connection
    const socket = io(API_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to WebSocket");
      socket.emit("subscribe", [symbol.toUpperCase()]);
    });

    socket.on("priceUpdate", (data) => {
      if (data?.prices?.[symbol.toUpperCase()]) {
        setPrice(data.prices[symbol.toUpperCase()].usd);
        setPriceChange(data.prices[symbol.toUpperCase()].change);
      }
    });

    // In your socket priceUpdate handler:
socket.on("priceUpdate", (data) => {
  console.log("Received priceUpdate:", data); // Debug log
  if (data.prices && data.prices[symbol.toLowerCase()]) {
    const coinData = data.prices[symbol.toLowerCase()];
    setPrice(coinData.usd);
    setPriceChange(coinData.change); // Make sure this matches your state variable name
    console.log(`Updated ${symbol}: $${coinData.usd}, ${coinData.change}%`);
  }
});

// In your render section, modify the percentage display:
<span className={`text-lg ${priceChange > 0 ? "text-green-600" : "text-red-600"}`}>
  {priceChange !== null && !isNaN(priceChange) 
    ? `${priceChange.toFixed(2)}%` 
    : "N/A"}
</span>

    return () => {
      socket.disconnect();
    };
  }, [symbol, uid, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gray-100 font-[poppins] flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const { isProfit, amount } = calculateProfitLoss();

  return (
    <div className="min-h-screen w-full bg-gray-100 font-[poppins] flex">
      <Sidebar />
      <div className="flex-1 ml-[100px] px-8 py-6 flex flex-col md:flex-row gap-6">
        {/* Left side: Buy/Sell form */}
        <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4 text-center">
            Buy / Sell {symbol.toUpperCase()}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Quantity ({symbol.toUpperCase()}):
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || (!isNaN(value) && Number(value) >= 0)) {
                    setQuantity(value);
                  }
                }}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quantity"
                min="0"
                step="0.00000001"
                disabled={processing}
              />
            </div>

            <div className="flex justify-between text-sm text-gray-600">
              <span>Available: ${walletBalance?.toFixed(2) || "0.00"}</span>
              <span>
                Total: ${quantity && price ? (price * Number(quantity)).toFixed(2) : "0.00"}
              </span>
            </div>

            <button
              onClick={handleBuy}
              disabled={processing || !quantity || Number(quantity) <= 0 || !price}
              className={`w-full py-3 rounded-lg text-white font-medium ${
                processing || !quantity || Number(quantity) <= 0 || !price
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {processing ? "Processing..." : "Buy"}
            </button>

            {portfolioData?.quantity > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Your Holdings</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span>{portfolioData.quantity.toFixed(8)} {symbol.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Buy Price:</span>
                    <span>${portfolioData.average_buy_price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className={isProfit ? "text-green-600" : "text-red-600"}>
                      {isProfit ? "Profit" : "Loss"}:
                    </span>
                    <span className={isProfit ? "text-green-600" : "text-red-600"}>
                      ${amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowSellModal(true)}
                  className="w-full mt-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Sell
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right side: Coin Details */}
        <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <img
              src={coinImage}
              className="w-16 h-16 rounded-full"
              alt={coinName}
            />
            <div>
              <h1 className="text-2xl font-bold">{coinName}</h1>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleToggleWatchlist}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  <FontAwesomeIcon icon={faBookmark} className="mr-2" />
                  {isInWatchlist ? "Remove Watchlist" : "Add Watchlist"}
                </button>
                <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                  <FontAwesomeIcon icon={faHourglassStart} className="mr-2" />
                  Set Alert
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <h2 className="text-4xl font-bold">
              ${price ? price.toFixed(2) : "N/A"}
            </h2>
            <span className={`text-xl ${
              priceChange > 0 ? "text-green-600" : "text-red-600"
            }`}>
              {priceChange ? `${priceChange.toFixed(2)}%` : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Comment section at the bottom */}
      <div className="ml-[100px] px-8 pb-6">
        <CommentSection symbol={symbol} />
      </div>

      {/* Sell Modal */}
      {showSellModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Sell {symbol.toUpperCase()}</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Quantity to Sell:
              </label>
              <input
                type="number"
                value={sellQuantity}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || (!isNaN(value) && Number(value) >= 0)) {
                    setSellQuantity(value);
                  }
                }}
                className="w-full p-3 border rounded-lg"
                placeholder="Enter quantity"
                min="0"
                max={portfolioData?.quantity}
                step="0.00000001"
                disabled={processing}
              />
            </div>

            {sellQuantity && (
              <div className="mb-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Current Price:</span>
                  <span>${price?.toFixed(2) || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Value:</span>
                  <span>${(price * Number(sellQuantity)).toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSellModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSell}
                disabled={processing || !sellQuantity || Number(sellQuantity) <= 0}
                className={`px-4 py-2 text-white rounded-lg ${
                  processing || !sellQuantity || Number(sellQuantity) <= 0
                    ? "bg-gray-400"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {processing ? "Processing..." : "Sell"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster />
    </div>
  );
};

export default StockDetails;

