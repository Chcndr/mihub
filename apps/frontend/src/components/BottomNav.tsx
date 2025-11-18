import { Home, Navigation, Wallet, MessageSquare, Store } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Button } from './ui/button';

export default function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Mappa' },
    { path: '/route', icon: Navigation, label: 'Route' },
    { path: '/wallet', icon: Wallet, label: 'Wallet' },
    { path: '/civic', icon: MessageSquare, label: 'Segnala' },
    { path: '/vetrine', icon: Store, label: 'Vetrine' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50">
      <div className="container max-w-2xl mx-auto px-2 py-2">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;

            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex flex-col items-center gap-1 min-w-[60px] min-h-[56px] ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
