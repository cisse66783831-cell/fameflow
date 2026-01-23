import { motion } from 'framer-motion';
import { usePublicVisuals } from '@/hooks/usePublicVisuals';
import { useMemo } from 'react';
import { Star } from 'lucide-react';

// Mock visuals for fallback when database is empty
const mockVisuals = [
  { id: '1', name: 'Aminata D.', color: 'from-rose-400 to-pink-500', event: 'Festival Dakar' },
  { id: '2', name: 'Kofi M.', color: 'from-amber-400 to-orange-500', event: 'Concert Abidjan' },
  { id: '3', name: 'Fatou S.', color: 'from-emerald-400 to-teal-500', event: 'Gala Cotonou' },
  { id: '4', name: 'Moussa K.', color: 'from-sky-400 to-blue-500', event: 'Show Bamako' },
  { id: '5', name: 'Aïcha B.', color: 'from-violet-400 to-purple-500', event: 'Soirée Conakry' },
  { id: '6', name: 'Ibrahim T.', color: 'from-cyan-400 to-sky-500', event: 'Festival Lomé' },
  { id: '7', name: 'Marie L.', color: 'from-fuchsia-400 to-pink-500', event: 'Concert Douala' },
  { id: '8', name: 'Jean P.', color: 'from-indigo-400 to-violet-500', event: 'Gala Libreville' },
  { id: '9', name: 'Awa N.', color: 'from-rose-400 to-red-500', event: 'Show Niamey' },
  { id: '10', name: 'Oumar S.', color: 'from-amber-400 to-yellow-500', event: 'Festival Ouaga' },
  { id: '11', name: 'Safiatou D.', color: 'from-teal-400 to-emerald-500', event: 'Concert Dakar' },
  { id: '12', name: 'Mamadou C.', color: 'from-blue-400 to-indigo-500', event: 'Soirée Abidjan' },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  }
};

interface VisualCardProps {
  visual: typeof mockVisuals[0] & { imageUrl?: string; isFeatured?: boolean };
  index: number;
}

function VisualCard({ visual, index }: VisualCardProps) {
  // Vary heights for masonry effect
  const heights = ['h-48', 'h-56', 'h-64', 'h-52'];
  const height = heights[index % heights.length];

  return (
    <motion.div
      variants={fadeInScale}
      className={`${height} rounded-2xl overflow-hidden relative group cursor-pointer ${visual.isFeatured ? 'ring-2 ring-yellow-500/50' : ''}`}
      whileHover={{ scale: 1.03, zIndex: 10 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {visual.isFeatured && (
        <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-yellow-500 text-yellow-950 text-xs font-bold rounded-full flex items-center gap-1">
          <Star className="w-3 h-3" />
          Featured
        </div>
      )}
      {visual.imageUrl ? (
        // Real visual from database
        <img 
          src={visual.imageUrl} 
          alt={`Visuel de ${visual.name}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        // Mock visual with gradient
        <div className={`w-full h-full bg-gradient-to-br ${visual.color} p-4 flex flex-col justify-between`}>
          {/* Avatar */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-white font-bold text-sm backdrop-blur-sm">
              {visual.name.split(' ').map(n => n[0]).join('')}
            </div>
            <span className="text-white/90 text-sm font-medium truncate">{visual.name}</span>
          </div>
          
          {/* Event badge */}
          <div className="mt-auto">
            <div className="inline-block px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
              {visual.event}
            </div>
            <p className="text-white font-bold text-lg mt-2">J'y serai ! 🎉</p>
          </div>
        </div>
      )}
      
      {/* Hover overlay */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4"
      >
        <div>
          <p className="text-white font-semibold">{visual.name}</p>
          <p className="text-white/70 text-sm">{visual.event}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function SocialProofMasonry() {
  const { visuals: dbVisuals, isLoading } = usePublicVisuals();

  // Merge real visuals with mocks, prioritizing featured then real ones
  const displayVisuals = useMemo(() => {
    if (dbVisuals.length > 0) {
      // Sort: featured first, then by date
      const sorted = [...dbVisuals].sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      // Use real visuals
      return sorted.slice(0, 12).map((v, i) => ({
        id: v.id,
        name: v.creator_name,
        color: mockVisuals[i % mockVisuals.length].color,
        event: v.event?.title || 'Événement',
        imageUrl: v.visual_url,
        isFeatured: v.is_featured,
      }));
    }
    // Fallback to mock visuals
    return mockVisuals.map(m => ({ ...m, imageUrl: undefined, isFeatured: false }));
  }, [dbVisuals]);

  return (
    <motion.section 
      className="relative py-12 sm:py-16 px-4 sm:px-6 bg-gradient-to-b from-slate-50/50 to-white border-y border-slate-100 overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={staggerContainer}
    >
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div 
          className="text-center mb-8 sm:mb-10"
          variants={fadeInScale}
        >
          <p className="text-base sm:text-lg font-semibold text-slate-900 mb-2">
            Déjà plus de <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent font-bold">2 000</span> visuels créés
          </p>
          <p className="text-slate-500 text-sm">
            pour des événements en Afrique francophone
          </p>
        </motion.div>

        {/* Masonry Grid */}
        <motion.div 
          className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3"
          variants={staggerContainer}
        >
          {displayVisuals.map((visual, index) => (
            <VisualCard 
              key={visual.id} 
              visual={visual}
              index={index}
            />
          ))}
        </motion.div>

        {/* Loading shimmer */}
        {isLoading && (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 mt-3">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i}
                className="h-48 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </div>
    </motion.section>
  );
}
