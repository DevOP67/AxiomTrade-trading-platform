import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Search, RefreshCw, Star, Bell, CheckCircle } from "lucide-react";
import { Widget } from "@/components/Widget";
import { MarketChart } from "@/components/MarketChart";
import { useMarketTickers } from "@/hooks/use-market";
import { downloadCSV } from "@/lib/csv";

const MCAP: Record<string, string> = {
  "BTC/USDT": "1.26T", "ETH/USDT": "413B",  "SOL/USDT": "63B",
  "AVAX/USDT": "15B",  "XRP/USDT": "162B",  "DOT/USDT": "16B",
  "MATIC/USDT": "8B",  "LINK/USDT": "10B",  "DOGE/USDT": "21B",
  "ADA/USDT": "17B",   "UNI/USDT": "6B",    "ATOM/USDT": "3.8B",
  "LTC/USDT": "6.8B",  "BCH/USDT": "9.4B",  "NEAR/USDT": "7.9B",
};

const ACTIVE_SYMBOLS = new Set(["BTC/USDT", "ETH/USDT", "SOL/USDT", "AVAX/USDT", "XRP/USDT"]);

const STATIC_PAIRS = [
  { symbol: "BTC/USDT",   price: 64250.50, change: 2.4,  volume: "28.5B", mcap: "1.26T", active: true,  rawVol: 28.5, high: 65500, low: 63100 },
  { symbol: "ETH/USDT",   price: 3450.25,  change: 1.8,  volume: "15.2B", mcap: "413B",  active: true,  rawVol: 15.2, high: 3520,  low: 3380  },
  { symbol: "SOL/USDT",   price: 145.80,   change: -0.5, volume: "8.3B",  mcap: "63B",   active: true,  rawVol: 8.3,  high: 151,   low: 142   },
  { symbol: "AVAX/USDT",  price: 38.42,    change: 3.2,  volume: "5.1B",  mcap: "15B",   active: true,  rawVol: 5.1,  high: 39.8,  low: 37.1  },
  { symbol: "XRP/USDT",   price: 2.84,     change: 5.1,  volume: "3.9B",  mcap: "162B",  active: true,  rawVol: 3.9,  high: 2.92,  low: 2.70  },
  { symbol: "DOT/USDT",   price: 12.45,    change: -1.2, volume: "2.7B",  mcap: "16B",   active: false, rawVol: 2.7,  high: 12.80, low: 12.20 },
  { symbol: "MATIC/USDT", price: 0.88,     change: 0.7,  volume: "1.8B",  mcap: "8B",    active: false, rawVol: 1.8,  high: 0.90,  low: 0.86  },
  { symbol: "LINK/USDT",  price: 18.32,    change: 4.3,  volume: "2.1B",  mcap: "10B",   active: false, rawVol: 2.1,  high: 18.90, low: 17.60 },
  { symbol: "DOGE/USDT",  price: 0.1524,   change: -2.1, volume: "3.2B",  mcap: "21B",   active: false, rawVol: 3.2,  high: 0.156, low: 0.148 },
  { symbol: "ADA/USDT",   price: 0.4812,   change: 1.5,  volume: "1.4B",  mcap: "17B",   active: false, rawVol: 1.4,  high: 0.492, low: 0.472 },
  { symbol: "UNI/USDT",   price: 11.20,    change: -0.8, volume: "0.9B",  mcap: "6B",    active: false, rawVol: 0.9,  high: 11.50, low: 11.00 },
  { symbol: "ATOM/USDT",  price: 9.84,     change: 2.2,  volume: "0.7B",  mcap: "3.8B",  active: false, rawVol: 0.7,  high: 10.10, low: 9.60  },
  { symbol: "LTC/USDT",   price: 92.50,    change: 0.3,  volume: "1.1B",  mcap: "6.8B",  active: false, rawVol: 1.1,  high: 93.80, low: 91.50 },
  { symbol: "BCH/USDT",   price: 478.20,   change: -1.8, volume: "0.8B",  mcap: "9.4B",  active: false, rawVol: 0.8,  high: 490,   low: 472   },
  { symbol: "NEAR/USDT",  price: 7.35,     change: 3.9,  volume: "0.6B",  mcap: "7.9B",  active: false, rawVol: 0.6,  high: 7.60,  low: 7.10  },
];

function formatVolume(quoteVol: string): string {
  const v = parseFloat(quoteVol);
  if (v >= 1e12) return (v / 1e12).toFixed(1) + "T";
  if (v >= 1e9)  return (v / 1e9).toFixed(1) + "B";
  if (v >= 1e6)  return (v / 1e6).toFixed(1) + "M";
  return v.toFixed(0);
}

function parseVolume(volStr: string): number {
  const v = parseFloat(volStr);
  if (volStr.endsWith("T")) return v * 1e12;
  if (volStr.endsWith("B")) return v * 1e9;
  if (volStr.endsWith("M")) return v * 1e6;
  return v;
}

function binanceToDisplay(sym: string): string {
  return sym.replace("USDT", "/USDT");
}

export default function Markets() {
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [searchTerm, setSearchTerm]     = useState("");
  const [filterBy, setFilterBy]         = useState("all");
  const [sortBy, setSortBy]             = useState<"default" | "volume" | "change">("default");
  const [lastUpdated, setLastUpdated]   = useState<Date | null>(null);
  const [notify, setNotify]             = useState<string | null>(null);
  const [watchlist, setWatchlist]       = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("qf_watchlist") || "[]")); }
    catch { return new Set(); }
  });

  const { data: tickers, isLoading, isFetching, isError, refetch, dataUpdatedAt } = useMarketTickers();

  useEffect(() => {
    if (dataUpdatedAt) setLastUpdated(new Date(dataUpdatedAt));
  }, [dataUpdatedAt]);

  function showNotify(msg: string) {
    setNotify(msg);
    setTimeout(() => setNotify(null), 3000);
  }

  function toggleWatchlist(symbol: string) {
    setWatchlist((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) {
        next.delete(symbol);
        showNotify(`${symbol} removed from watchlist`);
      } else {
        next.add(symbol);
        showNotify(`${symbol} added to watchlist`);
      }
      localStorage.setItem("qf_watchlist", JSON.stringify([...next]));
      return next;
    });
  }

  function setPriceAlert(symbol: string, currentPrice: number) {
    const input = window.prompt(
      `Set price alert for ${symbol}\nCurrent price: $${currentPrice.toLocaleString()}\n\nEnter target price:`,
      currentPrice.toFixed(2)
    );
    if (input === null) return;
    const target = parseFloat(input);
    if (isNaN(target) || target <= 0) {
      showNotify("Invalid price entered");
      return;
    }
    const alerts = JSON.parse(localStorage.getItem("qf_alerts") || "{}");
    alerts[symbol] = target;
    localStorage.setItem("qf_alerts", JSON.stringify(alerts));
    showNotify(`Alert set: ${symbol} at $${target.toLocaleString()}`);
  }

  function exportPairsCSV() {
    downloadCSV(
      "market_pairs.csv",
      ["Symbol", "Price", "24h Change %", "Volume", "Market Cap", "Status"],
      displayPairs.map((p) => [p.symbol, p.price, p.change.toFixed(2), p.volume, p.mcap, p.active ? "Active" : "Paused"])
    );
    showNotify(`Exported ${displayPairs.length} pairs`);
  }

  const basePairs = tickers
    ? tickers.map((t) => {
        const sym = binanceToDisplay(t.symbol);
        return {
          symbol: sym,
          price:  parseFloat(t.lastPrice),
          change: parseFloat(t.priceChangePercent),
          volume: formatVolume(t.quoteVolume),
          rawVol: parseFloat(t.quoteVolume),
          mcap:   MCAP[sym] ?? "—",
          active: ACTIVE_SYMBOLS.has(sym),
          high:   parseFloat(t.highPrice),
          low:    parseFloat(t.lowPrice),
        };
      })
    : STATIC_PAIRS;

  const filteredPairs = basePairs.filter((pair) => {
    const matchesSearch = pair.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy === "all" || (filterBy === "active" ? pair.active : !pair.active);
    return matchesSearch && matchesFilter;
  });

  const displayPairs = [...filteredPairs].sort((a, b) => {
    if (sortBy === "volume") return parseVolume(b.volume) - parseVolume(a.volume);
    if (sortBy === "change") return b.change - a.change;
    return 0;
  });

  const selectedPairData = basePairs.find((p) => p.symbol === selectedPair);

  const pairMenuItems = [
    {
      label: watchlist.has(selectedPair) ? "Remove from Watchlist" : "Add to Watchlist",
      onClick: () => toggleWatchlist(selectedPair),
    },
    {
      label: "Set Price Alert",
      onClick: () => {
        const d = basePairs.find((p) => p.symbol === selectedPair);
        if (d) setPriceAlert(selectedPair, d.price);
      },
    },
    {
      label: "View Full Chart",
      onClick: () => {
        document.querySelector("[data-chart-section]")?.scrollIntoView({ behavior: "smooth" });
        showNotify(`Chart loaded for ${selectedPair}`);
      },
    },
  ];

  const tradingPairMenuItems = [
    { label: "Export Pairs",       onClick: exportPairsCSV },
    { label: "Sort by Volume",     onClick: () => { setSortBy("volume");  showNotify("Sorted by 24h volume"); } },
    { label: "Sort by 24h Change", onClick: () => { setSortBy("change");  showNotify("Sorted by 24h change"); } },
    { label: "Reset Sort",         onClick: () => { setSortBy("default"); showNotify("Sort reset"); } },
  ];

  const liveIndicator = (
    <div className="flex items-center gap-2">
      {sortBy !== "default" && (
        <span className="text-[10px] text-primary hidden sm:inline">
          ↕ by {sortBy}
        </span>
      )}
      {lastUpdated && (
        <span className="text-[10px] text-muted-foreground hidden sm:inline">
          {lastUpdated.toLocaleTimeString()}
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
      {notify && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl border bg-success/20 border-success/40 text-success text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          {notify}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Market Explorer</h1>
        <p className="text-muted-foreground">Real-time cryptocurrency market data — auto-refreshes every 10s</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6" data-chart-section>
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
              <div className="flex items-start justify-between">
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
                <button
                  onClick={() => toggleWatchlist(selectedPair)}
                  title={watchlist.has(selectedPair) ? "Remove from watchlist" : "Add to watchlist"}
                  className={`p-2 rounded-lg transition-colors ${watchlist.has(selectedPair) ? "text-warning bg-warning/10" : "text-muted-foreground hover:text-warning hover:bg-warning/10"}`}
                >
                  <Star className="w-4 h-4" fill={watchlist.has(selectedPair) ? "currentColor" : "none"} />
                </button>
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

              <div className="border-t border-border/50 pt-3 flex gap-2">
                <button
                  onClick={() => {
                    const sym = selectedPairData.symbol.split("/")[0];
                    if (window.confirm(`Place MARKET BUY order for ${sym}?\nCurrent price: $${selectedPairData.price.toLocaleString()}\n\nThis is a simulated order.`)) {
                      showNotify(`BUY order placed for ${sym}`);
                    }
                  }}
                  className="flex-1 py-2 bg-success/20 text-success border border-success/30 rounded-lg text-sm font-semibold hover:bg-success/30 transition-colors"
                >
                  Buy
                </button>
                <button
                  onClick={() => {
                    const sym = selectedPairData.symbol.split("/")[0];
                    if (window.confirm(`Place MARKET SELL order for ${sym}?\nCurrent price: $${selectedPairData.price.toLocaleString()}\n\nThis is a simulated order.`)) {
                      showNotify(`SELL order placed for ${sym}`);
                    }
                  }}
                  className="flex-1 py-2 bg-danger/10 text-danger border border-danger/20 rounded-lg text-sm font-semibold hover:bg-danger/20 transition-colors"
                >
                  Sell
                </button>
                <button
                  onClick={() => setPriceAlert(selectedPair, selectedPairData.price)}
                  title="Set price alert"
                  className="px-3 py-2 bg-secondary/50 text-muted-foreground border border-border/50 rounded-lg text-sm hover:bg-secondary transition-colors"
                >
                  <Bell className="w-4 h-4" />
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
        onExport={exportPairsCSV}
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
                {displayPairs.map((pair) => (
                  <tr
                    key={pair.symbol}
                    className="hover:bg-secondary/30 transition-colors"
                    data-testid={`row-pair-${pair.symbol}`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${pair.active ? "bg-success" : "bg-muted-foreground"}`} />
                        <span className="font-semibold text-foreground text-sm">{pair.symbol}</span>
                        {watchlist.has(pair.symbol) && (
                          <Star className="w-3 h-3 text-warning" fill="currentColor" />
                        )}
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
                      <div className="flex items-center gap-1.5">
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
                        <button
                          onClick={() => toggleWatchlist(pair.symbol)}
                          title={watchlist.has(pair.symbol) ? "Remove from watchlist" : "Add to watchlist"}
                          className={`p-1 rounded transition-colors ${watchlist.has(pair.symbol) ? "text-warning" : "text-muted-foreground hover:text-warning"}`}
                        >
                          <Star className="w-3.5 h-3.5" fill={watchlist.has(pair.symbol) ? "currentColor" : "none"} />
                        </button>
                      </div>
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
