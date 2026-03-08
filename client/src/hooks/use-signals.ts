import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type SignalResponse } from "@shared/routes";

export function useSignals(symbol?: string, limit: number = 50) {
  return useQuery({
    queryKey: [api.signals.list.path, symbol, limit],
    queryFn: async () => {
      const url = new URL(api.signals.list.path, window.location.origin);
      if (symbol) url.searchParams.append("symbol", symbol);
      if (limit) url.searchParams.append("limit", limit.toString());
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch signals");
      return api.signals.list.responses[200].parse(await res.json());
    },
    // Refetch frequently to simulate live dashboard if we aren't mutating locally
    refetchInterval: 5000, 
  });
}

export function useCreateSignal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { symbol: string; type: string; strategyId: number; price: string; aiScore: number }) => {
      const validated = api.signals.create.input.parse(data);
      const res = await fetch(api.signals.create.path, {
        method: api.signals.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to create signal");
      return api.signals.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.signals.list.path] });
    },
  });
}
