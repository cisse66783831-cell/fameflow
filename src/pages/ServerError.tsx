import { Link } from "react-router-dom";
import { Home, RefreshCw, ServerCrash, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const ServerError = () => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-destructive/5">
      <div className="text-center px-6 max-w-lg">
        {/* Animated Error Display */}
        <div className="relative mb-10">
          <div className="absolute inset-0 flex items-center justify-center blur-3xl opacity-20">
            <div className="w-40 h-40 bg-destructive rounded-full animate-pulse" />
          </div>
          <div className="relative flex flex-col items-center">
            <div className="mb-4 p-6 bg-destructive/10 rounded-full">
              <ServerCrash className="w-16 h-16 text-destructive animate-pulse" />
            </div>
            <h1 className="text-[80px] md:text-[120px] font-black text-transparent bg-clip-text bg-gradient-to-br from-destructive via-destructive/80 to-destructive/40 leading-none tracking-tighter">
              500
            </h1>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-destructive to-transparent rounded-full" />
          </div>
        </div>
        
        <div className="space-y-4 mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Erreur serveur
          </h2>
          
          <p className="text-muted-foreground text-lg leading-relaxed">
            Oups ! Quelque chose s'est mal passé de notre côté. Notre équipe a été informée et travaille à résoudre le problème.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Button onClick={handleReload} size="lg" className="gap-2 shadow-lg shadow-destructive/20">
            <RefreshCw className="w-5 h-5" />
            Réessayer
          </Button>
          
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link to="/">
              <Home className="w-5 h-5" />
              Retour à l'accueil
            </Link>
          </Button>
        </div>

        {/* Support link */}
        <div className="mt-8 p-4 bg-muted/30 rounded-xl border border-border/50">
          <p className="text-sm text-muted-foreground mb-3">
            Le problème persiste ?
          </p>
          <Button variant="ghost" size="sm" className="gap-2 text-primary" asChild>
            <a href="mailto:support@example.com">
              <Mail className="w-4 h-4" />
              Contacter le support
            </a>
          </Button>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 left-10 w-2 h-2 bg-destructive/30 rounded-full animate-ping" />
        <div className="absolute bottom-1/3 right-10 w-3 h-3 bg-destructive/20 rounded-full animate-pulse" />
      </div>
    </div>
  );
};

export default ServerError;
