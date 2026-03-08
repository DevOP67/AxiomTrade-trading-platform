import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useStrategies() {
  return useQuery({
    queryKey: [api.strategies.list.path],
    queryFn: async () => {
      const res = await fetch(api.strategies.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch strategies");
      return api.strategies.list.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateStrategy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number; isActive?: boolean; parameters?: Record<string, any> }) => {
      const url = buildUrl(api.strategies.update.path, { id });
      const validated = api.strategies.update.input.parse(updates);
      
      const res = await fetch(url, {
        method: api.strategies.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to update strategy");
      return api.strategies.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.strategies.list.path] });
    },
  });
}
