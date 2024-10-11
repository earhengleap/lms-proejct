import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  color?: "blue" | "green" | "sky" | "red";
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  color = "blue",
}) => {
  const colors = {
    blue: "bg-blue-500 hover:bg-blue-600",
    green: "bg-green-500 hover:bg-green-600",
    sky: "bg-sky-500 hover:bg-sky-600",
    red: "bg-red-500 hover:bg-red-600",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full m-4"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5, ease: "easeInOut" }}
                className="text-2xl font-semibold text-gray-800 dark:text-white"
              >
                {title}
              </motion.h2>
              <motion.button
                whileHover={{
                  scale: 1.2,
                  rotate: 90, // Adding rotation for hover effect
                  opacity: 0.8,
                  transition: { type: "spring", stiffness: 300 },
                }}
                whileTap={{
                  scale: 0.8,
                  rotate: -90, // Rotate in opposite direction on tap
                  opacity: 0.6,
                  transition: { type: "spring", stiffness: 500 },
                }}
                onClick={onClose}
                className="p-1 text-gray-800 dark:text-white transition-colors duration-200"
              >
                <XMarkIcon className="w-6 h-6" />
              </motion.button>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeInOut" }}
              className="p-6 text-gray-600 dark:text-gray-300"
            >
              {children}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
