"use client";

import { Button } from "@/components/ui/button";
import { Course, Chapter } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { convertUSDToKHR, formatPrice } from "@/lib/format";

interface CourseWithDeletionStatus extends Course {
  deletionStatus: string | null;
  chapters: ChapterWithDeletionStatus[]; // Include chapters with deletion status
}

interface ChapterWithDeletionStatus extends Chapter {
  deletionStatus: string | null;
}

export const columns: ColumnDef<CourseWithDeletionStatus>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price") || "0");
      const usdPrice = formatPrice(price);
      const khrPrice = convertUSDToKHR(price);
      return <div>{`${usdPrice} ≈ ${khrPrice}`}</div>;
    },
  },
  {
    accessorKey: "isPublished",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Published
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const isPublished = row.getValue("isPublished") || false;
      return (
        <Badge className={cn("bg-slate-500", isPublished && "bg-sky-700")}>
          {isPublished ? "Published" : "Draft"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "deletionStatus",
    header: "Deletion Status",
    cell: ({ row }) => {
      const courseDeletionStatus = row.getValue("deletionStatus");
      const chapters = row.original.chapters;

      // Check course-level deletion status
      if (courseDeletionStatus === "pending") {
        return <Badge className="bg-yellow-500">Course Pending Deletion</Badge>;
      }

      // Check chapter-level deletion status
      const hasChapterPendingDeletion = chapters.some(
        (chapter) => chapter.deletionStatus === "pending"
      );

      if (hasChapterPendingDeletion) {
        return (
          <Badge className="bg-yellow-500">Chapter Pending Deletion</Badge>
        );
      }

      // Default message when no deletion request
      return <Badge className="bg-green-500">No Deletion Requested</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { id, deletionStatus, chapters } = row.original;
      const hasChapterPendingDeletion = chapters.some(
        (chapter) => chapter.deletionStatus === "pending"
      );

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Link href={`/teacher/courses/${id}`}>
              <DropdownMenuItem>
                <Pencil className="h-4 w-4 mr-2" />
                {deletionStatus === "pending" || hasChapterPendingDeletion
                  ? "View"
                  : "Edit"}
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
