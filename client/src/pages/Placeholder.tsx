import React from 'react';
import { Activity } from 'lucide-react';

export default function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background p-8">
      <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6">
        <Activity className="w-10 h-10 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-bold text-foreground mb-2">{title} Module</h1>
      <p className="text-muted-foreground text-center max-w-md">
        This section of the trading terminal is currently under development. 
        Please check back in a future update.
      </p>
    </div>
  );
}
