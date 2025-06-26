import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareArrowUpRight, faStar } from '@fortawesome/free-solid-svg-icons';
import { useUser } from '../../Context/UserContext';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const { uid } = useUser();
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get(`https://backendcrypto.onrender.com/api/wishlist/${uid}`)
      .then((response) => {
        if (response.data.length > 0) {
          setWishlist(response.data);
        }
      })
      .catch(() => setError('Error fetching wishlist.'));
  }, [uid]);

  return (
    <div className="min-h-screen flex justify-center items-start bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 px-4 py-12 overflow-hidden">
      <div className="w-full max-w-3xl bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-indigo-200/50 transform transition-all duration-500 hover:scale-[1.02]">
        <div className="relative">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 text-center mb-10 animate-pulse-slow">
            ⭐ Your Wishlist
          </h1>
          <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-indigo-300 to-purple-300 rounded-full opacity-30 blur-md animate-pulse"></div>
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-br from-purple-300 to-indigo-300 rounded-full opacity-20 blur-lg"></div>
        </div>

        {error ? (
          <p className="text-center text-red-400 text-xl font-medium bg-red-100/50 p-4 rounded-xl shadow-inner animate-shake">
            {error}
          </p>
        ) : wishlist.length > 0 ? (
          <ul className="space-y-6">
            {wishlist.map((coin, index) => (
              <Link to={`/stock/${coin.symbol}`} key={index}>
                <li className="bg-gradient-to-br from-white/80 to-indigo-50/80 backdrop-blur-sm border border-indigo-200/30 rounded-2xl p-6 flex justify-between items-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 transform hover:rotate-1">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {coin.coin_name}
                    </h3>
                    <p className="text-lg text-gray-600 font-medium">{coin.symbol.toUpperCase()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xl animate-pulse-slow" />
                    <FontAwesomeIcon icon={faSquareArrowUpRight} className="text-indigo-500 text-2xl hover:text-purple-500 transition-colors duration-300" />
                  </div>
                </li>
              </Link>
            ))}
          </ul>
        ) : (
          <div className="text-center bg-indigo-50/50 p-6 rounded-2xl shadow-inner animate-fade-in">
            <p className="text-lg text-gray-500 font-semibold italic">
              No coins in your wishlist yet. Start exploring!
            </p>
            <Link to="/home" className="mt-4 inline-block text-indigo-600 font-bold hover:text-purple-600 underline transition-colors duration-300">
              Go to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;