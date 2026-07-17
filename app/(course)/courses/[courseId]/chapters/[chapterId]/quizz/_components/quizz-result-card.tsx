import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

type Props = {
  isCorrect: boolean | null | undefined;
  correctAnswer: string;
};

const QuizzResultCard = ({ isCorrect, correctAnswer }: Props) => {
  if (isCorrect === null || isCorrect === undefined) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-xl p-4 text-sm font-medium flex items-start gap-2.5",
        isCorrect
          ? "bg-emerald-50 text-emerald-700"
          : "bg-rose-50 text-rose-700"
      )}
    >
      {isCorrect ? (
        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
      )}
      <span>
        {isCorrect
          ? "Correct answer!"
          : `Incorrect. The correct answer is: ${correctAnswer}`}
      </span>
    </div>
  );
};

export default QuizzResultCard;
