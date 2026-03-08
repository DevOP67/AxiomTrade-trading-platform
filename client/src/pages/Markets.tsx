import React, { useState } from "react";
import { TrendingUp, TrendingDown, Search, Filter } from "lucide-react";
import { Widget } from "@/components/Widget";
import { MarketChart } from "@/components/MarketChart";

const MARKET_PAIRS = [
  { symbol: "BTC/USDT", price: 64250.50, change: 2.4, volume: "28.5B", active: true },
  { symbol: "ETH/USDT", price: 3450.25, change: 1.8, volume: "15.2B", active: true },
  { symbol: "SOL/USDT", price: 145.80, change: -0.5, volume: "8.3B", active: true },
  { symbol: "AVAX/USDT", price: 38.42, change: 3.2, volume: "5.1B", active: false },
  { symbol: "XRP/USDT", price: 2.84, change: 5.1, volume: "3.9B", active: false },
  { symbol: "DOT/USDT", price: 12.45, change: -1.2, volume: "2.7B", active: false },
];

export default function Markets() {
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");

  const filteredPairs = MARKET_PAIRS.filter(pair => {
    const matchesSearch = pair.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy === "all" || (filterBy === "active" ? pair.active : !pair.active);
    return matchesSearch && matchesFilter;
  });

  const selectedPairData = MARKET_PAIRS.find(p => p.symbol === selectedPair);

  return (
    <div className="flex-1 overflow-auto bg-background p-4 md:p-6 lg:p-8 no-scrollbar">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Market Explorer</h1>
        <p className="text-muted-foreground">Real-time cryptocurrency market data and analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <Widget title={`${selectedPair} - 24h Chart`} className="h-[400px]">
            <MarketChart symbol={selectedPair} color="hsl(var(--primary))" dataPoints={100} />
          </Widget>
        </div>

        {/* Selected Pair Stats */}
        {selectedPairData && (
          <Widget title="Pair Details">
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold font-mono text-foreground">${selectedPairData.price.toLocaleString()}</h3>
                <p className={`text-sm font-semibold mt-1 ${selectedPairData.change > 0 ? 'text-success' : 'text-danger'}`}>
                  {selectedPairData.change > 0 ? '+' : ''}{selectedPairData.change}%
                </p>
              </div>
              <div className="border-t border-border/50 pt-4">
                <p className="text-xs text-muted-foreground mb-2">24h Volume</p>
                <p className="font-mono font-bold text-foreground">{selectedPairData.volume}</p>
              </div>
              <div className="border-t border-border/50 pt-4">
                <p className="text-xs text-muted-foreground mb-2">Status</p>
                <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${selectedPairData.active ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                  {selectedPairData.active ? 'Trading Enabled' : 'Paused'}
                </span>
              </div>
            </div>
          </Widget>
        )}
      </div>

      {/* Market List */}
      <Widget title="Trading Pairs">
        <div className="space-y-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search pairs..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              />
            </div>
            <select 
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-4 py-2 bg-secondary/50 border border-border/50 rounded-lg text-foreground focus:outline-none focus:border-primary/50"
            >
              <option value="all">All Pairs</option>
              <option value="active">Trading</option>
              <option value="inactive">Paused</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary/50">
              <tr>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Pair</th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase text-right">Price</th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase text-right">24h Change</th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase text-right">Volume</th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredPairs.map((pair) => (
                <tr key={pair.symbol} className="hover:bg-secondary/30 transition-colors">
                  <td className="py-4 px-4 font-semibold text-foreground">{pair.symbol}</td>
                  <td className="py-4 px-4 text-right font-mono text-foreground">${pair.price.toLocaleString()}</td>
                  <td className={`py-4 px-4 text-right font-semibold flex items-center justify-end gap-1 ${pair.change > 0 ? 'text-success' : 'text-danger'}`}>
                    {pair.change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {pair.change > 0 ? '+' : ''}{pair.change}%
                  </td>
                  <td className="py-4 px-4 text-right text-muted-foreground">{pair.volume}</td>
                  <td className="py-4 px-4">
                    <button 
                      onClick={() => setSelectedPair(pair.symbol)}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${selectedPair === pair.symbol ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-foreground hover:bg-secondary'}`}
                    >
                      {selectedPair === pair.symbol ? 'Selected' : 'Select'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Widget>
    </div>
  );
}
