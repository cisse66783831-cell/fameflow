import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen = ({ message = "Chargement..." }: LoadingScreenProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-primary/20 animate-pulse" />
          </div>
        </div>
        <p className="text-muted-foreground text-lg animate-pulse">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
