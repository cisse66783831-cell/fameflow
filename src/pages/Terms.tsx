import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';

export default function Terms() {
  return (
    <>
      <Helmet>
        <title>Conditions d'Utilisation | Jyserai</title>
        <meta name="description" content="Conditions générales d'utilisation de la plateforme Jyserai" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-8 pt-24 max-w-4xl">
          <Card className="p-8 space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Conditions d'Utilisation</h1>
              <p className="text-muted-foreground">Dernière mise à jour : 26 janvier 2026</p>
            </div>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">1. Acceptation des conditions</h2>
              <p className="text-muted-foreground">
                En utilisant Jyserai, vous acceptez ces conditions d'utilisation. Si vous n'êtes pas d'accord, 
                veuillez ne pas utiliser notre service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">2. Description du service</h2>
              <p className="text-muted-foreground">
                Jyserai est une plateforme permettant de :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Créer des visuels personnalisés "J'y serai" pour les événements</li>
                <li>Acheter et gérer des tickets d'événements</li>
                <li>Partager votre participation sur les réseaux sociaux</li>
                <li>Organiser et promouvoir des événements (pour les organisateurs)</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">3. Compte utilisateur</h2>
              <p className="text-muted-foreground">
                Vous devez avoir au moins 13 ans pour créer un compte. Vous êtes responsable de maintenir 
                la confidentialité de votre mot de passe et de toutes les activités sur votre compte.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">4. Utilisation acceptable</h2>
              <p className="text-muted-foreground">
                En utilisant Jyserai, vous vous engagez à ne pas :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Télécharger du contenu illégal, offensant ou violant les droits d'autrui</li>
                <li>Utiliser le service pour du spam ou des activités frauduleuses</li>
                <li>Tenter de contourner les mesures de sécurité</li>
                <li>Revendre des tickets à un prix supérieur au prix original</li>
                <li>Créer de faux événements ou des arnaques</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">5. Propriété intellectuelle</h2>
              <p className="text-muted-foreground">
                Les visuels que vous créez restent votre propriété. Cependant, vous nous accordez une licence 
                pour afficher et partager ces visuels dans le cadre du service. Le contenu, design et code 
                de Jyserai restent notre propriété.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">6. Achats et remboursements</h2>
              <p className="text-muted-foreground">
                Les achats de tickets sont soumis à notre{' '}
                <a href="/politique-remboursement" className="text-primary hover:underline">
                  politique de remboursement
                </a>. Les organisateurs d'événements sont responsables de leurs événements.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">7. Résiliation</h2>
              <p className="text-muted-foreground">
                Nous pouvons suspendre ou résilier votre compte si vous violez ces conditions. 
                Vous pouvez également supprimer votre compte à tout moment.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">8. Limitation de responsabilité</h2>
              <p className="text-muted-foreground">
                Jyserai est fourni "tel quel" sans garantie. Nous ne sommes pas responsables des dommages 
                indirects résultant de l'utilisation du service. Notre responsabilité est limitée au 
                montant que vous avez payé pour utiliser le service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">9. Modifications</h2>
              <p className="text-muted-foreground">
                Nous pouvons modifier ces conditions à tout moment. Les modifications importantes seront 
                notifiées par email ou via l'application.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">10. Droit applicable</h2>
              <p className="text-muted-foreground">
                Ces conditions sont régies par le droit français. Tout litige sera soumis à la juridiction 
                des tribunaux compétents.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">11. Contact</h2>
              <p className="text-muted-foreground">
                Pour toute question :{' '}
                <a href="mailto:contact@jyserai.com" className="text-primary hover:underline">
                  contact@jyserai.com
                </a>
              </p>
            </section>
          </Card>
        </main>
      </div>
    </>
  );
}
