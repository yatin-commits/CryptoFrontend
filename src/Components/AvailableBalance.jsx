import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWallet } from "@fortawesome/free-solid-svg-icons";
import { useUser } from "../../Context/UserContext";

const AvailableBalance = () => {
  const { walletBalance } = useUser();

  return (
    <div className="flex justify-end items-center p-4 font-[poppins]">
      <div className="flex items-center gap-3 border border-indigo-200 rounded-xl px-5 py-3 bg-white shadow-sm hover:shadow-lg transition-all duration-200">
        <FontAwesomeIcon icon={faWallet} className="text-indigo-600 text-xl" />
        <div className="text-gray-800 text-lg font-semibold tracking-wide">
          ${parseFloat(walletBalance || 0).toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default AvailableBalance;
