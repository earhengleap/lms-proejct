// components/course-card.tsx

import Image from "next/image";
import Link from "next/link";
import { IconBadge } from "./icon-badge";
import { BookOpen, User } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { CourseProgress } from "./course-progress";

interface CourseCardProps {
  id: string;
  title: string;
  imageUrl: string;
  chaptersLength: number;
  price: number;
  progress: number | null;
  category: string;
  publisherName: string;
  isFromDashboard?: boolean;
  firstChapterId: string;
}

const CourseCard = ({
  id,
  title,
  imageUrl,
  chaptersLength,
  price,
  progress,
  category,
  publisherName,
  isFromDashboard = false,
  firstChapterId,
}: CourseCardProps) => {
  const courseUrl = isFromDashboard
    ? `/courses/${id}`
    : `/search/preview/courses/${id}/chapters/${firstChapterId}`;
  return (
    <Link href={courseUrl}>
      <div className="group hover:shadow-sm transition overflow-hidden border rounded-lg p-3 h-full">
        <div className="relative w-full aspect-video rounded-md overflow-hidden">
          <Image fill className="object-cover" alt={title} src={imageUrl} />
        </div>
        <div className="flex flex-col pt-2">
          <div className="text-lg md:text-base font-medium group-hover:text-sky-700 transition line-clamp-2">
            {title}
          </div>
          <p className="text-xs text-muted-foreground">{category}</p>
          <div className="my-3 flex items-center gap-x-2 text-xs">
            <div className="flex items-center gap-x-1 text-sky-800 bg-sky-500/10 pr-2 pl-1 rounded-md font-medium">
              <IconBadge size="sm" icon={BookOpen} />
              <span>
                {chaptersLength} {chaptersLength === 1 ? "Chapter" : "Chapters"}
              </span>
            </div>
            <div className="flex items-center gap-x-1 text-emerald-800 bg-emerald-500/10 pr-2 pl-1 rounded-md font-medium">
              <IconBadge size="sm" icon={User} />
              <span>{publisherName}</span>
            </div>
          </div>
          {progress !== null ? (
            <CourseProgress
              variant={progress === 100 ? "success" : "default"}
              size="sm"
              value={progress}
            />
          ) : (
            <p className="text-md md:text-sm font-medium text-slate-700">
              {formatPrice(price)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
