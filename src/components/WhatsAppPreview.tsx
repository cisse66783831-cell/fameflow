import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Check, CheckCheck } from 'lucide-react';

interface WhatsAppPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  userName?: string;
  eventName?: string;
}

export function WhatsAppPreview({ 
  isOpen, 
  onClose, 
  imageUrl, 
  userName = 'Vous',
  eventName = 'Événement'
}: WhatsAppPreviewProps) {
  const currentTime = new Date().toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Phone mockup */}
          <motion.div
            className="fixed left-1/2 top-1/2 z-50"
            initial={{ opacity: 0, scale: 0.8, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.8, x: '-50%', y: '-50%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Phone frame */}
            <div className="relative w-[280px] sm:w-[320px] bg-slate-900 rounded-[40px] p-2 shadow-2xl">
              {/* Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-10" />
              
              {/* Screen */}
              <div className="relative bg-[#0b141a] rounded-[32px] overflow-hidden">
                {/* WhatsApp header */}
                <div className="bg-[#1f2c34] px-3 py-2 flex items-center gap-3 pt-8">
                  <button 
                    onClick={onClose}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-white/70" />
                  </button>
                  
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold">
                    G
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">Groupe Famille 👨‍👩‍👧‍👦</p>
                    <p className="text-white/50 text-xs">12 participants</p>
                  </div>
                </div>

                {/* Chat background */}
                <div 
                  className="h-[400px] sm:h-[480px] p-3 overflow-hidden"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundColor: '#0b141a'
                  }}
                >
                  {/* Previous messages */}
                  <motion.div 
                    className="flex justify-start mb-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="bg-[#1f2c34] rounded-lg rounded-tl-none px-3 py-2 max-w-[75%]">
                      <p className="text-[#25d366] text-xs font-medium mb-1">Papa</p>
                      <p className="text-white/90 text-sm">Qui vient à l'événement ce weekend ?</p>
                      <p className="text-white/40 text-[10px] text-right mt-1">10:23</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="flex justify-start mb-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="bg-[#1f2c34] rounded-lg rounded-tl-none px-3 py-2 max-w-[75%]">
                      <p className="text-[#e91e63] text-xs font-medium mb-1">Maman</p>
                      <p className="text-white/90 text-sm">Moi je serai là ! 🙋‍♀️</p>
                      <p className="text-white/40 text-[10px] text-right mt-1">10:25</p>
                    </div>
                  </motion.div>

                  {/* User's message with visual */}
                  <motion.div 
                    className="flex justify-end mb-3"
                    initial={{ opacity: 0, x: 20, y: 20 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ delay: 0.8, type: 'spring' }}
                  >
                    <div className="bg-[#005c4b] rounded-lg rounded-tr-none overflow-hidden max-w-[75%]">
                      {/* Visual preview */}
                      <div className="relative aspect-[3/4] w-48 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
                        {imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt="Visual preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold mb-3">
                              {userName[0]?.toUpperCase() || 'A'}
                            </div>
                            <p className="text-white/80 text-xs text-center">{userName}</p>
                            <div className="mt-auto bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 rounded-full">
                              <p className="text-white font-bold text-sm">J'y serai ! 🎉</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="px-3 py-2">
                        <p className="text-white/90 text-sm">
                          {userName} sera présent(e) à {eventName} ! 🔥
                        </p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <p className="text-white/40 text-[10px]">{currentTime}</p>
                          <CheckCheck className="w-4 h-4 text-[#53bdeb]" />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Reaction */}
                  <motion.div 
                    className="flex justify-start mb-3"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.4, type: 'spring' }}
                  >
                    <div className="bg-[#1f2c34] rounded-lg rounded-tl-none px-3 py-2">
                      <p className="text-[#ff9800] text-xs font-medium mb-1">Petit frère</p>
                      <p className="text-white/90 text-sm">Trop stylé le visuel ! 🔥🔥</p>
                      <p className="text-white/40 text-[10px] text-right mt-1">{currentTime}</p>
                    </div>
                  </motion.div>

                  {/* Typing indicator */}
                  <motion.div 
                    className="flex justify-start"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8 }}
                  >
                    <div className="bg-[#1f2c34] rounded-lg rounded-tl-none px-4 py-3">
                      <div className="flex gap-1">
                        <motion.div 
                          className="w-2 h-2 bg-white/50 rounded-full"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div 
                          className="w-2 h-2 bg-white/50 rounded-full"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div 
                          className="w-2 h-2 bg-white/50 rounded-full"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Input bar */}
                <div className="bg-[#1f2c34] px-3 py-2 flex items-center gap-2">
                  <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2">
                    <p className="text-white/30 text-sm">Message</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Label */}
            <motion.p
              className="text-center text-white/80 text-sm mt-4 font-medium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Aperçu du partage WhatsApp
            </motion.p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
