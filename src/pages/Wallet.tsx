import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { TicketWallet } from '@/components/TicketWallet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Ticket, LogIn } from 'lucide-react';

export default function WalletPage() {
  const navigate = useNavigate();
  const { user, loading: isLoading } = useAuth();

  return (
    <>
      <Helmet>
        <title>Mon Wallet | Jyserai</title>
        <meta name="description" content="Gérez vos tickets d'événements" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-6 py-8 pt-24 max-w-2xl">
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
