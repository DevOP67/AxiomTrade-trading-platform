import React, { useState, useRef, useEffect } from "react";
import { MoreHorizontal, RefreshCw, Download, Maximize2, Info, X } from "lucide-react";

export interface WidgetMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
}

interface WidgetProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  overflowVisible?: boolean;
  menuItems?: WidgetMenuItem[];
  onRefresh?: () => void;
}

export function Widget({
  title,
  children,
  action,
  className = "",
  noPadding = false,
  overflowVisible = false,
  menuItems,
  onRefresh,
}: WidgetProps) {
  const [open, setOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const defaultItems: WidgetMenuItem[] = [
    ...(onRefresh
      ? [{ label: "Refresh", icon: <RefreshCw className="w-3.5 h-3.5" />, onClick: () => { onRefresh(); setOpen(false); } }]
      : []),
    {
      label: "Export CSV",
      icon: <Download className="w-3.5 h-3.5" />,
      onClick: () => {
        const blob = new Blob([`Widget: ${title}\nExported at: ${new Date().toISOString()}`], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title.replace(/\s+/g, "_")}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        setOpen(false);
      },
    },
    {
      label: "Widget Info",
      icon: <Info className="w-3.5 h-3.5" />,
      onClick: () => { setShowInfo(true); setOpen(false); },
    },
  ];

  const allItems = menuItems ? [...menuItems, ...defaultItems] : defaultItems;

  return (
    <div className={`bg-card rounded-xl border border-border/40 flex flex-col shadow-sm relative ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-card/50 rounded-t-xl">
        <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">{title}</h3>
        <div className="flex items-center gap-2 text-muted-foreground">
          {action}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setOpen((prev) => !prev)}
              className={`p-1 rounded-md transition-colors cursor-pointer ${open ? "bg-secondary text-foreground" : "hover:bg-secondary hover:text-foreground"}`}
              title="Widget options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {open && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-card border border-border/60 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
                {allItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={item.onClick}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors text-left ${
                      item.variant === "danger"
                        ? "text-destructive hover:bg-destructive/10"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className={`flex-1 ${overflowVisible ? "overflow-visible" : "overflow-hidden"} ${noPadding ? "" : "p-4"}`}>
        {children}
      </div>

      {/* Info overlay */}
      {showInfo && (
        <div className="absolute inset-0 bg-card/95 rounded-xl flex flex-col items-center justify-center z-40 p-6">
          <Maximize2 className="w-8 h-8 text-primary mb-3" />
          <h4 className="font-bold text-foreground mb-2">{title}</h4>
          <p className="text-xs text-muted-foreground text-center">
            Real-time data widget. Data refreshes automatically. Use the menu to export or configure.
          </p>
          <button
            onClick={() => setShowInfo(false)}
            className="mt-4 px-4 py-2 bg-secondary rounded-lg text-sm text-foreground hover:bg-secondary/80 transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
