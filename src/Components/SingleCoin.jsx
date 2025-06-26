import React from "react";

const SingleCoin = ({ title, price, change, url, onClick }) => {
  const displayPrice =
    price && price !== "Loading..." ? price : "Loading...";

  const displayChange =
    change !== undefined
      ? `${parseFloat(change) > 0 ? "+" : ""}${parseFloat(change).toFixed(2)}%`
      : "0.00%";

  return (
    <div
      className="w-40 h-40 m-2 p-4 bg-[#F2F5F6] border-[2px] rounded-md flex flex-col justify-between items-center cursor-pointer"
      onClick={onClick}
    >
     <img
  src={url || "https://via.placeholder.com/32"}
  alt={title}
  className="w-12 h-12 mb-2 object-contain bg-white rounded-full"
/>

      <h1 className="font-bold text-lg text-black text-center truncate">{title}</h1>
      <p className="text-center">{displayPrice}</p>
      <p
        className={`text-center font-bold ${
          parseFloat(change) > 0
            ? "text-green-400"
            : parseFloat(change) < 0
            ? "text-red-400"
            : "text-gray-400"
        }`}
      >
        {displayChange}
      </p>
    </div>
  );
};

export default SingleCoin;
