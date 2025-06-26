import React from "react";

const CoinComparison = ({ coins, coinData }) => {
  if (!coins?.length || !coinData) {
    return null;
  }

  const hasData = coins.some((coin) => coinData[coin.toLowerCase()]?.usd);

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg m-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">
        🔍 Coin Comparison
      </h2>

      {!hasData ? (
        <p className="text-gray-500">Loading data for {coins.join(", ")}...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border border-gray-200 rounded-lg">
            <thead className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              <tr>
                <th className="p-3">Coin</th>
                <th className="p-3">Price (USD)</th>
                <th className="p-3">24h Change</th>
                <th className="p-3">Market Cap</th>
              </tr>
            </thead>
            <tbody>
              {coins.map((coin, index) => {
                const data = coinData[coin.toLowerCase()];
                const isPositive = data?.change >= 0;
                return (
                  <tr
                    key={coin}
                    className={`${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-gray-100 transition`}
                  >
                    <td className="p-3 font-medium text-gray-700">{coin.toUpperCase()}</td>
                    <td className="p-3 text-green-600 font-semibold">
                      {data?.usd ? `$${data.usd.toFixed(2)}` : "N/A"}
                    </td>
                    <td
                      className={`p-3 font-semibold ${
                        isPositive ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {data?.change !== undefined
                        ? `${isPositive ? "🚀" : "📉"} ${data.change.toFixed(2)}%`
                        : "N/A"}
                    </td>
                    <td className="p-3 text-gray-600">
                      {data?.marketCap
                        ? `$${data.marketCap.toLocaleString()}`
                        : "N/A"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CoinComparison;
