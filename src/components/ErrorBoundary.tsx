import React, { Component, ErrorInfo, ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center px-6 max-w-md">
            {/* Error Icon */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-destructive/20 flex items-center justify-center animate-pulse">
                  <AlertTriangle className="w-12 h-12 text-destructive" />
                </div>
                <div className="absolute inset-0 w-24 h-24 rounded-full bg-destructive/10 animate-ping" />
              </div>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Oups ! Une erreur est survenue
            </h2>
            
            <p className="text-muted-foreground mb-8 text-lg">
              Ne vous inquiétez pas, notre équipe est informée. Essayez de recharger la page.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={this.handleReload} 
                variant="default" 
                size="lg" 
                className="gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Recharger la page
              </Button>
              
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/" onClick={this.handleReset}>
                  <Home className="w-5 h-5" />
                  Retour à l'accueil
                </Link>
              </Button>
            </div>

            {/* Debug info in dev */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left bg-muted/50 rounded-lg p-4">
                <summary className="cursor-pointer text-sm text-muted-foreground">
                  Détails de l'erreur (dev only)
                </summary>
                <pre className="mt-2 text-xs text-destructive overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
