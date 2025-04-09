import './App.css';
import { useState } from "react";
import Card from "./components/ui/Card";
import CardContent from "./components/ui/Card";
import Button from "./components/ui/Button";
import Input from "./components/ui/Input";
import Label from "./components/ui/Label";

const defaultStocks = [
  { name: "Apple", ticker: "AAPL", target: 44000, invested: 8800, trend: "Falling", shareCount5Y: 1.05, epsGrowth5Y: 1.3, sbcToRevenue: 0.03, hasBuybacks: true, dilutionPurpose: "Strategic" },
  { name: "Johnson & Johnson", ticker: "JNJ", target: 44000, invested: 15000, trend: "Rising", shareCount5Y: 1.01, epsGrowth5Y: 1.12, sbcToRevenue: 0.01, hasBuybacks: true, dilutionPurpose: "Stock-based compensation" },
];

export default function DCAInvestmentTracker() {
  const [stocks, setStocks] = useState(defaultStocks);
  const [newStock, setNewStock] = useState({ name: "", ticker: "", target: "", invested: "", trend: "", shareCount5Y: "", epsGrowth5Y: "", sbcToRevenue: "", hasBuybacks: false, dilutionPurpose: "" });
  const monthlyBudget = 29000;
  const debtFund = 150000;

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

  const getDilutionColor = (assessment) => {
    return assessment === "✅ Acceptable" ? "text-green-600 font-semibold" : "text-red-600 font-semibold";
  };

  const handleAddStock = () => {
    setStocks(prevStocks => [
      {
        ...newStock,
        target: Number(newStock.target),
        invested: Number(newStock.invested),
        shareCount5Y: Number(newStock.shareCount5Y),
        epsGrowth5Y: Number(newStock.epsGrowth5Y),
        sbcToRevenue: Number(newStock.sbcToRevenue),
        hasBuybacks: Boolean(newStock.hasBuybacks),
      },
      ...prevStocks
    ]);
    setNewStock({ name: "", ticker: "", target: "", invested: "", trend: "", shareCount5Y: "", epsGrowth5Y: "", sbcToRevenue: "", hasBuybacks: false, dilutionPurpose: "" });
  };

  const handleDeleteStock = (index) => {
    const updatedStocks = stocks.filter((_, idx) => idx !== index);
    setStocks(updatedStocks);
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-screen animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stocks.map((stock, idx) => {
          const remaining = stock.target - stock.invested;
          const progress = calculateProgress(stock.invested, stock.target);
          const highlight = stock.trend === "Falling" && progress < 50;
          const dilutionAssessment = assessDilution(stock);

          return (
            <Card key={idx} className={`transition-transform transform hover:scale-105 duration-200 ${highlight ? "border-green-500 border-2" : ""}`}>
              <CardContent className="p-4">
                <h2 className="text-xl font-bold mb-2">{stock.name} ({stock.ticker})</h2>
                <p>🎯 Target: £{stock.target.toLocaleString()}</p>
                <p>💰 Invested: £{stock.invested.toLocaleString()}</p>
                <p>📉 Remaining: £{remaining.toLocaleString()}</p>
                <p>📊 Progress: {progress}%</p>
                <p>📈 Trend: <span className={highlight ? "text-green-600 font-semibold" : ""}>{stock.trend}</span></p>
                {stock.suggestion && <p className="mt-2 text-blue-600">💡 Suggested Allocation: £{stock.suggestion.toFixed(0)}</p>}
                <p className="mt-2">🧪 Dilution Assessment: <span className={getDilutionColor(dilutionAssessment)}>{dilutionAssessment}</span></p>
                <Button className="mt-2 bg-red-500 hover:bg-red-600 text-white" onClick={() => handleDeleteStock(idx)}>Delete</Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-xl animate-fade-in">
          <h3 className="text-lg font-semibold mb-2">Add New Stock</h3>
          <div className="space-y-2">
            <div>
              <Label>Name</Label>
              <Input value={newStock.name} onChange={(e) => setNewStock({ ...newStock, name: e.target.value })} />
            </div>
            <div>
              <Label>Ticker</Label>
              <Input value={newStock.ticker} onChange={(e) => setNewStock({ ...newStock, ticker: e.target.value })} />
            </div>
            <div>
              <Label>Target (£)</Label>
              <Input type="number" value={newStock.target} onChange={(e) => setNewStock({ ...newStock, target: e.target.value })} />
            </div>
            <div>
              <Label>Invested (£)</Label>
              <Input type="number" value={newStock.invested} onChange={(e) => setNewStock({ ...newStock, invested: e.target.value })} />
            </div>
            <div>
              <Label>Trend</Label>
              <Input value={newStock.trend} onChange={(e) => setNewStock({ ...newStock, trend: e.target.value })} />
            </div>
            <div>
              <Label>5Y Share Count Ratio (Now / 5Y Ago)</Label>
              <Input type="number" step="0.01" value={newStock.shareCount5Y} onChange={(e) => setNewStock({ ...newStock, shareCount5Y: e.target.value })} />
            </div>
            <div>
              <Label>5Y EPS Growth Ratio</Label>
              <Input type="number" step="0.01" value={newStock.epsGrowth5Y} onChange={(e) => setNewStock({ ...newStock, epsGrowth5Y: e.target.value })} />
            </div>
            <div>
              <Label>SBC to Revenue Ratio</Label>
              <Input type="number" step="0.01" value={newStock.sbcToRevenue} onChange={(e) => setNewStock({ ...newStock, sbcToRevenue: e.target.value })} />
            </div>
            <div>
              <Label>Dilution Purpose</Label>
              <Input value={newStock.dilutionPurpose} onChange={(e) => setNewStock({ ...newStock, dilutionPurpose: e.target.value })} />
            </div>
            <div>
              <Label>Has Buybacks?</Label>
              <Input type="checkbox" checked={newStock.hasBuybacks} onChange={(e) => setNewStock({ ...newStock, hasBuybacks: e.target.checked })} />
            </div>
            <Button onClick={handleAddStock} className="mt-2 w-full transition-all hover:scale-105">Add Stock</Button>
          </div>
        </div>

        <div className="p-4 border rounded-xl text-center animate-fade-in">
          <h3 className="text-lg font-semibold">Monthly Budget</h3>
          <p className="text-2xl font-bold text-blue-600 mb-2">£{monthlyBudget.toLocaleString()}</p>
          <Button onClick={suggestAllocation} className="transition-transform hover:scale-105">Suggest Allocation</Button>

          <div className="mt-6">
            <h4 className="font-semibold text-md">📦 Debt Reserve (30%)</h4>
            <p className="text-lg font-bold text-gray-700">£{debtFund.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
