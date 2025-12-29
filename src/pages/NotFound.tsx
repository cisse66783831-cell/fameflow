import { Link, useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Home, ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const REDIRECT_DELAY = 10; // seconds

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showDetails, setShowDetails] = useState(false);
  const [countdown, setCountdown] = useState(REDIRECT_DELAY);
  const [isPaused, setIsPaused] = useState(false);
  
  // Extract error info from URL params (for hosting errors)
  const errorCode = searchParams.get('code') || '404';
  const errorId = searchParams.get('id');

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  // Auto-redirect countdown
  useEffect(() => {
    if (isPaused) return;
    
    if (countdown <= 0) {
      navigate('/');
      return;
    }
    
    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown, isPaused, navigate]);

  const handleReload = () => {
    window.location.reload();
  };

  const progressValue = ((REDIRECT_DELAY - countdown) / REDIRECT_DELAY) * 100;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <div className="text-center px-6 max-w-lg">
        {/* Animated Error Display */}
        <div className="relative mb-10">
          <div className="absolute inset-0 flex items-center justify-center blur-3xl opacity-30">
            <div className="w-40 h-40 bg-primary rounded-full animate-pulse" />
          </div>
          <div className="relative">
            <h1 className="text-[100px] md:text-[140px] font-black text-transparent bg-clip-text bg-gradient-to-br from-primary via-primary/80 to-primary/40 leading-none tracking-tighter">
              {errorCode}
            </h1>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
          </div>
        </div>
        
        <div className="space-y-4 mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Page introuvable
          </h2>
          
          <p className="text-muted-foreground text-lg leading-relaxed">
            La page que vous cherchez n'existe pas, a été déplacée ou n'est plus disponible.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/20">
            <Link to="/">
              <Home className="w-5 h-5" />
              Retour à l'accueil
            </Link>
          </Button>
          
          <Button onClick={handleReload} variant="outline" size="lg" className="gap-2">
            <RefreshCw className="w-5 h-5" />
            Actualiser
          </Button>
          
          <Button asChild variant="ghost" size="lg" className="gap-2">
            <Link to="/events">
              <ArrowLeft className="w-5 h-5" />
              Événements
            </Link>
          </Button>
        </div>

        {/* Auto-redirect countdown */}
        <div 
          className="mb-8 p-4 bg-muted/30 rounded-xl border border-border/50"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <p className="text-sm text-muted-foreground mb-3">
            {isPaused ? (
              "Redirection en pause"
            ) : (
              <>Redirection automatique dans <span className="font-semibold text-foreground">{countdown}s</span></>
            )}
          </p>
          <Progress value={progressValue} className="h-1.5" />
          <p className="text-xs text-muted-foreground/70 mt-2">
            Survolez pour annuler
          </p>
        </div>

        {/* Error ID display (if available from hosting) */}
        {errorId && (
          <div className="mt-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <AlertCircle className="w-4 h-4" />
              {showDetails ? "Masquer les détails" : "Afficher les détails"}
            </button>
            
            {showDetails && (
              <div className="mt-4 p-4 bg-muted/50 rounded-xl border border-border/50 text-left">
                <p className="text-xs text-muted-foreground font-mono break-all">
                  <span className="text-foreground/70">ID:</span> {errorId}
                </p>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  <span className="text-foreground/70">Route:</span> {location.pathname}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Decorative elements */}
        <div className="absolute top-1/4 left-10 w-2 h-2 bg-primary/30 rounded-full animate-ping" />
        <div className="absolute bottom-1/3 right-10 w-3 h-3 bg-primary/20 rounded-full animate-pulse" />
      </div>
    </div>
  );
};

export default NotFound;
