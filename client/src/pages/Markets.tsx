import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Search,
  RefreshCw,
  Star,
  Bell,
  CheckCircle,
} from "lucide-react";
import { Widget } from "@/components/Widget";
import { MarketChart } from "@/components/MarketChart";
import { useMarketTickers } from "@/hooks/use-market";
import { downloadCSV } from "@/lib/csv";

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

function formatVolume(quoteVol: string): string {
  const v = parseFloat(quoteVol);
  if (v >= 1e12) return (v / 1e12).toFixed(1) + "T";
  if (v >= 1e9) return (v / 1e9).toFixed(1) + "B";
  if (v >= 1e6) return (v / 1e6).toFixed(1) + "M";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState<"default" | "volume" | "change">(
    "default",
  );
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [notify, setNotify] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("qf_watchlist") || "[]"));
    } catch {
      return new Set();
    }
  });

  const filteredPairs = MARKET_PAIRS.filter((pair) => {
    const matchesSearch = pair.symbol
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterBy === "all" ||
      (filterBy === "active" ? pair.active : !pair.active);
    return matchesSearch && matchesFilter;
  });

  const displayPairs = [...filteredPairs].sort((a, b) => {
    if (sortBy === "volume")
      return parseVolume(b.volume) - parseVolume(a.volume);
    if (sortBy === "change") return b.change - a.change;
    return 0;
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
              </div>
            </div>
          </Widget>
        )}
      </div>
    </div>
  );
}
