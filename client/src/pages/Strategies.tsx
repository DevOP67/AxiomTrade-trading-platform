import React, { useState } from "react";
import { Plus, Trash2, Edit2, BrainCircuit, Settings as SettingsIcon } from "lucide-react";
import { Widget } from "@/components/Widget";
import { Switch } from "@/components/Switch";
import { useStrategies, useUpdateStrategy } from "@/hooks/use-strategies";

export default function Strategies() {
  const { data: strategies, isLoading } = useStrategies();
  const updateStrategy = useUpdateStrategy();
  const [selectedStrategy, setSelectedStrategy] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex-1 overflow-auto bg-background p-4 md:p-6 lg:p-8 no-scrollbar">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Strategy Builder</h1>
          <p className="text-muted-foreground">Create and manage AI trading strategies</p>
        </div>
        <button 
          onClick={() => {
            setSelectedStrategy(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Strategy
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Strategies List */}
        <div className="lg:col-span-2">
          <Widget title="Active Strategies">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading strategies...</div>
            ) : !strategies?.length ? (
              <div className="text-center py-8 text-muted-foreground">No strategies yet</div>
            ) : (
              <div className="space-y-4">
                {strategies.map((strat) => (
                  <div 
                    key={strat.id}
                    onClick={() => setSelectedStrategy(strat)}
                    className="p-4 bg-secondary/30 border border-border/50 rounded-lg hover:border-primary/30 cursor-pointer transition-all hover:shadow-lg hover:shadow-primary/5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg ${strat.isActive ? 'bg-primary/20 text-primary' : 'bg-muted'}`}>
                          <BrainCircuit className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{strat.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{strat.description}</p>
                        </div>
                      </div>
                      <Switch 
                        checked={strat.isActive || false}
                        onCheckedChange={(checked) => updateStrategy.mutate({ id: strat.id, isActive: checked })}
                        disabled={updateStrategy.isPending}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/50">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Type</p>
                        <p className="text-xs font-mono text-foreground">{strat.name.split(' ')[0]}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Timeframe</p>
                        <p className="text-xs font-mono text-foreground">{strat.parameters?.timeframe || '1H'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Status</p>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${strat.isActive ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                          {strat.isActive ? 'Running' : 'Paused'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Widget>
        </div>

        {/* Selected Strategy Details */}
        <div>
          {selectedStrategy ? (
            <Widget title="Strategy Details">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-foreground text-lg">{selectedStrategy.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{selectedStrategy.description}</p>
                </div>
                
                <div className="border-t border-border/50 pt-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Parameters</h4>
                  <div className="space-y-3">
                    {selectedStrategy.parameters && Object.entries(selectedStrategy.parameters).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                        <span className="text-xs text-muted-foreground capitalize">{key}</span>
                        <span className="text-xs font-mono font-bold text-foreground">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border/50 pt-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Actions</h4>
                  <div className="space-y-2">
                    <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-secondary/50 text-foreground rounded-lg hover:bg-secondary transition-colors text-sm">
                      <Edit2 className="w-4 h-4" />
                      Edit Parameters
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-secondary/50 text-foreground rounded-lg hover:bg-secondary transition-colors text-sm">
                      <SettingsIcon className="w-4 h-4" />
                      Backtest
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-danger/10 text-danger rounded-lg hover:bg-danger/20 transition-colors text-sm">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </Widget>
          ) : (
            <Widget title="No Selection">
              <div className="text-center py-8 text-muted-foreground">
                <p>Select a strategy to view details</p>
              </div>
            </Widget>
          )}
        </div>
      </div>
    </div>
  );
}
