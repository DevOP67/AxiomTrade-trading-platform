import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Placeholder from "@/pages/Placeholder";
import { Sidebar } from "@/components/Sidebar";

function Router() {
  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/20">
      <Sidebar />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/markets">
          <Placeholder title="Markets Explorer" />
        </Route>
        <Route path="/signals">
          <Placeholder title="Advanced Signals" />
        </Route>
        <Route path="/strategies">
          <Placeholder title="Strategy Builder" />
        </Route>
        <Route path="/portfolio">
          <Placeholder title="Deep Portfolio Analytics" />
        </Route>
        <Route path="/settings">
          <Placeholder title="Terminal Settings" />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
