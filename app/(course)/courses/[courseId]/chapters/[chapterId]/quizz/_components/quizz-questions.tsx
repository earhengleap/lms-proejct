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

  const createNotification = useMutation(api.notifications.createNotification);

  useEffect(() => {
    // Verify quiz data is valid
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
    try {
      const score = calculateScore();
      const submissionData = {
        score,
        quizzId: quizz.id,
        userId: userId,
      };

      const { submissionId, ownerId } = await saveSubmission(submissionData);
      setSubmitted(true);

      createNotification({
        text: `You completed the quiz "${quizz.name || "Unnamed Quiz"}" with a score of ${score}%!`,
        userId,
      });
    } catch (e) {
      console.error("Error submitting quiz:", e);
    }
  };

  const handleNext = () => {
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
      <div className="flex flex-col h-full items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="mt-2 text-sm text-gray-600">Loading quiz...</p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No Questions Available
          </h2>
          <p className="text-gray-600 mb-4">
            This quiz doesn't have any questions yet.
          </p>
          <Button onClick={handleExit} variant="outline">
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
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white z-10 shadow-sm w-full">
        <header className="flex items-center justify-between p-4">
          <Button
            size="icon"
            variant="outline"
            onClick={handlePressPrev}
            className={!started ? "cursor-not-allowed opacity-50" : ""}
          >
            <ChevronLeft />
          </Button>

          <div className="flex-1 px-4">
            <QuizzProgressBar
              value={(currentQuestion / questions.length) * 100}
            />
          </div>
          <Button size="icon" variant="outline" onClick={handleExit}>
            <X />
          </Button>
        </header>
      </div>
      <main className="flex-1 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-3xl">
          {!started ? (
            <div className="text-center bg-white p-8 rounded-lg shadow-md">
              <h1 className="text-3xl font-bold mb-6">
                {quizz.name || "Welcome to the Quiz"}
              </h1>
              <p className="text-lg mb-4 text-gray-600">
                This quiz contains {questions.length} questions.
              </p>
              <p className="text-sm text-gray-500 mb-8">
                Take your time and answer each question carefully.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4 text-sm text-gray-500 text-right">
                Question {currentQuestion + 1} of {questions.length}
              </div>
              <h2 className="text-2xl font-bold mb-6 text-center">
                {currentQuestionData.questionText}
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {currentQuestionData.answers.map((answer) => {
                  const isSelected = currentAnswer?.answerId === answer.id;
                  const variant = isSelected
                    ? answer.isCorrect
                      ? "neonSuccess"
                      : "neonDanger"
                    : "neonOutline";

                  return (
                    <Button
                      key={answer.id}
                      variant={variant}
                      onClick={() =>
                        handleAnswer(answer, currentQuestionData.id)
                      }
                      disabled={isAnswerSelected}
                      className="disabled:opacity-100 h-auto py-3 text-left"
                    >
                      <p className="whitespace-normal">{answer.answerText}</p>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
      <footer className="p-4">
        <div className="w-full max-w-3xl mx-auto">
          {isAnswerSelected && currentQuestionData && (
            <QuizzResultCard
              isCorrect={currentAnswer!.isCorrect}
              correctAnswer={
                currentQuestionData.answers.find((answer) => answer.isCorrect)
                  ?.answerText || "No correct answer found"
              }
            />
          )}
          <Button
            variant="neon"
            className="mt-4 w-full"
            onClick={handleNext}
            size="lg"
          >
            {!started
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

//OLD CODE
