import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import Sidebar from "../Components/Sidebar";
import AvailableBalance from "../Components/AvailableBalance";
import { useUser } from "../../Context/UserContext";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const socket = io("https://backendcrypto.onrender.com", {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

const Account = () => {
  const { email, walletBalance, setWalletBalance, uid } = useUser();
  const [transactions, setTransactions] = useState([]);

  const fetchWalletBalance = async () => {
    try {
      const response = await axios.get(`https://backendcrypto.onrender.com/api/wallet/${uid}`);
      setWalletBalance(response.data.wallet_balance);
    } catch (error) {
      console.error("Error fetching wallet balance:", error.response?.data || error.message);
      toast.error("Failed to fetch wallet balance.");
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`https://backendcrypto.onrender.com/api/transactions/${uid}`);
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error.response?.data || error.message);
      toast("No Transactions Found!", { icon: "📉" });
    }
  };

  useEffect(() => {
    fetchWalletBalance();
    fetchTransactions();

    socket.on("walletUpdate", (data) => {
      if (data.user_id === uid) {
        setWalletBalance(data.newBalance);
      }
    });

    socket.on("connect", () => {
      // console.log("Socket.IO connected");
    });

    socket.on("error", (error) => {
      console.error("Socket.IO error:", error.message);
      toast.error(error.message);
    });

    return () => {
      socket.off("walletUpdate");
      socket.off("connect");
      socket.off("error");
    };
  }, [uid, setWalletBalance]);

  return (
    <>
      <Sidebar />
      <Toaster />
      <div className="flex flex-col w-screen items-center bg-gradient-to-b min-h-screen p-6">
        {/* Account Overview */}
        <div className="flex font-[poppins] bg-blue-700 text-white rounded-xl shadow-md p-6 mt-2 w-full max-w-4xl">
          <div className="w-full">
            <h1 className="text-3xl">Account Overview</h1>
            <h1 className="font-mono">{email || "Error fetching email!"}</h1>
          </div>
          <div className="flex flex-col items-center">
            <AvailableBalance />
            <div className="flex flex-col items-center text-center mt-6 bg-white text-black p-4 rounded-md">
              <h2 className="text-lg font-semibold">Need more money to trade?</h2>
              <p className="text-sm mt-2 mb-3">
                Participate in quizzes to learn and earn virtual currency. The more you learn, the more you earn!
              </p>
              <a
                href="/learn"
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-md font-medium transition"
              >
                Go to Quizzes
              </a>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="max-w-3xl w-full bg-blue-700 text-white rounded-xl shadow-md p-6 mt-6">
          <h2 className="text-3xl font-bold text-center">Recent Transactions</h2>
          <div className="mt-6 grid grid-cols-1 gap-4">
            {transactions.length === 0 ? (
              <p className="text-center text-gray-300">No transactions found.</p>
            ) : (
              transactions.map((transaction) => {
                const transactionDate = new Date(transaction.transaction_time);
                const formattedDate = transactionDate.toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });
                const formattedTime = transactionDate.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const formattedAmount = parseFloat(transaction.quantity).toFixed(2);
                const formattedPrice = (transaction.quantity * transaction.price).toFixed(2);

                return (
                  <div
                    key={transaction.id}
                    className={`flex items-center justify-between bg-blue-900 rounded-lg p-3 shadow-md text-sm ${
                      transaction.transaction_type.toLowerCase() === "buy"
                        ? "border-l-4 border-green-500"
                        : "border-l-4 border-red-500"
                    }`}
                  >
                    <div>
                      <h3 className="font-bold capitalize">{transaction.transaction_type}</h3>
                      <p>Coin: {transaction.coin_symbol}</p>
                      <p>Amount: {formattedAmount}</p>
                      <p>Price: ${formattedPrice}</p>
                    </div>
                    <div className="text-xs font-light text-right">
                      <p>{formattedDate}</p>
                      <p>{formattedTime}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Account;
