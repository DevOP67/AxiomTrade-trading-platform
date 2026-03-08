import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ChartProps {
  symbol: string;
  color?: string;
  dataPoints?: number;
}

// Generates realistic looking random walk data for the mock charts
const generateMockData = (points: number, startPrice: number, volatility: number) => {
  let price = startPrice;
  return Array.from({ length: points }).map((_, i) => {
    const change = (Math.random() - 0.5) * volatility;
    price = price + change;
    return {
      time: new Date(Date.now() - (points - i) * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: Number(price.toFixed(2)),
    };
  });
};

export function MarketChart({ symbol, color = "#3b82f6", dataPoints = 50 }: ChartProps) {
  // Use useMemo to prevent data from jumping around on every render unless unmounted
  const data = useMemo(() => {
    const startPrice = symbol === "BTC/USDT" ? 64000 : symbol === "ETH/USDT" ? 3400 : 100;
    const volatility = startPrice * 0.005; 
    return generateMockData(dataPoints, startPrice, volatility);
  }, [symbol, dataPoints]);

  const minPrice = Math.min(...data.map(d => d.price));
  const maxPrice = Math.max(...data.map(d => d.price));

  return (
    <div className="w-full h-full relative group">
      <div className="absolute top-2 left-4 z-10">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
            ${data[data.length - 1].price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          <span className={`text-sm font-mono ${data[data.length - 1].price >= data[0].price ? 'text-success' : 'text-danger'}`}>
            {data[data.length - 1].price >= data[0].price ? '+' : ''}
            {(((data[data.length - 1].price / data[0].price) - 1) * 100).toFixed(2)}%
          </span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 40, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            dy={10}
            minTickGap={30}
          />
          <YAxis 
            domain={[minPrice * 0.999, maxPrice * 1.001]} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            orientation="right"
            dx={5}
            tickFormatter={(val) => val.toLocaleString()}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              borderColor: 'hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))',
              fontFamily: 'JetBrains Mono',
              fontSize: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
            }}
            itemStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={color} 
            strokeWidth={2}
            fillOpacity={1} 
            fill={`url(#gradient-${symbol})`} 
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
