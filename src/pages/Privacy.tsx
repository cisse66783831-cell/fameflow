import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';

export default function Privacy() {
  return (
    <>
      <Helmet>
        <title>Politique de Confidentialité | Jyserai</title>
        <meta name="description" content="Politique de confidentialité de Jyserai - Comment nous protégeons vos données" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-8 pt-24 max-w-4xl">
          <Card className="p-8 space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Politique de Confidentialité</h1>
              <p className="text-muted-foreground">Dernière mise à jour : 26 janvier 2026</p>
            </div>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">1. Données collectées</h2>
              <p className="text-muted-foreground">
                Nous collectons les informations suivantes lorsque vous utilisez Jyserai :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Données de compte :</strong> Email, nom d'utilisateur lors de l'inscription</li>
                <li><strong>Photos :</strong> Images que vous téléchargez pour créer vos visuels "J'y serai"</li>
                <li><strong>Données de transaction :</strong> Informations de paiement pour l'achat de tickets</li>
                <li><strong>Données d'utilisation :</strong> Pages visitées, interactions avec l'application</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">2. Utilisation des données</h2>
              <p className="text-muted-foreground">
                Vos données sont utilisées pour :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Fournir et améliorer nos services</li>
                <li>Traiter vos achats de tickets</li>
                <li>Générer vos visuels personnalisés</li>
                <li>Vous envoyer des notifications importantes</li>
                <li>Analyser l'utilisation pour améliorer l'expérience</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">3. Partage des données</h2>
              <p className="text-muted-foreground">
                Nous ne vendons jamais vos données personnelles. Nous partageons uniquement avec :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Prestataires de paiement :</strong> Pour traiter vos transactions de manière sécurisée</li>
                <li><strong>Hébergeur :</strong> Pour stocker vos données de manière sécurisée</li>
                <li><strong>Organisateurs d'événements :</strong> Informations de ticket pour validation</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">4. Conservation des données</h2>
              <p className="text-muted-foreground">
                Vos données sont conservées tant que votre compte est actif. Les visuels partagés sont conservés 
                pendant 1 an après leur création. Vous pouvez demander la suppression de vos données à tout moment.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">5. Vos droits (RGPD)</h2>
              <p className="text-muted-foreground">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Accès :</strong> Obtenir une copie de vos données</li>
                <li><strong>Rectification :</strong> Corriger vos données inexactes</li>
                <li><strong>Effacement :</strong> Demander la suppression de vos données</li>
                <li><strong>Portabilité :</strong> Recevoir vos données dans un format standard</li>
                <li><strong>Opposition :</strong> Refuser certains traitements</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">6. Cookies</h2>
              <p className="text-muted-foreground">
                Nous utilisons des cookies essentiels pour le fonctionnement du site et des cookies d'analyse 
                (avec votre consentement) pour améliorer nos services. Vous pouvez gérer vos préférences 
                via la bannière de cookies.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">7. Sécurité</h2>
              <p className="text-muted-foreground">
                Nous utilisons des mesures de sécurité conformes aux standards de l'industrie : 
                chiffrement SSL/TLS, authentification sécurisée, et stockage sécurisé des données.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">8. Contact</h2>
              <p className="text-muted-foreground">
                Pour toute question concernant vos données personnelles, contactez-nous à :{' '}
                <a href="mailto:privacy@jyserai.com" className="text-primary hover:underline">
                  privacy@jyserai.com
                </a>
              </p>
            </section>
          </Card>
        </main>
      </div>
    </>
  );
}
