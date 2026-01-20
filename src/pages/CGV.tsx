import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function CGV() {
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
          Conditions Générales de Vente
        </h1>

        <div className="prose prose-invert prose-sm max-w-none space-y-6">
          <p className="text-muted-foreground">
            Dernière mise à jour : Janvier 2026
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">1. Objet</h2>
            <p className="text-muted-foreground">
              Les présentes Conditions Générales de Vente (CGV) régissent l'ensemble des ventes 
              de billets d'événements et services proposés sur la plateforme Jyserai. En utilisant 
              nos services, vous acceptez ces conditions dans leur intégralité.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">2. Services proposés</h2>
            <p className="text-muted-foreground">
              Jyserai est une plateforme permettant :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>La création et gestion de campagnes virales (photos, vidéos, documents)</li>
              <li>L'achat et la gestion de billets d'événements</li>
              <li>Le partage de contenus sur les réseaux sociaux</li>
              <li>La validation de billets via QR code</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">3. Prix et paiement</h2>
            <p className="text-muted-foreground">
              Les prix des billets sont indiqués en XOF (Franc CFA) et incluent toutes les taxes 
              applicables. Le paiement s'effectue via les moyens de paiement mobile suivants :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Orange Money</li>
              <li>MTN Mobile Money</li>
              <li>Moov Money</li>
              <li>Wave</li>
              <li>Carte bancaire</li>
            </ul>
            <p className="text-muted-foreground">
              La transaction est considérée comme complète une fois la confirmation de paiement reçue.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">4. Livraison des billets</h2>
            <p className="text-muted-foreground">
              Les billets sont délivrés sous forme électronique (e-ticket) immédiatement après 
              confirmation du paiement. Chaque billet contient un QR code unique permettant 
              l'accès à l'événement.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">5. Annulation et remboursement</h2>
            <p className="text-muted-foreground">
              Consultez notre <button onClick={() => navigate('/politique-remboursement')} className="text-primary hover:underline">Politique de remboursement</button> pour 
              les conditions d'annulation et de remboursement.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">6. Responsabilité</h2>
            <p className="text-muted-foreground">
              Jyserai agit en tant qu'intermédiaire entre les organisateurs d'événements et les 
              acheteurs. L'organisation, le contenu et le déroulement des événements restent 
              sous la responsabilité exclusive des organisateurs.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">7. Protection des données</h2>
            <p className="text-muted-foreground">
              Vos données personnelles sont collectées et traitées conformément à notre politique 
              de confidentialité. Nous utilisons ces données uniquement pour fournir nos services 
              et ne les partageons pas avec des tiers sans votre consentement.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">8. Propriété intellectuelle</h2>
            <p className="text-muted-foreground">
              L'ensemble des contenus présents sur la plateforme (logos, textes, images, design) 
              sont protégés par le droit de la propriété intellectuelle. Toute reproduction non 
              autorisée est interdite.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">9. Droit applicable</h2>
            <p className="text-muted-foreground">
              Les présentes CGV sont soumises au droit ivoirien. En cas de litige, les parties 
              s'engagent à rechercher une solution amiable avant toute action judiciaire.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">10. Contact</h2>
            <p className="text-muted-foreground">
              Pour toute question concernant ces CGV, contactez-nous via notre page 
              <button onClick={() => navigate('/contact')} className="text-primary hover:underline ml-1">Contact</button>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
