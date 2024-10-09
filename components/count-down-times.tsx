import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CountdownTimerProps {
  initialTime: number;
  onComplete: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  initialTime,
  onComplete,
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onComplete, initialTime]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (time % 60).toString().padStart(2, "0");
    return { minutes, seconds };
  };

  const { minutes, seconds } = formatTime(timeLeft);

  return (
    <div className="flex justify-center items-center space-x-1 sm:space-x-2 p-2 sm:p-3 rounded-xl bg-gray-100">
      <FlipUnitContainer unit={minutes} label="Min" />
      <span className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
        :
      </span>
      <FlipUnitContainer unit={seconds} label="Sec" />
    </div>
  );
};

const FlipUnitContainer = ({
  unit,
  label,
}: {
  unit: string;
  label: string;
}) => {
  return (
    <div className="flex flex-col items-center">
      <div className="flex">
        <FlipUnit digit={unit[0]} />
        <FlipUnit digit={unit[1]} />
      </div>
      <span className="text-xs font-semibold text-gray-600 mt-1">{label}</span>
    </div>
  );
};

const FlipUnit = ({ digit }: { digit: string }) => {
  return (
    <div className="relative w-6 h-8 sm:w-8 sm:h-10 md:w-10 md:h-12 mx-0.5">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={digit}
          initial={{ rotateX: -90, position: "absolute", top: 0 }}
          animate={{ rotateX: 0, position: "absolute", top: 0 }}
          exit={{ rotateX: 90, position: "absolute", top: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-full h-full bg-white rounded-md shadow-md flex items-center justify-center"
        >
          <span className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-800">
            {digit}
          </span>
        </motion.div>
      </AnimatePresence>
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-10 rounded-md" />
    </div>
  );
};

export default CountdownTimer;
