import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { 
  Sparkles, Image, Users, Zap, ArrowRight, Ticket, Calendar, TrendingUp
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
    { icon: Ticket, title: 'Billetterie Intégrée', description: 'Vendez vos tickets avec QR codes uniques et sécurisés.' },
    { icon: Image, title: 'Visuels "J\'y serai"', description: 'Vos participants créent et partagent des visuels viraux.' },
    { icon: Users, title: 'Mur Social', description: 'Un flux en temps réel des participants enthousiastes.' },
    { icon: Zap, title: 'Scanner Staff', description: 'Validez les entrées en temps réel avec feedback visuel.' },
  ];

  const stats = [
    { value: '10K+', label: 'Participants' },
    { value: '500+', label: 'Événements' },
    { value: '1M+', label: 'Visuels créés' },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] animate-pulse-soft" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] animate-pulse-soft" style={{ animationDelay: '1s' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl gradient-neon animate-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-display text-gradient-neon">FameFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/events')}>Événements</Button>
            <Button variant="ghost" onClick={() => navigate('/auth')}>Connexion</Button>
            <Button className="btn-neon gradient-primary" onClick={() => navigate('/auth?mode=signup')}>Commencer</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 animate-fade-in">
            <TrendingUp className="w-4 h-4" />
            <span>La plateforme événementielle nouvelle génération</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold font-display mb-6 animate-slide-up">
            Créez le <span className="text-gradient-neon">buzz</span> autour de vos <span className="text-gradient-neon">événements</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Billetterie, visuels viraux "J'y serai", mur social et scanner sécurisé.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Button className="btn-neon gradient-primary" size="lg" onClick={() => navigate('/events')}>
              <Ticket className="w-5 h-5 mr-2" />
              Découvrir les événements
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/auth?mode=signup')}>
              Créer un événement <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
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

      {/* Features */}
      <section className="py-20 px-6 relative z-10">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Tout pour <span className="text-gradient-neon">réussir</span></h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-glow transition-all">
                <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4"><f.icon className="w-6 h-6 text-primary" /></div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8 px-6 relative z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg gradient-neon"><Sparkles className="w-4 h-4 text-white" /></div>
            <span className="font-semibold text-gradient-neon">FameFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 FameFlow</p>
        </div>
      </footer>
    </div>
  );
}
