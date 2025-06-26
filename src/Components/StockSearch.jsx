import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchCoinCard } from './SearchCoinCard';
import axios from 'axios';

const StockSearch = () => {
  const [keyword, setKeyword] = useState('');
  const [coins, setCoins] = useState([]);
  const [filteredCoins, setFilteredCoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const api = `https://min-api.cryptocompare.com/data/top/mktcapfull?limit=50&tsym=USD`;

  useEffect(() => {
    const fetchCoins = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(api);
        if (data.Data) {
          const parsedCoins = data.Data.map((coin) => ({
            id: coin.CoinInfo.Id,
            name: coin.CoinInfo.FullName,
            symbol: coin.CoinInfo.Name,
            price: coin.RAW?.USD?.PRICE || 0,
            rate: coin.RAW?.USD?.CHANGEPCT24HOUR || 0,
            image: `https://www.cryptocompare.com${coin.CoinInfo.ImageUrl}`,
          }));
          setCoins(parsedCoins);
          setFilteredCoins(parsedCoins.slice(0, 3));
          setError('');
        } else {
          setError('No data received');
        }
      } catch (err) {
        console.error('Error fetching coins:', err);
        setError('Error fetching coins. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
  }, []);

  useEffect(() => {
    if (keyword.trim() === '') {
      setFilteredCoins(coins.slice(0, 5));
    } else {
      const filtered = coins.filter((coin) =>
        coin.name.toLowerCase().includes(keyword.toLowerCase())
      );
      setFilteredCoins(filtered);
    }
  }, [keyword, coins]);

  const addCoinToLocalStorage = (coin) => {
    const storedCoins = JSON.parse(localStorage.getItem('selectedCoins')) || [];
    const alreadyExists = storedCoins.some((item) => item.symbol === coin.symbol);
    if (alreadyExists) return;

    storedCoins.push({ symbol: coin.symbol });

    if (storedCoins.length > 5) {
      storedCoins.shift();
    }

    localStorage.setItem('selectedCoins', JSON.stringify(storedCoins));
  };

  return (
    <div className="p-4 m-4 max-w-md">
      <div className="bg-white rounded-lg shadow-md p-2 h-fit overflow-hidden">
        <input
          type="text"
          placeholder="Search for coins..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full bg-transparent border border-gray-300 rounded-md p-2 text-lg focus:outline-none focus:ring-0 focus:border-gray-300"
        />

        <div className="mt-4">
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : filteredCoins.length > 0 ? (
            filteredCoins.map((coin) => (
              <Link to={`/stock/${coin.symbol}`} key={coin.id}>
                <div onClick={() => addCoinToLocalStorage(coin)}>
                  <SearchCoinCard
                    title={coin.name.length > 9 ? coin.name.slice(0, 9) + '...' : coin.name}
                    price={coin.price.toFixed(2)}
                    rate={coin.rate?.toFixed(2) || '0.00'}
                    url={coin.image}
                  />
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-500">No coins match your search.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockSearch;
