// QuizzBar.tsx
import { clsx } from "clsx";

interface QuizzBarProps {
  percentage: number;
  color: string;
}

const QuizzBar = ({ percentage, color }: QuizzBarProps) => {
  const visualPercentage = Math.min(100, Math.max(0, percentage));

  const barStyle = {
    height: `${visualPercentage}%`,
  };

  const barBgClasses: Record<string, string> = {
    green: "bg-green-500",
    red: "bg-red-500",
    blue: "bg-blue-500",
  };

  return (
    <div className="h-40 w-16 flex flex-col justify-end overflow-hidden rounded-xl border-2 border-black m-2">
      <div
        style={barStyle}
        className={clsx(
          barBgClasses[color],
          "w-full transition-height duration-300 ease-in-out"
        )}
      ></div>
    </div>
  );
};

export default QuizzBar;
