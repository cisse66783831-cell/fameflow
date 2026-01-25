import { motion } from 'framer-motion';
import { Image as ImageIcon, Video, Play } from 'lucide-react';
import { useFeaturedCampaigns, fillWithDuplicates, getLowQualityUrl } from '@/hooks/useFeaturedCampaigns';

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

// Number of preview slots to fill
const IMAGE_SLOTS = 1;
const VIDEO_SLOTS = 1;

export function FeaturedCampaignsPreview() {
  const { data: campaigns = [], isLoading } = useFeaturedCampaigns();
  
  // Separate by type for potential future use
  const imageCampaigns = campaigns.filter(c => c.type !== 'video' || !c.type);
  const videoCampaigns = campaigns.filter(c => c.type === 'video');
  
  // Use all campaigns for both slots (since frame_image works for both)
  const allCampaigns = campaigns.length > 0 ? campaigns : [];
  
  // Fill slots with duplicates if needed
  const imageItems = fillWithDuplicates(
    allCampaigns.length > 0 ? allCampaigns : [],
    IMAGE_SLOTS
  );
  const videoItems = fillWithDuplicates(
    allCampaigns.length > 0 ? allCampaigns : [],
    VIDEO_SLOTS
  );

  // Get display item (cycle through available campaigns)
  const imageItem = imageItems[0];
  const videoItem = videoItems.length > 1 ? videoItems[1] : videoItems[0];

  const hasContent = allCampaigns.length > 0;

  return (
    <motion.div 
      variants={fadeInScale}
      className="relative h-64 sm:h-80"
    >
      {/* Image mockup */}
      <motion.div 
        className="absolute left-4 sm:left-0 top-1/2 -translate-y-1/2 w-36 sm:w-48 h-48 sm:h-64 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 p-1 shadow-xl overflow-hidden"
        initial={{ rotate: -8 }}
        whileHover={{ rotate: 0, scale: 1.05 }}
        animate={{ y: [0, -10, 0] }}
        transition={{ 
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          rotate: { type: "spring", stiffness: 300 }
        }}
      >
        <div className="w-full h-full bg-white rounded-[10px] sm:rounded-[14px] flex items-center justify-center overflow-hidden">
          {hasContent && imageItem?.frame_image ? (
            <img 
              src={getLowQualityUrl(imageItem.frame_image, 200)}
              alt={imageItem.title || "Campagne"}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 text-slate-200" />
          )}
        </div>
      </motion.div>
      
      {/* Video mockup */}
      <motion.div 
        className="absolute right-4 sm:right-0 top-1/2 -translate-y-1/2 w-40 sm:w-52 h-56 sm:h-72 rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 p-1 shadow-xl overflow-hidden"
        initial={{ rotate: 5 }}
        whileHover={{ rotate: 0, scale: 1.05 }}
        animate={{ y: [0, -12, 0] }}
        transition={{ 
          y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 },
          rotate: { type: "spring", stiffness: 300 }
        }}
      >
        <div className="w-full h-full bg-white rounded-[10px] sm:rounded-[14px] flex items-center justify-center relative overflow-hidden">
          {hasContent && videoItem?.frame_image ? (
            <>
              <img 
                src={getLowQualityUrl(videoItem.frame_image, 220)}
                alt={videoItem.title || "Campagne vidéo"}
                className="w-full h-full object-cover absolute inset-0"
                loading="lazy"
              />
              {/* Play overlay */}
              <motion.div 
                className="relative z-10 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-6 h-6 sm:w-8 sm:h-8 text-slate-700 ml-1" />
              </motion.div>
            </>
          ) : (
            <motion.div 
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-100 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400 ml-1" />
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
