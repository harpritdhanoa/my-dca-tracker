import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_KEY = process.env.REACT_APP_FMP_API_KEY; // Environment Variable for API Key

const defaultStocks = [
  { name: "Apple", ticker: "AAPL", target: 44000, invested: 8800, trend: "Falling" },
  { name: "Johnson & Johnson", ticker: "JNJ", target: 44000, invested: 15000, trend: "Rising" },
];

function DCAInvestmentTracker() {
  const [stocks, setStocks] = useState(defaultStocks);
  const [newStock, setNewStock] = useState({ name: "", ticker: "", target: "", invested: "", trend: "" });
  const [livePrices, setLivePrices] = useState({});

  useEffect(() => {
    const fetchStockPrices = async () => {
      const tickers = stocks.map(stock => stock.ticker).join(",");
      try {
        const response = await axios.get(`https://financialmodelingprep.com/api/v3/quote/${tickers}?apikey=${API_KEY}`);
        const prices = response.data.reduce((acc, stock) => {
          acc[stock.symbol] = stock.price;
          return acc;
        }, {});
        setLivePrices(prices);
      } catch (error) {
        console.error("Error fetching stock prices:", error);
      }
    };
    fetchStockPrices();
  }, [stocks]);

  const calculateProgress = (invested, target) => ((invested / target) * 100).toFixed(1);

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stocks.map((stock, idx) => {
          const remaining = stock.target - stock.invested;
          const progress = calculateProgress(stock.invested, stock.target);
          const livePrice = livePrices[stock.ticker];

          return (
            <div key={idx} className="card p-4 border rounded-xl">
              <h2>{stock.name} ({stock.ticker})</h2>
              <p>🎯 Target: £{stock.target.toLocaleString()}</p>
              <p>💰 Invested: £{stock.invested.toLocaleString()}</p>
              <p>📉 Remaining: £{remaining.toLocaleString()}</p>
              <p>📊 Progress: {progress}%</p>
              <p>📈 Trend: {stock.trend}</p>
              {livePrice && <p>💵 Live Price: £{livePrice.toFixed(2)}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DCAInvestmentTracker;

