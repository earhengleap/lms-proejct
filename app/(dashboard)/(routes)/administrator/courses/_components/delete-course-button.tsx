"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteCourse } from "./api";
import type { Course } from "./types";

interface DeleteCourseButtonProps {
  course: Course;
}

export const DeleteCourseButton = ({ course }: DeleteCourseButtonProps) => {
  const queryClient = useQueryClient();

  const { mutate: remove, isPending } = useMutation({
    mutationFn: () => deleteCourse(course.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCourses"] });
      toast.success("Course deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete course. Please try again.");
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete course"
          className="h-9 w-9 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Course</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{course.title}&quot;? This
            action cannot be undone and will remove all associated content and
            student enrollments.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              remove();
            }}
            className="rounded-lg bg-red-500 hover:bg-red-600 text-white"
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
