import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Builder from "@/pages/builder";
import TextExtractor from "@/pages/text-extractor";
import ATSAnalysis from "@/pages/ats-analysis";
import TemplateTest from "@/pages/template-test";


function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/builder" component={Builder} />
      <Route path="/builder/:id" component={Builder} />
      <Route path="/text-extractor" component={TextExtractor} />
      <Route path="/ats-analysis" component={ATSAnalysis} />
      <Route path="/template-test" component={TemplateTest} />
      <Route component={NotFound} />
    </Switch>
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
