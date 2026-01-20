import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Sparkles, 
  Users, 
  Zap, 
  Globe, 
  Heart,
  Camera,
  Ticket,
  Share2,
  Shield
} from 'lucide-react';

export default function About() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Camera,
      title: 'Campagnes virales',
      description: 'Créez des contenus personnalisables qui se partagent naturellement sur les réseaux sociaux.',
    },
    {
      icon: Ticket,
      title: 'Billetterie simplifiée',
      description: 'Vendez des billets avec paiement Mobile Money et validation par QR code.',
    },
    {
      icon: Share2,
      title: 'Partage social',
      description: 'Vos participants deviennent vos ambassadeurs en partageant leur contenu.',
    },
    {
      icon: Shield,
      title: 'Sécurité garantie',
      description: 'Chaque billet est unique avec un QR code crypté inviolable.',
    },
  ];

  const values = [
    {
      icon: Users,
      title: 'Communauté',
      description: 'Nous croyons en la puissance des communautés et des événements qui rassemblent.',
    },
    {
      icon: Zap,
      title: 'Simplicité',
      description: 'Des outils puissants mais simples à utiliser, accessibles à tous.',
    },
    {
      icon: Globe,
      title: 'Accessibilité',
      description: 'Solutions adaptées au marché africain avec paiement Mobile Money.',
    },
    {
      icon: Heart,
      title: 'Passion',
      description: 'Nous aimons ce que nous faisons et nous le faisons avec cœur.',
    },
  ];

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

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Notre histoire</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-6">
            Créer des moments 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent"> inoubliables</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Jyserai est né d'une vision simple : permettre à chacun de créer des expériences 
            mémorables et de les partager avec le monde. Notre plateforme connecte les créateurs 
            d'événements avec leur communauté de manière innovante.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold font-display mb-4">Notre mission</h2>
              <p className="text-muted-foreground mb-4">
                Démocratiser l'accès aux outils de création d'événements et de campagnes 
                marketing virales pour les entreprises, associations et créateurs africains.
              </p>
              <p className="text-muted-foreground">
                Nous croyons que chaque événement mérite d'être partagé, chaque moment 
                mérite d'être célébré, et chaque créateur mérite les outils pour réussir.
              </p>
            </div>
            <div className="glass-card rounded-3xl p-8">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <p className="text-4xl font-bold text-primary">2K+</p>
                  <p className="text-sm text-muted-foreground">Campagnes créées</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-primary">50K+</p>
                  <p className="text-sm text-muted-foreground">Contenus générés</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-primary">10+</p>
                  <p className="text-sm text-muted-foreground">Pays actifs</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-primary">98%</p>
                  <p className="text-sm text-muted-foreground">Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold font-display text-center mb-12">
            Ce que nous offrons
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 bg-card border-border/50">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold font-display text-center mb-12">
            Nos valeurs
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold mb-2">{value.title}</h3>
                <p className="text-muted-foreground text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold font-display mb-4">
            Prêt à créer ?
          </h2>
          <p className="text-muted-foreground mb-8">
            Rejoignez des milliers de créateurs qui utilisent Jyserai pour leurs événements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="gradient" size="lg" onClick={() => navigate('/auth?mode=signup')}>
              Commencer gratuitement
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/contact')}>
              Nous contacter
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
