import React, { useState, useEffect } from "react";
import { TabView, TabPanel } from "primereact/tabview";

import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css";
import "./TabView.css"; // Custom styles
import TopGain from "./TopGain";
import TopLossers from "./TopLossers";

export default function TablView() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://min-api.cryptocompare.com/data/top/mktcapfull?limit=30&tsym=USD"
        );
        const { Data } = await response.json();

        if (Data && Array.isArray(Data)) {
          const parsed = Data.map((item) => ({
            id: item.CoinInfo.Id,
            name: item.CoinInfo.FullName,
            price: item.RAW?.USD?.PRICE || 0,
            change: item.RAW?.USD?.CHANGEPCT24HOUR || 0,
          }));

          const sorted = [...parsed].sort((a, b) => b.change - a.change);

          setTopGainers(sorted.slice(0, 4));
          setTopLosers(sorted.slice(-4).reverse());
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card mt-4 w-fit">
      <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
        <TabPanel header="Top Gainers">
          <div className="flex flex-row flex-wrap w-fit justify-start">
            {topGainers.map((coin) => (
              <TopGain
                key={coin.id}
                name={coin.name.length > 9 ? coin.name.slice(0, 9) + "..." : coin.name}
                price={coin.price}
                change={coin.change}
              />
            ))}
          </div>
        </TabPanel>
        <TabPanel header="Top Losers">
          <div className="flex flex-row flex-wrap w-fit justify-start">
            {topLosers.map((coin) => (
              <TopLossers
                key={coin.id}
                name={coin.name.length > 9 ? coin.name.slice(0, 9) + "..." : coin.name}
                price={coin.price}
                change={coin.change}
              />
            ))}
          </div>
        </TabPanel>
      </TabView>
    </div>
  );
}
