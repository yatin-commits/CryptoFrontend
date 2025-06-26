import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(
          `https://newsapi.org/v2/top-headlines?q=crypto&apiKey=e577fe77ce0743949caa84c1628415d8`
        );
        const data = await response.json();

        if (data.articles) {
          setNews(data.articles.slice(0, 10)); // Limit to 10 articles
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching news:", error);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <>
      <Sidebar />
      <div className="ml-12">
        <div className="flex flex-col w-screen items-center bg-gradient-to-b from-gray-800 to-black min-h-screen p-6">
          <div className="text-white text-3xl font-bold mb-6">Crypto News</div>

          {loading ? (
            <p className="text-white text-lg">Loading news...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((article, index) => (
                <div
                  key={index}
                  className="bg-gray-900 text-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {article.urlToImage ? (
                    <img
                      src={article.urlToImage}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
                      <p className="text-gray-400">No Image Available</p>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2 truncate">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">
                      {article.description
                        ? article.description.slice(0, 100) + "..."
                        : "No description available."}
                    </p>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      Read more
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default News;
