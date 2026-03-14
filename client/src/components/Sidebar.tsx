import React from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, LineChart, Activity, Briefcase, Settings, Cpu, LogOut, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: LineChart,        label: "Markets",   href: "/markets" },
    { icon: Activity,         label: "Signals",   href: "/signals" },
    { icon: Cpu,              label: "Strategies",href: "/strategies" },
    { icon: Briefcase,        label: "Portfolio", href: "/portfolio" },
  ];

  return (
    <div className="w-16 md:w-64 h-screen bg-card border-r border-border/50 flex flex-col transition-all duration-300 z-50 shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-800 flex items-center justify-center shadow-lg shadow-primary/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg hidden md:block tracking-tight text-foreground">
            Quant<span className="text-primary">Forge</span>
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-primary" : ""}`} />
              <span className="hidden md:block">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-border/50 space-y-1">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 hidden md:flex">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground truncate">{user.username}</span>
          </div>
        )}
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
            location === "/settings"
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          <Settings className="w-5 h-5 shrink-0" />
          <span className="hidden md:block">Settings</span>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="hidden md:block">Logout</span>
        </button>
      </div>
    </div>
  );
}
