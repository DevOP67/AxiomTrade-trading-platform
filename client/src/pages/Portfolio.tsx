import React, { useState } from "react";
import { TrendingUp, TrendingDown, CheckCircle } from "lucide-react";
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
  const positions = portfolioData?.positions || [];
  const totalValue = parseFloat(portfolio?.balance || "0");

  const positionData = positions.map((pos) => ({
    name: pos.symbol,
    value: parseFloat(pos.amount) * parseFloat(pos.entryPrice),
    amount: parseFloat(pos.amount),
    entryPrice: parseFloat(pos.entryPrice),
  }));

  function exportPositionsCSV() {
    downloadCSV(
      "portfolio_positions.csv",
      ["Symbol", "Amount", "Entry Price", "Current Value", "P&L %"],
      positions.map((pos, i) => {
        const pnlPct = (((i * 7 + 13) % 11) - 5) * 1;
        const val = parseFloat(pos.amount) * parseFloat(pos.entryPrice);
        return [
          pos.symbol,
          pos.amount,
          pos.entryPrice,
          val.toFixed(2),
          `${pnlPct.toFixed(2)}%`,
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

  const commonMenuItems = [
    {
      label: "Export as CSV",
      onClick: () => alert("Exporting portfolio data..."),
    },
    { label: "Refresh Data", onClick: () => refetch() },
    { label: "Print Report", onClick: () => window.print() },
  ];

  return (
    <div className="min-h-full bg-background p-4 md:p-6 lg:p-8">
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
          value={`$${totalValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}`}
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
          menuItems={commonMenuItems}
          overflowVisible
          onExport={exportAllocationCSV}
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
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
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
        </Widget>

        <div className="lg:col-span-2">
          <Widget
            title="Asset Distribution"
            menuItems={commonMenuItems}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height={280}>
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
                  formatter={(v: any) => `$${Number(v).toLocaleString()}`}
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
        menuItems={commonMenuItems}
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
              formatter={(v: any) => `$${Number(v).toLocaleString()}`}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {PERFORMANCE_DATA.map((_, i) => (
                <Cell
                  key={i}
                  fill={
                    i === PERFORMANCE_DATA.length - 1
                      ? "hsl(var(--primary))"
                      : "hsl(var(--secondary))"
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
        menuItems={commonMenuItems}
        onExport={exportPositionsCSV}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary/50">
              <tr>
                {[
                  "Asset",
                  "Amount",
                  "Entry Price",
                  "Current Value",
                  "P&L",
                  "Action",
                ].map((h, i) => (
                  <th
                    key={h}
                    className={`py-3 px-4 text-xs font-semibold text-muted-foreground uppercase ${
                      i === 0 || i === 5 ? "" : "text-right"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {positions.map((pos) => {
                const currentPrice =
                  parseFloat(pos.entryPrice) *
                  (1 + (Math.random() * 0.08 - 0.03));
                const totalCost =
                  parseFloat(pos.amount) * parseFloat(pos.entryPrice);
                const currentVal = parseFloat(pos.amount) * currentPrice;
                const pnl = currentVal - totalCost;
                const pnlPct = (pnl / totalCost) * 100;
                const isProfit = pnl >= 0;

                return (
                  <tr key={pos.id}>
                    <td>{pos.symbol}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Widget>
    </div>
  );
}

function MetricCard({ label, value, change, isPositive, subtitle }: any) {
  return <div>{label}</div>;
}
