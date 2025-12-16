import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { 
  Sparkles, Image, FileText, Download, Share2, 
  Users, Zap, Shield, ArrowRight 
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const features = [
    {
      icon: Image,
      title: 'Cadres Photo Viraux',
      description: 'Créez des cadres personnalisés pour vos campagnes sur les réseaux sociaux.'
    },
    {
      icon: FileText,
      title: 'Certificats & Diplômes',
      description: 'Générez des documents professionnels avec des champs personnalisables.'
    },
    {
      icon: Download,
      title: 'Export Multi-format',
      description: 'Téléchargez en PNG ou PDF, partagez directement sur les réseaux.'
    },
    {
      icon: Zap,
      title: 'IA Intégrée',
      description: 'Génération automatique de titres et hashtags optimisés.'
    },
  ];

  const stats = [
    { value: '10K+', label: 'Créateurs' },
    { value: '50K+', label: 'Campagnes' },
    { value: '1M+', label: 'Téléchargements' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-display">FrameFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/auth')}>
              Connexion
            </Button>
            <Button variant="gradient" onClick={() => navigate('/auth?mode=signup')}>
              Commencer
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>La plateforme de campagnes virales</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold font-display mb-6 animate-slide-up">
            Créez des campagnes{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              virales
            </span>{' '}
            en quelques clics
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Cadres photo personnalisés, certificats professionnels, génération IA. 
            Tout ce dont vous avez besoin pour engager votre audience.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Button variant="gradient" size="lg" onClick={() => navigate('/auth?mode=signup')}>
              Créer mon compte gratuit
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/auth')}>
              J'ai déjà un compte
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold font-display text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Des outils puissants pour créer des campagnes qui engagent votre audience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div 
                key={i}
                className="glass-card rounded-2xl p-6 hover:shadow-elevated transition-all duration-300 group"
              >
                <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="glass-card rounded-3xl p-8 md:p-12 text-center bg-gradient-to-br from-primary/10 to-accent/10">
            <h2 className="text-3xl font-bold font-display mb-4">
              Prêt à lancer votre première campagne ?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Rejoignez des milliers de créateurs qui utilisent FrameFlow pour engager leur audience.
            </p>
            <Button variant="gradient" size="lg" onClick={() => navigate('/auth?mode=signup')}>
              Commencer gratuitement
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-accent">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">FrameFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 FrameFlow. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
