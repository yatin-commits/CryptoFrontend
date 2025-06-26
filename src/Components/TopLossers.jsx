import React from "react";

const TopLossers = ({ name, price, change }) => {
  return (
    <div className="w-[40%] h-[40%] m-2 p-4 bg-red-700 rounded-md flex flex-col justify-between items-center">
      <h1 className="text-white font-[poppins] text-lg text-center truncate w-full">
        {name}
      </h1>
      <p className="text-white text-center"> ${price.toFixed(2)}</p>
      <p
        className={`text-center font-bold ${
          change > 0 ? "text-green-400" : "text-red-400"
        }`}
      >
        {change.toFixed(2)}%
      </p>
    </div>
  );
};

export default TopLossers;
