import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";

interface QuizzCardProps {
  courseId: string;
  courseTitle: string;
  courseImageUrl: string;
  quizCount: number;
  averageScore: number;
  category: string;
}

const QuizzCard: React.FC<QuizzCardProps> = ({
  courseId,
  courseTitle,
  courseImageUrl,
  quizCount,
  averageScore,
  category,
}) => {
  return (
    <Link href={`/quizzes/submissions/courses/${courseId}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="aspect-video relative">
          <Image
            src={courseImageUrl}
            alt={courseTitle}
            layout="fill"
            objectFit="cover"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-2">{courseTitle}</h3>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
            <span className="text-sm text-gray-500">
              {quizCount} {quizCount === 1 ? "Quiz" : "Quizzes"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <ClipboardList className="w-4 h-4 mr-1" />
              <span>Avg. Score: {averageScore.toFixed(1)}%</span>
            </div>
            <span className="text-green-600">Submitted</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default QuizzCard;

//old code