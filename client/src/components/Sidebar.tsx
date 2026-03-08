import React from 'react';
import { Link, useLocation } from "wouter";
import { LayoutDashboard, LineChart, Activity, Briefcase, Settings, Cpu } from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: LineChart, label: "Markets", href: "/markets" },
    { icon: Activity, label: "Signals", href: "/signals" },
    { icon: Cpu, label: "Strategies", href: "/strategies" },
    { icon: Briefcase, label: "Portfolio", href: "/portfolio" },
  ];

  return (
    <div className="w-16 md:w-64 h-screen bg-card border-r border-border/50 flex flex-col transition-all duration-300 z-50">
      <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-800 flex items-center justify-center shadow-lg shadow-primary/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg hidden md:block tracking-tight text-foreground">
            Axiom<span className="text-primary">Trade</span>
          </span>
        </div>
      </div>

      <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }
              `}
            >
              <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-primary' : ''}`} />
              <span className="hidden md:block">{item.label}</span>
              
              {/* Active Indicator Line */}
              {isActive && (
                <div className="absolute left-0 w-1 h-8 bg-primary rounded-r-full hidden md:block" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <Link href="/settings" className="flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200">
          <Settings className="w-5 h-5" />
          <span className="hidden md:block">Settings</span>
        </Link>
      </div>
    </div>
  );
}
