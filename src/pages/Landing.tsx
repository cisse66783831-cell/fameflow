import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { 
  Sparkles, ArrowRight, Play, CheckCircle2, Users, Smartphone, 
  BarChart3, Share2, MessageCircle, Video, Image as ImageIcon
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [activeVisual, setActiveVisual] = useState(0);

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  // Rotate floating visuals
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveVisual((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { 
      number: '01',
      title: 'Créez votre campagne', 
      description: 'Ajoutez le nom de l\'événement et un visuel de fond.' 
    },
    { 
      number: '02',
      title: 'Les participants créent leur visuel', 
      description: 'Ils ajoutent leur photo ou vidéo et disent "J\'y serai".' 
    },
    { 
      number: '03',
      title: 'Ils partagent partout', 
      description: 'Votre événement gagne en visibilité naturellement.' 
    },
  ];

  const benefits = [
    { 
      icon: Share2, 
      title: 'Faites parler de votre événement', 
      description: 'Chaque participant devient un ambassadeur qui partage sur ses réseaux.' 
    },
    { 
      icon: Users, 
      title: 'Transformez vos participants en ambassadeurs', 
      description: 'La preuve sociale au service de votre communication.' 
    },
    { 
      icon: Smartphone, 
      title: 'Pensé pour WhatsApp et le mobile', 
      description: 'Formats optimisés pour le partage instantané sur mobile.' 
    },
    { 
      icon: BarChart3, 
      title: 'Suivez l\'engagement en temps réel', 
      description: 'Statistiques détaillées sur les créations et partages.' 
    },
  ];

  const avatars = [
    { name: 'Aminata', color: 'bg-rose-500' },
    { name: 'Kofi', color: 'bg-amber-500' },
    { name: 'Fatou', color: 'bg-emerald-500' },
    { name: 'Moussa', color: 'bg-sky-500' },
    { name: 'Aïcha', color: 'bg-violet-500' },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden light">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-violet-100/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-50/60 via-transparent to-transparent" />
      </div>

      {/* Header */}
      <header className="relative z-50 py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Jyserai</span>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              className="text-slate-600 hover:text-slate-900 hidden sm:flex"
              onClick={() => navigate('/auth')}
            >
              Connexion
            </Button>
            <Button 
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6"
              onClick={() => navigate('/auth?mode=signup')}
            >
              Commencer
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-sm font-medium mb-6">
                <MessageCircle className="w-4 h-4" />
                <span>Communication événementielle</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Faites parler de votre événement{' '}
                <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                  avant même qu'il commence
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-xl">
                Créez des visuels "<span className="font-semibold text-slate-900">J'y serai</span>" que vos participants partagent sur WhatsApp et les réseaux sociaux.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-full px-8 h-14 text-base font-semibold shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all"
                  onClick={() => navigate('/auth?mode=signup')}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Créer une campagne "J'y serai"
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="rounded-full px-6 h-14 text-base border-slate-200 text-slate-700 hover:bg-slate-50"
                  onClick={() => navigate('/events')}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Voir un exemple
                </Button>
              </div>
            </div>

            {/* Right - 3D Floating Visuals */}
            <div className="relative h-[500px] hidden lg:block">
              {/* Main floating card */}
              <div 
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-96 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-600 p-1 shadow-2xl shadow-violet-500/30 transition-all duration-700 ${activeVisual === 0 ? 'scale-100 rotate-0' : 'scale-95 rotate-3 opacity-80'}`}
                style={{ animation: 'float 6s ease-in-out infinite' }}
              >
                <div className="w-full h-full bg-white rounded-[22px] p-4 flex flex-col">
                  <div className="flex-1 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center overflow-hidden">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold">
                        A
                      </div>
                      <p className="text-sm text-slate-500">Aminata</p>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                      J'y serai ! 🎉
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Festival Dakar 2025</p>
                  </div>
                </div>
              </div>

              {/* Second floating card */}
              <div 
                className={`absolute top-16 right-8 w-56 h-72 rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 p-1 shadow-xl shadow-cyan-500/20 transition-all duration-700 ${activeVisual === 1 ? 'scale-100 rotate-0' : 'scale-90 -rotate-6 opacity-70'}`}
                style={{ animation: 'float 6s ease-in-out infinite', animationDelay: '1s' }}
              >
                <div className="w-full h-full bg-white rounded-[14px] p-3 flex flex-col">
                  <div className="flex-1 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 mx-auto mb-2 flex items-center justify-center text-white text-lg font-bold">
                        K
                      </div>
                      <p className="text-xs text-slate-500">Kofi</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-center mt-2 text-slate-700">J'y serai !</p>
                </div>
              </div>

              {/* Third floating card */}
              <div 
                className={`absolute bottom-12 left-4 w-48 h-60 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 p-1 shadow-xl shadow-pink-500/20 transition-all duration-700 ${activeVisual === 2 ? 'scale-100 rotate-0' : 'scale-90 rotate-6 opacity-70'}`}
                style={{ animation: 'float 6s ease-in-out infinite', animationDelay: '2s' }}
              >
                <div className="w-full h-full bg-white rounded-[14px] p-3 flex flex-col">
                  <div className="flex-1 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl flex items-center justify-center">
                    <Video className="w-10 h-10 text-slate-300" />
                  </div>
                  <p className="text-xs font-semibold text-center mt-2 text-slate-700">Vidéo "J'y serai"</p>
                </div>
              </div>

              {/* Floating bubbles */}
              <div className="absolute top-8 left-16 w-12 h-12 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 opacity-60" style={{ animation: 'float 4s ease-in-out infinite' }} />
              <div className="absolute bottom-24 right-4 w-8 h-8 rounded-full bg-gradient-to-br from-violet-200 to-fuchsia-300 opacity-60" style={{ animation: 'float 5s ease-in-out infinite', animationDelay: '1s' }} />
              <div className="absolute top-32 right-32 w-6 h-6 rounded-full bg-gradient-to-br from-cyan-200 to-sky-300 opacity-60" style={{ animation: 'float 4.5s ease-in-out infinite', animationDelay: '0.5s' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Social Proof */}
      <section className="relative py-16 px-6 bg-gradient-to-b from-slate-50/50 to-white border-y border-slate-100">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-lg font-semibold text-slate-900 mb-8">
            Déjà plus de <span className="text-violet-600">2 000</span> visuels créés pour des événements en Afrique francophone
          </p>
          
          {/* Avatars */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex -space-x-3">
              {avatars.map((avatar, i) => (
                <div 
                  key={i}
                  className={`w-12 h-12 rounded-full ${avatar.color} border-3 border-white flex items-center justify-center text-white font-bold text-sm shadow-lg`}
                  style={{ zIndex: avatars.length - i }}
                >
                  {avatar.name[0]}
                </div>
              ))}
              <div className="w-12 h-12 rounded-full bg-slate-200 border-3 border-white flex items-center justify-center text-slate-600 font-medium text-xs shadow-lg">
                +2K
              </div>
            </div>
          </div>

          {/* Mini visual grid */}
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2 max-w-2xl mx-auto opacity-60">
            {Array.from({ length: 8 }).map((_, i) => (
              <div 
                key={i}
                className="aspect-[3/4] rounded-lg bg-gradient-to-br from-slate-100 to-slate-200"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="relative py-24 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-violet-50 text-violet-700 text-sm font-medium mb-4">
              Comment ça marche
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              3 étapes simples
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div 
                key={i} 
                className="relative p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:border-violet-100 transition-all group"
              >
                <div className="text-5xl font-bold text-violet-100 group-hover:text-violet-200 transition-colors mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600">{step.description}</p>
                
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-4 w-8 h-8 text-slate-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="relative py-24 px-6 bg-slate-50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-fuchsia-50 text-fuchsia-700 text-sm font-medium mb-4">
              Avantages
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Pourquoi utiliser Jyserai ?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, i) => (
              <div 
                key={i} 
                className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-violet-200 hover:shadow-lg transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <benefit.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{benefit.title}</h3>
                <p className="text-slate-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image + Video Section */}
      <section className="relative py-24 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-50 text-cyan-700 text-sm font-medium mb-4">
                Formats
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Images et vidéos "J'y serai"
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Vos participants créent des images et de courtes vidéos personnalisées pour montrer qu'ils seront présents.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-slate-700">Photos personnalisées avec cadre événement</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-slate-700">Vidéos courtes optimisées pour WhatsApp</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-slate-700">Partage instantané sur tous les réseaux</span>
                </div>
              </div>
            </div>
            
            {/* Visual mockups */}
            <div className="relative h-80">
              {/* Image mockup */}
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 w-48 h-64 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 p-1 shadow-xl rotate-[-8deg]"
                style={{ animation: 'float 5s ease-in-out infinite' }}
              >
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-slate-200" />
                </div>
              </div>
              
              {/* Video mockup */}
              <div 
                className="absolute right-0 top-1/2 -translate-y-1/2 w-52 h-72 rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 p-1 shadow-xl rotate-[5deg]"
                style={{ animation: 'float 6s ease-in-out infinite', animationDelay: '1s' }}
              >
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center relative">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                    <Play className="w-8 h-8 text-slate-400 ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 px-6">
        <div className="container mx-auto max-w-3xl">
          <div className="relative p-12 md:p-16 rounded-[32px] bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 text-center overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Prêt à lancer votre campagne ?
              </h2>
              <p className="text-lg text-white/80 mb-8">
                Gratuit pour commencer. Aucune carte bancaire requise.
              </p>
              <Button 
                size="lg"
                className="bg-white text-violet-700 hover:bg-white/90 rounded-full px-8 h-14 text-base font-semibold shadow-xl"
                onClick={() => navigate('/auth?mode=signup')}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Créer ma campagne maintenant
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-slate-100">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-900">Jyserai</span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <button onClick={() => navigate('/events')} className="text-slate-600 hover:text-slate-900 transition-colors">
                Événements
              </button>
              <button onClick={() => navigate('/a-propos')} className="text-slate-600 hover:text-slate-900 transition-colors">
                À propos
              </button>
              <button onClick={() => navigate('/contact')} className="text-slate-600 hover:text-slate-900 transition-colors">
                Contact
              </button>
              <button onClick={() => navigate('/cgv')} className="text-slate-600 hover:text-slate-900 transition-colors">
                CGV
              </button>
              <button onClick={() => navigate('/politique-remboursement')} className="text-slate-600 hover:text-slate-900 transition-colors">
                Remboursement
              </button>
            </div>
            
            <p className="text-sm text-slate-500">© 2025 Jyserai</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
