import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Play, Square, Activity, TrendingUp, TrendingDown, BrainCircuit } from "lucide-react";
import { Widget } from "@/components/Widget";
import { MarketChart } from "@/components/MarketChart";
import { Switch } from "@/components/Switch";
import { useStrategies, useUpdateStrategy } from "@/hooks/use-strategies";
import { useSignals, useCreateSignal } from "@/hooks/use-signals";
import { usePortfolio } from "@/hooks/use-portfolio";

export default function Dashboard() {
  const { data: strategies, isLoading: stratLoading } = useStrategies();
  const { data: signals, isLoading: sigLoading } = useSignals(undefined, 20);
  const { data: portfolioData, isLoading: portLoading } = usePortfolio();
  
  const updateStrategy = useUpdateStrategy();
  const createSignal = useCreateSignal();

  // Mock Live Signal Generation
  useEffect(() => {
    if (!strategies || strategies.length === 0) return;
    
    const activeStrategies = strategies.filter(s => s.isActive);
    if (activeStrategies.length === 0) return;

    const interval = setInterval(() => {
      // 10% chance to generate a signal every 3 seconds
      if (Math.random() > 0.9) {
        const strat = activeStrategies[Math.floor(Math.random() * activeStrategies.length)];
        const symbols = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "AVAX/USDT"];
        const isBuy = Math.random() > 0.5;
        const basePrice = isBuy ? 64000 : 64500;
        
        createSignal.mutate({
          symbol: symbols[Math.floor(Math.random() * symbols.length)],
          type: isBuy ? "BUY" : "SELL",
          strategyId: strat.id,
          price: (basePrice + (Math.random() * 100 - 50)).toFixed(2),
          aiScore: Math.floor(Math.random() * 30) + 70, // 70-100 score
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [strategies, createSignal]);

  return (
    <div className="flex-1 overflow-auto bg-background p-4 md:p-6 lg:p-8 no-scrollbar">
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Portfolio Value" value="$124,532.00" change="+2.4%" isPositive={true} />
        <StatCard title="24h PnL" value="+$2,943.50" change="+1.2%" isPositive={true} />
        <StatCard title="Active Positions" value="8" subtitle="Using 45% margin" />
        <StatCard title="AI Confidence" value="High" subtitle="Market aligns with models" highlight />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {/* Main Chart Area */}
        <div className="lg:col-span-2 xl:col-span-3 flex flex-col gap-6">
          <Widget title="BTC/USDT - AI Model Beta-1" className="h-[400px]">
            <MarketChart symbol="BTC/USDT" color="hsl(var(--primary))" dataPoints={100} />
          </Widget>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Widget title="Open Positions" className="h-[300px]" noPadding>
                <div className="overflow-auto h-full">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-secondary/50 sticky top-0 backdrop-blur-md">
                      <tr>
                        <th className="py-3 px-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">Asset</th>
                        <th className="py-3 px-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">Size</th>
                        <th className="py-3 px-4 text-xs text-muted-foreground font-medium uppercase tracking-wider text-right">Entry</th>
                        <th className="py-3 px-4 text-xs text-muted-foreground font-medium uppercase tracking-wider text-right">PnL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 font-mono text-sm">
                      {portLoading ? (
                        <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">Loading...</td></tr>
                      ) : portfolioData?.positions.map((pos, i) => {
                        // Mocking PnL calculation for visual effect
                        const currentMockPrice = parseFloat(pos.entryPrice) * (1 + (Math.random() * 0.1 - 0.04));
                        const pnlPct = ((currentMockPrice / parseFloat(pos.entryPrice)) - 1) * 100;
                        const isProfit = pnlPct >= 0;
                        
                        return (
                          <tr key={pos.id} className="hover:bg-secondary/30 transition-colors">
                            <td className="py-3 px-4 font-bold font-sans">{pos.symbol}</td>
                            <td className="py-3 px-4 text-muted-foreground">{pos.amount}</td>
                            <td className="py-3 px-4 text-right">${parseFloat(pos.entryPrice).toLocaleString()}</td>
                            <td className={`py-3 px-4 text-right ${isProfit ? 'text-success' : 'text-danger'}`}>
                              {isProfit ? '+' : ''}{pnlPct.toFixed(2)}%
                            </td>
                          </tr>
                        );
                      })}
                      {/* Fallback mock data if DB is empty */}
                      {!portfolioData?.positions?.length && (
                         <>
                          <tr className="hover:bg-secondary/30">
                            <td className="py-3 px-4 font-bold font-sans">ETH/USDT</td>
                            <td className="py-3 px-4 text-muted-foreground">12.5</td>
                            <td className="py-3 px-4 text-right">$3,420.50</td>
                            <td className="py-3 px-4 text-right text-success">+4.20%</td>
                          </tr>
                          <tr className="hover:bg-secondary/30">
                            <td className="py-3 px-4 font-bold font-sans">SOL/USDT</td>
                            <td className="py-3 px-4 text-muted-foreground">250</td>
                            <td className="py-3 px-4 text-right">$145.20</td>
                            <td className="py-3 px-4 text-right text-danger">-1.15%</td>
                          </tr>
                         </>
                      )}
                    </tbody>
                  </table>
                </div>
             </Widget>
             
             <Widget title="AI Strategy Engine" className="h-[300px]">
                <div className="flex flex-col gap-4">
                  {stratLoading ? (
                    <div className="animate-pulse flex space-x-4">
                      <div className="flex-1 space-y-4 py-1">
                        <div className="h-4 bg-secondary rounded w-3/4"></div>
                        <div className="h-4 bg-secondary rounded"></div>
                      </div>
                    </div>
                  ) : strategies?.map((strat) => (
                    <div key={strat.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/40 border border-border/50 hover:border-primary/30 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${strat.isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          <BrainCircuit className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-foreground">{strat.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{strat.description}</p>
                        </div>
                      </div>
                      <Switch 
                        checked={strat.isActive || false} 
                        onCheckedChange={(checked) => updateStrategy.mutate({ id: strat.id, isActive: checked })} 
                        disabled={updateStrategy.isPending}
                      />
                    </div>
                  ))}
                  
                  {/* Mock Strategies if DB is empty */}
                  {!strategies?.length && (
                    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/40 border border-border/50">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/20 text-primary">
                          <BrainCircuit className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-foreground">Momentum Alpha</h4>
                          <p className="text-xs text-muted-foreground mt-1">Trend following with RSI divergence</p>
                        </div>
                      </div>
                      <Switch checked={true} onCheckedChange={() => {}} />
                    </div>
                  )}
                </div>
             </Widget>
          </div>
        </div>

        {/* Right Sidebar: Signal Feed */}
        <div className="lg:col-span-1">
          <Widget 
            title="Live Signal Feed" 
            className="h-[724px]" 
            noPadding 
            action={
              <span className="flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-1 rounded-md border border-success/20">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Live
              </span>
            }
          >
            <div className="overflow-auto h-full flex flex-col">
              {sigLoading ? (
                 <div className="p-4 text-center text-muted-foreground">Connecting to AI engine...</div>
              ) : signals?.length === 0 ? (
                 <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                    <Activity className="w-8 h-8 opacity-20" />
                    <p>No signals generated yet.</p>
                    <p className="text-xs">Ensure strategies are active.</p>
                 </div>
              ) : signals?.map((sig, i) => {
                const isBuy = sig.type === 'BUY';
                const isNew = i === 0; // Highlight the newest one
                
                return (
                  <div 
                    key={sig.id} 
                    className={`
                      p-4 border-b border-border/40 hover:bg-secondary/30 transition-colors
                      ${isNew ? (isBuy ? 'animate-flash-buy' : 'animate-flash-sell') : ''}
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`
                          px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                          ${isBuy ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}
                        `}>
                          {sig.type}
                        </span>
                        <span className="font-bold font-sans text-sm">{sig.symbol}</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        {sig.timestamp ? format(new Date(sig.timestamp), 'HH:mm:ss') : 'Just now'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-end mt-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Target Price</p>
                        <p className="font-mono text-sm">${parseFloat(sig.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">AI Confidence</p>
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${sig.aiScore > 85 ? 'bg-success' : sig.aiScore > 70 ? 'bg-warning' : 'bg-danger'}`} 
                              style={{ width: `${sig.aiScore}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono font-bold">{sig.aiScore}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Widget>
        </div>
        
      </div>
    </div>
  );
}

// Subcomponent for top stats
function StatCard({ title, value, change, subtitle, isPositive, highlight }: any) {
  return (
    <div className={`
      bg-card p-4 rounded-xl border flex flex-col justify-between
      ${highlight ? 'border-primary/50 shadow-[0_0_15px_rgba(59,130,246,0.1)] bg-gradient-to-br from-card to-primary/5' : 'border-border/50 shadow-sm'}
    `}>
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold font-mono text-foreground">{value}</span>
        {change && (
          <span className={`text-xs font-semibold flex items-center ${isPositive ? 'text-success' : 'text-danger'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
            {change}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>}
    </div>
  );
}
