import React, { useState } from "react";
import { TrendingUp, TrendingDown, Search } from "lucide-react";
import { Widget } from "@/components/Widget";
import { MarketChart } from "@/components/MarketChart";

const MARKET_PAIRS = [
  {
    symbol: "BTC/USDT",
    price: 64250.5,
    change: 2.4,
    volume: "28.5B",
    mcap: "1.26T",
    active: true,
  },
  {
    symbol: "ETH/USDT",
    price: 3450.25,
    change: 1.8,
    volume: "15.2B",
    mcap: "413B",
    active: true,
  },
  {
    symbol: "SOL/USDT",
    price: 145.8,
    change: -0.5,
    volume: "8.3B",
    mcap: "63B",
    active: true,
  },
  {
    symbol: "AVAX/USDT",
    price: 38.42,
    change: 3.2,
    volume: "5.1B",
    mcap: "15B",
    active: true,
  },
  {
    symbol: "XRP/USDT",
    price: 2.84,
    change: 5.1,
    volume: "3.9B",
    mcap: "162B",
    active: true,
  },
  {
    symbol: "DOT/USDT",
    price: 12.45,
    change: -1.2,
    volume: "2.7B",
    mcap: "16B",
    active: false,
  },
  {
    symbol: "MATIC/USDT",
    price: 0.88,
    change: 0.7,
    volume: "1.8B",
    mcap: "8B",
    active: false,
  },
  {
    symbol: "LINK/USDT",
    price: 18.32,
    change: 4.3,
    volume: "2.1B",
    mcap: "10B",
    active: false,
  },
  {
    symbol: "DOGE/USDT",
    price: 0.1524,
    change: -2.1,
    volume: "3.2B",
    mcap: "21B",
    active: false,
  },
  {
    symbol: "ADA/USDT",
    price: 0.4812,
    change: 1.5,
    volume: "1.4B",
    mcap: "17B",
    active: false,
  },
  {
    symbol: "UNI/USDT",
    price: 11.2,
    change: -0.8,
    volume: "0.9B",
    mcap: "6B",
    active: false,
  },
  {
    symbol: "ATOM/USDT",
    price: 9.84,
    change: 2.2,
    volume: "0.7B",
    mcap: "3.8B",
    active: false,
  },
  {
    symbol: "LTC/USDT",
    price: 92.5,
    change: 0.3,
    volume: "1.1B",
    mcap: "6.8B",
    active: false,
  },
  {
    symbol: "BCH/USDT",
    price: 478.2,
    change: -1.8,
    volume: "0.8B",
    mcap: "9.4B",
    active: false,
  },
  {
    symbol: "NEAR/USDT",
    price: 7.35,
    change: 3.9,
    volume: "0.6B",
    mcap: "7.9B",
    active: false,
  },
];

export default function Markets() {
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");

  const filteredPairs = MARKET_PAIRS.filter((pair) => {
    const matchesSearch = pair.symbol
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterBy === "all" ||
      (filterBy === "active" ? pair.active : !pair.active);
    return matchesSearch && matchesFilter;
  });

  const selectedPairData = MARKET_PAIRS.find((p) => p.symbol === selectedPair);

  const pairMenuItems = [
    {
      label: "Add to Watchlist",
      onClick: () => alert(`${selectedPair} added to watchlist`),
    },
    {
      label: "Set Price Alert",
      onClick: () => alert(`Alert set for ${selectedPair}`),
    },
    {
      label: "View Full Chart",
      onClick: () => alert(`Opening ${selectedPair} in full chart`),
    },
  ];

  const tradingPairMenuItems = [
    {
      label: "Export Pairs",
      onClick: () => alert("Exporting trading pairs..."),
    },
    { label: "Sort by Volume", onClick: () => alert("Sorted by volume") },
    { label: "Sort by 24h Change", onClick: () => alert("Sorted by change") },
  ];

  return (
    <div className="min-h-full bg-background p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Market Explorer
        </h1>
        <p className="text-muted-foreground">
          Real-time cryptocurrency market data and analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <Widget
            title={`${selectedPair} — 24h Chart`}
            className="h-[420px]"
            onRefresh={() => {}}
          >
            <MarketChart
              symbol={selectedPair}
              color="hsl(var(--primary))"
              dataPoints={100}
            />
          </Widget>
        </div>

        {/* Pair Details */}
        {selectedPairData && (
          <Widget title="Pair Details" menuItems={pairMenuItems}>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {selectedPairData.symbol}
                </p>
                <h3 className="text-2xl font-bold font-mono text-foreground">
                  ${selectedPairData.price.toLocaleString()}
                </h3>
                <p
                  className={`text-sm font-semibold mt-1 inline-flex items-center gap-1 ${selectedPairData.change > 0 ? "text-success" : "text-danger"}`}
                >
                  {selectedPairData.change > 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {selectedPairData.change > 0 ? "+" : ""}
                  {selectedPairData.change}%
                </p>
              </div>

              {[
                { label: "24h Volume", val: selectedPairData.volume },
                { label: "Market Cap", val: selectedPairData.mcap },
                { label: "Status", val: null },
              ].map((row, i) => (
                <div key={i} className="border-t border-border/50 pt-4">
                  <p className="text-xs text-muted-foreground mb-2">
                    {row.label}
                  </p>
                  {row.val ? (
                    <p className="font-mono font-bold text-foreground">
                      {row.val}
                    </p>
                  ) : (
                    <span
                      className={`inline-block px-3 py-1 rounded text-xs font-semibold ${selectedPairData.active ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}
                    >
                      {selectedPairData.active ? "Trading Active" : "Paused"}
                    </span>
                  )}
                </div>
              ))}

              <div className="border-t border-border/50 pt-4">
                <button
                  onClick={() => alert(`Opening trade for ${selectedPair}`)}
                  className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Trade {selectedPairData.symbol.split("/")[0]}
                </button>
              </div>
            </div>
          </Widget>
        )}
      </div>

      {/* Market List */}
      <Widget title="Trading Pairs" menuItems={tradingPairMenuItems}>
        <div className="space-y-4 mb-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search pairs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 text-sm"
              />
            </div>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-4 py-2 bg-secondary/50 border border-border/50 rounded-lg text-foreground focus:outline-none focus:border-primary/50 text-sm"
            >
              <option value="all">All Pairs</option>
              <option value="active">Active</option>
              <option value="inactive">Paused</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary/50">
              <tr>
                {[
                  "Pair",
                  "Price",
                  "24h Change",
                  "Volume",
                  "Market Cap",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className={`py-3 px-4 text-xs font-semibold text-muted-foreground uppercase ${h === "Pair" || h === "Action" ? "" : "text-right"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredPairs.map((pair) => (
                <tr
                  key={pair.symbol}
                  className="hover:bg-secondary/30 transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${pair.active ? "bg-success" : "bg-muted-foreground"}`}
                      />
                      <span className="font-semibold text-foreground text-sm">
                        {pair.symbol}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-foreground text-sm">
                    ${pair.price.toLocaleString()}
                  </td>
                  <td
                    className={`py-3.5 px-4 text-right font-semibold text-sm ${pair.change > 0 ? "text-success" : "text-danger"}`}
                  >
                    <span className="inline-flex items-center justify-end gap-1">
                      {pair.change > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {pair.change > 0 ? "+" : ""}
                      {pair.change}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-muted-foreground text-sm">
                    {pair.volume}
                  </td>
                  <td className="py-3.5 px-4 text-right text-muted-foreground text-sm">
                    {pair.mcap}
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => setSelectedPair(pair.symbol)}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${selectedPair === pair.symbol ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-foreground hover:bg-secondary"}`}
                    >
                      {selectedPair === pair.symbol ? "Selected" : "Select"}
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
