import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Widget } from "@/components/Widget";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { usePortfolio } from "@/hooks/use-portfolio";

const ALLOCATION_DATA = [
  { name: "Crypto",       value: 65 },
  { name: "Cash Reserve", value: 20 },
  { name: "Staking",      value: 10 },
  { name: "Pending",      value: 5  },
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

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">Loading portfolio...</div>
      </div>
    );
  }

  const portfolio  = portfolioData?.portfolio;
  const positions  = portfolioData?.positions || [];
  const totalValue = parseFloat(portfolio?.balance || "0");

  const positionData = positions.map((pos) => ({
    name:       pos.symbol,
    value:      parseFloat(pos.amount) * parseFloat(pos.entryPrice),
    amount:     parseFloat(pos.amount),
    entryPrice: parseFloat(pos.entryPrice),
  }));

  const commonMenuItems = [
    { label: "Export as CSV",  onClick: () => alert("Exporting portfolio data...") },
    { label: "Refresh Data",   onClick: () => refetch() },
    { label: "Print Report",   onClick: () => window.print() },
  ];

  return (
    <div className="flex-1 overflow-auto bg-background p-4 md:p-6 lg:p-8 no-scrollbar">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Portfolio Analytics</h1>
        <p className="text-muted-foreground">Comprehensive portfolio overview and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard label="Total Balance" value={`$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} change="+2.4%" isPositive />
        <MetricCard label="24h P&L"       value="+$2,943.50" change="+1.2%" isPositive />
        <MetricCard label="Positions"     value={positions.length.toString()} subtitle="Active trades" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Widget title="Portfolio Allocation" menuItems={commonMenuItems}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={ALLOCATION_DATA}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={({ name, value }) => `${name} ${value}%`}
                labelLine={false}
              >
                {ALLOCATION_DATA.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
        </Widget>

        <div className="lg:col-span-2">
          <Widget title="Asset Distribution" menuItems={commonMenuItems} className="h-full">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={positionData.length ? positionData : [{ name: "No Data", value: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip {...tooltipStyle} formatter={(v: any) => `$${Number(v).toLocaleString()}`} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Widget>
        </div>
      </div>

      {/* Monthly Performance */}
      <Widget title="Monthly Performance" className="mb-6" menuItems={commonMenuItems}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={PERFORMANCE_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
            <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip {...tooltipStyle} formatter={(v: any) => `$${Number(v).toLocaleString()}`} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {PERFORMANCE_DATA.map((_, i) => (
                <Cell key={i} fill={i === PERFORMANCE_DATA.length - 1 ? "hsl(var(--primary))" : "hsl(var(--secondary))"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Widget>

      {/* Open Positions */}
      <Widget title="Open Positions" menuItems={commonMenuItems}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary/50">
              <tr>
                {["Asset", "Amount", "Entry Price", "Current Value", "P&L", "Action"].map((h, i) => (
                  <th key={h} className={`py-3 px-4 text-xs font-semibold text-muted-foreground uppercase ${i === 0 || i === 5 ? "" : "text-right"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {positions.map((pos) => {
                const drift        = ((pos.id * 7 + 13) % 11 - 5) * 0.01;
                const currentPrice = parseFloat(pos.entryPrice) * (1 + drift);
                const totalCost    = parseFloat(pos.amount) * parseFloat(pos.entryPrice);
                const currentVal   = parseFloat(pos.amount) * currentPrice;
                const pnl          = currentVal - totalCost;
                const pnlPct       = (pnl / totalCost) * 100;
                const isProfit     = pnl >= 0;

                return (
                  <tr key={pos.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-foreground">{pos.symbol}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-foreground">{parseFloat(pos.amount).toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-foreground">${parseFloat(pos.entryPrice).toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-foreground">${currentVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className={`py-3.5 px-4 text-right font-mono font-semibold ${isProfit ? "text-success" : "text-danger"}`}>
                      {isProfit ? "+" : ""}${pnl.toFixed(2)} ({pnlPct.toFixed(2)}%)
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => alert(`Closing position: ${pos.symbol}`)}
                        className="text-xs px-2 py-1 bg-danger/10 text-danger rounded hover:bg-danger/20 transition-colors border border-danger/20"
                      >
                        Close
                      </button>
                    </td>
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

function MetricCard({ label, value, change, isPositive, subtitle }: {
  label: string; value: string; change?: string; isPositive?: boolean; subtitle?: string;
}) {
  return (
    <div className="p-4 bg-card rounded-lg border border-border/50 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground uppercase mb-2">{label}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-2xl font-bold font-mono text-foreground">{value}</span>
        {change && (
          <span className={`text-xs font-semibold inline-flex items-center gap-0.5 ${isPositive ? "text-success" : "text-danger"}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>}
    </div>
  );
}
