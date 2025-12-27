import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  Sparkles, LogOut, User, Calendar, Ticket, ScanLine, LayoutDashboard, Plus, Home
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
      <div className="container mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="p-2 rounded-xl gradient-neon animate-glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold font-display text-gradient-neon hidden sm:block">
            Jyserai
          </span>
        </button>

        {/* Navigation Links */}
        <div className="flex items-center gap-1 md:gap-2">
          <Button 
            variant={isActive('/') ? 'secondary' : 'ghost'} 
            size="sm"
            onClick={() => navigate('/')}
            className="hidden sm:flex"
          >
            <Home className="w-4 h-4 mr-1" />
            Accueil
          </Button>

          <Button 
            variant={isActive('/events') ? 'secondary' : 'ghost'} 
            size="sm"
            onClick={() => navigate('/events')}
            className="hidden sm:flex"
          >
            <Calendar className="w-4 h-4 mr-1" />
            Événements
          </Button>

          {user ? (
            <>
              {/* My Events - accessible to all logged in users */}
              <Button 
                variant={isActive('/admin/events') ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => navigate('/admin/events')}
              >
                <LayoutDashboard className="w-4 h-4 md:mr-1" />
                <span className="hidden md:inline">Mes événements</span>
              </Button>

              {/* Scanner Link - always visible for logged in users */}
              <Button 
                variant={isActive('/scanner') ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => navigate('/scanner')}
                className="hidden md:flex"
              >
                <ScanLine className="w-4 h-4 mr-1" />
                <span className="hidden lg:inline">Scanner</span>
              </Button>

              {/* Wallet */}
              <Button 
                variant={isActive('/wallet') ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => navigate('/wallet')}
              >
                <Ticket className="w-4 h-4 md:mr-1" />
                <span className="hidden md:inline">Wallet</span>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/')}>
                    <Home className="w-4 h-4 mr-2" />
                    Accueil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/events')}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Événements
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/wallet')}>
                    <Ticket className="w-4 h-4 mr-2" />
                    Mes tickets
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin/events')}>
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Mes événements
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/scanner')}>
                    <ScanLine className="w-4 h-4 mr-2" />
                    Scanner
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => signOut()} 
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/auth')}
              >
                Connexion
              </Button>
              <Button 
                className="btn-neon gradient-primary" 
                size="sm"
                onClick={() => navigate('/auth?mode=signup')}
              >
                <Plus className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Créer un événement</span>
                <span className="sm:hidden">Créer</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
