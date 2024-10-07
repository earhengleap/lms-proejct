"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import QuizzProgressBar from "./_components/quizz-progress-bar";
import { ChevronLeft, X } from "lucide-react";
import QuizzResultCard from "./_components/quizz-result-card";
import QuizzSubmission from "./_components/quizz-submission";

const Quizz = () => {
  const [started, setStarted] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const questions = [
    {
      questionText: "What is React?",
      answers: [
        {
          answerText: "A library for building user interfaces",
          isCorrect: true,
          id: 1,
        },
        {
          answerText: "A framework for building user interfaces",
          isCorrect: false,
          id: 2,
        },
        {
          answerText: "A tool for building user interfaces",
          isCorrect: false,
          id: 3,
        },
      ],
    },
    {
      questionText: "What is JSX?",
      answers: [
        {
          answerText: "A library for building user interfaces",
          isCorrect: false,
          id: 4,
        },
        {
          answerText: "A framework for building user interfaces",
          isCorrect: false,
          id: 5,
        },
        {
          answerText: "A syntax extension for JavaScript",
          isCorrect: true,
          id: 6,
        },
      ],
    },
    {
      questionText: "What is Nextjs?",
      answers: [
        {
          answerText: "A framework for building user interfaces",
          isCorrect: true,
          id: 7,
        },
        {
          answerText: "A library for building user interfaces",
          isCorrect: false,
          id: 8,
        },
        {
          answerText: "A tool for building user interfaces",
          isCorrect: false,
          id: 9,
        },
      ],
    },
  ];

  const handleNext = () => {
    if (!started) {
      setStarted(true);
    } else if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setSubmitted(true);
      return;
    }
  };

  const handleAnswer = (answer: any) => {
    setSelectedAnswer(answer.id);

    const isCurrentCorrect = answer.isCorrect;

    if (isCurrentCorrect) {
      setScore(score + 1);
    }

    setIsCorrect(isCurrentCorrect);
  };

  const scorePercentage: number = Math.round((score / questions.length) * 100);

  if (submitted) {
    return <QuizzSubmission score={score} totalQuestions={questions.length} />;
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="sticky top-0 bg-white z-10 shadow-sm w-full">
        <header className="flex items-center justify-between p-2">
          <Button size="icon" variant="outline">
            <ChevronLeft />
          </Button>
          <div className="flex-1 px-4">
            <QuizzProgressBar
              value={(currentQuestion / questions.length) * 100}
            />
          </div>
          <Button size="icon" variant="outline">
            <X />
          </Button>
        </header>
      </div>
      <main className="flex justify-center flex-1 p-4">
        <div className="w-full max-w-2xl mx-auto">
          {!started ? (
            <h1 className="text-center text-2xl font-bold">
              Welcome to the quiz
            </h1>
          ) : (
            <div>
              <h2 className="text-center text-3xl font-bold mb-6">
                {questions[currentQuestion].questionText}
              </h2>
              <div className="grid grid-cols-1 gap-6">
                {questions[currentQuestion].answers.map((answer) => {
                  const variant =
                    selectedAnswer === answer.id
                      ? answer.isCorrect
                        ? "neonSuccess"
                        : "neonDanger"
                      : "neonOutline";

                  return (
                    <Button
                      key={answer.id}
                      variant={variant}
                      onClick={() => handleAnswer(answer)}
                      className="whitespace-normal"
                    >
                      {answer.answerText}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
      <footer className="flex justify-center p-4">
        <div className="w-full max-w-2xl mx-auto">
          <QuizzResultCard
            isCorrect={isCorrect}
            correctAnswer={
              questions[currentQuestion].answers.find(
                (answer) => answer.isCorrect === true
              )?.answerText || ""
            }
          />
          <Button
            variant={"neon"}
            className="mt-4 w-full"
            onClick={handleNext}
            size={"lg"}
          >
            {!started
              ? "Start"
              : currentQuestion === questions.length - 1
                ? "Submit"
                : "Next"}
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default Quizz;
