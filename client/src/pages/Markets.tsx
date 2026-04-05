import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Search,
  Star,
  Bell,
  ShoppingCart,
  ArrowDownCircle,
} from "lucide-react";
import { Widget } from "@/components/Widget";
import { MarketChart } from "@/components/MarketChart";
import { downloadCSV } from "@/lib/csv";

const MARKET_PAIRS = [
  { symbol: "BTC/USDT",  price: 64250.5,  change: 2.4,  volume: "28.5B", mcap: "1.26T" },
  { symbol: "ETH/USDT",  price: 3450.25,  change: 1.8,  volume: "15.2B", mcap: "413B"  },
  { symbol: "SOL/USDT",  price: 145.8,    change: -0.5, volume: "8.3B",  mcap: "63B"   },
  { symbol: "AVAX/USDT", price: 38.42,    change: 3.2,  volume: "5.1B",  mcap: "15B"   },
  { symbol: "XRP/USDT",  price: 2.84,     change: 5.1,  volume: "3.9B",  mcap: "162B"  },
  { symbol: "DOT/USDT",  price: 12.45,    change: -1.2, volume: "2.7B",  mcap: "16B"   },
  { symbol: "MATIC/USDT",price: 0.88,     change: 0.7,  volume: "1.8B",  mcap: "8B"    },
  { symbol: "LINK/USDT", price: 18.32,    change: 4.3,  volume: "2.1B",  mcap: "10B"   },
  { symbol: "DOGE/USDT", price: 0.1524,   change: -2.1, volume: "3.2B",  mcap: "21B"   },
  { symbol: "ADA/USDT",  price: 0.4812,   change: 1.5,  volume: "1.4B",  mcap: "17B"   },
  { symbol: "UNI/USDT",  price: 11.2,     change: -0.8, volume: "0.9B",  mcap: "6B"    },
  { symbol: "ATOM/USDT", price: 9.84,     change: 2.2,  volume: "0.7B",  mcap: "3.8B"  },
  { symbol: "LTC/USDT",  price: 92.5,     change: 0.3,  volume: "1.1B",  mcap: "6.8B"  },
  { symbol: "BCH/USDT",  price: 478.2,    change: -1.8, volume: "0.8B",  mcap: "9.4B"  },
  { symbol: "NEAR/USDT", price: 7.35,     change: 3.9,  volume: "0.6B",  mcap: "7.9B"  },
];

function parseVolume(volStr: string): number {
  const v = parseFloat(volStr);
  if (volStr.endsWith("T")) return v * 1e12;
  if (volStr.endsWith("B")) return v * 1e9;
  if (volStr.endsWith("M")) return v * 1e6;
  return v;
}

export default function Markets() {
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "volume" | "change">("default");
  const [notify, setNotify] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("qf_watchlist") || "[]"));
    } catch {
      return new Set();
    }
  });

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
      `Set price alert for ${symbol} (current: $${currentPrice.toLocaleString()}):\nEnter target price:`,
    );
    if (!input) return;
    const target = parseFloat(input);
    if (isNaN(target)) {
      showNotify("Invalid price entered");
      return;
    }
    const alerts = JSON.parse(localStorage.getItem("qf_alerts") || "{}");
    alerts[symbol] = target;
    localStorage.setItem("qf_alerts", JSON.stringify(alerts));
    showNotify(`Alert set: ${symbol} @ $${target.toLocaleString()}`);
  }

  function handleTrade(side: "BUY" | "SELL", symbol: string, price: number) {
    if (!window.confirm(`${side} ${symbol} at $${price.toLocaleString()}?`)) return;
    showNotify(`${side} order placed for ${symbol}`);
  }

  function exportPairsCSV() {
    downloadCSV(
      "market_pairs.csv",
      ["Symbol", "Price", "24h Change %", "Volume", "Mkt Cap"],
      displayPairs.map((p) => [
        p.symbol,
        p.price,
        `${p.change >= 0 ? "+" : ""}${p.change}%`,
        p.volume,
        p.mcap,
      ]),
    );
    showNotify("CSV exported");
  }

  const filteredPairs = MARKET_PAIRS.filter((p) =>
    p.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const displayPairs = [...filteredPairs].sort((a, b) => {
    if (sortBy === "volume") return parseVolume(b.volume) - parseVolume(a.volume);
    if (sortBy === "change") return b.change - a.change;
    return 0;
  });

  const selectedPairData = MARKET_PAIRS.find((p) => p.symbol === selectedPair)!;

  const pairMenuItems = [
    {
      label: watchlist.has(selectedPair) ? "Remove from Watchlist" : "Add to Watchlist",
      onClick: () => toggleWatchlist(selectedPair),
    },
    {
      label: "Set Price Alert",
      onClick: () => setPriceAlert(selectedPair, selectedPairData.price),
    },
  ];

  const tableMenuItems = [
    { label: "Export Pairs CSV", onClick: exportPairsCSV },
    {
      label: sortBy === "volume" ? "✓ Sort by Volume" : "Sort by Volume",
      onClick: () => setSortBy((s) => (s === "volume" ? "default" : "volume")),
    },
    {
      label: sortBy === "change" ? "✓ Sort by 24h Change" : "Sort by 24h Change",
      onClick: () => setSortBy((s) => (s === "change" ? "default" : "change")),
    },
  ];

  return (
    <div className="min-h-full bg-background p-4 md:p-6 lg:p-8">
      {notify && (
        <div className="fixed top-4 right-4 z-50 bg-primary text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          {notify}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Market Explorer
        </h1>
        <p className="text-muted-foreground">
          Real-time cryptocurrency market data and analysis
        </p>
      </div>

      {/* Chart + Pair Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
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

        <Widget title="Pair Details" menuItems={pairMenuItems}>
          <div className="space-y-5">
            {/* Price */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {selectedPairData.symbol}
              </p>
              <h3 className="text-3xl font-bold font-mono text-foreground">
                ${selectedPairData.price.toLocaleString()}
              </h3>
              <p
                className={`text-sm font-semibold flex items-center gap-1 mt-1 ${
                  selectedPairData.change >= 0 ? "text-success" : "text-danger"
                }`}
              >
                {selectedPairData.change >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {selectedPairData.change >= 0 ? "+" : ""}
                {selectedPairData.change}% (24h)
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "24h Volume", value: selectedPairData.volume },
                { label: "Market Cap",  value: selectedPairData.mcap  },
                { label: "High 24h",    value: `$${(selectedPairData.price * 1.025).toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
                { label: "Low 24h",     value: `$${(selectedPairData.price * 0.971).toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-secondary/40 rounded-lg p-3 border border-border/50"
                >
                  <p className="text-xs text-muted-foreground mb-1">
                    {item.label}
                  </p>
                  <p className="font-mono font-semibold text-sm text-foreground">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Watchlist + Alert buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => toggleWatchlist(selectedPair)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                  watchlist.has(selectedPair)
                    ? "border-warning/60 text-warning bg-warning/10"
                    : "border-border/50 text-muted-foreground hover:border-warning/40 hover:text-warning"
                }`}
                data-testid="button-watchlist"
              >
                <Star className={`w-3.5 h-3.5 ${watchlist.has(selectedPair) ? "fill-warning" : ""}`} />
                {watchlist.has(selectedPair) ? "Watching" : "Watchlist"}
              </button>
              <button
                onClick={() => setPriceAlert(selectedPair, selectedPairData.price)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold border border-border/50 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
                data-testid="button-alert"
              >
                <Bell className="w-3.5 h-3.5" />
                Set Alert
              </button>
            </div>

            {/* Buy / Sell */}
            <div className="flex gap-2">
              <button
                onClick={() => handleTrade("BUY", selectedPair, selectedPairData.price)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold bg-success/20 text-success border border-success/30 hover:bg-success/30 transition-colors"
                data-testid="button-buy"
              >
                <ShoppingCart className="w-4 h-4" />
                Buy
              </button>
              <button
                onClick={() => handleTrade("SELL", selectedPair, selectedPairData.price)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold bg-danger/20 text-danger border border-danger/30 hover:bg-danger/30 transition-colors"
                data-testid="button-sell"
              >
                <ArrowDownCircle className="w-4 h-4" />
                Sell
              </button>
            </div>
          </div>
        </Widget>
      </div>

      {/* Trading Pairs Table */}
      <Widget
        title="Trading Pairs"
        menuItems={tableMenuItems}
        onExport={exportPairsCSV}
        noPadding
      >
        {/* Search + filter bar */}
        <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search pairs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-secondary/50 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              data-testid="input-search"
            />
          </div>
          <div className="flex gap-2">
            {(["default", "volume", "change"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  sortBy === s
                    ? "border-primary/60 text-primary bg-primary/10"
                    : "border-border/50 text-muted-foreground hover:border-primary/30"
                }`}
                data-testid={`button-sort-${s}`}
              >
                {s === "default" ? "Default" : s === "volume" ? "Volume" : "24h Change"}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-secondary/50">
              <tr>
                {["Pair", "Price", "24h Change", "Volume", "Mkt Cap", "Actions"].map((h, i) => (
                  <th
                    key={h}
                    className={`py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider ${
                      i === 0 ? "" : i < 5 ? "text-right" : "text-center"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {displayPairs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground text-sm">
                    No pairs match your search
                  </td>
                </tr>
              ) : (
                displayPairs.map((pair) => {
                  const isPositive = pair.change >= 0;
                  const isSelected = pair.symbol === selectedPair;
                  const isWatched = watchlist.has(pair.symbol);

                  return (
                    <tr
                      key={pair.symbol}
                      onClick={() => setSelectedPair(pair.symbol)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-primary/10 border-l-2 border-l-primary"
                          : "hover:bg-secondary/30"
                      }`}
                      data-testid={`row-pair-${pair.symbol}`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWatchlist(pair.symbol);
                            }}
                            className={`transition-colors ${
                              isWatched
                                ? "text-warning"
                                : "text-muted-foreground hover:text-warning"
                            }`}
                            data-testid={`button-star-${pair.symbol}`}
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${isWatched ? "fill-warning" : ""}`}
                            />
                          </button>
                          <span className="font-bold text-sm text-foreground">
                            {pair.symbol}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-sm text-foreground">
                        ${pair.price.toLocaleString(undefined, {
                          minimumFractionDigits: pair.price < 1 ? 4 : 2,
                          maximumFractionDigits: pair.price < 1 ? 4 : 2,
                        })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1 text-sm font-semibold ${
                            isPositive ? "text-success" : "text-danger"
                          }`}
                        >
                          {isPositive ? (
                            <TrendingUp className="w-3.5 h-3.5" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5" />
                          )}
                          {isPositive ? "+" : ""}
                          {pair.change}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-muted-foreground font-mono">
                        {pair.volume}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-muted-foreground font-mono">
                        {pair.mcap}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTrade("BUY", pair.symbol, pair.price);
                            }}
                            className="px-2.5 py-1 rounded text-xs font-bold bg-success/20 text-success border border-success/30 hover:bg-success/30 transition-colors"
                            data-testid={`button-buy-${pair.symbol}`}
                          >
                            Buy
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTrade("SELL", pair.symbol, pair.price);
                            }}
                            className="px-2.5 py-1 rounded text-xs font-bold bg-danger/20 text-danger border border-danger/30 hover:bg-danger/30 transition-colors"
                            data-testid={`button-sell-${pair.symbol}`}
                          >
                            Sell
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPriceAlert(pair.symbol, pair.price);
                            }}
                            className="p-1 rounded text-muted-foreground hover:text-primary transition-colors"
                            data-testid={`button-alert-${pair.symbol}`}
                          >
                            <Bell className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Widget>
    </div>
  );
}
