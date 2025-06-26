import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Sidebar from "../Components/Sidebar";
import WelcomeMsg from "../Components/WelcomeMsg";
import AvailableBalance from "../Components/AvailableBalance";
import SingleCoin from "../Components/SingleCoin";
import StockSearch from "../Components/StockSearch";
import TabView from "../Components/TabView";
import Marquee from "../Components/Marquee";
import { useUser } from "../../Context/UserContext";
import CoinNews from "../Components/CoinNews";
import CryptoChatBot from "../Components/CryptoChatBot";
import CoinComparison from "../Components/CoinComparison.jsx";
import axios from "axios";

const Home = () => {
  const [prices, setPrices] = useState({});
  const [coinInfo, setCoinInfo] = useState({});
  const [error, setError] = useState("");
  const [comparisonCoins, setComparisonCoins] = useState([]);
  const [wishlistCoins, setWishlistCoins] = useState([]);
  const { uid } = useUser();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const fetchWishlist = async () => {
    try {
      const response = await axios.get(`https://backendcrypto.onrender.com/api/wishlist/${uid}`);
      const coins = response.data.slice(0, 4);
      setWishlistCoins(coins);

      const symbols = coins.map(coin => coin.symbol.toUpperCase());
      if (symbols.length > 0) {
        fetchCoinInfo(symbols);
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setError("Error loading wishlist coins.");
    }
  };

  const fetchCoinInfo = async (symbols) => {
    try {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/coins/markets",
        {
          params: {
            vs_currency: "usd",
            per_page: 250,
            page: 1,
          },
        }
      );

      const coinData = response.data.reduce((acc, coin) => {
        const symbol = coin.symbol.toUpperCase();
        if (symbols.includes(symbol)) {
          acc[symbol] = {
            name: coin.name,
            image: coin.image,
          };
        }
        return acc;
      }, {});

      setCoinInfo(coinData);
    } catch (err) {
      try {
        const response = await axios.get("https://min-api.cryptocompare.com/data/all/coinlist");
        const fallbackData = response.data.Data;

        const fallbackCoinInfo = {};
        symbols.forEach(symbol => {
          const upper = symbol.toUpperCase();
          fallbackCoinInfo[upper] = fallbackData[upper]
            ? {
                name: fallbackData[upper].FullName,
                image: `https://www.cryptocompare.com${fallbackData[upper].ImageUrl}`,
              }
            : {
                name: upper,
                image: "https://via.placeholder.com/32",
              };
        });

        setCoinInfo(fallbackCoinInfo);
      } catch (error) {
        console.error("Fallback failed:", error);
        setError("Error loading coin details.");
      }
    }
  };

  useEffect(() => {
    if (uid) {
      fetchWishlist();
    }
  }, [uid]);

  useEffect(() => {
    if (wishlistCoins.length === 0) return;

    const socket = io("https://backendcrypto.onrender.com/", {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    const handlePriceUpdate = (data) => {
      if (data?.prices) {
        const filteredPrices = {};
        const wishlistSymbols = wishlistCoins.map(c => c.symbol.toUpperCase());

        Object.keys(data.prices).forEach(symbol => {
          const up = symbol.toUpperCase();
          if (wishlistSymbols.includes(up) && data.prices[symbol]?.usd) {
            filteredPrices[up] = {
              usd: data.prices[symbol].usd,
              change: data.prices[symbol].change || 0,
            };
          }
        });

        if (Object.keys(filteredPrices).length > 0) {
          setPrices(prev => ({ ...prev, ...filteredPrices }));
        }
      }
    };

    socket.on("connect", () => {
      const symbols = wishlistCoins.map(c => c.symbol.toUpperCase());
      socket.emit("subscribe", symbols);
    });

    socket.on("priceUpdate", handlePriceUpdate);
    socket.on("error", err => setError(`WebSocket error: ${err.message}`));

    return () => {
      if (socketRef.current) {
        const symbols = wishlistCoins.map(c => c.symbol.toUpperCase());
        socketRef.current.emit("unsubscribe", symbols);
        socketRef.current.disconnect();
      }
    };
  }, [wishlistCoins]);

  const handleCoinAdded = () => {
    fetchWishlist();
  };

  return (
    <>
      <Sidebar />
      <div className="ml-10 w-full bg-gradient-to-br from-slate-50 to-blue-100 min-h-screen p-6">
        {/* Welcome and Balance Section */}
        <div className="flex flex-wrap justify-between items-center mb-6">
          <WelcomeMsg />
          <AvailableBalance />
        </div>

        {/* Wishlist Coins */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">📌 Your Watchlist</h2>
          {wishlistCoins.length === 0 ? (
            <p className="text-gray-500 text-center">No coins in your wishlist. Add some below!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {wishlistCoins.map((coin) => {
                const symbol = coin.symbol.toUpperCase();
                const coinData = prices[symbol] || {};
                return (
                  <SingleCoin
                    key={symbol}
                    title={coinInfo[symbol]?.name || coin.coin_name || symbol}
                    price={coinData.usd ? `$${parseFloat(coinData.usd).toFixed(2)}` : "Loading..."}
                    change={coinData.change !== undefined ? parseFloat(coinData.change).toFixed(2) : 0}
                    url={coinInfo[symbol]?.image || "https://via.placeholder.com/32"}
                    onClick={() => navigate(`/stock/${symbol}`)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Stock Search + Tabs + Marquee */}
        <div className="flex flex-col lg:flex-row gap-6 mb-10">
          <div className="flex-1">
            <StockSearch onCoinAdded={handleCoinAdded} />
          </div>
          <div className="flex-1">
            <TabView />
          </div>
          <div className="flex-1">
            <Marquee />
          </div>
        </div>

        {/* Coin Comparison */}
        <div className="mb-10">
          <CoinComparison coins={comparisonCoins} coinData={prices} />
        </div>

        {/* News & Chatbot */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
          <CoinNews />
          <CryptoChatBot />
        </div>

        {error && <div className="text-red-600 text-center font-semibold">{error}</div>}
      </div>
    </>
  );
};

export default Home;
