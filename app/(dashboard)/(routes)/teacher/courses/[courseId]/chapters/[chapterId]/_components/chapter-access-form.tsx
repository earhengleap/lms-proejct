"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Pencil, Lock, Globe, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Chapter } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";

interface ChapterAccessFormProps {
  initialData: Chapter;
  courseId: string;
  chapterId: string;
}

const formSchema = z.object({
  isFree: z.boolean().default(false),
});

const ChapterAccessForm = ({
  initialData,
  courseId,
  chapterId,
}: ChapterAccessFormProps) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isFirstChapter, setIsFirstChapter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkChapterPosition = async () => {
      try {
        const response = await axios.get(`/api/courses/${courseId}/chapters`);
        const chapters = response.data;
        const isFirst = chapters[0]?.id === chapterId;
        setIsFirstChapter(isFirst);
      } catch (error) {
        toast.error("Something went wrong while checking chapter position");
      } finally {
        setIsLoading(false);
      }
    };

    checkChapterPosition();
  }, [courseId, chapterId]);

  const toggleEdit = () => setIsEditing((current) => !current);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isFree: !!initialData.isFree,
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, values);
      toast.success("Chapter updated");
      toggleEdit();
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200/70 bg-white p-4 text-sm text-slate-400">
        Loading…
      </div>
    );
  }

  // A chapter is effectively free if it's toggled OR it's the first chapter.
  const isEffectivelyFree = initialData.isFree || isFirstChapter;

  return (
    <div className="rounded-xl border border-slate-200/70 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">
          Chapter access
        </span>
        <Button onClick={toggleEdit} variant="ghost" size="sm">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit access
            </>
          )}
        </Button>
      </div>

      {!isEditing && (
        <div className="mt-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={isEffectivelyFree ? "free" : "paid"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2.5",
                isEffectivelyFree
                  ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-slate-50 text-slate-600"
              )}
            >
              {isEffectivelyFree ? (
                <Globe className="h-4 w-4 shrink-0" />
              ) : (
                <Lock className="h-4 w-4 shrink-0" />
              )}
              <div className="text-sm">
                {isFirstChapter ? (
                  <span className="font-medium">
                    Free preview — this is the first chapter.
                  </span>
                ) : isEffectivelyFree ? (
                  <span className="font-medium">
                    Free for preview — anyone can watch this chapter.
                  </span>
                ) : (
                  <span>This chapter is paid (requires purchase).</span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {isFirstChapter && !initialData.isFree && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
              <Sparkles className="h-3.5 w-3.5" />
              The first chapter is automatically free so students can preview your
              course.
            </p>
          )}
        </div>
      )}

      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="isFree"
              render={({ field }) => (
                <FormItem
                  className={cn(
                    "flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 transition",
                    isFirstChapter
                      ? "border-emerald-100 bg-emerald-50/60"
                      : "border-slate-200"
                  )}
                >
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isFirstChapter}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormDescription>
                      {isFirstChapter ? (
                        <>
                          This is the first chapter, so it&apos;s already free for
                          preview. The toggle is locked.
                        </>
                      ) : (
                        <>
                          Make this chapter free so anyone can preview it without
                          purchasing the course.
                        </>
                      )}
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button disabled={!isValid || isSubmitting} type="submit">
                Save
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default ChapterAccessForm;
