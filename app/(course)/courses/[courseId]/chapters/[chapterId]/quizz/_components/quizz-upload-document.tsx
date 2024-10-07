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
import { Pencil, Upload, X, FileText } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Quiz } from "@prisma/client";

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

  const toggleEdit = () => {
    setIsEditing((current) => !current);
    setUploadedFile(null);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pdf: undefined,
    },
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
        headers: {
          "Content-Type": "multipart/form-data",
        },
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
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        {initialData ? "Update Quiz" : "Generate Quiz"}
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload PDF
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <div
          className={cn(
            "text-sm mt-2",
            !initialData && "text-slate-500 italic"
          )}
        >
          {!initialData && "No quiz generated"}
          {initialData && (
            <div>
              Quiz generated: <span className="font-semibold">{quizName}</span>
              <Button
                onClick={() =>
                  router.push(
                    `/courses/${courseId}/chapters/${chapterId}/quizz/${initialData.id}`
                  )
                }
                variant="link"
                className="p-0 text-sm text-blue-500 ml-2"
              >
                View Quiz
              </Button>
            </div>
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
              name="pdf"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex flex-col items-center justify-center w-full">
                      {!uploadedFile ? (
                        <label
                          htmlFor="dropzone-file"
                          className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-4 text-gray-500" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">
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
                        <div className="flex items-center w-full p-4 bg-white border rounded-md">
                          <FileText className="h-5 w-5 text-blue-500 mr-2" />
                          <span className="text-sm font-medium text-gray-700 flex-grow truncate">
                            {uploadedFile.name}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFileChange(undefined)}
                            className="ml-2"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {uploadedFile && (
              <p className="text-sm text-green-600 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                File uploaded successfully. Click{" "}
                {initialData ? "Update" : "Generate"} Quiz to proceed.
              </p>
            )}
            <div className="flex items-center gap-x-2">
              <Button
                disabled={!isValid || isSubmitting || !uploadedFile}
                type="submit"
              >
                {isSubmitting
                  ? initialData
                    ? "Updating..."
                    : "Generating..."
                  : initialData
                    ? "Update Quiz"
                    : "Generate Quiz"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default QuizzUploadDocument;
