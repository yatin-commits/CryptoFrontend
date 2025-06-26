// src/ProfitLossChart.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ProfitLossChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch transaction data from the API
    axios.get('https://backendcrypto.onrender.com/api/transactions/1')
      .then(response => {
        const transactions = response.data;
        console.log('Fetched transactions:', transactions); // Debug log to check data

        // Process data for chart
        const chartData = transactions.map(transaction => {
          const profitLoss = parseFloat(transaction.profit_loss);
          const date = new Date(transaction.transaction_time).toLocaleDateString(); // Format date

          // Log the data to check
          console.log('Processing:', { date, profitLoss });

          // Ensure profitLoss and date are valid
          if (!isNaN(profitLoss) && date) {
            return { date, profitLoss };
          }
          return null; // Skip invalid entries
        }).filter(item => item !== null); // Remove null items

        console.log('Chart data:', chartData); // Debug log for processed chart data

        // Check if the chartData has more than 1 entry
        if (chartData.length > 1) {
          setData(chartData);
        } else {
          console.error('Not enough data points for the chart!');
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <div>
      <h2>Portfolio Profit and Loss Over Time</h2>
      {data.length === 0 ? (
        <p>Loading...</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="profitLoss"
              stroke={(entry) => (entry.profitLoss >= 0 ? 'green' : 'red')}
              fillOpacity={0.2}
              fill={(entry) => (entry.profitLoss >= 0 ? 'green' : 'red')}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ProfitLossChart;
