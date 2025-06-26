import React from "react";
import Sidebar from "../Components/Sidebar";
import Footer from "../Components/Footer";

const traders = [
  { name: "Alice", dayProfit: 5000, weekProfit: 15000, monthProfit: 50000 },
  { name: "Bob", dayProfit: 3000, weekProfit: 12000, monthProfit: 45000 },
  { name: "Charlie", dayProfit: 2000, weekProfit: 9000, monthProfit: 40000 },
  { name: "David", dayProfit: 7000, weekProfit: 20000, monthProfit: 60000 },
  { name: "Eve", dayProfit: 8000, weekProfit: 25000, monthProfit: 70000 },
  { name: "Frank", dayProfit: 10000, weekProfit: 30000, monthProfit: 80000 },
  { name: "George", dayProfit: 6000, weekProfit: 18000, monthProfit: 55000 },
  { name: "Hank", dayProfit: 7500, weekProfit: 22000, monthProfit: 65000 },
];

const getSortedLeaderboard = (data, timePeriod) => {
  return [...data]
    .sort((a, b) => b[timePeriod] - a[timePeriod])
    .map((entry, index) => ({ rank: index + 1, name: entry.name, profit: entry[timePeriod] }));
};

const sortedDay = getSortedLeaderboard(traders, "dayProfit");
const sortedWeek = getSortedLeaderboard(traders, "weekProfit");
const sortedMonth = getSortedLeaderboard(traders, "monthProfit");

const finalLeaderboard = sortedDay.map((entry, index) => ({
  rank: index + 1,
  day: sortedDay[index],
  week: sortedWeek[index],
  month: sortedMonth[index],
}));

const Leaderboard = () => {
  return (
    <div className="flex w-full h-full bg-gradient-to-br from-gray-900 to-black text-white min-h-screen">
      <Sidebar />
      <div className="p-8 w-full flex flex-col items-center">
        <h1 className="text-5xl font-extrabold text-center text-gray-200 mb-12 tracking-wide uppercase bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-white">
          📈 Crypto Trading Leaderboard
        </h1>

        <div className="w-full max-w-6xl bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-gray-700 overflow-hidden">
          <table className="w-full border-collapse text-lg text-gray-200">
            <thead>
              <tr className="bg-gray-800 text-gray-200 text-xl">
                <th className="p-4 text-center">🏆 Rank</th>
                <th className="p-4 text-center">24H Top Trader</th>
                <th className="p-4 text-center">1W Top Trader</th>
                <th className="p-4 text-center">1M Top Trader</th>
              </tr>
            </thead>
            <tbody>
              {finalLeaderboard.map((entry) => (
                <tr
                  key={entry.rank}
                  className="border-t border-gray-600 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0px_0px_15px_3px_rgba(255,255,255,0.2)] rounded-xl bg-gray-800/40 hover:bg-gray-700/60"
                >
                  <td className="p-5 font-bold text-center">
                    <span className={`px-4 py-2 rounded-full text-black font-bold shadow-lg ${
                      entry.rank === 1 ? "bg-yellow-400 shadow-yellow-500/50" :
                      entry.rank === 2 ? "bg-gray-300 shadow-gray-400/50" :
                      entry.rank === 3 ? "bg-orange-400 shadow-orange-500/50" : "bg-gray-700 text-gray-200"
                    }`}>
                      {entry.rank}
                    </span>
                  </td>
                  <td className="p-5 text-green-400 font-semibold text-center">
                    <span className="text-xl">{entry.day.name}</span>
                    <span className="block text-gray-400 text-sm">(${entry.day.profit})</span>
                  </td>
                  <td className="p-5 text-blue-400 font-semibold text-center">
                    <span className="text-xl">{entry.week.name}</span>
                    <span className="block text-gray-400 text-sm">(${entry.week.profit})</span>
                  </td>
                  <td className="p-5 text-purple-400 font-semibold text-center">
                    <span className="text-xl">{entry.month.name}</span>
                    <span className="block text-gray-400 text-sm">(${entry.month.profit})</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
