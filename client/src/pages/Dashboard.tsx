import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Activity, TrendingUp, TrendingDown, BrainCircuit } from "lucide-react";
import { Widget } from "@/components/Widget";
import { MarketChart } from "@/components/MarketChart";
import { Switch } from "@/components/Switch";
import { useStrategies, useUpdateStrategy } from "@/hooks/use-strategies";
import { useSignals, useCreateSignal } from "@/hooks/use-signals";
import { usePortfolio } from "@/hooks/use-portfolio";

export default function Dashboard() {
  const { data: strategies, isLoading: stratLoading } = useStrategies();
  const {
    data: signals,
    isLoading: sigLoading,
    refetch: refetchSignals,
  } = useSignals(undefined, 20);
  const { data: portfolioData, isLoading: portLoading } = usePortfolio();
  const updateStrategy = useUpdateStrategy();
  const createSignal = useCreateSignal();

  useEffect(() => {
    if (!strategies || strategies.length === 0) return;
    const activeStrategies = strategies.filter((s) => s.isActive);
    if (activeStrategies.length === 0) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.9) {
        const strat =
          activeStrategies[Math.floor(Math.random() * activeStrategies.length)];
        const symbols = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "AVAX/USDT"];
        const isBuy = Math.random() > 0.5;
        const basePrice = isBuy ? 64000 : 64500;
        createSignal.mutate({
          symbol: symbols[Math.floor(Math.random() * symbols.length)],
          type: isBuy ? "BUY" : "SELL",
          strategyId: strat.id,
          price: (basePrice + (Math.random() * 200 - 100)).toFixed(2),
          aiScore: Math.floor(Math.random() * 30) + 70,
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [strategies]);

  function getScoreColor(score: number): string {
    if (score > 85) return "hsl(var(--success))";
    if (score > 70) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  }

  return (
    <div className="min-h-full bg-background p-4 md:p-6 lg:p-8">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Portfolio Value"
          value="$124,532.00"
          change="+2.4%"
          isPositive={true}
        />
        <StatCard
          title="24h PnL"
          value="+$2,943.50"
          change="+1.2%"
          isPositive={true}
        />
        <StatCard
          title="Active Positions"
          value="8"
          subtitle="Using 45% margin"
        />
        <StatCard
          title="AI Confidence"
          value="High"
          subtitle="Signals aligned with models"
          highlight
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Left: Chart + Tables */}
        <div className="lg:col-span-2 xl:col-span-3 flex flex-col gap-6">
          <Widget
            title="BTC/USDT — AI Model Beta-1"
            className="h-[400px]"
            onRefresh={() => {}}
          >
            <MarketChart
              symbol="BTC/USDT"
              color="hsl(var(--primary))"
              dataPoints={100}
            />
          </Widget>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Widget title="Open Positions" className="h-[300px]" noPadding>
              <div className="overflow-auto h-full">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-secondary/50 sticky top-0">
                    <tr>
                      {["Asset", "Size", "Entry", "PnL"].map((h) => (
                        <th
                          key={h}
                          className="py-3 px-4 text-xs text-muted-foreground font-medium uppercase tracking-wider text-right first:text-left"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 font-mono text-sm">
                    {portLoading ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-4 text-center text-muted-foreground"
                        >
                          Loading...
                        </td>
                      </tr>
                    ) : (
                      portfolioData?.positions.map((pos) => {
                        const currentPrice =
                          parseFloat(pos.entryPrice) *
                          (1 + (Math.random() * 0.08 - 0.03));
                        const pnlPct =
                          (currentPrice / parseFloat(pos.entryPrice) - 1) * 100;
                        const isProfit = pnlPct >= 0;
                        return (
                          <tr
                            key={pos.id}
                            className="hover:bg-secondary/30 transition-colors"
                          >
                            <td className="py-3 px-4 font-bold font-sans">
                              {pos.symbol}
                            </td>
                            <td className="py-3 px-4 text-right text-muted-foreground">
                              {pos.amount}
                            </td>
                            <td className="py-3 px-4 text-right">
                              ${parseFloat(pos.entryPrice).toLocaleString()}
                            </td>
                            <td
                              className={`py-3 px-4 text-right ${isProfit ? "text-success" : "text-danger"}`}
                            >
                              {isProfit ? "+" : ""}
                              {pnlPct.toFixed(2)}%
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Widget>

            <Widget title="AI Strategy Engine" className="h-[300px]">
              <div className="flex flex-col gap-3 overflow-y-auto h-full">
                {stratLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-16 bg-secondary rounded-xl" />
                    ))}
                  </div>
                ) : (
                  strategies?.map((strat) => (
                    <div
                      key={strat.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border/50 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${strat.isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}
                        >
                          <BrainCircuit className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-xs text-foreground">
                            {strat.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[150px]">
                            {strat.description}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={strat.isActive || false}
                        onCheckedChange={(checked) =>
                          updateStrategy.mutate({
                            id: strat.id,
                            isActive: checked,
                          })
                        }
                        disabled={updateStrategy.isPending}
                      />
                    </div>
                  ))
                )}
              </div>
            </Widget>
          </div>
        </div>

        {/* Right: Signal Feed */}
        <div className="lg:col-span-1">
          <Widget
            title="Live Signal Feed"
            className="h-[500px] lg:h-[724px]"
            noPadding
            onRefresh={() => refetchSignals()}
            action={
              <span className="flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-1 rounded-md border border-success/20">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />{" "}
                Live
              </span>
            }
          >
            <div className="overflow-auto h-full flex flex-col no-scrollbar">
              {sigLoading ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  Connecting to AI engine...
                </div>
              ) : !signals?.length ? (
                <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                  <Activity className="w-8 h-8 opacity-20" />
                  <p className="text-sm">No signals yet</p>
                  <p className="text-xs">
                    Enable strategies to generate signals.
                  </p>
                </div>
              ) : (
                signals.map((sig, i) => {
                  const isBuy = sig.type === "BUY";
                  return (
                    <div
                      key={sig.id}
                      className={`p-4 border-b border-border/40 hover:bg-secondary/30 transition-colors ${i === 0 ? (isBuy ? "animate-flash-buy" : "animate-flash-sell") : ""}`}
                    >
                      ...
                    </div>
                  );
                })
              )}
            </div>
          </Widget>
        </div>
      </div>
    </div>
  );
}
