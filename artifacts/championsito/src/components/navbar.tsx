import { Link, useLocation } from 'wouter';
import { Trophy, Users, LayoutDashboard, Menu, X, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/hooks/use-auth';

export function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { token } = useAuthStore();

  const links = [
    { href: '/', label: 'Home', icon: Trophy },
    { href: '/classifica', label: 'Classifica', icon: Trophy },
    { href: '/partecipanti', label: 'Partecipanti', icon: Users },
  ];

  if (token) {
    links.push({ href: '/admin', label: 'Dashboard', icon: LayoutDashboard });
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-bold tracking-tight text-white">
              Championsito <span className="text-primary text-glow">ST 26</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
            {!token && (
              <Link
                href="/admin"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors ml-4"
              >
                <ShieldAlert className="h-4 w-4" />
                Admin
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-background/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-2 py-3 rounded-md transition-colors ${
                    isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
            {!token && (
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-2 py-3 rounded-md text-muted-foreground hover:text-white hover:bg-white/5 transition-colors mt-2 border-t border-white/10"
              >
                <ShieldAlert className="h-5 w-5" />
                Area Admin
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
