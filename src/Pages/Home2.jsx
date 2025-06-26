// src/Home.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";

import Sidebar from "../Components/Sidebar";
import WelcomeMsg from "../Components/WelcomeMsg";
import AvailableBalance from "../Components/AvailableBalance";
import SingleCoin from "../Components/SingleCoin";
import StockSearch from "../Components/StockSearch";
import TabView from "../Components/TabView";
import Marquee from "../Components/Marquee";
import CoinNews from "../Components/CoinNews";
import Wishlist from "../Components/Wishlist";
import CryptoChatBot from "../Components/CryptoChatBot";
import CoinComparison from "../Components/CoinComparison";
import { useUser } from "../../Context/UserContext";

const Home = () => {
  const [prices, setPrices] = useState({});
  const [coinInfo, setCoinInfo] = useState({});
  const [error, setError] = useState("");
  const [comparisonCoins, setComparisonCoins] = useState([]);
  const [wishlistCoins, setWishlistCoins] = useState([]);
  const { uid } = useUser();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  // Fetch wishlist coins
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await axios.get(`https://backendcrypto.onrender.com/api/wishlist/${uid}`);
        const coins = response.data.slice(0, 4);
        setWishlistCoins(coins);
      } catch (err) {
        console.error("Error fetching wishlist:", err);
        setError("Error loading wishlist coins.");
      }
    };
    if (uid) fetchWishlist();
  }, [uid]);

  // Fetch coin info
  useEffect(() => {
    const fetchCoinInfo = async () => {
      if (!wishlistCoins.length) return;
      try {
        const symbols = wishlistCoins.map((coin) => coin.symbol.toLowerCase());
        const response = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
          params: {
            vs_currency: "usd",
            ids: "",
            per_page: 250,
            page: 1,
          },
        });
        const data = response.data.reduce((acc, coin) => {
          if (symbols.includes(coin.symbol.toLowerCase())) {
            acc[coin.symbol.toUpperCase()] = {
              name: coin.name,
              image: coin.image,
            };
          }
          return acc;
        }, {});
        setCoinInfo(data);
      } catch (err) {
        console.error("Error fetching CoinGecko data:", err);
        setError("Error loading coin details.");
      }
    };
    fetchCoinInfo();
  }, [wishlistCoins]);

  // WebSocket for live prices
  useEffect(() => {
    socketRef.current = io("https://backendcrypto.onrender.com", {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on("connect", () => {
      const coinSymbols = wishlistCoins.map((coin) => coin.symbol);
      socketRef.current.emit("subscribe", coinSymbols);
    });

    socketRef.current.on("priceUpdate", (data) => {
      try {
        if (data.prices) {
          setPrices((prev) => ({ ...prev, ...data.prices }));
        }
      } catch (err) {
        console.error("Error processing price update:", err);
        setError("Error receiving price data.");
      }
    });

    socketRef.current.on("error", (error) => {
      console.error("Socket error:", error.message);
      setError(error.message);
    });

    socketRef.current.on("disconnect", () => {
      console.log("Socket.IO disconnected");
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [wishlistCoins]);

  return (
    <div className="flex">
      <Sidebar />

      <div className="ml-16 w-full min-h-screen p-4 bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <WelcomeMsg />
          <AvailableBalance />
        </div>

        {/* Wishlist Coins */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-2">Your Wishlist</h2>
          <div className="flex flex-wrap gap-4">
            {wishlistCoins.length === 0 ? (
              <p className="text-gray-500">No coins in wishlist. Use Stock Search to add.</p>
            ) : (
              wishlistCoins.map((coin) => (
                <SingleCoin
                  key={coin.symbol}
                  title={coinInfo[coin.symbol]?.name || coin.coin_name}
                  price={
                    prices[coin.symbol]?.usd
                      ? `$${parseFloat(prices[coin.symbol].usd).toFixed(2)}`
                      : "Loading..."
                  }
                  change={
                    prices[coin.symbol]?.change
                      ? parseFloat(prices[coin.symbol].change).toFixed(2)
                      : "0.00"
                  }
                  url={coinInfo[coin.symbol]?.image || "https://via.placeholder.com/32"}
                  onClick={() => navigate(`/stock/${coin.symbol}`)}
                />
              ))
            )}
          </div>
        </section>

        {/* Tools & Tickers */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="col-span-1">
            <StockSearch />
          </div>
          <div className="col-span-1">
            <TabView />
          </div>
          <div className="col-span-1">
            <Marquee />
          </div>
        </section>

        {/* Coin Comparison */}
        <section className="mb-6">
          <CoinComparison coins={comparisonCoins} coinData={prices} />
        </section>

        {/* News & ChatBot */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="col-span-2">
            <CoinNews />
          </div>
          <div className="col-span-1">
            <CryptoChatBot />
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <div className="text-red-600 text-center mt-4 font-medium">{error}</div>
        )}
      </div>
    </div>
  );
};

export default Home;
