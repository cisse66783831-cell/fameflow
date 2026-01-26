import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Delay showing the banner slightly for better UX
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <Card className="max-w-2xl mx-auto p-4 md:p-6 bg-card/95 backdrop-blur-lg border-border shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 flex-shrink-0">
            <Cookie className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-foreground">🍪 Cookies</h3>
              <button
                onClick={declineCookies}
                className="p-1 hover:bg-muted rounded-md transition-colors sm:hidden"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              Nous utilisons des cookies pour améliorer votre expérience et analyser l'utilisation du site.{' '}
              <Link to="/cgv" className="text-primary hover:underline">
                En savoir plus
              </Link>
            </p>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                onClick={acceptCookies}
                size="sm"
                className="gradient-primary text-white"
              >
                Accepter
              </Button>
              <Button
                onClick={declineCookies}
                variant="outline"
                size="sm"
              >
                Refuser
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
