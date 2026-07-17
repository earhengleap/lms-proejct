// app/(course)/courses/[courseId]/chapters/[chapterId]/quizz/_components/quizz-questions.tsx

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, X, Loader2 } from "lucide-react";
import QuizzProgressBar from "./quizz-progress-bar";
import QuizzResultCard from "./quizz-result-card";
import QuizzSubmission from "./quizz-submission";
import { useRouter } from "next/navigation";
import { Quiz, Question, Answer } from "@prisma/client";
import { saveSubmission } from "@/actions/save-submission";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type QuestionWithAnswers = Question & { answers: Answer[] };
type QuizWithQuestions = Quiz & {
  questions: QuestionWithAnswers[];
  chapterId: string;
  courseId: string;
};

type Props = {
  quizz: QuizWithQuestions;
  userId: string;
};

const QuizzQuestions = ({ quizz, userId }: Props) => {
  const router = useRouter();
  const { questions = [], chapterId, courseId } = quizz;
  const [started, setStarted] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userAnswers, setUserAnswers] = useState<
    {
      questionId: number;
      answerId: number;
      isCorrect: boolean;
    }[]
  >([]);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const createNotification = useMutation(api.notifications.createNotification);

  useEffect(() => {
    if (quizz && questions.length > 0) {
      setIsLoading(false);
    }
  }, [quizz, questions]);

  const calculateScore = () => {
    const correctAnswers = userAnswers.filter(
      (answer) => answer.isCorrect
    ).length;
    return Math.round((correctAnswers / questions.length) * 100);
  };

  const handleSubmit = async () => {
    if (isSubmitting || submitted) return;
    setIsSubmitting(true);
    try {
      const score = calculateScore();
      const submissionData = {
        score,
        quizzId: quizz.id,
        userId: userId,
      };

      await saveSubmission(submissionData);
      setSubmitted(true);

      createNotification({
        text: `You completed the quiz "${quizz.name || "Unnamed Quiz"}" with a score of ${score}%!`,
        userId,
      });
    } catch (e) {
      console.error("Error submitting quiz:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (isSubmitting || submitted) return;
    if (!started) {
      setStarted(true);
      return;
    }
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handleAnswer = (answer: Answer, questionId: number) => {
    const newUserAnswer = {
      answerId: answer.id,
      questionId,
      isCorrect: answer.isCorrect,
    };

    setUserAnswers((prevAnswers) => [
      ...prevAnswers.filter((a) => a.questionId !== questionId),
      newUserAnswer,
    ]);
  };

  const handlePressPrev = () => {
    if (currentQuestion === 0) {
      setStarted(false);
    } else {
      setCurrentQuestion((prevQuestion) => prevQuestion - 1);
    }
  };

  const handleExit = () => {
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        <p className="mt-3 text-sm text-slate-500">Loading quiz...</p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-2xl border border-slate-200/70 shadow-sm max-w-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            No Questions Available
          </h2>
          <p className="text-sm text-slate-500 mb-5">
            This quiz doesn&apos;t have any questions yet.
          </p>
          <Button onClick={handleExit} variant="outline" className="rounded-xl">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <QuizzSubmission
        score={calculateScore()}
        totalQuestions={questions.length}
        chapterId={chapterId}
        courseId={courseId}
      />
    );
  }

  const currentQuestionData = questions[currentQuestion];
  const currentAnswer = userAnswers.find(
    (answer) => answer.questionId === currentQuestionData?.id
  );
  const isAnswerSelected = currentAnswer !== undefined;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white z-10 w-full border-b border-slate-100">
        <header className="flex items-center justify-between p-4 max-w-2xl mx-auto w-full">
          <Button
            size="icon"
            variant="ghost"
            onClick={handlePressPrev}
            className={cn(
              !started && "cursor-not-allowed opacity-40",
              "rounded-lg hover:bg-slate-100 text-slate-600"
            )}
          >
            <ChevronLeft />
          </Button>

          <div className="flex-1 px-4">
            <QuizzProgressBar
              value={(currentQuestion / questions.length) * 100}
            />
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleExit}
            className="rounded-lg hover:bg-slate-100 text-slate-600"
          >
            <X />
          </Button>
        </header>
      </div>

      <main className="flex-1 flex flex-col justify-center items-center p-4 overflow-y-auto">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {!started ? (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="text-center bg-white p-8 sm:p-10 rounded-2xl border border-slate-200/70 shadow-sm"
              >
                <h1 className="text-2xl sm:text-3xl font-bold mb-4 tracking-tight text-slate-900">
                  {quizz.name || "Welcome to the Quiz"}
                </h1>
                <p className="text-base mb-3 text-slate-500">
                  This quiz contains{" "}
                  <span className="font-semibold text-slate-700">
                    {questions.length}
                  </span>{" "}
                  questions.
                </p>
                <p className="text-sm text-slate-400">
                  Take your time and answer each question carefully.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 sm:p-8"
              >
                <div className="mb-5 text-sm text-slate-400 text-right font-medium">
                  Question {currentQuestion + 1} of {questions.length}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-6 text-slate-900 tracking-tight">
                  {currentQuestionData.questionText}
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  {currentQuestionData.answers.map((answer) => {
                    const isSelected = currentAnswer?.answerId === answer.id;
                    const variant = isSelected
                      ? answer.isCorrect
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                        : "bg-rose-50 border-rose-300 text-rose-700"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50";

                    return (
                      <button
                        key={answer.id}
                        onClick={() =>
                          handleAnswer(answer, currentQuestionData.id)
                        }
                        disabled={isAnswerSelected}
                        className={cn(
                          "w-full text-left rounded-xl border px-4 py-3.5 transition-all duration-200 disabled:opacity-100 text-sm sm:text-base",
                          variant
                        )}
                      >
                        <span className="whitespace-normal">
                          {answer.answerText}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="p-4 bg-white border-t border-slate-100">
        <div className="w-full max-w-2xl mx-auto">
          <AnimatePresence>
            {isAnswerSelected && currentQuestionData && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
              >
                <QuizzResultCard
                  isCorrect={currentAnswer!.isCorrect}
                  correctAnswer={
                    currentQuestionData.answers.find((answer) => answer.isCorrect)
                      ?.answerText || "No correct answer found"
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            variant="default"
            className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
            onClick={handleNext}
            disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting
              ? "Submitting..."
              : !started
                ? "Start Quiz"
                : currentQuestion === questions.length - 1
                  ? "Submit"
                  : "Next"}
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default QuizzQuestions;
