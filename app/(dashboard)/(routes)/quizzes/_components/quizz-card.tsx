import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconBadge } from "@/components/icon-badge";
import { ClipboardList } from "lucide-react"; // Assuming you have Lucide icons

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
      <Card className="group hover:shadow-sm transition overflow-hidden border rounded-lg p-3 h-full">
        <div className="relative w-full aspect-video rounded-md overflow-hidden">
          <Image
            src={courseImageUrl}
            alt={courseTitle}
            layout="fill"
            objectFit="cover"
          />
        </div>
        <CardContent className="flex flex-col pt-2 p-0">
          <div className="text-lg md:text-base font-medium group-hover:text-sky-700 transition line-clamp-2">
            {courseTitle}
          </div>
          <p className="text-xs text-muted-foreground">{category}</p>
          <div className="my-3 flex items-center gap-x-2 text-xs">
            <div className="flex items-center gap-x-1 text-sky-800 bg-sky-500/10 pr-2 pl-1 rounded-md font-medium">
              <IconBadge size="sm" icon={ClipboardList} />
              <span>
                {quizCount} {quizCount === 1 ? "Quiz" : "Quizzes"}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <Badge variant="secondary" className="text-xs">
              Submitted
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default QuizzCard;
