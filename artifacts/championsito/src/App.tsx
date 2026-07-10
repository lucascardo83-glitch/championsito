import { Link, Route, Switch, Router as WouterRouter } from 'wouter';
import Home from './pages/home';
import Classifica from './pages/classifica';
import Partecipanti from './pages/partecipanti';
import Admin from './pages/admin/index';
import { Navbar } from './components/navbar';
import NotFound from './pages/not-found';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

const queryClient = new QueryClient();

function Router() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <Navbar />
      <main className="flex-1 w-full z-10">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/classifica" component={Classifica} />
          <Route path="/partecipanti" component={Partecipanti} />
          <Route path="/admin" component={Admin} />
          <Route component={NotFound} />
        </Switch>
      </main>
      
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-white/5 bg-background/50 backdrop-blur-sm z-10 relative mt-auto">
        <p>© {new Date().getFullYear()} Championsito ST 26. All rights reserved.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
