import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import ChatWidget from "./components/ChatWidget";
import HomePage from "./pages/HomePage";
import MapPage from "./pages/MapPage";
import WalletPage from "./pages/WalletPage";
import CivicPage from "./pages/CivicPage";
import RoutePage from "./pages/RoutePage";
import VetrinePage from "./pages/VetrinePage";
import HubOperatore from "./pages/HubOperatore";
import DashboardPA from "./pages/DashboardPA";
import MioPage from "./pages/mio";
import MIHUBPage from "./pages/MIHUBPage";

function Router() {
  return (
    <Switch>
      <Route path="/" sonnElement={'exact'} component={HomePage} />
      <Route path="/mappa" component={MapPage} />
      <Route path="/wallet" component={WalletPage} />
      <Route path="/civic" component={CivicPage} />
      <Route path="/route" component={RoutePage} />
      <Route path="/vetrine" component={VetrinePage} />
      <Route path="/hub-operatore" component={HubOperatore} />
      <Route path="/dashboard-pa" component={DashboardPA} />
      <Route path="/mio" component={MioPage} />
      <Route path="/mihub" component={MIHUBPage} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
          <ChatWidget userRole="client" />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
