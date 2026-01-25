import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Sparkles, ArrowRight, Play, CheckCircle2, Users, Smartphone, 
  BarChart3, Share2, MessageCircle, Video, Image as ImageIcon
} from 'lucide-react';
import { SocialProofMasonry } from '@/components/SocialProofMasonry';
import { FeaturedCampaignsPreview } from '@/components/FeaturedCampaignsPreview';
import { LandingDemo } from '@/components/LandingDemo';
// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const floatAnimation = {
  animate: {
    y: [0, -15, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// 3D Card hover component
const Card3D = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    setRotateX((y - centerY) / 10);
    setRotateY((centerX - x) / 10);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      className={className}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d"
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        animate={{
          rotateX: rotateX,
          rotateY: rotateY,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [activeVisual, setActiveVisual] = useState(0);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

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
      <motion.header 
        className="relative z-50 py-4 px-4 sm:px-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Jyserai</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button 
              variant="ghost" 
              className="text-slate-600 hover:text-slate-900 hidden sm:flex"
              onClick={() => navigate('/auth')}
            >
              Connexion
            </Button>
            <Button 
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-4 sm:px-6 text-sm sm:text-base"
              onClick={() => navigate('/auth?mode=signup')}
            >
              Commencer
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section 
        className="relative pt-8 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-6"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <motion.div 
              className="text-left"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div 
                variants={fadeInUp}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-xs sm:text-sm font-medium mb-4 sm:mb-6"
              >
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Communication événementielle</span>
              </motion.div>
              
              <motion.h1 
                variants={fadeInUp}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-4 sm:mb-6"
              >
                Faites parler de votre événement{' '}
                <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                  avant même qu'il commence
                </span>
              </motion.h1>
              
              <motion.p 
                variants={fadeInUp}
                className="text-base sm:text-lg md:text-xl text-slate-600 mb-6 sm:mb-8 max-w-xl"
              >
                Créez des visuels "<span className="font-semibold text-slate-900">J'y serai</span>" que vos participants partagent sur WhatsApp et les réseaux sociaux.
              </motion.p>
              
              <motion.div 
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              >
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-full px-6 sm:px-8 h-12 sm:h-14 text-sm sm:text-base font-semibold shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all w-full sm:w-auto"
                  onClick={() => navigate('/auth?mode=signup')}
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Créer une campagne "J'y serai"
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="rounded-full px-6 h-12 sm:h-14 text-sm sm:text-base border-slate-200 text-slate-700 hover:bg-slate-50 w-full sm:w-auto"
                  onClick={() => navigate('/events')}
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Voir un exemple
                </Button>
              </motion.div>
            </motion.div>

            {/* Right - 3D Floating Visuals - Hidden on mobile, shown on lg */}
            <div className="relative h-[350px] sm:h-[400px] lg:h-[500px] mt-8 lg:mt-0">
              {/* Main floating card */}
              <motion.div 
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 sm:w-64 lg:w-72 h-72 sm:h-80 lg:h-96 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-600 p-1 shadow-2xl shadow-violet-500/30 transition-all duration-700 ${activeVisual === 0 ? 'scale-100 rotate-0' : 'scale-95 rotate-3 opacity-80'}`}
                variants={floatAnimation}
                animate="animate"
              >
                <div className="w-full h-full bg-white rounded-[22px] p-3 sm:p-4 flex flex-col">
                  <div className="flex-1 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center overflow-hidden">
                    <div className="text-center">
                      <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mx-auto mb-2 sm:mb-3 flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                        A
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500">Aminata</p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 text-center">
                    <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                      J'y serai ! 🎉
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-400 mt-1">Festival Dakar 2025</p>
                  </div>
                </div>
              </motion.div>

              {/* Second floating card - Hidden on very small screens */}
              <motion.div 
                className={`hidden sm:block absolute top-8 sm:top-16 right-4 sm:right-8 w-44 sm:w-56 h-56 sm:h-72 rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 p-1 shadow-xl shadow-cyan-500/20 transition-all duration-700 ${activeVisual === 1 ? 'scale-100 rotate-0' : 'scale-90 -rotate-6 opacity-70'}`}
                variants={floatAnimation}
                animate="animate"
                transition={{ delay: 1 }}
              >
                <div className="w-full h-full bg-white rounded-[14px] p-2 sm:p-3 flex flex-col">
                  <div className="flex-1 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 mx-auto mb-2 flex items-center justify-center text-white text-base sm:text-lg font-bold">
                        K
                      </div>
                      <p className="text-[10px] sm:text-xs text-slate-500">Kofi</p>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-center mt-2 text-slate-700">J'y serai !</p>
                </div>
              </motion.div>

              {/* Third floating card - Hidden on very small screens */}
              <motion.div 
                className={`hidden sm:block absolute bottom-8 sm:bottom-12 left-0 sm:left-4 w-40 sm:w-48 h-48 sm:h-60 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 p-1 shadow-xl shadow-pink-500/20 transition-all duration-700 ${activeVisual === 2 ? 'scale-100 rotate-0' : 'scale-90 rotate-6 opacity-70'}`}
                variants={floatAnimation}
                animate="animate"
                transition={{ delay: 2 }}
              >
                <div className="w-full h-full bg-white rounded-[14px] p-2 sm:p-3 flex flex-col">
                  <div className="flex-1 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl flex items-center justify-center">
                    <Video className="w-8 sm:w-10 h-8 sm:h-10 text-slate-300" />
                  </div>
                  <p className="text-[10px] sm:text-xs font-semibold text-center mt-2 text-slate-700">Vidéo "J'y serai"</p>
                </div>
              </motion.div>

              {/* Floating bubbles */}
              <motion.div 
                className="absolute top-4 sm:top-8 left-8 sm:left-16 w-8 sm:w-12 h-8 sm:h-12 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 opacity-60"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div 
                className="absolute bottom-16 sm:bottom-24 right-2 sm:right-4 w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-gradient-to-br from-violet-200 to-fuchsia-300 opacity-60"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              />
              <motion.div 
                className="absolute top-24 sm:top-32 right-24 sm:right-32 w-4 sm:w-6 h-4 sm:h-6 rounded-full bg-gradient-to-br from-cyan-200 to-sky-300 opacity-60"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Social Proof Masonry - Real visuals from database */}
      <SocialProofMasonry />

      {/* How it Works */}
      <motion.section 
        className="relative py-16 sm:py-24 px-4 sm:px-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <div className="container mx-auto max-w-5xl">
          <motion.div variants={fadeInUp} className="text-center mb-10 sm:mb-16">
            <span className="inline-block px-3 sm:px-4 py-1.5 rounded-full bg-violet-50 text-violet-700 text-xs sm:text-sm font-medium mb-3 sm:mb-4">
              Comment ça marche
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
              3 étapes simples
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {steps.map((step, i) => (
              <Card3D key={i} className="h-full">
                <motion.div 
                  variants={fadeInUp}
                  className="relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-violet-100 transition-all group h-full"
                  whileHover={{ y: -5 }}
                >
                  <div className="text-4xl sm:text-5xl font-bold text-violet-100 group-hover:text-violet-200 transition-colors mb-3 sm:mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2 sm:mb-3">{step.title}</h3>
                  <p className="text-sm sm:text-base text-slate-600">{step.description}</p>
                  
                  {i < steps.length - 1 && (
                    <ArrowRight className="hidden md:block absolute top-1/2 -right-4 w-6 sm:w-8 h-6 sm:h-8 text-slate-200" />
                  )}
                </motion.div>
              </Card3D>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Benefits */}
      <motion.section 
        className="relative py-16 sm:py-24 px-4 sm:px-6 bg-slate-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <div className="container mx-auto max-w-5xl">
          <motion.div variants={fadeInUp} className="text-center mb-10 sm:mb-16">
            <span className="inline-block px-3 sm:px-4 py-1.5 rounded-full bg-fuchsia-50 text-fuchsia-700 text-xs sm:text-sm font-medium mb-3 sm:mb-4">
              Avantages
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
              Pourquoi utiliser Jyserai ?
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {benefits.map((benefit, i) => (
              <Card3D key={i} className="h-full">
                <motion.div 
                  variants={fadeInUp}
                  className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-slate-100 hover:border-violet-200 hover:shadow-xl transition-all group h-full"
                  whileHover={{ y: -5 }}
                >
                  <motion.div 
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center mb-4 sm:mb-6"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <benefit.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </motion.div>
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2 sm:mb-3">{benefit.title}</h3>
                  <p className="text-sm sm:text-base text-slate-600">{benefit.description}</p>
                </motion.div>
              </Card3D>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Image + Video Section */}
      <motion.section 
        className="relative py-16 sm:py-24 px-4 sm:px-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <motion.div variants={fadeInUp}>
              <span className="inline-block px-3 sm:px-4 py-1.5 rounded-full bg-cyan-50 text-cyan-700 text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                Formats
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-4 sm:mb-6">
                Images et vidéos "J'y serai"
              </h2>
              <p className="text-base sm:text-lg text-slate-600 mb-6 sm:mb-8">
                Vos participants créent des images et de courtes vidéos personnalisées pour montrer qu'ils seront présents.
              </p>
              <motion.div className="space-y-3 sm:space-y-4" variants={staggerContainer}>
                {[
                  "Photos personnalisées avec cadre événement",
                  "Vidéos courtes optimisées pour WhatsApp",
                  "Partage instantané sur tous les réseaux"
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    variants={fadeInUp}
                    className="flex items-center gap-2 sm:gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-slate-700">{item}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            
            {/* Visual mockups - Now uses featured campaigns */}
            <FeaturedCampaignsPreview />
          </div>
        </div>
      </motion.section>

      {/* Interactive Demo Section */}
      <LandingDemo />

      {/* Final CTA */}
      <motion.section 
        className="relative py-16 sm:py-24 px-4 sm:px-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <div className="container mx-auto max-w-3xl">
          <motion.div 
            className="relative p-8 sm:p-12 md:p-16 rounded-2xl sm:rounded-[32px] bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 text-center overflow-hidden"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div 
                className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl"
                animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div 
                className="absolute bottom-0 left-0 w-36 sm:w-48 h-36 sm:h-48 bg-white/10 rounded-full blur-3xl"
                animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
                Prêt à lancer votre campagne ?
              </h2>
              <p className="text-base sm:text-lg text-white/80 mb-6 sm:mb-8">
                Gratuit pour commencer. Aucune carte bancaire requise.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  size="lg"
                  className="bg-white text-violet-700 hover:bg-white/90 rounded-full px-6 sm:px-8 h-12 sm:h-14 text-sm sm:text-base font-semibold shadow-xl w-full sm:w-auto"
                  onClick={() => navigate('/auth?mode=signup')}
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Créer ma campagne maintenant
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        className="relative py-8 sm:py-12 px-4 sm:px-6 border-t border-slate-100"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <span className="font-bold text-slate-900 text-sm sm:text-base">Jyserai</span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
              {[
                { label: 'Événements', path: '/events' },
                { label: 'À propos', path: '/a-propos' },
                { label: 'Contact', path: '/contact' },
                { label: 'CGV', path: '/cgv' },
                { label: 'Remboursement', path: '/politique-remboursement' },
              ].map((link) => (
                <motion.button 
                  key={link.path}
                  onClick={() => navigate(link.path)} 
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  {link.label}
                </motion.button>
              ))}
            </div>
            
            <p className="text-xs sm:text-sm text-slate-500">© 2025 Jyserai</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
