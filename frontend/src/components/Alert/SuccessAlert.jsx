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
      }, [ onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 30, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed w-[95%] max-w-[30rem] top-0 left-1/2 transform -translate-x-1/2 z-[5000]"
        >
          <div className="bg-[#ffffff] border border-green-600 text-green-600 px-6 py-2 rounded-[5px] shadow-lg flex items-center justify-between space-x-4">
            
            <span>{message}</span>
            <button
              onClick={onClose}
              className="ml-4  font-bold text-xl leading-none cursor-pointer"
            >
              &times;
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessAlert;
