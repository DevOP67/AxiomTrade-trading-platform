import React, { useState, useEffect } from "react";
import { Save, Bell, Shield, Zap, Moon, Sun, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { Widget } from "@/components/Widget";
import { Switch } from "@/components/Switch";
import { useAuth } from "@/context/AuthContext";

const STORAGE_KEY = "quantforge_settings";
const DEFAULTS = {
  darkMode:          true,
  notifications:     true,
  emailAlerts:       false,
  soundEnabled:      true,
  riskLevel:         "medium",
  maxPositions:      5,
  leverageLimit:     5,
  slippageTolerance: 0.5,
  autoClose:         false,
  twoFactor:         true,
  theme:             "dark",
};

function loadSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

function generateApiKey() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return "qf_" + Array.from({ length: 40 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function Settings() {
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState(loadSettings);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("quantforge_api_key") || generateApiKey());
  const [showApiKey, setShowApiKey] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "warning" | "danger" } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  function showToast(msg: string, type: "success" | "warning" | "danger" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function applyTheme(theme: string) {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
    } else if (theme === "dark") {
      root.classList.remove("light");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) root.classList.remove("light");
      else root.classList.add("light");
    }
  }

  useEffect(() => {
    applyTheme(settings.theme);
  }, []);

  function updateSetting(key: string, value: any) {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  }

  function handleThemeChange(theme: string) {
    updateSetting("theme", theme);
    applyTheme(theme);
  }

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    localStorage.setItem("quantforge_api_key", apiKey);
    applyTheme(settings.theme);
    showToast("Settings saved successfully!");
  }

  function handleRestore() {
    setSettings({ ...DEFAULTS });
    showToast("Settings restored to defaults", "warning");
  }

  function handleRegenerateKey() {
    const newKey = generateApiKey();
    setApiKey(newKey);
    localStorage.setItem("quantforge_api_key", newKey);
    showToast("New API key generated — copy it now");
  }

  function handleResetAccount() {
    localStorage.clear();
    setSettings({ ...DEFAULTS });
    setApiKey(generateApiKey());
    showToast("Account data cleared. Logging out...", "warning");
    setTimeout(() => logout(), 2000);
    setShowResetConfirm(false);
  }

  const commonMenuItems = [
    { label: "Save Settings",     onClick: handleSave },
    { label: "Restore Defaults",  onClick: handleRestore },
  ];

  return (
    <div className="flex-1 overflow-auto bg-background p-4 md:p-6 lg:p-8 no-scrollbar relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium transition-all duration-300 ${
          toast.type === "success" ? "bg-success/20 border-success/40 text-success" :
          toast.type === "warning" ? "bg-warning/20 border-warning/40 text-warning" :
          "bg-danger/20 border-danger/40 text-danger"
        }`}>
          {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Terminal Settings</h1>
          <p className="text-muted-foreground">Configure preferences for <strong>{user?.username}</strong></p>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Display */}
        <Widget title="Display Preferences" menuItems={commonMenuItems}>
          <div className="space-y-4">
            <SettingRow label="Dark Mode" description="Enable the dark trading terminal theme">
              <Switch checked={settings.darkMode} onCheckedChange={(v) => updateSetting("darkMode", v)} />
            </SettingRow>

            <div className="border-t border-border/50 pt-4">
              <label className="block text-sm font-semibold text-foreground mb-3">Theme</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "dark",  icon: <Moon className="w-5 h-5 mx-auto mb-2" />,  label: "Dark" },
                  { id: "light", icon: <Sun  className="w-5 h-5 mx-auto mb-2" />,  label: "Light" },
                  { id: "auto",  icon: <Zap  className="w-5 h-5 mx-auto mb-2" />,  label: "Auto" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    data-testid={`button-theme-${t.id}`}
                    className={`p-4 rounded-lg border-2 font-semibold text-sm transition-all ${settings.theme === t.id ? "border-primary bg-primary/10 text-primary" : "border-border/50 hover:border-primary/50 text-foreground"}`}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Widget>

        {/* Notifications */}
        <Widget title="Notifications" menuItems={commonMenuItems}>
          <div className="space-y-3">
            <SettingRow label="Push Notifications" description="Browser push alerts for signals">
              <Switch checked={settings.notifications} onCheckedChange={(v) => updateSetting("notifications", v)} />
            </SettingRow>
            <SettingRow label="Email Alerts" description="Get signals via email">
              <Switch checked={settings.emailAlerts} onCheckedChange={(v) => updateSetting("emailAlerts", v)} />
            </SettingRow>
            <SettingRow label="Sound Alerts" description="Play sound on new signal">
              <Switch checked={settings.soundEnabled} onCheckedChange={(v) => updateSetting("soundEnabled", v)} />
            </SettingRow>
          </div>
        </Widget>

        {/* Trading */}
        <Widget title="Trading Configuration" menuItems={commonMenuItems}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Risk Level</label>
              <select
                value={settings.riskLevel}
                onChange={(e) => updateSetting("riskLevel", e.target.value)}
                className="w-full px-4 py-2 bg-secondary/50 border border-border/50 rounded-lg text-foreground focus:outline-none focus:border-primary/50 text-sm"
              >
                <option value="low">Low Risk (Conservative)</option>
                <option value="medium">Medium Risk (Balanced)</option>
                <option value="high">High Risk (Aggressive)</option>
              </select>
            </div>
            {[
              { key: "maxPositions",      label: "Max Open Positions",    min: 1,   max: 20,  step: 1   },
              { key: "leverageLimit",     label: "Leverage Limit",        min: 1,   max: 20,  step: 1   },
              { key: "slippageTolerance", label: "Slippage Tolerance (%)",min: 0,   max: 5,   step: 0.1 },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-semibold text-foreground mb-2">{field.label}</label>
                <input
                  type="number"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={(settings as any)[field.key]}
                  onChange={(e) => updateSetting(field.key, parseFloat(e.target.value))}
                  className="w-full px-4 py-2 bg-secondary/50 border border-border/50 rounded-lg text-foreground focus:outline-none focus:border-primary/50 text-sm font-mono"
                />
              </div>
            ))}
            <SettingRow label="Auto-Close Losing Positions" description="Automatically cut losses at stop-loss">
              <Switch checked={settings.autoClose} onCheckedChange={(v) => updateSetting("autoClose", v)} />
            </SettingRow>
          </div>
        </Widget>

        {/* Security */}
        <Widget title="Security" menuItems={commonMenuItems}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">API Key</label>
              <div className="flex gap-2">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  readOnly
                  className="flex-1 px-4 py-2 bg-secondary/50 border border-border/50 rounded-lg text-foreground focus:outline-none font-mono text-sm"
                />
                <button
                  onClick={() => setShowApiKey((prev) => !prev)}
                  className="px-3 py-2 bg-secondary/50 border border-border/50 rounded-lg text-foreground hover:bg-secondary transition-colors text-xs"
                >
                  {showApiKey ? "Hide" : "Show"}
                </button>
                <button
                  onClick={handleRegenerateKey}
                  className="flex items-center gap-1.5 px-3 py-2 bg-primary/20 border border-primary/30 rounded-lg text-primary hover:bg-primary/30 transition-colors text-xs font-semibold"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Regenerate
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Keep your API key secret. Regenerating invalidates the old key.</p>
            </div>

            <SettingRow label="Two-Factor Authentication" description="Add extra layer of security">
              <Switch checked={settings.twoFactor} onCheckedChange={(v) => updateSetting("twoFactor", v)} />
            </SettingRow>

            <div className="border-t border-border/50 pt-4">
              {showResetConfirm ? (
                <div className="p-4 bg-danger/5 border border-danger/30 rounded-lg">
                  <p className="text-sm text-danger font-semibold mb-1">Confirm Account Reset</p>
                  <p className="text-xs text-muted-foreground mb-3">This will clear all local data and log you out. Your account remains in the database.</p>
                  <div className="flex gap-2">
                    <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-2 bg-secondary text-foreground rounded-lg text-xs font-semibold">
                      Cancel
                    </button>
                    <button onClick={handleResetAccount} className="flex-1 py-2 bg-danger text-white rounded-lg text-xs font-semibold hover:bg-danger/90">
                      Confirm Reset
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full px-4 py-2 bg-danger/10 border border-danger/30 text-danger rounded-lg hover:bg-danger/20 transition-colors font-semibold text-sm"
                >
                  Reset Account Data
                </button>
              )}
            </div>
          </div>
        </Widget>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
          <button
            onClick={handleRestore}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-secondary/50 border border-border/50 text-foreground rounded-lg hover:bg-secondary transition-colors font-semibold"
          >
            <RefreshCw className="w-4 h-4" />
            Restore Defaults
          </button>
        </div>

        <div className="p-4 bg-primary/5 border border-primary/30 rounded-lg">
          <p className="text-sm text-foreground">
            <span className="font-semibold">Pro Tip:</span> Settings are saved to your browser. Click "Save Settings" to persist across sessions.
          </p>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border border-border/50">
      <div>
        <span className="text-sm font-semibold text-foreground">{label}</span>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}
