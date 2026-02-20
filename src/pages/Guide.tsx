import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import {
  ArrowRight, ArrowLeft, Sparkles, Upload, Sliders, Share2,
  Users, CheckCircle2, Camera, Smartphone, QrCode, TicketIcon,
  ScanLine, ChevronRight, Play, BarChart3, Globe
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Step {
  id: number;
  tag: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string; // tailwind bg class for the icon bubble
  visual: React.ReactNode;
  tips: string[];
}

// ─── Step visuals ─────────────────────────────────────────────────────────────
const CreateCampaignVisual = () => (
  <div className="relative w-full h-full flex items-center justify-center">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-72 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
    >
      {/* Mock modal header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-slate-900 text-sm">Nouvelle campagne</span>
      </div>
      {/* Mock form */}
      <div className="p-5 space-y-4">
        <div>
          <div className="text-xs text-slate-500 mb-1 font-medium">Titre de l'événement</div>
          <div className="rounded-xl border border-violet-300 bg-violet-50 px-3 py-2 text-sm text-violet-800 font-medium">
            Festival Dakar 2025
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1 font-medium">Type de media</div>
          <div className="flex gap-2">
            <div className="flex-1 rounded-xl border-2 border-violet-500 bg-violet-50 px-3 py-2 text-xs text-violet-700 font-semibold flex items-center gap-1">
              <Camera className="w-3 h-3" /> Photo
            </div>
            <div className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-400 flex items-center gap-1">
              <Play className="w-3 h-3" /> Vidéo
            </div>
          </div>
        </div>
        {/* Frame upload zone */}
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-4 text-center">
          <Upload className="w-5 h-5 text-slate-300 mx-auto mb-1" />
          <p className="text-xs text-slate-400">Déposer le visuel/cadre</p>
        </div>
        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-bold py-2.5 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5" /> Créer la campagne
        </motion.div>
      </div>
    </motion.div>
  </div>
);

const PhotoZoneVisual = () => (
  <div className="relative w-full h-full flex items-center justify-center">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-72 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
    >
      <div className="p-4 border-b border-slate-100">
        <span className="font-bold text-slate-900 text-sm">Zone photo du participant</span>
        <p className="text-xs text-slate-400 mt-0.5">Délimitez où apparaît la photo</p>
      </div>
      {/* Mock poster preview */}
      <div className="relative m-4 aspect-square bg-gradient-to-br from-violet-400 to-fuchsia-600 rounded-2xl overflow-hidden">
        {/* Simulated event poster */}
        <div className="absolute inset-0 flex flex-col items-center justify-end p-4">
          <div className="text-white font-black text-lg leading-tight text-center drop-shadow-lg">
            FESTIVAL<br/>DAKAR 2025
          </div>
        </div>
        {/* Draggable zone */}
        <motion.div
          animate={{ boxShadow: ['0 0 0 2px rgba(255,255,255,0.5)', '0 0 0 4px rgba(255,255,255,0.9)', '0 0 0 2px rgba(255,255,255,0.5)'] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-4 border-white bg-white/30 backdrop-blur-sm flex items-center justify-center cursor-move"
        >
          <Camera className="w-6 h-6 text-white" />
        </motion.div>
        {/* Handle indicator */}
        <div className="absolute bottom-2 right-2 bg-white/90 rounded-lg px-2 py-1 text-xs font-semibold text-violet-700 flex items-center gap-1">
          <Sliders className="w-3 h-3" /> Glisser
        </div>
      </div>
      <div className="px-4 pb-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-slate-200 p-2 text-center">
          <div className="text-xs text-slate-400">Forme</div>
          <div className="text-xs font-bold text-violet-700">Cercle ●</div>
        </div>
        <div className="rounded-xl border border-slate-200 p-2 text-center">
          <div className="text-xs text-slate-400">Taille</div>
          <div className="text-xs font-bold text-violet-700">25%</div>
        </div>
      </div>
    </motion.div>
  </div>
);

const ParticipantVisual = () => (
  <div className="relative w-full h-full flex items-center justify-center">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-72 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
    >
      <div className="p-4 border-b border-slate-100">
        <span className="font-bold text-slate-900 text-sm">Vue participant</span>
        <p className="text-xs text-slate-400 mt-0.5">Ce que voit le participant</p>
      </div>
      <div className="p-4 space-y-3">
        {/* Result preview */}
        <div className="relative aspect-square bg-gradient-to-br from-violet-400 to-fuchsia-600 rounded-2xl overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-4 border-white shadow-lg flex items-center justify-center text-white text-2xl font-bold">
            A
          </div>
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
            <p className="text-white font-black text-lg text-center">J'y serai ! 🎉</p>
            <p className="text-white/80 text-xs text-center">Festival Dakar 2025</p>
          </div>
        </div>
        {/* Action buttons */}
        <div className="flex gap-2">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="flex-1 bg-emerald-500 text-white rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1"
          >
            <Smartphone className="w-3 h-3" /> Télécharger
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            className="flex-1 bg-green-600 text-white rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1"
          >
            <Share2 className="w-3 h-3" /> WhatsApp
          </motion.div>
        </div>
      </div>
    </motion.div>
  </div>
);

const TicketVisual = () => (
  <div className="relative w-full h-full flex items-center justify-center">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-72 space-y-3"
    >
      {/* Event card */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-4">
          <p className="text-white font-black text-lg">Festival Dakar 2025</p>
          <p className="text-white/80 text-xs mt-1">Sam. 14 juin 2025 — 20h00</p>
        </div>
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Prix du ticket</p>
            <p className="text-2xl font-black text-slate-900">5 000 <span className="text-sm font-medium">FCFA</span></p>
          </div>
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl px-4 py-2 text-sm font-bold flex items-center gap-2"
          >
            <TicketIcon className="w-4 h-4" /> Acheter
          </motion.div>
        </div>
      </div>
      {/* Ticket in wallet */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex items-center gap-3 p-4"
      >
        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
          <QrCode className="w-6 h-6 text-slate-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-900">Mon ticket · Festival Dakar</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <p className="text-xs text-emerald-600 font-medium">Payé · Valide</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  </div>
);

const ScannerVisual = () => (
  <div className="relative w-full h-full flex items-center justify-center">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-72 bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
    >
      <div className="p-5 flex items-center gap-3 border-b border-white/10">
        <ScanLine className="w-5 h-5 text-violet-400" />
        <span className="font-bold text-white text-sm">Scanner de tickets</span>
      </div>
      {/* Camera viewfinder mock */}
      <div className="relative aspect-square bg-slate-800 flex items-center justify-center">
        <div className="relative w-40 h-40">
          {/* Corner brackets */}
          {[
            'top-0 left-0 border-t-2 border-l-2 rounded-tl-lg',
            'top-0 right-0 border-t-2 border-r-2 rounded-tr-lg',
            'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg',
            'bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg',
          ].map((cls, i) => (
            <div key={i} className={`absolute w-6 h-6 border-violet-400 ${cls}`} />
          ))}
          {/* Scan line */}
          <motion.div
            animate={{ top: ['10%', '85%', '10%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-0 right-0 h-0.5 bg-violet-400 shadow-[0_0_8px_2px_rgba(139,92,246,0.6)]"
            style={{ position: 'absolute' }}
          />
          {/* Fake QR grid */}
          <div className="absolute inset-3 grid grid-cols-7 gap-0.5 opacity-20">
            {Array.from({ length: 49 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-[1px]"
                style={{ opacity: Math.random() > 0.4 ? 1 : 0 }}
              />
            ))}
          </div>
        </div>
      </div>
      {/* Success state */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity, times: [0, 0.3, 0.7, 1], delay: 1.5 }}
        className="p-5 flex items-center gap-3 bg-emerald-500/20"
      >
        <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
        <div>
          <p className="text-white font-bold text-sm">Ticket valide ✓</p>
          <p className="text-white/60 text-xs">Aminata Diallo · Entrée autorisée</p>
        </div>
      </motion.div>
    </motion.div>
  </div>
);

const StatsVisual = () => (
  <div className="relative w-full h-full flex items-center justify-center">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-72 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
    >
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <BarChart3 className="w-5 h-5 text-violet-600" />
        <span className="font-bold text-slate-900 text-sm">Tableau de bord</span>
      </div>
      <div className="p-5 space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Vues', value: '1.2K', color: 'text-violet-600', bg: 'bg-violet-50' },
            { label: 'Visuels', value: '348', color: 'text-fuchsia-600', bg: 'bg-fuchsia-50' },
            { label: 'Tickets', value: '92', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.15 }}
              className={`rounded-xl ${s.bg} p-2.5 text-center`}
            >
              <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </motion.div>
          ))}
        </div>
        {/* Bar chart mock */}
        <div className="space-y-1.5">
          {[
            { label: 'Lun', w: '40%' },
            { label: 'Mar', w: '65%' },
            { label: 'Mer', w: '55%' },
            { label: 'Jeu', w: '80%' },
            { label: 'Ven', w: '90%' },
          ].map((bar, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-slate-400 w-6">{bar.label}</span>
              <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: bar.w }}
                  transition={{ delay: 0.8 + i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
          <Globe className="w-4 h-4 text-slate-400" />
          <p className="text-xs text-slate-500">Partagé dans <span className="font-semibold text-slate-700">12 pays</span></p>
        </div>
      </div>
    </motion.div>
  </div>
);

// ─── Steps data ────────────────────────────────────────────────────────────────
const STEPS: Step[] = [
  {
    id: 1,
    tag: 'Étape 1 · Créateur',
    title: 'Créez votre campagne',
    description:
      'Depuis votre tableau de bord, créez une nouvelle campagne en quelques secondes. Donnez-lui un titre, choisissez le type de contenu (photo ou vidéo), puis uploadez le visuel/cadre de votre événement.',
    icon: Sparkles,
    color: 'bg-violet-100 text-violet-600',
    visual: <CreateCampaignVisual />,
    tips: [
      'Le cadre peut être une affiche PNG transparente',
      'Les campagnes photo sont gratuites',
      'Les campagnes vidéo nécessitent un paiement de 2 000 FCFA',
    ],
  },
  {
    id: 2,
    tag: 'Étape 2 · Créateur',
    title: 'Configurez la zone photo',
    description:
      "Délimitez précisément l'endroit où apparaîtra la photo du participant. Choisissez entre une zone rectangulaire ou circulaire, glissez-la sur votre visuel et ajustez la taille. La zone s'intègre automatiquement au cadre.",
    icon: Camera,
    color: 'bg-fuchsia-100 text-fuchsia-600',
    visual: <PhotoZoneVisual />,
    tips: [
      'La zone circulaire est idéale pour les portraits',
      'Activez la "zone nom" pour afficher le prénom du participant',
      'Les modifications sont prévisualisées en temps réel',
    ],
  },
  {
    id: 3,
    tag: 'Étape 3 · Participant',
    title: 'Le participant crée son visuel',
    description:
      'Via le lien de votre campagne (ou le QR code), le participant accède à la page publique. Il uploade sa photo, ajuste la position et le zoom, renseigne son prénom, puis génère son visuel personnalisé "J\'y serai".',
    icon: Users,
    color: 'bg-amber-100 text-amber-600',
    visual: <ParticipantVisual />,
    tips: [
      'Aucune inscription requise pour les participants',
      'Le visuel est généré côté client, instantanément',
      'Disponible sur mobile WhatsApp et desktop',
    ],
  },
  {
    id: 4,
    tag: 'Étape 4 · Billetterie',
    title: 'Vendez des tickets en ligne',
    description:
      'Activez la billetterie sur votre événement. Les participants achètent leurs places via Mobile Money (Orange Money, MTN MoMo, Wave). Les tickets sont stockés dans leur wallet numérique avec un QR code unique.',
    icon: TicketIcon,
    color: 'bg-emerald-100 text-emerald-600',
    visual: <TicketVisual />,
    tips: [
      'Paiement via Orange Money, MTN MoMo, Wave',
      'Les tickets sont vérifiés côté serveur',
      'Option d\'offrir un ticket à un proche',
    ],
  },
  {
    id: 5,
    tag: 'Étape 5 · Le jour J',
    title: 'Scannez les tickets à l\'entrée',
    description:
      'Votre équipe staff scanne les QR codes avec n\'importe quel smartphone. L\'application valide instantanément le ticket, empêche les doublons et affiche le nom du porteur. Tout se passe sans connexion spéciale.',
    icon: ScanLine,
    color: 'bg-sky-100 text-sky-600',
    visual: <ScannerVisual />,
    tips: [
      'Aucun matériel spécial requis, juste un smartphone',
      'Fonctionne avec ou sans imprimé (QR dans le wallet)',
      'Les tickets déjà scannés sont bloqués automatiquement',
    ],
  },
  {
    id: 6,
    tag: 'Étape 6 · Analytics',
    title: 'Suivez vos résultats',
    description:
      'Depuis votre tableau de bord, visualisez en temps réel les vues, les créations de visuels, les téléchargements et les ventes de tickets. Exportez les statistiques au format CSV pour vos rapports.',
    icon: BarChart3,
    color: 'bg-rose-100 text-rose-600',
    visual: <StatsVisual />,
    tips: [
      'Vues et téléchargements trackés par campagne',
      'Répartition géographique des participants',
      'Export CSV disponible pour chaque événement',
    ],
  },
];

// ─── Animation variants ────────────────────────────────────────────────────────
const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 80 : -80,
    opacity: 0,
    scale: 0.97,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -80 : 80,
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Guide() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const step = STEPS[current];
  const Icon = step.icon;

  const goTo = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const next = () => { if (current < STEPS.length - 1) goTo(current + 1); };
  const prev = () => { if (current > 0) goTo(current - 1); };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Progress bar */}
      <div className="fixed top-[60px] left-0 right-0 z-40 h-1 bg-slate-200">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
          animate={{ width: `${((current + 1) / STEPS.length) * 100}%` }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <div className="pt-20 pb-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">

          {/* Page title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 sm:mb-12"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 text-violet-700 text-sm font-medium mb-4">
              <Play className="w-3.5 h-3.5" /> Guide interactif
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Comment utiliser Jyserai ?
            </h1>
            <p className="text-slate-500 mt-2 text-base sm:text-lg max-w-xl mx-auto">
              Parcourez les 6 étapes clés pour organiser et promouvoir votre événement.
            </p>
          </motion.div>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-8 sm:mb-12">
            {STEPS.map((s, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`transition-all duration-300 rounded-full flex items-center justify-center font-bold text-xs
                  ${i === current
                    ? 'w-8 h-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25'
                    : i < current
                    ? 'w-7 h-7 bg-violet-100 text-violet-600'
                    : 'w-7 h-7 bg-white border-2 border-slate-200 text-slate-400'
                  }`}
              >
                {i < current ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </button>
            ))}
          </div>

          {/* Main slide */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-center"
            >
              {/* Left: content */}
              <div className="space-y-6 order-2 lg:order-1">
                {/* Tag + icon */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${step.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-slate-500">{step.tag}</span>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-3">
                    {step.title}
                  </h2>
                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Tips */}
                <div className="space-y-2.5">
                  {step.tips.map((tip, i) => (
                    <motion.div
                      key={i}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-start gap-2.5"
                    >
                      <ChevronRight className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-600">{tip}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={prev}
                    disabled={current === 0}
                    className="rounded-xl border-slate-200"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Précédent
                  </Button>

                  {current < STEPS.length - 1 ? (
                    <Button
                      onClick={next}
                      className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold shadow-md shadow-violet-500/20 hover:shadow-lg hover:shadow-violet-500/30"
                    >
                      Étape suivante
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => navigate('/auth?mode=signup')}
                      className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold shadow-md shadow-violet-500/20 hover:shadow-lg hover:shadow-violet-500/30"
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      Commencer maintenant
                    </Button>
                  )}
                </div>

                {/* Step counter */}
                <p className="text-xs text-slate-400">
                  Étape {current + 1} sur {STEPS.length}
                </p>
              </div>

              {/* Right: visual mockup */}
              <div className="relative h-80 sm:h-96 lg:h-[500px] order-1 lg:order-2">
                {/* Background blob */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-50 via-fuchsia-50 to-white" />
                {/* Decorative dots */}
                <div className="absolute top-4 right-4 grid grid-cols-4 gap-1.5 opacity-30">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  ))}
                </div>
                <div className="relative h-full">
                  {step.visual}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* CTA bottom */}
          {current === STEPS.length - 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12 text-center p-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-3xl shadow-xl shadow-violet-500/20"
            >
              <h3 className="text-2xl font-bold text-white mb-2">Prêt à lancer votre événement ?</h3>
              <p className="text-white/80 mb-6">Créez votre première campagne en moins de 2 minutes.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate('/auth?mode=signup')}
                  className="bg-white text-violet-700 hover:bg-white/90 rounded-full px-8 font-bold shadow-lg"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Créer un compte gratuit
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/events')}
                  className="border-white/40 text-white hover:bg-white/10 rounded-full px-8"
                >
                  Voir des exemples
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
