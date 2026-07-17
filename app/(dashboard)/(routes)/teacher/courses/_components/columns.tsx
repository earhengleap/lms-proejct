"use client";

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
import { cn } from "@/lib/utils";
import { convertUSDToKHR, formatPrice } from "@/lib/format";

interface CourseWithDeletionStatus extends Course {
  deletionStatus: string | null;
  chapters: ChapterWithDeletionStatus[];
}

interface ChapterWithDeletionStatus extends Chapter {
  deletionStatus: string | null;
}

export const columns: ColumnDef<CourseWithDeletionStatus>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1.5 hover:text-slate-700 transition-colors"
        >
          Title
          <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      );
    },
    cell: ({ row }) => {
      return (
        <span className="font-medium text-slate-900">
          {row.getValue("title")}
        </span>
      );
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1.5 hover:text-slate-700 transition-colors"
        >
          Price
          <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      );
    },
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price") || "0");
      const usdPrice = formatPrice(price);
      const khrPrice = convertUSDToKHR(price);
      return (
        <span className="text-slate-600">
          {usdPrice} <span className="text-slate-400">≈</span> {khrPrice}
        </span>
      );
    },
  },
  {
    accessorKey: "isPublished",
    header: ({ column }) => {
      return (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1.5 hover:text-slate-700 transition-colors"
        >
          Status
          <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      );
    },
    cell: ({ row }) => {
      const isPublished = row.getValue("isPublished") || false;
      return (
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
            isPublished
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          )}
        >
          {isPublished ? "Published" : "Draft"}
        </span>
      );
    },
  },
  {
    accessorKey: "deletionStatus",
    header: "Deletion",
    cell: ({ row }) => {
      const courseDeletionStatus = row.getValue("deletionStatus");
      const chapters = row.original.chapters;

      if (courseDeletionStatus === "pending") {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
            Course Pending
          </span>
        );
      }

      const hasChapterPendingDeletion = chapters.some(
        (chapter) => chapter.deletionStatus === "pending"
      );

      if (hasChapterPendingDeletion) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
            Chapter Pending
          </span>
        );
      }

      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-500">
          None
        </span>
      );
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
            <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-40 rounded-xl border border-slate-200/60 shadow-lg"
          >
            <Link href={`/teacher/courses/${id}`}>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <Pencil className="h-3.5 w-3.5" />
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
