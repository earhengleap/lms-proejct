import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Trophy } from "lucide-react";

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
    className="flex items-center justify-center min-h-screen bg-slate-50"
  >
    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
  </motion.div>
);

const ScoreDisplay = ({ score }: { score: number }) => (
  <motion.div
    initial={{ scale: 0.6, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
    className="text-center"
  >
    <span className="text-7xl font-extrabold tracking-tight text-slate-900">
      {score}
    </span>
    <span className="text-3xl font-bold text-slate-400">%</span>
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
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.35 }}
    className="w-full"
  >
    <div className="flex justify-between mb-1.5">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-700">
        {value}/{total}
      </span>
    </div>
    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
      <motion.div
        className={`h-2.5 rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${(value / total) * 100}%` }}
        transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
      />
    </div>
  </motion.div>
);

const FeedbackMessage = ({ score }: { score: number }) => (
  <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.6, delay: 0.7 }}
    className="text-center text-slate-600 mt-6 text-base font-medium"
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
    setTimeout(() => {
      router.push(`/quizzes/submissions/courses/${courseId}`);
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.85 }}
      className="mt-10"
    >
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="w-full bg-slate-900 text-white py-3 px-5 rounded-xl hover:bg-slate-800 transition-colors duration-300 shadow-sm flex items-center justify-center font-medium text-base gap-2 disabled:opacity-70"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            View Quiz Submissions
            <ArrowRight className="w-5 h-5" />
          </>
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
    const timer = setTimeout(() => setLoading(false), 1200);
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
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6"
        >
          <div className="max-w-lg w-full space-y-8">
            <motion.div
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Quiz Results
              </h2>
            </motion.div>
            <ScoreDisplay score={score} />
            <div className="space-y-5 mt-8">
              <ResultBar
                label="Correct"
                value={correctAnswers}
                total={totalQuestions}
                color="bg-emerald-500"
              />
              <ResultBar
                label="Incorrect"
                value={incorrectAnswers}
                total={totalQuestions}
                color="bg-rose-500"
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
