import React, { useState } from "react";
import { Save, Bell, Shield, Zap, Eye, Moon, Sun } from "lucide-react";
import { Widget } from "@/components/Widget";
import { Switch } from "@/components/Switch";

export default function Settings() {
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: true,
    emailAlerts: false,
    soundEnabled: true,
    apiKey: "••••••••••••••••",
    riskLevel: "medium",
    maxPositions: 5,
    leverageLimit: 5,
    slippageTolerance: 0.5,
    autoClose: false,
    twoFactor: true,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex-1 overflow-auto bg-background p-4 md:p-6 lg:p-8 no-scrollbar">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Terminal Settings</h1>
        <p className="text-muted-foreground">Configure your trading terminal preferences and security</p>
      </div>

      <div className="max-w-2xl">
        {/* Display Settings */}
        <Widget title="Display Preferences" className="mb-6">
          <div className="space-y-4">
            <SettingRow label="Dark Mode">
              <Switch checked={settings.darkMode} onCheckedChange={(val) => updateSetting('darkMode', val)} />
            </SettingRow>
            
            <div className="border-t border-border/50 pt-4">
              <label className="block text-sm font-semibold text-foreground mb-3">Theme</label>
              <div className="grid grid-cols-3 gap-3">
                <button className="p-4 rounded-lg border-2 border-primary bg-secondary/50 text-foreground font-semibold transition-all">
                  <Moon className="w-5 h-5 mx-auto mb-2" />
                  Dark
                </button>
                <button className="p-4 rounded-lg border-2 border-border/50 hover:border-primary/50 text-foreground font-semibold transition-all">
                  <Sun className="w-5 h-5 mx-auto mb-2" />
                  Light
                </button>
                <button className="p-4 rounded-lg border-2 border-border/50 hover:border-primary/50 text-foreground font-semibold transition-all">
                  <Zap className="w-5 h-5 mx-auto mb-2" />
                  Auto
                </button>
              </div>
            </div>
          </div>
        </Widget>

        {/* Notification Settings */}
        <Widget title="Notifications" className="mb-6">
          <div className="space-y-4">
            <SettingRow label="Push Notifications">
              <Switch checked={settings.notifications} onCheckedChange={(val) => updateSetting('notifications', val)} />
            </SettingRow>
            
            <SettingRow label="Email Alerts">
              <Switch checked={settings.emailAlerts} onCheckedChange={(val) => updateSetting('emailAlerts', val)} />
            </SettingRow>
            
            <SettingRow label="Sound Alerts">
              <Switch checked={settings.soundEnabled} onCheckedChange={(val) => updateSetting('soundEnabled', val)} />
            </SettingRow>
          </div>
        </Widget>

        {/* Trading Settings */}
        <Widget title="Trading Configuration" className="mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Risk Level</label>
              <select 
                value={settings.riskLevel}
                onChange={(e) => updateSetting('riskLevel', e.target.value)}
                className="w-full px-4 py-2 bg-secondary/50 border border-border/50 rounded-lg text-foreground focus:outline-none focus:border-primary/50"
              >
                <option value="low">Low Risk (Conservative)</option>
                <option value="medium">Medium Risk (Balanced)</option>
                <option value="high">High Risk (Aggressive)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Max Open Positions</label>
              <input 
                type="number" 
                min="1"
                max="20"
                value={settings.maxPositions}
                onChange={(e) => updateSetting('maxPositions', parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-secondary/50 border border-border/50 rounded-lg text-foreground focus:outline-none focus:border-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Leverage Limit</label>
              <input 
                type="number" 
                min="1"
                max="20"
                value={settings.leverageLimit}
                onChange={(e) => updateSetting('leverageLimit', parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-secondary/50 border border-border/50 rounded-lg text-foreground focus:outline-none focus:border-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Slippage Tolerance (%)</label>
              <input 
                type="number" 
                step="0.1"
                min="0"
                max="5"
                value={settings.slippageTolerance}
                onChange={(e) => updateSetting('slippageTolerance', parseFloat(e.target.value))}
                className="w-full px-4 py-2 bg-secondary/50 border border-border/50 rounded-lg text-foreground focus:outline-none focus:border-primary/50"
              />
            </div>

            <SettingRow label="Auto-Close Losing Positions">
              <Switch checked={settings.autoClose} onCheckedChange={(val) => updateSetting('autoClose', val)} />
            </SettingRow>
          </div>
        </Widget>

        {/* Security Settings */}
        <Widget title="Security" className="mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">API Key</label>
              <div className="flex gap-2">
                <input 
                  type="password" 
                  value={settings.apiKey}
                  readOnly
                  className="flex-1 px-4 py-2 bg-secondary/50 border border-border/50 rounded-lg text-foreground focus:outline-none"
                />
                <button className="px-4 py-2 bg-secondary/50 border border-border/50 rounded-lg text-foreground hover:bg-secondary transition-colors text-sm">
                  Regenerate
                </button>
              </div>
            </div>

            <SettingRow label="Two-Factor Authentication">
              <Switch checked={settings.twoFactor} onCheckedChange={(val) => updateSetting('twoFactor', val)} />
            </SettingRow>

            <div className="border-t border-border/50 pt-4">
              <button className="w-full px-4 py-2 bg-danger/10 border border-danger/30 text-danger rounded-lg hover:bg-danger/20 transition-colors font-semibold">
                Reset Account
              </button>
            </div>
          </div>
        </Widget>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={handleSave}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${saved ? 'bg-success text-success-foreground' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
          >
            <Save className="w-4 h-4" />
            {saved ? 'Settings Saved!' : 'Save Settings'}
          </button>
          <button className="flex-1 px-6 py-3 bg-secondary/50 border border-border/50 text-foreground rounded-lg hover:bg-secondary transition-colors font-semibold">
            Restore Defaults
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-primary/5 border border-primary/30 rounded-lg">
          <p className="text-sm text-foreground">
            <span className="font-semibold">Pro Tip:</span> Your settings are synchronized across all devices in real-time. Changes take effect immediately.
          </p>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ label, children }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border border-border/50">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {children}
    </div>
  );
}
