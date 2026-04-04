import React, { useState } from "react";
import { format } from "date-fns";
import { CheckCircle, Activity, ChevronDown, ChevronUp } from "lucide-react";
import { Widget } from "@/components/Widget";
import { useSignals } from "@/hooks/use-signals";
import type { Signal } from "@shared/schema";
import { downloadCSV } from "@/lib/csv";

type EnrichedSignal = Signal & {
  confidence: number;
  confidence_breakdown: { technical: number; sentiment: number; macro: number };
  explanation: {
    technical_factors: string[];
    sentiment_factors: string[];
    macro_factors: string[];
    summary: string;
  };
  scenarios: { bullish: string; bearish: string; sideways: string };
};

function getScoreColor(score: number) {
  if (score > 85) return "hsl(var(--success))";
  if (score > 70) return "hsl(var(--warning))";
  return "hsl(var(--destructive))";
}

function getScoreLabel(score: number) {
  if (score > 85) return "High";
  if (score > 70) return "Medium";
  return "Low";
}

export default function Signals() {
  const { data: rawSignals, isLoading, refetch } = useSignals(undefined, 50);
  const signals = rawSignals as EnrichedSignal[] | undefined;
  const [typeFilter, setTypeFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState(0);

  const filteredSignals =
    signals?.filter((sig) => {
      const typeMatch = typeFilter === "all" || sig.type === typeFilter;
      const scoreMatch = sig.aiScore >= scoreFilter;
      return typeMatch && scoreMatch;
    }) || [];

  const stats = {
    total: signals?.length || 0,
    buy: signals?.filter((s) => s.type === "BUY").length || 0,
    sell: signals?.filter((s) => s.type === "SELL").length || 0,
    hold: signals?.filter((s) => s.type === "HOLD").length || 0,
    avgScore: signals?.length
      ? Math.round(signals.reduce((a, s) => a + s.aiScore, 0) / signals.length)
      : 0,
  };

  const menuItems = [
    { label: "Refresh Feed", onClick: () => refetch() },
    {
      label: "Export Signals",
      onClick: () => alert("Exporting signals data..."),
    },
    {
      label: "Clear Filters",
      onClick: () => {
        setTypeFilter("all");
        setScoreFilter(0);
      },
    },
  ];

  return (
    <div className="min-h-full bg-background p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Advanced Signals
        </h1>
        <p className="text-muted-foreground">
          AI-powered trading signals with confidence scoring
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatsCard label="Total Signals" value={stats.total} color="default" />
        <StatsCard label="Buy Signals" value={stats.buy} color="success" />
        <StatsCard label="Sell Signals" value={stats.sell} color="danger" />
        <StatsCard
          label="Avg AI Score"
          value={`${stats.avgScore}%`}
          color="warning"
        />
      </div>

      {/* Filters + Feed */}
      <Widget
        title="Signal Analysis"
        menuItems={menuItems}
        onRefresh={() => refetch()}
      >
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase">
                Signal Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 bg-secondary/50 border border-border/50 rounded-lg text-foreground focus:outline-none focus:border-primary/50 text-sm"
              >
                <option value="all">All Signals</option>
                <option value="BUY">Buy Only</option>
                <option value="SELL">Sell Only</option>
                <option value="HOLD">Hold Only</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase">
                Min AI Score:{" "}
                <span className="text-foreground">{scoreFilter}</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={scoreFilter}
                onChange={(e) => setScoreFilter(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>

          <div className="border-t border-border/50 pt-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Signal Feed
              <span className="ml-2 text-xs text-muted-foreground font-normal">
                ({filteredSignals.length} results)
              </span>
            </h3>

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading signals...
              </div>
            ) : filteredSignals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
                <Activity className="w-8 h-8 opacity-20" />
                <p>No signals match your filters</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto no-scrollbar">
                {filteredSignals.map((sig) => {
                  const isBuy = sig.type === "BUY";
                  const isHold = sig.type === "HOLD";
                  return (
                    <div
                      key={sig.id}
                      className="bg-secondary/30 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span
                            className="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider"
                            style={{
                              backgroundColor: isBuy
                                ? "hsl(var(--success) / 0.2)"
                                : isHold
                                  ? "hsl(var(--warning) / 0.2)"
                                  : "hsl(var(--destructive) / 0.2)",
                              color: isBuy
                                ? "hsl(var(--success))"
                                : isHold
                                  ? "hsl(var(--warning))"
                                  : "hsl(var(--destructive))",
                            }}
                          >
                            {sig.type}
                          </span>
                          <span className="font-bold text-sm text-foreground">
                            {sig.symbol}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border/50">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Price
                            </p>
                            <p className="font-mono font-bold text-foreground text-sm">
                              ${parseFloat(sig.price).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              AI Score
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${sig.aiScore}%`,
                                    backgroundColor: getScoreColor(sig.aiScore),
                                  }}
                                />
                              </div>
                              <span className="text-xs font-bold text-foreground">
                                {sig.aiScore}
                              </span>
                            </div>
                            <p
                              className="text-xs mt-0.5"
                              style={{ color: getScoreColor(sig.aiScore) }}
                            >
                              {getScoreLabel(sig.aiScore)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Action
                            </p>
                            <button
                              onClick={() =>
                                alert(
                                  `Executing ${sig.type} order for ${sig.symbol} at $${sig.price}`,
                                )
                              }
                              className="flex items-center gap-1 text-xs px-2 py-1 bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Execute
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Widget>
    </div>
  );
}

function StatsCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: "default" | "success" | "danger" | "warning";
}) {
  const colorStyles: Record<
    string,
    { border: string; bg: string; text: string }
  > = {
    default: {
      border: "border-border/50",
      bg: "bg-secondary/30",
      text: "text-foreground",
    },
    success: {
      border: "border-success/30",
      bg: "bg-success/5",
      text: "text-success",
    },
    danger: {
      border: "border-danger/30",
      bg: "bg-danger/5",
      text: "text-danger",
    },
    warning: {
      border: "border-warning/30",
      bg: "bg-warning/5",
      text: "text-warning",
    },
  };
  const c = colorStyles[color];
  return (
    <div className={`p-4 rounded-lg border ${c.border} ${c.bg}`}>
      <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
        {label}
      </p>
      <p className={`text-2xl font-bold font-mono ${c.text}`}>{value}</p>
    </div>
  );
}
