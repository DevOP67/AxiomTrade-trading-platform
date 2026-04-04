import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Search, RefreshCw } from "lucide-react";
import { Widget } from "@/components/Widget";
import { MarketChart } from "@/components/MarketChart";
import { useMarketTickers } from "@/hooks/use-market";

const MCAP: Record<string, string> = {
  "BTC/USDT": "1.26T", "ETH/USDT": "413B",  "SOL/USDT": "63B",
  "AVAX/USDT": "15B",  "XRP/USDT": "162B",  "DOT/USDT": "16B",
  "MATIC/USDT": "8B",  "LINK/USDT": "10B",  "DOGE/USDT": "21B",
  "ADA/USDT": "17B",   "UNI/USDT": "6B",    "ATOM/USDT": "3.8B",
  "LTC/USDT": "6.8B",  "BCH/USDT": "9.4B",  "NEAR/USDT": "7.9B",
};

const ACTIVE_SYMBOLS = new Set(["BTC/USDT", "ETH/USDT", "SOL/USDT", "AVAX/USDT", "XRP/USDT"]);

const STATIC_PAIRS = [
  { symbol: "BTC/USDT",   price: 64250.50, change: 2.4,  volume: "28.5B", mcap: "1.26T", active: true  },
  { symbol: "ETH/USDT",   price: 3450.25,  change: 1.8,  volume: "15.2B", mcap: "413B",  active: true  },
  { symbol: "SOL/USDT",   price: 145.80,   change: -0.5, volume: "8.3B",  mcap: "63B",   active: true  },
  { symbol: "AVAX/USDT",  price: 38.42,    change: 3.2,  volume: "5.1B",  mcap: "15B",   active: true  },
  { symbol: "XRP/USDT",   price: 2.84,     change: 5.1,  volume: "3.9B",  mcap: "162B",  active: true  },
  { symbol: "DOT/USDT",   price: 12.45,    change: -1.2, volume: "2.7B",  mcap: "16B",   active: false },
  { symbol: "MATIC/USDT", price: 0.88,     change: 0.7,  volume: "1.8B",  mcap: "8B",    active: false },
  { symbol: "LINK/USDT",  price: 18.32,    change: 4.3,  volume: "2.1B",  mcap: "10B",   active: false },
  { symbol: "DOGE/USDT",  price: 0.1524,   change: -2.1, volume: "3.2B",  mcap: "21B",   active: false },
  { symbol: "ADA/USDT",   price: 0.4812,   change: 1.5,  volume: "1.4B",  mcap: "17B",   active: false },
  { symbol: "UNI/USDT",   price: 11.20,    change: -0.8, volume: "0.9B",  mcap: "6B",    active: false },
  { symbol: "ATOM/USDT",  price: 9.84,     change: 2.2,  volume: "0.7B",  mcap: "3.8B",  active: false },
  { symbol: "LTC/USDT",   price: 92.50,    change: 0.3,  volume: "1.1B",  mcap: "6.8B",  active: false },
  { symbol: "BCH/USDT",   price: 478.20,   change: -1.8, volume: "0.8B",  mcap: "9.4B",  active: false },
  { symbol: "NEAR/USDT",  price: 7.35,     change: 3.9,  volume: "0.6B",  mcap: "7.9B",  active: false },
];

function formatVolume(quoteVol: string): string {
  const v = parseFloat(quoteVol);
  if (v >= 1e12) return (v / 1e12).toFixed(1) + "T";
  if (v >= 1e9)  return (v / 1e9).toFixed(1) + "B";
  if (v >= 1e6)  return (v / 1e6).toFixed(1) + "M";
  return v.toFixed(0);
}

function binanceToDisplay(sym: string): string {
  return sym.replace("USDT", "/USDT");
}

export default function Markets() {
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [searchTerm, setSearchTerm]     = useState("");
  const [filterBy, setFilterBy]         = useState("all");
  const [lastUpdated, setLastUpdated]   = useState<Date | null>(null);

  const { data: tickers, isLoading, isFetching, isError, refetch, dataUpdatedAt } = useMarketTickers();

  useEffect(() => {
    if (dataUpdatedAt) setLastUpdated(new Date(dataUpdatedAt));
  }, [dataUpdatedAt]);

  const pairs = tickers
    ? tickers.map((t) => {
        const sym = binanceToDisplay(t.symbol);
        return {
          symbol: sym,
          price:  parseFloat(t.lastPrice),
          change: parseFloat(t.priceChangePercent),
          volume: formatVolume(t.quoteVolume),
          mcap:   MCAP[sym] ?? "—",
          active: ACTIVE_SYMBOLS.has(sym),
          high:   parseFloat(t.highPrice),
          low:    parseFloat(t.lowPrice),
        };
      })
    : STATIC_PAIRS.map((p) => ({ ...p, high: p.price * 1.02, low: p.price * 0.98 }));

  const filteredPairs = pairs.filter((pair) => {
    const matchesSearch = pair.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy === "all" || (filterBy === "active" ? pair.active : !pair.active);
    return matchesSearch && matchesFilter;
  });

  const selectedPairData = pairs.find((p) => p.symbol === selectedPair);

  const pairMenuItems = [
    { label: "Add to Watchlist", onClick: () => alert(`${selectedPair} added to watchlist`) },
    { label: "Set Price Alert",  onClick: () => alert(`Alert set for ${selectedPair}`) },
    { label: "View Full Chart",  onClick: () => alert(`Opening ${selectedPair} in full chart`) },
  ];

  const tradingPairMenuItems = [
    { label: "Export Pairs",       onClick: () => alert("Exporting trading pairs...") },
    { label: "Sort by Volume",     onClick: () => alert("Sorted by volume") },
    { label: "Sort by 24h Change", onClick: () => alert("Sorted by change") },
  ];

  const liveIndicator = (
    <div className="flex items-center gap-2">
      {lastUpdated && (
        <span className="text-[10px] text-muted-foreground hidden sm:inline">
          Updated {lastUpdated.toLocaleTimeString()}
        </span>
      )}
      <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md border ${
        isError
          ? "text-warning bg-warning/10 border-warning/20"
          : "text-success bg-success/10 border-success/20"
      }`}>
        {isFetching
          ? <RefreshCw className="w-3 h-3 animate-spin" />
          : <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        }
        {isError ? "Fallback" : "Live"}
      </span>
    </div>
  );

  return (
    <div className="flex-1 overflow-auto bg-background p-4 md:p-6 lg:p-8 no-scrollbar">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Market Explorer</h1>
        <p className="text-muted-foreground">Real-time cryptocurrency market data — auto-refreshes every 10s</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <Widget title={`${selectedPair} — 24h Chart`} className="h-[280px] md:h-[420px]" onRefresh={() => refetch()}>
            <MarketChart symbol={selectedPair} color="hsl(var(--primary))" dataPoints={100} />
          </Widget>
        </div>

        {/* Pair Details */}
        {selectedPairData && (
          <Widget title="Pair Details" menuItems={pairMenuItems}>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{selectedPairData.symbol}</p>
                <h3 className="text-2xl font-bold font-mono text-foreground">
                  ${selectedPairData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </h3>
                <p className={`text-sm font-semibold mt-1 inline-flex items-center gap-1 ${selectedPairData.change > 0 ? "text-success" : "text-danger"}`}>
                  {selectedPairData.change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {selectedPairData.change > 0 ? "+" : ""}{selectedPairData.change.toFixed(2)}%
                </p>
              </div>

              {[
                { label: "24h Volume",  val: selectedPairData.volume },
                { label: "Market Cap",  val: selectedPairData.mcap },
                { label: "24h High",    val: `$${selectedPairData.high.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}` },
                { label: "24h Low",     val: `$${selectedPairData.low.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}` },
                { label: "Status",      val: null },
              ].map((row, i) => (
                <div key={i} className="border-t border-border/50 pt-3">
                  <p className="text-xs text-muted-foreground mb-1">{row.label}</p>
                  {row.val ? (
                    <p className="font-mono font-bold text-foreground text-sm">{row.val}</p>
                  ) : (
                    <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${selectedPairData.active ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                      {selectedPairData.active ? "Trading Active" : "Paused"}
                    </span>
                  )}
                </div>
              ))}

              <div className="border-t border-border/50 pt-3">
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
      <Widget
        title="Trading Pairs"
        menuItems={tradingPairMenuItems}
        onRefresh={() => refetch()}
        action={liveIndicator}
      >
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
                data-testid="input-search-pairs"
              />
            </div>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-4 py-2 bg-secondary/50 border border-border/50 rounded-lg text-foreground focus:outline-none focus:border-primary/50 text-sm"
              data-testid="select-filter-pairs"
            >
              <option value="all">All Pairs</option>
              <option value="active">Active</option>
              <option value="inactive">Paused</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-12 bg-secondary/40 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-secondary/50">
                <tr>
                  {["Pair", "Price", "24h Change", "Volume", "Market Cap", "Action"].map((h) => (
                    <th key={h} className={`py-3 px-4 text-xs font-semibold text-muted-foreground uppercase ${h === "Pair" || h === "Action" ? "" : "text-right"}`}>
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
                    data-testid={`row-pair-${pair.symbol}`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${pair.active ? "bg-success" : "bg-muted-foreground"}`} />
                        <span className="font-semibold text-foreground text-sm">{pair.symbol}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-foreground text-sm">
                      ${pair.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </td>
                    <td className={`py-3.5 px-4 text-right font-semibold text-sm ${pair.change > 0 ? "text-success" : "text-danger"}`}>
                      <span className="inline-flex items-center justify-end gap-1">
                        {pair.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {pair.change > 0 ? "+" : ""}{pair.change.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-muted-foreground text-sm">{pair.volume}</td>
                    <td className="py-3.5 px-4 text-right text-muted-foreground text-sm">{pair.mcap}</td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setSelectedPair(pair.symbol)}
                        data-testid={`button-select-pair-${pair.symbol}`}
                        className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                          selectedPair === pair.symbol
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary/50 text-foreground hover:bg-secondary"
                        }`}
                      >
                        {selectedPair === pair.symbol ? "Selected" : "Select"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Widget>
    </div>
  );
}
