import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function RefundPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold font-display">Jyserai</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold font-display mb-8">
          Politique de remboursement
        </h1>

        <div className="prose prose-invert prose-sm max-w-none space-y-6">
          <p className="text-muted-foreground">
            Dernière mise à jour : Janvier 2026
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">1. Principes généraux</h2>
            <p className="text-muted-foreground">
              Les billets achetés sur Jyserai sont des titres d'accès à des événements organisés 
              par des tiers. La politique de remboursement peut varier selon les événements et 
              les décisions des organisateurs.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">2. Annulation par l'acheteur</h2>
            <div className="bg-secondary/50 rounded-xl p-4 border border-border/50">
              <h3 className="font-medium mb-2">Conditions de remboursement :</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Plus de 7 jours avant l'événement :</strong> Remboursement intégral moins 5% de frais de service</li>
                <li><strong>Entre 3 et 7 jours avant :</strong> Remboursement de 50% du prix du billet</li>
                <li><strong>Moins de 3 jours avant :</strong> Aucun remboursement possible</li>
              </ul>
            </div>
            <p className="text-muted-foreground text-sm">
              Note : Ces conditions sont indicatives. Certains organisateurs peuvent appliquer 
              des politiques plus restrictives ou plus souples.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">3. Annulation par l'organisateur</h2>
            <p className="text-muted-foreground">
              En cas d'annulation d'un événement par l'organisateur, vous serez remboursé 
              intégralement dans un délai de 14 jours ouvrés. Le remboursement sera effectué 
              via le même moyen de paiement utilisé lors de l'achat.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">4. Report d'événement</h2>
            <p className="text-muted-foreground">
              Si un événement est reporté à une nouvelle date :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Votre billet reste valide pour la nouvelle date</li>
              <li>Vous pouvez demander un remboursement si la nouvelle date ne vous convient pas</li>
              <li>La demande de remboursement doit être faite dans les 7 jours suivant l'annonce du report</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">5. Billets non utilisés</h2>
            <p className="text-muted-foreground">
              Les billets non utilisés le jour de l'événement ne sont pas remboursables. 
              Il est de la responsabilité de l'acheteur de s'assurer de sa disponibilité.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">6. Billets cadeaux</h2>
            <p className="text-muted-foreground">
              Pour les billets achetés en cadeau, seul l'acheteur (et non le bénéficiaire) 
              peut demander un remboursement. Les mêmes conditions s'appliquent.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">7. Procédure de remboursement</h2>
            <p className="text-muted-foreground">
              Pour demander un remboursement :
            </p>
            <ol className="list-decimal pl-6 text-muted-foreground space-y-2">
              <li>Connectez-vous à votre compte Jyserai</li>
              <li>Accédez à votre portefeuille de billets</li>
              <li>Sélectionnez le billet concerné</li>
              <li>Cliquez sur "Demander un remboursement"</li>
              <li>Suivez les instructions à l'écran</li>
            </ol>
            <p className="text-muted-foreground">
              Le traitement des demandes de remboursement peut prendre jusqu'à 7 jours ouvrés.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">8. Délais de remboursement</h2>
            <div className="bg-secondary/50 rounded-xl p-4 border border-border/50">
              <ul className="text-muted-foreground space-y-2">
                <li><strong>Orange Money / MTN / Moov / Wave :</strong> 1-3 jours ouvrés</li>
                <li><strong>Carte bancaire :</strong> 5-10 jours ouvrés</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">9. Cas exceptionnels</h2>
            <p className="text-muted-foreground">
              En cas de force majeure (catastrophe naturelle, pandémie, etc.), des conditions 
              spéciales peuvent être appliquées. Nous vous tiendrons informé par email de 
              toute modification de la politique de remboursement.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">10. Contact</h2>
            <p className="text-muted-foreground">
              Pour toute question concernant un remboursement, contactez notre service client 
              via la page <button onClick={() => navigate('/contact')} className="text-primary hover:underline">Contact</button>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
