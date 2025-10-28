import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";


const SuccessAlert = ({ message, show, onClose }) => {

    useEffect(() => {
        if (show) {
          const timer = setTimeout(() => {
            onClose();
           
          }, 5000); // Auto-dismiss after 5 seconds
         
          return () => clearTimeout(timer); // Clear timeout if component unmounts
        }
      }, [onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -100, opacity: 0, scale: 0.9 }}
          animate={{ y: 20, opacity: 1, scale: 1 }}
          exit={{ y: -100, opacity: 0, scale: 0.9 }}
          transition={{ 
            duration: 0.4,
            type: "spring",
            stiffness: 300,
            damping: 25
          }}
          className="fixed w-[95%] max-w-[32rem] left-1/2 transform -translate-x-1/2 z-[5000] top-4"
        >
          {/* Futuristic Glassmorphism Container */}
          <div className="relative backdrop-blur-2xl bg-gradient-to-r from-emerald-600/20 via-green-500/20 to-teal-600/20 border-2 border-emerald-400/50 rounded-2xl shadow-2xl shadow-emerald-500/30 overflow-hidden">
            
            {/* Animated gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 via-green-500/30 to-teal-600/30 opacity-50 blur-xl animate-pulse"></div>
            
            {/* Animated shimmer effect */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
              style={{ opacity: 0.1 }}
            />
            
            {/* Content */}
            <div className="relative px-6 py-4 flex items-center gap-4">
              
              {/* Icon Container */}
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/50"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              
              {/* Message */}
              <div className="flex-1">
                <p className="text-white font-medium text-sm md:text-base tracking-wide">
                  {message}
                </p>
              </div>
              
              {/* Close Button */}
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors duration-200 group"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
              
            </div>
            
            {/* Bottom progress bar */}
            <motion.div 
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 5, ease: "linear" }}
            />
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessAlert;
