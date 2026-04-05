import { useState } from "react";
import { TrendingUp, TrendingDown, X } from "lucide-react";
import { Widget } from "@/components/Widget";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { usePortfolio } from "@/hooks/use-portfolio";
import { downloadCSV } from "@/lib/csv";

const ALLOCATION_DATA = [
  { name: "Crypto", value: 65 },
  { name: "Cash Reserve", value: 20 },
  { name: "Staking", value: 10 },
  { name: "Pending", value: 5 },
];

const PERFORMANCE_DATA = [
  { month: "Oct", value: 85000 },
  { month: "Nov", value: 92000 },
  { month: "Dec", value: 105000 },
  { month: "Jan", value: 98000 },
  { month: "Feb", value: 115000 },
  { month: "Mar", value: 124532 },
];

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
];

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    color: "hsl(var(--foreground))",
    fontSize: "12px",
  },
};

function getPnl(id: number) {
  return (((id * 7 + 13) % 11) - 5) * 0.01;
}

function MetricCard({
  label,
  value,
  change,
  isPositive,
  subtitle,
}: {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
}) {
  return (
    <div
      className="rounded-xl border border-border/50 bg-secondary/30 p-5 flex flex-col gap-1"
      data-testid={`metric-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
        {label}
      </p>
      <p className="text-2xl font-bold font-mono text-foreground">{value}</p>
      {change && (
        <p
          className={`text-xs font-semibold flex items-center gap-1 ${isPositive ? "text-success" : "text-danger"}`}
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {change}
        </p>
      )}
      {subtitle && (
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}

export default function Portfolio() {
  const { data: portfolioData, isLoading, refetch } = usePortfolio();
  const [closedIds, setClosedIds] = useState<Set<number>>(new Set());
  const [notify, setNotify] = useState<string | null>(null);

  function showNotify(msg: string) {
    setNotify(msg);
    setTimeout(() => setNotify(null), 3000);
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">
          Loading portfolio...
        </div>
      </div>
    );
  }

  const portfolio = portfolioData?.portfolio;
  const allPositions = portfolioData?.positions || [];
  const positions = allPositions.filter((p) => !closedIds.has(p.id));
  const totalValue = parseFloat(portfolio?.balance || "0");

  const positionData = positions.map((pos) => ({
    name: pos.symbol,
    value: parseFloat(pos.amount) * parseFloat(pos.entryPrice),
  }));

  function exportPositionsCSV() {
    downloadCSV(
      "portfolio_positions.csv",
      ["Symbol", "Amount", "Entry Price", "Current Value", "P&L %"],
      positions.map((pos) => {
        const pnlPct = getPnl(pos.id) * 100;
        const entryPrice = parseFloat(pos.entryPrice);
        const amount = parseFloat(pos.amount);
        const val = amount * entryPrice * (1 + getPnl(pos.id));
        return [
          pos.symbol,
          amount.toFixed(4),
          entryPrice.toLocaleString(),
          val.toFixed(2),
          `${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(2)}%`,
        ];
      }),
    );
  }

  function exportAllocationCSV() {
    downloadCSV(
      "portfolio_allocation.csv",
      ["Category", "Allocation %"],
      ALLOCATION_DATA.map((d) => [d.name, d.value]),
    );
  }

  function exportPerformanceCSV() {
    downloadCSV(
      "monthly_performance.csv",
      ["Month", "Portfolio Value"],
      PERFORMANCE_DATA.map((d) => [d.month, d.value]),
    );
  }

  function handleClose(id: number, symbol: string) {
    if (!window.confirm(`Close position for ${symbol}?`)) return;
    setClosedIds((prev) => new Set([...prev, id]));
    showNotify(`${symbol} position closed`);
  }

  const renderLegend = () => (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
      {ALLOCATION_DATA.map((entry, i) => (
        <div key={entry.name} className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
          />
          <span className="text-xs text-muted-foreground">
            {entry.name} ({entry.value}%)
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-full bg-background p-4 md:p-6 lg:p-8">
      {notify && (
        <div className="fixed top-4 right-4 z-50 bg-success text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          {notify}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Portfolio Analytics
        </h1>
        <p className="text-muted-foreground">
          Comprehensive portfolio overview and performance metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard
          label="Total Balance"
          value={`$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          change="+2.4%"
          isPositive
        />
        <MetricCard
          label="24h P&L"
          value="+$2,943.50"
          change="+1.2%"
          isPositive
        />
        <MetricCard
          label="Positions"
          value={positions.length.toString()}
          subtitle="Active trades"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Widget
          title="Portfolio Allocation"
          onExport={exportAllocationCSV}
          menuItems={[
            { label: "Export as CSV", onClick: exportAllocationCSV },
            { label: "Refresh Data", onClick: () => refetch() },
          ]}
          overflowVisible
        >
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={ALLOCATION_DATA}
                cx="50%"
                cy="50%"
                outerRadius={85}
                innerRadius={42}
                dataKey="value"
                paddingAngle={3}
                strokeWidth={0}
              >
                {ALLOCATION_DATA.map((_, i) => (
                  <Cell
                    key={i}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                {...tooltipStyle}
                formatter={(v) => [`${v}%`, "Allocation"]}
                wrapperStyle={{ zIndex: 50 }}
                cursor={false}
              />
            </PieChart>
          </ResponsiveContainer>
          {renderLegend()}
        </Widget>

        <div className="lg:col-span-2">
          <Widget
            title="Asset Distribution"
            className="h-full"
            menuItems={[
              { label: "Export as CSV", onClick: exportPositionsCSV },
              { label: "Refresh Data", onClick: () => refetch() },
            ]}
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={
                  positionData.length
                    ? positionData
                    : [{ name: "No Data", value: 0 }]
                }
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(v: any) => [
                    `$${Number(v).toLocaleString()}`,
                    "Value",
                  ]}
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                />
                <Bar
                  dataKey="value"
                  fill="hsl(var(--primary))"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Widget>
        </div>
      </div>

      {/* Monthly Performance */}
      <Widget
        title="Monthly Performance"
        className="mb-6"
        onExport={exportPerformanceCSV}
        menuItems={[
          { label: "Export as CSV", onClick: exportPerformanceCSV },
          { label: "Refresh Data", onClick: () => refetch() },
          { label: "Print Report", onClick: () => window.print() },
        ]}
      >
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={PERFORMANCE_DATA}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 11 }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              {...tooltipStyle}
              formatter={(v: any) => [
                `$${Number(v).toLocaleString()}`,
                "Portfolio Value",
              ]}
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {PERFORMANCE_DATA.map((_, i) => (
                <Cell
                  key={i}
                  fill={
                    i === PERFORMANCE_DATA.length - 1
                      ? "hsl(var(--primary))"
                      : "rgba(148,163,184,0.25)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Widget>

      {/* Open Positions */}
      <Widget
        title="Open Positions"
        onExport={exportPositionsCSV}
        menuItems={[
          { label: "Export as CSV", onClick: exportPositionsCSV },
          { label: "Refresh Data", onClick: () => refetch() },
        ]}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-secondary/50">
              <tr>
                {["Asset", "Amount", "Entry Price", "Current Value", "P&L", "Action"].map(
                  (h, i) => (
                    <th
                      key={h}
                      className={`py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider ${
                        i > 0 && i < 5 ? "text-right" : ""
                      }`}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-sm font-mono">
              {positions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground text-sm font-sans"
                  >
                    No open positions
                  </td>
                </tr>
              ) : (
                positions.map((pos) => {
                  const pnlFrac = getPnl(pos.id);
                  const entryPrice = parseFloat(pos.entryPrice);
                  const amount = parseFloat(pos.amount);
                  const currentPrice = entryPrice * (1 + pnlFrac);
                  const currentValue = amount * currentPrice;
                  const pnlPct = pnlFrac * 100;
                  const pnlDollar = amount * (currentPrice - entryPrice);
                  const isProfit = pnlFrac >= 0;

                  return (
                    <tr
                      key={pos.id}
                      className="hover:bg-secondary/30 transition-colors"
                      data-testid={`row-position-${pos.id}`}
                    >
                      <td className="py-3 px-4 font-bold font-sans text-foreground">
                        {pos.symbol}
                      </td>
                      <td className="py-3 px-4 text-right text-muted-foreground">
                        {amount.toFixed(4)}
                      </td>
                      <td className="py-3 px-4 text-right text-foreground">
                        ${entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right text-foreground">
                        ${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-semibold ${isProfit ? "text-success" : "text-danger"}`}
                      >
                        <div>
                          {isProfit ? "+" : ""}
                          {pnlPct.toFixed(2)}%
                        </div>
                        <div className="text-xs opacity-75">
                          {isProfit ? "+" : ""}${pnlDollar.toFixed(2)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleClose(pos.id, pos.symbol)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold border border-danger/40 text-danger hover:bg-danger/10 transition-colors"
                          data-testid={`button-close-${pos.id}`}
                        >
                          <X className="w-3 h-3" />
                          Close
                        </button>
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
