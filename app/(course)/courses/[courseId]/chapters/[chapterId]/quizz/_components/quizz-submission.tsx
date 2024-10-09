import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

interface QuizzSubmissionProps {
  score: number;
  totalQuestions: number;
  chapterId: string;
  courseId: string;
}

const LoadingScreen = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex items-center justify-center min-h-screen bg-gray-100"
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-16 h-16 border-4 border-gray-300 border-t-blue-600 rounded-full"
    />
  </motion.div>
);

const ScoreDisplay = ({ score }: { score: number }) => (
  <motion.div
    initial={{ scale: 0.5, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.6, delay: 0.2 }}
    className="text-center"
  >
    <span className="text-7xl font-extrabold text-gray-800">{score}</span>
    <span className="text-4xl font-bold text-gray-500">%</span>
  </motion.div>
);

const ResultBar = ({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.4 }}
    className="w-full"
  >
    <div className="flex justify-between mb-2">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className="text-sm font-medium text-gray-600">
        {value}/{total}
      </span>
    </div>
    <div className="w-full bg-gray-300 rounded-full h-3">
      <motion.div
        className={`h-3 rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${(value / total) * 100}%` }}
        transition={{ duration: 0.8, delay: 0.6 }}
      ></motion.div>
    </div>
  </motion.div>
);

const FeedbackMessage = ({ score }: { score: number }) => (
  <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.6, delay: 0.8 }}
    className="text-center text-gray-700 mt-6 text-lg font-semibold"
  >
    {score === 100
      ? "Perfect score! Outstanding performance."
      : score >= 70
        ? "Great job! You've demonstrated solid understanding."
        : "Good effort. Keep practicing to improve."}
  </motion.p>
);

const ContinueButton = ({ courseId }: { courseId: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    setIsLoading(true);
    // Simulate loading time (remove this in production and replace with actual navigation)
    setTimeout(() => {
      router.push(`/quizzes/submissions/courses/${courseId}`);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1 }}
      className="mt-10"
    >
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 px-5 rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-md flex items-center justify-center font-medium text-lg relative overflow-hidden"
      >
        <span className={`flex items-center ${isLoading ? "opacity-50" : ""}`}>
          View Quiz Submissions
          <ArrowRight className="ml-2 w-5 h-5" />
        </span>
        {isLoading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-1.5 h-1.5 bg-white rounded-full mr-1"
              animate={{
                scale: [1, 1.5, 1],
                transition: {
                  repeat: Infinity,
                  duration: 1,
                  ease: "easeInOut",
                },
              }}
            />
            <motion.div
              className="w-1.5 h-1.5 bg-white rounded-full mr-1"
              animate={{
                scale: [1, 1.5, 1],
                transition: {
                  repeat: Infinity,
                  duration: 1,
                  ease: "easeInOut",
                  delay: 0.2,
                },
              }}
            />
            <motion.div
              className="w-1.5 h-1.5 bg-white rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                transition: {
                  repeat: Infinity,
                  duration: 1,
                  ease: "easeInOut",
                  delay: 0.4,
                },
              }}
            />
          </motion.div>
        )}
      </button>
    </motion.div>
  );
};

const QuizzSubmission = ({
  score,
  totalQuestions,
  chapterId,
  courseId,
}: QuizzSubmissionProps) => {
  const [loading, setLoading] = useState(true);

  const correctAnswers = Math.round((score / 100) * totalQuestions);
  const incorrectAnswers = totalQuestions - correctAnswers;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <LoadingScreen key="loading" />
      ) : (
        <motion.div
          key="result"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6"
        >
          <div className="max-w-lg w-full space-y-8">
            <motion.h2
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-center text-gray-800 mb-8"
            >
              Quiz Results
            </motion.h2>
            <ScoreDisplay score={score} />
            <div className="space-y-5 mt-8">
              <ResultBar
                label="Correct"
                value={correctAnswers}
                total={totalQuestions}
                color="bg-green-500"
              />
              <ResultBar
                label="Incorrect"
                value={incorrectAnswers}
                total={totalQuestions}
                color="bg-red-500"
              />
            </div>
            <FeedbackMessage score={score} />
            <ContinueButton courseId={courseId} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuizzSubmission;


//this is an old code