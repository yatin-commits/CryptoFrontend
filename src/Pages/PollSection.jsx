import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../../Context/UserContext";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

const PollSection = () => {
  const { uid } = useUser();
  const { symbol } = useParams();
  const [pollData, setPollData] = useState({
    buy: 0,
    sell: 0,
    hold: 0,
    totalVotes: 0,
    userVote: null,
  });

  // Fetch Poll Data
  const fetchPollData = async () => {
    try {
      const response = await axios.get(`https://backendcrypto.onrender.com/poll/${symbol}`);
      setPollData(response.data);
    } catch (error) {
      console.error("Error fetching poll data:", error);
    }
  };

  // Submit Vote
  const handleVote = async (vote) => {
    if (pollData.userVote) {
      toast.error("You have already voted.");
      return;
    }

    try {
      const response = await axios.post(`https://backendcrypto.onrender.com/api/poll/${symbol}`, {
        user_id: uid,
        vote,
      });

      if (response.status === 201) {
        toast.success("Your vote has been recorded!");
        fetchPollData(); // Refresh the poll data
      }
    } catch (error) {
      console.error("Error submitting vote:", error);
      toast.error("Failed to submit vote.");
    }
  };

  // Calculate Percentage
  const calculatePercentage = (count) => {
    return pollData.totalVotes > 0 ? ((count / pollData.totalVotes) * 100).toFixed(1) : 0;
  };

  useEffect(() => {
    fetchPollData();
  }, [symbol]);

  return (
    <div className="bg-white p-3 shadow-lg rounded-lg mb-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Market Sentiment Poll</h3>

      <div className="space-y-4">
        <button
          onClick={() => handleVote("buy")}
          className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300"
          disabled={pollData.userVote}
        >
          Buy ({calculatePercentage(pollData.buy)}%)
        </button>

        <button
          onClick={() => handleVote("sell")}
          className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300"
          disabled={pollData.userVote}
        >
          Sell ({calculatePercentage(pollData.sell)}%)
        </button>

        <button
          onClick={() => handleVote("hold")}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
          disabled={pollData.userVote}
        >
          Hold ({calculatePercentage(pollData.hold)}%)
        </button>
      </div>

      <p className="text-gray-600 mt-4">
        Total Votes: <span className="font-bold">{pollData.totalVotes}</span>
      </p>
    </div>
  );
};

export default PollSection;
