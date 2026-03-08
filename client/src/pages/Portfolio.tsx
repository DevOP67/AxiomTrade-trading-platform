import React, { useState } from "react";
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { Widget } from "@/components/Widget";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { usePortfolio } from "@/hooks/use-portfolio";

export default function Portfolio() {
  const { data: portfolioData, isLoading } = usePortfolio();
  const [viewType, setViewType] = useState("table");

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto bg-background p-4 md:p-6 lg:p-8 no-scrollbar">
        <div className="text-center py-8 text-muted-foreground">Loading portfolio...</div>
      </div>
    );
  }

  const portfolio = portfolioData?.portfolio;
  const positions = portfolioData?.positions || [];

  // Calculate portfolio composition
  const totalValue = parseFloat(portfolio?.balance || "0");
  const positionData = positions.map(pos => ({
    name: pos.symbol,
    value: parseFloat(pos.amount) * parseFloat(pos.entryPrice),
    amount: parseFloat(pos.amount),
    entryPrice: parseFloat(pos.entryPrice),
  }));

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

  // Mock allocation data
  const allocationData = [
    { name: 'Cryptocurrency', value: 65 },
    { name: 'Cash Reserve', value: 20 },
    { name: 'Staking', value: 10 },
    { name: 'Pending', value: 5 }
  ];

  // Mock performance data
  const performanceData = [
    { month: 'Jan', value: 85000, profit: 0 },
    { month: 'Feb', value: 92000, profit: 7000 },
    { month: 'Mar', value: 105000, profit: 13000 },
    { month: 'Apr', value: 98000, profit: -7000 },
    { month: 'May', value: 115000, profit: 17000 },
    { month: 'Jun', value: 124532, profit: 9532 }
  ];

  return (
    <div className="flex-1 overflow-auto bg-background p-4 md:p-6 lg:p-8 no-scrollbar">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Portfolio Analytics</h1>
        <p className="text-muted-foreground">Comprehensive portfolio overview and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard 
          label="Total Balance" 
          value={`$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          change="+2.4%"
          isPositive={true}
        />
        <MetricCard 
          label="24h P&L" 
          value="+$2,943.50"
          change="+1.2%"
          isPositive={true}
        />
        <MetricCard 
          label="Positions" 
          value={positions.length.toString()}
          subtitle="Active trades"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Portfolio Composition */}
        <Widget title="Portfolio Allocation">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </Widget>

        {/* Position Breakdown */}
        <div className="lg:col-span-2">
          <Widget title="Asset Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={positionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  formatter={(value) => `$${value.toLocaleString()}`}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Widget>
        </div>
      </div>

      {/* Performance Chart */}
      <Widget title="Monthly Performance">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              formatter={(value) => `$${value.toLocaleString()}`}
            />
            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Widget>

      {/* Positions Table */}
      <Widget title="Open Positions">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary/50">
              <tr>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Asset</th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase text-right">Amount</th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase text-right">Entry Price</th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase text-right">Current Value</th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase text-right">P&L</th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {positions.map((pos, i) => {
                const currentMockPrice = pos.entryPrice ? parseFloat(pos.entryPrice) * (1 + (Math.random() * 0.1 - 0.04)) : 0;
                const currentValue = (parseFloat(pos.amount) * currentMockPrice).toLocaleString(undefined, { minimumFractionDigits: 2 });
                const totalCost = parseFloat(pos.amount) * parseFloat(pos.entryPrice);
                const pnl = currentMockPrice * parseFloat(pos.amount) - totalCost;
                const pnlPct = (pnl / totalCost) * 100;
                const isProfit = pnl >= 0;

                return (
                  <tr key={pos.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-4 font-semibold text-foreground">{pos.symbol}</td>
                    <td className="py-4 px-4 text-right font-mono text-foreground">{parseFloat(pos.amount).toLocaleString()}</td>
                    <td className="py-4 px-4 text-right font-mono text-foreground">${parseFloat(pos.entryPrice).toLocaleString()}</td>
                    <td className="py-4 px-4 text-right font-mono text-foreground">${currentValue}</td>
                    <td className={`py-4 px-4 text-right font-mono font-semibold ${isProfit ? 'text-success' : 'text-danger'}`}>
                      {isProfit ? '+' : ''}${pnl.toFixed(2)} ({pnlPct.toFixed(2)}%)
                    </td>
                    <td className="py-4 px-4">
                      <button className="text-xs px-2 py-1 bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors">
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

function MetricCard({ label, value, change, isPositive, subtitle }: any) {
  return (
    <div className="p-4 bg-card rounded-lg border border-border/50 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground uppercase mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold font-mono text-foreground">{value}</span>
        {change && (
          <span className={`text-xs font-semibold flex items-center gap-1 ${isPositive ? 'text-success' : 'text-danger'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>}
    </div>
  );
}
