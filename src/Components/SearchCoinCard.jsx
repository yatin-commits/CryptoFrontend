import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareArrowUpRight } from '@fortawesome/free-solid-svg-icons';

export const SearchCoinCard = (props) => {
  const { title, url, symbol } = props;

  return (
    <div className="flex flex-row text-white p-2 font-[poppins] bg-blue-900 rounded-lg mt-2  justify-between cursor-pointer">
      <div className="flex items-center space-x-3">
        <img src={url} className="w-[30px] h-[30px] rounded-full" alt={`${title} logo`} />
        <div>
          <h1 className="text-lg w-[120px]">{title}</h1>
          <p className="text-sm text-gray-300">{symbol}</p>
        </div>
      </div>
      <div className="flex items-center ml-4">
        <FontAwesomeIcon icon={faSquareArrowUpRight} className="text-white" />
      </div>
    </div>
  );
};
