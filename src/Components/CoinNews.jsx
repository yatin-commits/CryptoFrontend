import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CoinNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = 'https://backendcrypto.onrender.com'; // Your backend URL

  useEffect(() => {
    const fetchNews = async () => {
      // Get selected coins from localStorage
      let storedCoins = [];
      try {
        const storedData = localStorage.getItem('selectedCoins');
        storedCoins = storedData ? JSON.parse(storedData) : [];
      } catch (err) {
        console.error('Error parsing selectedCoins:', err);
        setError('Invalid coin data in local storage.');
        return;
      }

      if (!storedCoins || storedCoins.length === 0) {
        setError('No selected coins found. Please select some coins to view news.');
        return;
      }

      setLoading(true);
      try {
        // Prepare coin symbols for the query
        const coinSymbols = storedCoins.map((coin) => coin.symbol).join(' OR ');

        // Call your backend proxy instead of News API directly
        const response = await axios.get(`${API_BASE_URL}/api/news`, {
          params: {
            q: coinSymbols, // Pass coin symbols as query
          },
        });

        if (response.data.articles && response.data.articles.length > 0) {
          setNews(response.data.articles); // Set fetched news
        } else {
          setError('No news available for your selected coins.');
        }
      } catch (err) {
        console.error('Error fetching news:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        setError(
          err.response?.data?.message ||
            'Error fetching news. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Utility function to ensure content is a string
  const safeString = (content) => {
    return typeof content === 'string' ? content : 'No valid content available';
  };

  // Function to format the date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'No date available';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Invalid date';
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    };
    return date.toLocaleString('en-US', options);
  };

  return (
    <div className="p-6 m-6 bg-gradient-to-r w-full from-blue-50 to-blue-100 rounded-xl shadow-lg">
      <div className="flex justify-center items-center mb-2">
        <span className="text-2xl font-semibold font-[poppins] align-middle items-center">
          Your Feed
        </span>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 h-fit overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="spinner-border inline-block w-12 h-12" role="status">
              <span className="text-4xl">⌛</span>
            </div>
          </div>
        ) : error ? (
          <p className="text-red-500 font-semibold text-center">{error}</p>
        ) : news.length > 0 ? (
          <ul>
            {news.map((item, index) => (
              <li
                key={index}
                className="mb-6 p-4 rounded-lg shadow-sm hover:bg-gray-100 transition ease-in-out duration-300"
              >
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                >
                  <h3 className="font-semibold text-xl mb-2">
                    {safeString(item.title)}
                  </h3>
                  <p className="text-gray-800 w-fit rounded-md text-sm mb-3 shadow-md hover:bg-gray-300 transition duration-200">
                    {safeString(item.source.name)}
                  </p>
                  {item.publishedAt && (
                    <p className="text-sm text-gray-600 mt-1">
                      <strong className="text-gray-800">Published At:</strong>{' '}
                      {formatDate(item.publishedAt)}
                    </p>
                  )}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-600">
            No news available for your selected coins.
          </p>
        )}
      </div>
    </div>
  );
};

export default CoinNews;