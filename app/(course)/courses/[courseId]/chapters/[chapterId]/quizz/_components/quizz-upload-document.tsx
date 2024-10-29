"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Pencil,
  Upload,
  X,
  FileText,
  Trash2,
  Plus,
  FileDown,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Quiz } from "@prisma/client";
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
import { Badge } from "@/components/ui/badge";
import QuizPDFViewer from "./quiz-pdf-view";

interface CompleteQuiz extends Quiz {
  questions: {
    id: number;
    questionText: string;
    createdAt: Date;
    updatedAt: Date;
    quizId: number;
    answers: {
      id: number;
      answerText: string;
      isCorrect: boolean;
      questionId: number;
      createdAt: Date;
      updatedAt: Date;
    }[];
  }[];
}

interface QuizzUploadDocumentProps {
  initialData: Quiz | null;
  courseId: string;
  chapterId: string;
}

const formSchema = z.object({
  pdf: z.instanceof(File).optional(),
});

const QuizzUploadDocument = ({
  initialData,
  courseId,
  chapterId,
}: QuizzUploadDocumentProps) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [quizName, setQuizName] = useState(initialData?.name || "");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [completeQuizData, setCompleteQuizData] = useState<CompleteQuiz | null>(
    null
  );
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);

  const handleOpenPDF = async () => {
    if (!initialData) return;

    try {
      setIsLoadingPDF(true);
      const response = await axios.get<CompleteQuiz>(
        `/api/quizz/${initialData.id}/complete`
      );
      setCompleteQuizData(response.data);
      setShowPDF(true);
    } catch (error) {
      toast.error("Failed to load quiz data");
      console.error("Error loading quiz data:", error);
    } finally {
      setIsLoadingPDF(false);
    }
  };

  const toggleEdit = () => {
    setIsEditing((current) => !current);
    setUploadedFile(null);
  };

  const onDelete = async () => {
    try {
      setIsDeleting(true);
      await axios.delete(`/api/quizz/${initialData?.id}`, {
        params: { courseId, chapterId },
      });
      toast.success("Quiz deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsDeleting(false);
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { pdf: undefined },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formData = new FormData();
      if (uploadedFile) {
        formData.append("pdf", uploadedFile);
      }
      formData.append("courseId", courseId);
      formData.append("chapterId", chapterId);
      if (initialData) {
        formData.append("quizId", initialData.id.toString());
      }

      const response = await axios.post("/api/quizz/generate", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.quizzId) {
        setQuizName(response.data.quizName);
        toast.success(
          initialData
            ? "Quiz updated successfully. Click 'View Quiz' to see changes."
            : "Quiz generated successfully. Click 'View Quiz' to see the new quiz."
        );
      } else {
        throw new Error(
          initialData ? "Failed to update quiz" : "Failed to generate quiz"
        );
      }

      toggleEdit();
      router.refresh();
    } catch (error) {
      console.error("Error while generating/updating quiz:", error);
      toast.error(
        initialData
          ? "Failed to update quiz. Please try again."
          : "Failed to generate quiz. Please try again."
      );
    }
  };

  const handleFileChange = (file: File | undefined) => {
    if (file) {
      setUploadedFile(file);
      form.setValue("pdf", file);
    } else {
      setUploadedFile(null);
      form.setValue("pdf", undefined);
    }
  };

  return (
    <div className="mt-6 border bg-slate-50 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-y-1">
          <h3 className="text-lg font-semibold">
            {initialData ? "Quiz Management" : "Add Chapter Quiz"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {initialData
              ? "Update or manage your quiz content"
              : "Upload a PDF to generate quiz questions automatically"}
          </p>
        </div>
        <div className="flex items-center gap-x-2">
          {initialData && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isDeleting}
                  className="hover:opacity-75 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the quiz and all its questions.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Quiz
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button
            onClick={toggleEdit}
            variant={isEditing ? "ghost" : "outline"}
            className="flex items-center gap-x-2"
          >
            {isEditing ? (
              <>
                <X className="h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                {initialData ? (
                  <>
                    <Upload className="h-4 w-4" />
                    Update Quiz
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Quiz
                  </>
                )}
              </>
            )}
          </Button>
        </div>
      </div>

      {!isEditing && (
        <div className="mt-4">
          {!initialData ? (
            <div className="flex items-center justify-center h-60 border-2 border-dashed border-slate-200 rounded-lg bg-slate-100">
              <div className="text-center">
                <FileText className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No quiz generated yet</p>
                <Button
                  onClick={toggleEdit}
                  variant="link"
                  className="mt-2 text-blue-500"
                >
                  Generate one now
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">{quizName}</p>
                    <p className="text-sm text-muted-foreground">
                      Quiz is ready for students
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenPDF}
                    disabled={isLoadingPDF}
                    className="flex items-center gap-x-2"
                  >
                    {isLoadingPDF ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <FileDown className="h-4 w-4" />
                        PDF Version
                      </>
                    )}
                  </Button>
                  <Badge variant="secondary">Active</Badge>
                </div>
              </div>
              <div className="flex items-center gap-x-2 mt-2">
                <Button
                  onClick={() =>
                    router.push(
                      `/courses/${courseId}/chapters/${chapterId}/quizz/${initialData.id}`
                    )
                  }
                  variant="link"
                  className="text-blue-500 p-0"
                >
                  View Quiz Content →
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-4"
          >
            <FormField
              control={form.control}
              name="pdf"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex flex-col items-center justify-center w-full">
                      {!uploadedFile ? (
                        <label
                          htmlFor="dropzone-file"
                          className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-200 rounded-lg bg-slate-100 cursor-pointer hover:bg-slate-50 transition"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <div className="p-4 rounded-full bg-white mb-4">
                              <Upload className="w-8 h-8 text-blue-500" />
                            </div>
                            <p className="mb-2 text-sm text-slate-700">
                              <span className="font-semibold">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </p>
                            <p className="text-xs text-slate-500">
                              PDF (MAX. 10MB)
                            </p>
                          </div>
                          <input
                            id="dropzone-file"
                            type="file"
                            className="hidden"
                            accept=".pdf"
                            onChange={(e) =>
                              handleFileChange(e.target.files?.[0])
                            }
                          />
                        </label>
                      ) : (
                        <div className="w-full p-4 bg-white border rounded-lg">
                          <div className="flex items-center gap-x-2">
                            <div className="p-2 rounded-md bg-blue-50">
                              <FileText className="h-6 w-6 text-blue-500" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-700 truncate">
                                {uploadedFile.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                PDF Document
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFileChange(undefined)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {uploadedFile && (
              <div className="flex items-center gap-x-2 p-2 bg-blue-50 text-blue-700 rounded-md">
                <FileText className="h-4 w-4" />
                <span className="text-sm">
                  File uploaded successfully. Click{" "}
                  {initialData ? "Update" : "Generate"} to proceed.
                </span>
              </div>
            )}
            <div className="flex justify-end gap-x-2">
              <Button
                type="button"
                variant="ghost"
                onClick={toggleEdit}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                disabled={!isValid || isSubmitting || !uploadedFile}
                type="submit"
                variant="default"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {initialData ? "Updating..." : "Generating..."}
                  </div>
                ) : (
                  <>{initialData ? "Update Quiz" : "Generate Quiz"}</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}

      {showPDF && completeQuizData && (
        <QuizPDFViewer
          quiz={completeQuizData}
          onClose={() => {
            setShowPDF(false);
            setCompleteQuizData(null);
          }}
        />
      )}
    </div>
  );
};

export default QuizzUploadDocument;

//OLD CODE
