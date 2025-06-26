import React, { useEffect, useState } from "react";
import axios from "axios";

const Marquee = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const { data } = await axios.get(
          "https://min-api.cryptocompare.com/data/top/mktcapfull",
          {
            params: {
              limit: 15,
              tsym: "USD",
            },
          }
        );

        if (data.Data) {
          const parsedData = data.Data.map((item) => ({
            id: item.CoinInfo.Id,
            name: item.CoinInfo.FullName,
            image: `https://www.cryptocompare.com${item.CoinInfo.ImageUrl}`,
            price: item.RAW?.USD?.PRICE || 0,
            change: item.RAW?.USD?.CHANGEPCT24HOUR || 0,
          }));
          setStocks(parsedData);
        }
      } catch (error) {
        console.error("Error fetching stocks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

  return (
    <div className="relative overflow-hidden h-full mt-6 rounded-md bg-white text-white">
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <p>Loading stocks...</p>
        </div>
      ) : (
        <div className="absolute w-full flex flex-col animate-vertical-scroll">
          {[...stocks, ...stocks].map((stock, index) => (
            <div
              key={`${stock.id}-${index}`}
              className="flex items-center justify-between bg-black text-white rounded-lg p-4 w-11/12 mx-auto mb-2"
            >
              <img
                src={stock.image}
                alt={stock.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="font-bold">
                {stock.name.length > 9 ? stock.name.slice(0, 9) + '...' : stock.name}
              </span>
              <span>${stock.price.toFixed(2)}</span>
              <span
                className={`font-bold ${
                  stock.change >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {stock.change.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marquee;
