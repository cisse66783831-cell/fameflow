import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface PremiumLoaderProps {
  onComplete?: () => void;
}

export function PremiumLoader({ onComplete }: PremiumLoaderProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        scale: 1.05,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
      }}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-violet-100 to-fuchsia-100 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-100 to-sky-100 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </div>

      {/* Main content */}
      <div className="relative flex flex-col items-center">
        {/* Logo container with animations */}
        <motion.div
          className="relative mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Pulsing ring */}
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600"
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            style={{ margin: -8 }}
          />
          
          {/* Logo background */}
          <motion.div
            className="relative p-5 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-xl shadow-violet-500/30"
            animate={{
              boxShadow: [
                '0 20px 40px -10px rgba(139, 92, 246, 0.3)',
                '0 30px 50px -10px rgba(192, 38, 211, 0.4)',
                '0 20px 40px -10px rgba(139, 92, 246, 0.3)',
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="w-10 h-10 text-white" />
            
            {/* Sparkle effects */}
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full"
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="absolute -bottom-1 -left-1 w-2 h-2 bg-white rounded-full"
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }}
            />
          </motion.div>
        </motion.div>

        {/* Brand name */}
        <motion.h1
          className="text-3xl font-bold mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
            Jyserai
          </span>
        </motion.h1>

        {/* Progress indicator */}
        <div className="relative w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ 
              duration: 1.5, 
              ease: [0.22, 1, 0.36, 1],
            }}
            onAnimationComplete={onComplete}
          />
        </div>

        {/* Loading text */}
        <motion.p
          className="mt-4 text-sm text-slate-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Chargement...
          </motion.span>
        </motion.p>

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400"
            style={{
              top: '50%',
              left: '50%',
            }}
            initial={{ 
              x: 0, 
              y: 0, 
              scale: 0, 
              opacity: 0 
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * 150],
              y: [0, (Math.random() - 0.5) * 150],
              scale: [0, 1, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
