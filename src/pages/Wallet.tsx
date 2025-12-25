import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { TicketWallet } from '@/components/TicketWallet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Ticket, LogIn } from 'lucide-react';

export default function WalletPage() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  return (
    <>
      <Helmet>
        <title>Mon Wallet | FameFlow</title>
        <meta name="description" content="Gérez vos tickets d'événements" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>

            <h1 className="text-lg font-semibold font-display flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              Mon Wallet
            </h1>

            <div className="w-20" /> {/* Spacer */}
          </div>
        </header>

        <main className="container mx-auto px-6 py-8 max-w-2xl">
          {!user && !isLoading ? (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <LogIn className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Connectez-vous</h2>
              <p className="text-muted-foreground mb-6">
                Connectez-vous pour accéder à vos tickets.
              </p>
              <Button
                onClick={() => navigate('/auth')}
                className="gradient-primary text-white"
              >
                Se connecter
              </Button>
            </Card>
          ) : (
            <TicketWallet />
          )}
        </main>
      </div>
    </>
  );
}
