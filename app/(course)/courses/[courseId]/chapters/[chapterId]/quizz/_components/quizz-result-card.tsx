import { cn } from "@/lib/utils";
import { clsx } from "clsx";

type Props = {
  isCorrect: boolean | null | undefined;
  correctAnswer: string;
};

const QuizzResultCard = ({ isCorrect, correctAnswer }: Props) => {
  if (isCorrect === null || isCorrect === undefined) {
    return null;
  }

  const text = isCorrect
    ? "The answer is correct!"
    : `The answer is incorrect! The correct answer is: ${correctAnswer}`;

  const borderClasses = clsx({
    "border-green-500": isCorrect,
    "border-red-500": !isCorrect,
  });

  return (
    <div
      className={cn(
        borderClasses,
        "border",
        "rounded-lg",
        "p-4",
        "text-center",
        "text-lg",
        "font-semibold"
      )}
    >
      {text}
    </div>
  );
};

export default QuizzResultCard;
