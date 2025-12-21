import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center px-6 max-w-md">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <h1 className="text-[120px] md:text-[180px] font-bold text-primary/20 leading-none animate-pulse-glow">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="w-16 h-16 md:w-24 md:h-24 text-primary animate-float" />
          </div>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Page introuvable
        </h2>
        
        <p className="text-muted-foreground mb-8 text-lg">
          Oups ! La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="default" size="lg" className="gap-2">
            <Link to="/">
              <Home className="w-5 h-5" />
              Retour à l'accueil
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link to="/events">
              <ArrowLeft className="w-5 h-5" />
              Voir les événements
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
