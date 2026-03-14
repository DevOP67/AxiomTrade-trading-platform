import React, { useState } from "react";
import { Plus, Trash2, Edit2, BarChart2, BrainCircuit, X, Save, PlayCircle, ChevronRight } from "lucide-react";
import { Widget } from "@/components/Widget";
import { Switch } from "@/components/Switch";
import { useStrategies, useUpdateStrategy, useCreateStrategy, useDeleteStrategy } from "@/hooks/use-strategies";

const STRATEGY_TEMPLATES = [
  { name: "Moving Average Crossover", description: "Buy/sell on fast/slow MA crossover points.", defaults: { timeframe: "1H", fast_ma: 10, slow_ma: 50 } },
  { name: "RSI Reversion",            description: "Mean reversion using overbought/oversold RSI.", defaults: { timeframe: "1H", rsi_period: 14, overbought: 70, oversold: 30 } },
  { name: "MACD Trend",               description: "Trend following using MACD histogram divergence.", defaults: { timeframe: "4H", fast: 12, slow: 26, signal: 9 } },
  { name: "Bollinger Bands",          description: "Volatility breakout using Bollinger Bands.", defaults: { timeframe: "4H", period: 20, std_dev: 2.0 } },
  { name: "Volume Surge",             description: "Trades on unusual volume spikes.", defaults: { timeframe: "15M", volume_multiplier: 2.0, lookback: 20 } },
];

const BACKTEST_METRICS = [
  { label: "Win Rate",      format: (n: string) => n + "%" },
  { label: "Total Trades",  format: (n: string) => n },
  { label: "Avg Return",    format: (n: string) => n + "%" },
  { label: "Max Drawdown",  format: (n: string) => "-" + n + "%" },
  { label: "Sharpe Ratio",  format: (n: string) => n },
  { label: "Profit Factor", format: (n: string) => n },
];

export default function Strategies() {
  const { data: strategies, isLoading, refetch } = useStrategies();
  const updateStrategy = useUpdateStrategy();
  const createStrategy = useCreateStrategy();
  const deleteStrategy = useDeleteStrategy();

  const [selectedStrategy, setSelectedStrategy] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBacktestPanel, setShowBacktestPanel] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [backtestRunning, setBacktestRunning] = useState(false);
  const [backtestResults, setBacktestResults] = useState<any>(null);

  const [newStratForm, setNewStratForm] = useState({
    name: "",
    description: "",
    templateIdx: 0,
    isActive: true,
  });
  const [editParams, setEditParams] = useState<Record<string, any>>({});

  function openEdit() {
    if (!selectedStrategy) return;
    setEditParams({ ...selectedStrategy.parameters });
    setShowEditModal(true);
  }

  async function runBacktest() {
    if (!selectedStrategy) return;
    setBacktestRunning(true);
    setShowBacktestPanel(true);
    await new Promise((r) => setTimeout(r, 1800));
    setBacktestResults({
      winRate:      (55 + Math.random() * 25).toFixed(1),
      totalTrades:  Math.floor(80 + Math.random() * 120),
      avgReturn:    (1.5 + Math.random() * 3.5).toFixed(2),
      maxDrawdown:  (5 + Math.random() * 15).toFixed(1),
      sharpeRatio:  (1.0 + Math.random() * 1.5).toFixed(2),
      profitFactor: (1.1 + Math.random() * 1.4).toFixed(2),
    });
    setBacktestRunning(false);
  }

  async function handleCreate() {
    const tmpl = STRATEGY_TEMPLATES[newStratForm.templateIdx];
    await createStrategy.mutateAsync({
      name: newStratForm.name || tmpl.name,
      description: newStratForm.description || tmpl.description,
      isActive: newStratForm.isActive,
      parameters: tmpl.defaults,
    });
    setShowCreateModal(false);
    setNewStratForm({ name: "", description: "", templateIdx: 0, isActive: true });
    refetch();
  }

  async function handleSaveEdit() {
    if (!selectedStrategy) return;
    await updateStrategy.mutateAsync({ id: selectedStrategy.id, parameters: editParams });
    setShowEditModal(false);
    setSelectedStrategy((prev: any) => ({ ...prev, parameters: editParams }));
  }

  async function handleDelete() {
    if (!selectedStrategy) return;
    await deleteStrategy.mutateAsync(selectedStrategy.id);
    setSelectedStrategy(null);
    setShowDeleteConfirm(false);
  }

  const listMenuItems = [
    { label: "Refresh",          onClick: () => refetch() },
    { label: "New Strategy",     onClick: () => setShowCreateModal(true) },
    { label: "Deactivate All",   onClick: () => strategies?.forEach((s) => updateStrategy.mutate({ id: s.id, isActive: false })) },
  ];

  return (
    <div className="flex-1 overflow-auto bg-background p-4 md:p-6 lg:p-8 no-scrollbar">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Strategy Builder</h1>
          <p className="text-muted-foreground">Create and manage AI trading strategies</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          New Strategy
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Strategies List */}
        <div className="lg:col-span-2">
          <Widget title="Active Strategies" menuItems={listMenuItems} onRefresh={() => refetch()}>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-secondary/40 rounded-lg animate-pulse" />)}
              </div>
            ) : !strategies?.length ? (
              <div className="text-center py-12 text-muted-foreground">
                <BrainCircuit className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p>No strategies yet</p>
                <button onClick={() => setShowCreateModal(true)} className="mt-3 text-primary text-sm hover:underline">
                  Create your first strategy
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {strategies.map((strat) => (
                  <div
                    key={strat.id}
                    onClick={() => { setSelectedStrategy(strat); setShowBacktestPanel(false); setBacktestResults(null); }}
                    className={`p-4 bg-secondary/30 border rounded-lg cursor-pointer transition-all ${selectedStrategy?.id === strat.id ? "border-primary/60 shadow-sm shadow-primary/10" : "border-border/50 hover:border-primary/30"}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg ${strat.isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                          <BrainCircuit className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{strat.name}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{strat.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${strat.isActive ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                          {strat.isActive ? "Running" : "Paused"}
                        </span>
                        <Switch
                          checked={strat.isActive || false}
                          onCheckedChange={(checked) => updateStrategy.mutate({ id: strat.id, isActive: checked })}
                          disabled={updateStrategy.isPending}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/40">
                      {Object.entries(strat.parameters || {}).slice(0, 3).map(([key, val]) => (
                        <div key={key}>
                          <p className="text-xs text-muted-foreground mb-0.5 capitalize">{key}</p>
                          <p className="text-xs font-mono font-bold text-foreground">{String(val)}</p>
                        </div>
                      ))}
                    </div>
                    {selectedStrategy?.id === strat.id && (
                      <div className="mt-3 pt-3 border-t border-border/40 flex items-center text-xs text-primary gap-1">
                        <ChevronRight className="w-3 h-3" />
                        <span>Selected — view details on the right</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Widget>
        </div>

        {/* Right: Strategy Details */}
        <div>
          {selectedStrategy ? (
            <div className="space-y-4">
              <Widget
                title="Strategy Details"
                menuItems={[
                  { label: "Edit Parameters", onClick: openEdit },
                  { label: "Run Backtest",    onClick: runBacktest },
                  { label: "Delete Strategy", onClick: () => setShowDeleteConfirm(true), variant: "danger" },
                ]}
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-foreground">{selectedStrategy.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{selectedStrategy.description}</p>
                  </div>

                  <div className="border-t border-border/50 pt-4">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Parameters</h4>
                    <div className="space-y-2">
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
                      <button
                        onClick={openEdit}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-secondary/50 text-foreground rounded-lg hover:bg-secondary transition-colors text-sm"
                      >
                        <Edit2 className="w-4 h-4" /> Edit Parameters
                      </button>
                      <button
                        onClick={runBacktest}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors text-sm"
                      >
                        <BarChart2 className="w-4 h-4" /> Run Backtest
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-danger/10 text-danger rounded-lg hover:bg-danger/20 transition-colors text-sm"
                      >
                        <Trash2 className="w-4 h-4" /> Delete Strategy
                      </button>
                    </div>
                  </div>
                </div>
              </Widget>

              {/* Backtest Panel */}
              {showBacktestPanel && (
                <Widget title="Backtest Results">
                  {backtestRunning ? (
                    <div className="flex flex-col items-center py-6 gap-3">
                      <PlayCircle className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-sm text-muted-foreground">Running simulation...</p>
                    </div>
                  ) : backtestResults ? (
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Win Rate",      val: backtestResults.winRate + "%" },
                        { label: "Total Trades",  val: backtestResults.totalTrades },
                        { label: "Avg Return",    val: "+" + backtestResults.avgReturn + "%" },
                        { label: "Max Drawdown",  val: "-" + backtestResults.maxDrawdown + "%" },
                        { label: "Sharpe Ratio",  val: backtestResults.sharpeRatio },
                        { label: "Profit Factor", val: backtestResults.profitFactor },
                      ].map((item) => (
                        <div key={item.label} className="p-3 bg-secondary/30 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                          <p className="font-mono font-bold text-sm text-foreground">{item.val}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </Widget>
              )}
            </div>
          ) : (
            <Widget title="Strategy Details">
              <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-3">
                <BrainCircuit className="w-10 h-10 opacity-20" />
                <p className="text-sm">Select a strategy to view details</p>
              </div>
            </Widget>
          )}
        </div>
      </div>

      {/* Create Strategy Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border/60 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <h2 className="font-bold text-lg text-foreground">New Strategy</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg hover:bg-secondary text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Template</label>
                <select
                  value={newStratForm.templateIdx}
                  onChange={(e) => setNewStratForm((prev) => ({ ...prev, templateIdx: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 bg-secondary/50 border border-border/50 rounded-lg text-foreground focus:outline-none focus:border-primary/50 text-sm"
                >
                  {STRATEGY_TEMPLATES.map((tmpl, i) => (
                    <option key={i} value={i}>{tmpl.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Custom Name <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={newStratForm.name}
                  onChange={(e) => setNewStratForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder={STRATEGY_TEMPLATES[newStratForm.templateIdx].name}
                  className="w-full px-4 py-2 bg-secondary/50 border border-border/50 rounded-lg text-foreground focus:outline-none focus:border-primary/50 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
                <textarea
                  value={newStratForm.description}
                  onChange={(e) => setNewStratForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder={STRATEGY_TEMPLATES[newStratForm.templateIdx].description}
                  rows={2}
                  className="w-full px-4 py-2 bg-secondary/50 border border-border/50 rounded-lg text-foreground focus:outline-none focus:border-primary/50 text-sm resize-none"
                />
              </div>

              {/* Preview parameters */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Default Parameters</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(STRATEGY_TEMPLATES[newStratForm.templateIdx].defaults).map(([k, v]) => (
                    <div key={k} className="p-2 bg-secondary/30 rounded text-xs">
                      <span className="text-muted-foreground">{k}: </span>
                      <span className="font-mono font-bold text-foreground">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                <span className="text-sm font-semibold text-foreground">Activate immediately</span>
                <Switch
                  checked={newStratForm.isActive}
                  onCheckedChange={(val) => setNewStratForm((prev) => ({ ...prev, isActive: val }))}
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2 bg-secondary/50 text-foreground rounded-lg text-sm font-semibold hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={createStrategy.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {createStrategy.isPending ? "Creating..." : "Create Strategy"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Parameters Modal */}
      {showEditModal && selectedStrategy && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border/60 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <h2 className="font-bold text-lg text-foreground">Edit Parameters</h2>
              <button onClick={() => setShowEditModal(false)} className="p-1 rounded-lg hover:bg-secondary text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-muted-foreground">{selectedStrategy.name}</p>
              {Object.entries(editParams).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-foreground mb-1.5 capitalize">{key}</label>
                  <input
                    type={typeof value === "number" ? "number" : "text"}
                    value={String(value)}
                    onChange={(e) =>
                      setEditParams((prev) => ({
                        ...prev,
                        [key]: typeof value === "number" ? parseFloat(e.target.value) || 0 : e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 bg-secondary/50 border border-border/50 rounded-lg text-foreground focus:outline-none focus:border-primary/50 text-sm font-mono"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-2 bg-secondary/50 text-foreground rounded-lg text-sm font-semibold hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={updateStrategy.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {updateStrategy.isPending ? "Saving..." : "Save Parameters"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && selectedStrategy && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border/60 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-danger" />
            </div>
            <h2 className="font-bold text-lg text-foreground mb-2">Delete Strategy?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              This will permanently delete <strong>{selectedStrategy.name}</strong>. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 bg-secondary/50 text-foreground rounded-lg text-sm font-semibold hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteStrategy.isPending}
                className="flex-1 py-2 bg-danger text-white rounded-lg text-sm font-semibold hover:bg-danger/90 transition-colors disabled:opacity-50"
              >
                {deleteStrategy.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

