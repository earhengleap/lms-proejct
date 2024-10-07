"use client";

import Image from "next/image";
import QuizzBar from "./quizz-bar";
import { useReward } from "react-rewards";
import { useEffect } from "react";

interface QuizzSubmissionProps {
  score: number;
  totalQuestions: number;
}

const QuizzSubmission = ({ score, totalQuestions }: QuizzSubmissionProps) => {
  const { reward } = useReward("rewardId", "confetti"); // Initialize reward mechanism

  const scorePercentage = score; // The score is already a percentage

  useEffect(() => {
    // Trigger confetti when score is 100%
    if (scorePercentage === 100) {
      reward();
    }
  }, [scorePercentage, reward]);

  const correctAnswers = Math.round((scorePercentage / 100) * totalQuestions);
  const incorrectAnswers = totalQuestions - correctAnswers;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-full max-h-full p-6 flex flex-col items-center text-center space-y-6">
        <h2 className="text-3xl font-bold">Quiz Complete!</h2>
        <p>Your score: {scorePercentage}%</p>
        {scorePercentage === 100 ? (
          <>
            <p className="text-lg">Congratulations!</p>
            <div className="flex justify-center">
              <Image
                src="/main-logo.png"
                alt="Congratulations"
                width={200}
                height={200}
                className="max-w-full h-auto"
              />
            </div>
            <span id="rewardId" /> {/* Placeholder for confetti effect */}
          </>
        ) : (
          <>
            <div className="flex justify-center items-end w-full">
              <QuizzBar percentage={scorePercentage} color="green" />
              <QuizzBar percentage={100 - scorePercentage} color="red" />
            </div>
            <div className="text-center mt-4">
              <p>{correctAnswers} Correct</p>
              <p>{incorrectAnswers} Incorrect</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizzSubmission;

//Already done the percentage of the quizz submission