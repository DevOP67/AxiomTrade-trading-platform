import React from "react";
import { Maximize2, MoreHorizontal } from "lucide-react";

interface WidgetProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function Widget({ title, children, action, className = "", noPadding = false }: WidgetProps) {
  return (
    <div className={`bg-card rounded-xl border border-border/40 flex flex-col shadow-sm ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-card/50">
        <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">{title}</h3>
        <div className="flex items-center gap-2 text-muted-foreground">
          {action}
          <button className="hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className={`flex-1 overflow-hidden ${noPadding ? '' : 'p-4'}`}>
        {children}
      </div>
    </div>
  );
}
