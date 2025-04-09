import './App.css';
import { useState, useEffect } from "react";
import Card from "./components/ui/Card";
import CardContent from "./components/ui/Card";
import Button from "./components/ui/Button";
import Input from "./components/ui/Input";
import Label from "./components/ui/Label";

const defaultStocks = [
  { name: "Apple", ticker: "AAPL", target: 44000, invested: 8800, trend: "Falling", shareCount5Y: 1.05, epsGrowth5Y: 1.3, sbcToRevenue: 0.03, hasBuybacks: true, dilutionPurpose: "Strategic" },
  { name: "Johnson & Johnson", ticker: "JNJ", target: 44000, invested: 15000, trend: "Rising", shareCount5Y: 1.01, epsGrowth5Y: 1.12, sbcToRevenue: 0.01, hasBuybacks: true, dilutionPurpose: "Stock-based compensation" },
];

const CACHE_KEY = 'stocksCache';
const CACHE_TIMESTAMP_KEY = 'stocksCacheTimestamp';
const CACHE_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export default function DCAInvestmentTracker() {
  const [stocks, setStocks] = useState([]);
  const [newStock, setNewStock] = useState({ name: "", ticker: "", target: "", invested: "", trend: "", shareCount5Y: "", epsGrowth5Y: "", sbcToRevenue: "", hasBuybacks: false, dilutionPurpose: "" });
  const [monthlyBudget, setMonthlyBudget] = useState(29000);
  const [debtFund, setDebtFund] = useState(150000);

  useEffect(() => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    const isFresh = timestamp && (Date.now() - Number(timestamp)) < CACHE_DURATION_MS;

    if (cachedData && isFresh) {
      setStocks(JSON.parse(cachedData));
    } else {
      setStocks(defaultStocks);
      localStorage.setItem(CACHE_KEY, JSON.stringify(defaultStocks));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    }
  }, []);

  const calculateProgress = (invested, target) => ((invested / target) * 100).toFixed(1);

  const suggestAllocation = () => {
    const updated = stocks.map(stock => {
      const progress = stock.invested / stock.target;
      const allocation = progress < 1 ? (1 - progress) * monthlyBudget : 0;
      return {
        ...stock,
        suggestion: Math.min(allocation, stock.target - stock.invested),
      };
    });
    setStocks(updated);
    localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  };

  const assessDilution = (stock) => {
    let score = 0;
    if (stock.shareCount5Y <= 1.1) score++;
    if (stock.epsGrowth5Y > stock.shareCount5Y) score++;
    if (stock.sbcToRevenue <= 0.05) score++;
    if (stock.hasBuybacks) score++;
    if (["Strategic", "M&A", "Growth Investment"].includes(stock.dilutionPurpose)) score++;
    return score >= 3 ? "✅ Acceptable" : "❌ Red Flag";
  };

  const dilutionCriteria = (stock) => [
    { label: "Share count increase ≤ 10%", condition: stock.shareCount5Y <= 1.1 },
    { label: "EPS growth > Share count growth", condition: stock.epsGrowth5Y > stock.shareCount5Y },
    { label: "SBC to Revenue ≤ 5%", condition: stock.sbcToRevenue <= 0.05 },
    { label: "Has Buybacks", condition: stock.hasBuybacks },
    { label: "Purpose: Strategic / M&A / Growth", condition: ["Strategic", "M&A", "Growth Investment"].includes(stock.dilutionPurpose) },
  ];

  const getDilutionColor = (assessment) => {
    return assessment === "✅ Acceptable" ? "text-green-600 font-semibold" : "text-red-600 font-semibold";
  };

  const handleAddStock = () => {
    const updatedStocks = [
      {
        ...newStock,
        target: Number(newStock.target),
        invested: Number(newStock.invested),
        shareCount5Y: Number(newStock.shareCount5Y),
        epsGrowth5Y: Number(newStock.epsGrowth5Y),
        sbcToRevenue: Number(newStock.sbcToRevenue),
        hasBuybacks: Boolean(newStock.hasBuybacks),
      },
      ...stocks
    ];
    setStocks(updatedStocks);
    setNewStock({ name: "", ticker: "", target: "", invested: "", trend: "", shareCount5Y: "", epsGrowth5Y: "", sbcToRevenue: "", hasBuybacks: false, dilutionPurpose: "" });
    localStorage.setItem(CACHE_KEY, JSON.stringify(updatedStocks));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  };

  const handleDeleteStock = (index) => {
    const updatedStocks = stocks.filter((_, idx) => idx !== index);
    setStocks(updatedStocks);
    localStorage.setItem(CACHE_KEY, JSON.stringify(updatedStocks));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-screen animate-fade-in bg-[#f5f7fa] font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stocks.map((stock, idx) => {
          const remaining = stock.target - stock.invested;
          const progress = calculateProgress(stock.invested, stock.target);
          const highlight = stock.trend === "Falling" && progress < 50;
          const dilutionAssessment = assessDilution(stock);
          const criteria = dilutionCriteria(stock);

          return (
            <Card key={idx} className={`transition-transform transform hover:scale-105 duration-200 shadow-lg rounded-xl bg-white ${highlight ? "border-green-500 border-2" : "border border-gray-200"}`}>
              <CardContent className="p-4">
                <h2 className="text-xl font-bold mb-2">{stock.name} ({stock.ticker})</h2>
                <p>🎯 Target: £{stock.target.toLocaleString()}</p>
                <p>💰 Invested: £{stock.invested.toLocaleString()}</p>
                <p>📉 Remaining: £{remaining.toLocaleString()}</p>
                <p>📊 Progress: {progress}%</p>
                <p>📈 Trend: <span className={highlight ? "text-green-600 font-semibold" : ""}>{stock.trend}</span></p>
                {stock.suggestion && <p className="mt-2 text-blue-600">💡 Suggested Allocation: £{stock.suggestion.toFixed(0)}</p>}
                <div className="mt-2 group relative inline-block">
                  <p className="cursor-pointer">🧪 Dilution Assessment: <span className={getDilutionColor(dilutionAssessment)}>{dilutionAssessment}</span></p>
                  <div className="absolute z-10 hidden group-hover:block bg-white text-sm text-gray-800 border border-gray-300 shadow-md p-2 mt-1 rounded w-[250px]">
                    {criteria.map((c, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <span>{c.condition ? "✅" : "❌"}</span>
                        <span>{c.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button className="mt-2 bg-red-500 hover:bg-red-600 text-white" onClick={() => handleDeleteStock(idx)}>Delete</Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Remaining unchanged */}

    </div>
  );
}
