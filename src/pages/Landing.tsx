import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { Header } from '@/components/Header';
import { 
  Sparkles, Image, Users, Zap, ArrowRight, Ticket, Calendar, TrendingUp,
  Camera, Share2, Heart, Star
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
    { icon: Image, title: 'Visuels "J\'y serai"', description: 'Créez et partagez des visuels viraux pour montrer votre enthousiasme.', highlight: true },
    { icon: Users, title: 'Mur Social', description: 'Un flux en temps réel des participants enthousiastes.' },
    { icon: Ticket, title: 'Billetterie Intégrée', description: 'Vendez vos tickets avec QR codes uniques et sécurisés.' },
    { icon: Zap, title: 'Scanner Staff', description: 'Validez les entrées en temps réel avec feedback visuel.' },
  ];

  const stats = [
    { value: '10K+', label: 'Participants' },
    { value: '500+', label: 'Événements' },
    { value: '1M+', label: 'Visuels "J\'y serai"' },
  ];

  const steps = [
    { 
      icon: Calendar, 
      title: 'Choisissez un événement', 
      description: 'Parcourez les événements à venir dans votre ville' 
    },
    { 
      icon: Camera, 
      title: 'Créez votre visuel', 
      description: 'Ajoutez votre photo sur le cadre officiel de l\'événement' 
    },
    { 
      icon: Share2, 
      title: 'Partagez sur vos réseaux', 
      description: 'Montrez à vos amis que vous y serez !' 
    },
    { 
      icon: Ticket, 
      title: 'Achetez votre ticket', 
      description: 'Recevez votre ticket avec QR code unique' 
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] animate-pulse-soft" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-success/5 rounded-full blur-[120px] animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      <Header />

      {/* Hero Section */}
      <section className="relative pt-28 pb-20 px-6">
        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6 animate-fade-in">
            <Heart className="w-4 h-4 fill-current" />
            <span>Rejoignez la communauté des passionnés</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display mb-6 animate-slide-up">
            Montrez que vous{' '}
            <span className="text-gradient-neon relative">
              y serez
              <Star className="absolute -top-4 -right-6 w-6 h-6 text-accent animate-pulse" />
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Créez des visuels viraux "<span className="text-primary font-medium">J'y serai</span>", 
            partagez votre enthousiasme et achetez vos tickets en un clic.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Button className="btn-neon-cyan gradient-accent text-accent-foreground" size="lg" onClick={() => navigate('/events')}>
              <Camera className="w-5 h-5 mr-2" />
              Créer mon visuel "J'y serai"
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/auth?mode=signup')}>
              Créer un événement <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Floating Visuals Preview */}
          <div className="relative mt-16 mx-auto max-w-3xl animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i}
                  className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-border/50 flex items-center justify-center animate-float"
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  <div className="text-center p-4">
                    <div className="w-16 h-16 rounded-full bg-primary/20 mx-auto mb-3 flex items-center justify-center">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground">Visuel #{i}</p>
                    <p className="text-sm font-medium text-gradient-neon">"J'y serai"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border/30 bg-card/30 relative z-10">
        <div className="container mx-auto px-6 grid grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-5xl font-bold text-gradient-neon mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works - J'y serai Focus */}
      <section className="py-20 px-6 relative z-10">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
              <TrendingUp className="w-4 h-4" />
              <span>Simple et viral</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-display">
              Comment créer votre{' '}
              <span className="text-gradient-neon">"J'y serai"</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {steps.map((step, i) => (
              <div 
                key={i} 
                className="relative p-6 rounded-2xl bg-card border border-border/50 hover:border-accent/30 hover:shadow-neon-cyan transition-all group"
              >
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full gradient-accent flex items-center justify-center text-accent-foreground font-bold text-sm">
                  {i + 1}
                </div>
                <div className="p-3 rounded-xl bg-accent/10 w-fit mb-4 group-hover:bg-accent/20 transition-colors">
                  <step.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button className="btn-neon gradient-primary" size="lg" onClick={() => navigate('/events')}>
              <Image className="w-5 h-5 mr-2" />
              Voir les événements
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 relative z-10 bg-card/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Tout pour <span className="text-gradient-neon">réussir</span> votre événement
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div 
                key={i} 
                className={`p-6 rounded-2xl border transition-all ${
                  f.highlight 
                    ? 'bg-primary/10 border-primary/30 hover:border-primary/50 shadow-neon-pink' 
                    : 'bg-card border-border/50 hover:border-primary/30'
                }`}
              >
                <div className={`p-3 rounded-xl w-fit mb-4 ${f.highlight ? 'bg-primary/20' : 'bg-primary/10'}`}>
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
                {f.highlight && (
                  <div className="mt-3 inline-flex items-center gap-1 text-xs text-primary font-medium">
                    <Star className="w-3 h-3 fill-current" />
                    Fonctionnalité phare
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative z-10">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-6">
            Prêt à montrer que vous{' '}
            <span className="text-gradient-neon">y serez</span> ?
          </h2>
          <p className="text-muted-foreground mb-8">
            Rejoignez des milliers de participants qui partagent déjà leur enthousiasme.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button className="btn-neon-cyan gradient-accent text-accent-foreground" size="lg" onClick={() => navigate('/events')}>
              <Camera className="w-5 h-5 mr-2" />
              Créer mon visuel
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/auth')}>
              Connexion
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8 px-6 relative z-10">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg gradient-neon"><Sparkles className="w-4 h-4 text-white" /></div>
            <span className="font-semibold text-gradient-neon">FameFlow</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <button onClick={() => navigate('/events')} className="hover:text-primary transition-colors">
              Événements
            </button>
            <button onClick={() => navigate('/auth')} className="hover:text-primary transition-colors">
              Connexion
            </button>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 FameFlow</p>
        </div>
      </footer>
    </div>
  );
}
