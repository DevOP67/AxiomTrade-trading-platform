import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Activity, Eye, EyeOff, TrendingUp, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const result = await login(username, password);
    setIsLoading(false);
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-card via-secondary/20 to-background border-r border-border/40 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center shadow-lg shadow-primary/30">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-2xl text-foreground tracking-tight">
            Quant<span className="text-primary">Forge</span>
          </span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-foreground mb-4 leading-tight">
            AI-Powered<br />
            <span className="text-primary">Trading Intelligence</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Professional-grade signals, real-time market analysis, and AI-driven strategy management.
          </p>

          <div className="space-y-4">
            {[
              { icon: TrendingUp, text: "Real-time BUY/SELL/HOLD signals with AI confidence scoring" },
              { icon: Zap, text: "Automated strategy execution across multiple crypto pairs" },
              { icon: Activity, text: "Portfolio analytics with P&L tracking and drawdown metrics" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-secondary/30 rounded-lg border border-border/40">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          © 2026 QuantForge. Professional trading platform.
        </p>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center shadow-lg shadow-primary/30">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-foreground">
              Quant<span className="text-primary">Forge</span>
            </span>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back</h2>
          <p className="text-muted-foreground mb-8">Sign in to your trading terminal</p>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="w-full px-4 py-3 bg-secondary/50 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3 bg-secondary/50 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary font-semibold hover:underline">
                Create account
              </Link>
            </p>
          </div>

          {/* Demo credentials box */}
          <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-xs font-semibold text-primary mb-1">Demo Access</p>
            <p className="text-xs text-muted-foreground">
              Create an account to explore the full trading terminal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
