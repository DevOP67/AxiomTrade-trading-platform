import { useQuery } from "@tanstack/react-query";

export interface BinanceTicker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  priceChange: string;
  quoteVolume: string;
  volume: string;
  highPrice: string;
  lowPrice: string;
}

export function useMarketTickers() {
  return useQuery<BinanceTicker[]>({
    queryKey: ["/api/market/tickers"],
    queryFn: async () => {
      const res = await fetch("/api/market/tickers", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch market data");
      return res.json();
    },
    refetchInterval: 10000,
    staleTime: 5000,
    retry: 2,
  });
}
