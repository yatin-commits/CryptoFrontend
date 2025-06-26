import React, { useState, useEffect } from "react";
import axios from "axios";

function Temp() {
  const [coins, setCoins] = useState([]); // All fetched coins
  const [searchTerm, setSearchTerm] = useState(""); // Search input
  const [filteredCoins, setFilteredCoins] = useState([]); // Filtered results

  // Fetch data from CoinGecko on component mount
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const { data } = await axios.get(
          "https://api.coingecko.com/api/v3/coins/markets",
          {
            params: {
              vs_currency: "usd",
              order: "market_cap_desc",
              per_page: 250,
              page: 1,
            },
          }
        );
        setCoins(data); // Save all coins
        setFilteredCoins(data); // Default filtered list
      } catch (error) {
        console.error("Error fetching coins:", error.message);
      }
    };

    fetchCoins();
  }, []);

  // Filter coins based on search term
  useEffect(() => {
    const results = coins.filter((coin) =>
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCoins(results);
  }, [searchTerm, coins]);

  return (
    <div>
      <h1>Crypto Search</h1>
      <input
        type="text"
        placeholder="Search for a cryptocurrency..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ padding: "8px", width: "300px" }}
      />

      <div style={{ marginTop: "20px" }}>
        {filteredCoins.map((coin) => (
          <div key={coin.id} style={{ marginBottom: "10px" }}>
            <img
              src={coin.image}
              alt={coin.name}
              width="20"
              style={{ marginRight: "10px" }}
            />
            {coin.name} ({coin.symbol.toUpperCase()}) - ${coin.current_price}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Temp;
