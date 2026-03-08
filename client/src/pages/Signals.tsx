import React, { useState } from "react";
import { format } from "date-fns";
import { Filter, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Widget } from "@/components/Widget";
import { useSignals } from "@/hooks/use-signals";

export default function Signals() {
  const { data: signals, isLoading } = useSignals(undefined, 50);
  const [typeFilter, setTypeFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState(0);

  const filteredSignals = signals?.filter(sig => {
    const typeMatch = typeFilter === "all" || sig.type === typeFilter;
    const scoreMatch = sig.aiScore >= scoreFilter;
    return typeMatch && scoreMatch;
  }) || [];

  const stats = {
    total: signals?.length || 0,
    buy: signals?.filter(s => s.type === "BUY").length || 0,
    sell: signals?.filter(s => s.type === "SELL").length || 0,
    hold: signals?.filter(s => s.type === "HOLD").length || 0,
  };

  return (
    <div className="flex-1 overflow-auto bg-background p-4 md:p-6 lg:p-8 no-scrollbar">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Advanced Signals</h1>
        <p className="text-muted-foreground">AI-powered trading signals with confidence scoring</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatsCard label="Total Signals" value={stats.total} />
        <StatsCard label="Buy Signals" value={stats.buy} highlight="success" />
        <StatsCard label="Sell Signals" value={stats.sell} highlight="danger" />
        <StatsCard label="Hold Signals" value={stats.hold} />
      </div>

      {/* Filters */}
      <Widget title="Signal Analysis">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase">Signal Type</label>
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 bg-secondary/50 border border-border/50 rounded-lg text-foreground focus:outline-none focus:border-primary/50"
              >
                <option value="all">All Signals</option>
                <option value="BUY">Buy Only</option>
                <option value="SELL">Sell Only</option>
                <option value="HOLD">Hold Only</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase">Min AI Score</label>
              <div className="flex items-center gap-3">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={scoreFilter}
                  onChange={(e) => setScoreFilter(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-mono font-bold text-foreground">{scoreFilter}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-border/50 pt-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Signal Feed ({filteredSignals.length})</h3>
            
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading signals...</div>
            ) : filteredSignals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No signals match your filters</div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {filteredSignals.map((sig, i) => {
                  const isBuy = sig.type === "BUY";
                  return (
                    <div 
                      key={sig.id} 
                      className="p-4 bg-secondary/30 rounded-lg border border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${isBuy ? 'bg-success/20 text-success' : sig.type === 'SELL' ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'}`}>
                            {sig.type}
                          </span>
                          <span className="font-bold text-sm text-foreground">{sig.symbol}</span>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">
                          {format(new Date(sig.timestamp || ''), 'HH:mm:ss')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-border/50">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Price</p>
                          <p className="font-mono font-bold text-foreground">${parseFloat(sig.price).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">AI Score</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${sig.aiScore > 85 ? 'bg-success' : sig.aiScore > 70 ? 'bg-warning' : 'bg-danger'}`}
                                style={{ width: `${sig.aiScore}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-foreground">{sig.aiScore}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Action</p>
                          <button className="text-xs px-2 py-1 bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors">
                            Execute
                          </button>
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

function StatsCard({ label, value, highlight }: any) {
  return (
    <div className={`p-4 rounded-lg border ${highlight ? `border-${highlight}/30 bg-${highlight}/5` : 'border-border/50 bg-secondary/30'}`}>
      <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">{label}</p>
      <p className={`text-2xl font-bold font-mono ${highlight ? `text-${highlight}` : 'text-foreground'}`}>{value}</p>
    </div>
  );
}
