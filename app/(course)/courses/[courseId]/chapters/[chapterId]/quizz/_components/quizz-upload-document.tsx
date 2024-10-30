// app/(course)/courses/[courseId]/chapters/[chapterId]/quizz/_components/quizz-upload-document.tsx

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
  Info,
  AlertCircle,
  Terminal,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
import { Label } from "@/components/ui/label";
import QuizPDFViewer from "./quiz-pdf-view";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

interface ContentAnalysis {
  wordCount: number;
  meaningfulWords: number; // Added
  possibleQuestions: number;
  isContentSufficient: boolean;
  recommendation: string;
  contentDensity: number; // Added
  estimatedWordsPerQuestion: number; // Added
}

const formSchema = z.object({
  pdf: z.instanceof(File).optional(),
  questionCount: z
    .string()
    .refine((value) => {
      const num = parseInt(value);
      return !isNaN(num) && num > 0 && num <= 15;
    }, "Please enter a number between 1 and 15")
    .optional(),
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
  const [contentLength, setContentLength] = useState(0);
  const [customQuestionCount, setCustomQuestionCount] = useState("5");
  const [maxPossibleQuestions, setMaxPossibleQuestions] = useState<number>(15);
  const [contentWarning, setContentWarning] = useState<string>("");
  const [contentAnalysis, setContentAnalysis] =
    useState<ContentAnalysis | null>(null);
  const [showInsufficientAlert, setShowInsufficientAlert] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pdf: undefined,
      questionCount: "5",
    },
  });

  const { isSubmitting, isValid } = form.formState;

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
    setContentLength(0);
    setContentWarning("");
    setCustomQuestionCount("5");
    form.reset();
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

  const getRecommendedCount = (length: number) => {
    const wordsEstimate = Math.ceil(length / 5); // Rough estimate of words
    const possibleQuestions = Math.min(Math.floor(wordsEstimate / 50), 15); // 1 question per ~50 words
    setMaxPossibleQuestions(possibleQuestions);

    return {
      min: Math.min(3, possibleQuestions),
      recommended: Math.min(5, possibleQuestions),
      max: possibleQuestions,
    };
  };

  const handleFileChange = async (file: File | undefined) => {
    if (file) {
      setUploadedFile(file);
      form.setValue("pdf", file);

      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        setContentLength(text.length);

        // Perform enhanced analysis
        const analysis = analyzeContent(text);
        setContentAnalysis(analysis);
        setMaxPossibleQuestions(analysis.possibleQuestions);

        // Set warnings based on analysis
        if (!analysis.isContentSufficient) {
          setShowInsufficientAlert(true);
          setContentWarning(
            "Content lacks sufficient detail for meaningful questions."
          );
        } else if (analysis.possibleQuestions < 15) {
          const warning = `Based on content analysis, we can generate up to ${analysis.possibleQuestions} 
            high-quality questions. Requesting more may result in repetitive or low-quality questions.`;
          setContentWarning(warning);

          // Automatically adjust question count if too high
          const recommendedCount = Math.min(5, analysis.possibleQuestions);
          setCustomQuestionCount(String(recommendedCount));
          form.setValue("questionCount", String(recommendedCount));
        } else {
          setContentWarning("");
          setCustomQuestionCount("15");
          form.setValue("questionCount", "15");
        }
      };
      reader.readAsText(file);
    } else {
      // Reset states
      setUploadedFile(null);
      form.setValue("pdf", undefined);
      setContentLength(0);
      setContentWarning("");
      setCustomQuestionCount("5");
      setContentAnalysis(null);
      setShowInsufficientAlert(false);
    }
  };
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formData = new FormData();
      if (uploadedFile) {
        formData.append("pdf", uploadedFile);
      }
      formData.append("courseId", courseId);
      formData.append("chapterId", chapterId);
      formData.append("questionCount", customQuestionCount);

      if (initialData) {
        formData.append("quizId", initialData.id.toString());
      }

      const response = await axios.post("/api/quizz/generate", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Add check for actual generated questions count
      if (response.data.generatedQuestions < parseInt(customQuestionCount)) {
        toast.warning(
          `Only generated ${response.data.generatedQuestions} questions instead of requested ${customQuestionCount}. 
          The PDF content wasn't sufficient to generate ${customQuestionCount} unique questions.`,
          {
            duration: 6000, // Show for longer duration
          }
        );
      }

      if (response.data.warning) {
        toast.warning(response.data.warning, {
          duration: 5000,
        });
      }

      if (response.data.quizzId) {
        setQuizName(response.data.quizName);
        toast.success(
          initialData
            ? "Quiz updated successfully. Click 'View Quiz' to see changes."
            : `Quiz generated with ${response.data.generatedQuestions} questions. 
              ${
                response.data.generatedQuestions < parseInt(customQuestionCount)
                  ? "\nNot enough content for all requested questions."
                  : ""
              }`
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

  const analyzeContent = (text: string): ContentAnalysis => {
    // More accurate word count calculation
    const words = text.split(/\s+/).filter((word) => word.length > 0);
    const wordCount = words.length;

    // Calculate meaningful content density
    const meaningfulWords = words.filter((word) => word.length > 3).length;
    const contentDensity = meaningfulWords / wordCount;

    // Calculate possible questions based on meaningful content
    const wordsPerQuestion = contentDensity > 0.7 ? 40 : 60;
    const estimatedQuestions = Math.floor(meaningfulWords / wordsPerQuestion);

    // Cap at 15 questions but ensure accuracy of estimation
    const possibleQuestions = Math.min(estimatedQuestions, 15);
    const isContentSufficient = meaningfulWords >= wordsPerQuestion;

    let recommendation = "";
    if (!isContentSufficient) {
      recommendation = `The content is too short (${wordCount} words, ${meaningfulWords} meaningful words). 
        We recommend at least ${wordsPerQuestion} meaningful words for one question.`;
    } else if (possibleQuestions < 15) {
      recommendation = `Based on content analysis (${wordCount} total words, ${meaningfulWords} meaningful words), 
        we can reliably generate up to ${possibleQuestions} questions for optimal quality.`;
    } else {
      recommendation = `Content is sufficient for the maximum of 15 questions.`;
    }

    return {
      wordCount,
      meaningfulWords,
      possibleQuestions,
      isContentSufficient,
      recommendation,
      contentDensity,
      estimatedWordsPerQuestion: wordsPerQuestion,
    };
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
        {/* Action Buttons */}
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
            {/* PDF Upload Field */}
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

            {/* Question Count Input - Only shows after file upload */}
            {uploadedFile && (
              <FormField
                control={form.control}
                name="questionCount"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-x-2">
                          <Label htmlFor="question-count">
                            Number of Questions
                          </Label>
                          <div className="relative group">
                            <Info className="h-4 w-4 text-slate-500 cursor-help" />
                            <div className="absolute hidden group-hover:block w-64 p-2 bg-slate-800 text-white text-xs rounded-md -top-2 left-6 z-50">
                              Maximum 15 questions. The system will analyze
                              content and adjust if needed.
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Max: {Math.min(15, maxPossibleQuestions)} questions
                        </span>
                      </div>

                      {contentWarning && (
                        <div className="flex items-center gap-x-2 text-sm text-amber-600">
                          <AlertCircle className="h-4 w-4" />
                          <span>{contentWarning}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-x-3">
                        <input
                          type="number"
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          min="1"
                          max={Math.min(15, maxPossibleQuestions)}
                          value={customQuestionCount}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue = parseInt(value);

                            if (!contentAnalysis?.isContentSufficient) {
                              setContentWarning(
                                "Content is too short for meaningful questions."
                              );
                              setShowInsufficientAlert(true);
                            } else if (numValue > 15) {
                              setContentWarning(
                                "Maximum 15 questions allowed."
                              );
                            } else if (numValue > maxPossibleQuestions) {
                              setContentWarning(
                                `Content only supports up to ${maxPossibleQuestions} questions.`
                              );
                              setShowInsufficientAlert(true);
                            } else if (numValue < 1) {
                              setContentWarning("Minimum 1 question required.");
                            } else {
                              setContentWarning("");
                              setShowInsufficientAlert(false);
                            }

                            setCustomQuestionCount(value);
                            field.onChange(value);
                          }}
                          placeholder="Enter number of questions (1-15)"
                        />
                      </div>

                      {maxPossibleQuestions < 15 && (
                        <p className="text-xs text-muted-foreground">
                          Based on content length, we recommend generating up to{" "}
                          {maxPossibleQuestions} questions for optimal quality.
                        </p>
                      )}
                    </div>
                  </FormItem>
                )}
              />
            )}

            {uploadedFile &&
              contentAnalysis &&
              parseInt(customQuestionCount) >
                contentAnalysis.possibleQuestions && (
                <Alert variant="destructive" className="mt-4">
                  {" "}
                  {/* Changed from "warning" to "destructive" */}
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Question Count Warning</AlertTitle>
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>
                        The requested number of questions ({customQuestionCount}
                        ) may exceed what can be reliably generated from the
                        current content.
                      </p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Total words: {contentAnalysis.wordCount}</li>
                        <li>
                          Meaningful words: {contentAnalysis.meaningfulWords}
                        </li>
                        <li>
                          Recommended maximum:{" "}
                          {contentAnalysis.possibleQuestions} questions
                        </li>
                        <li>
                          Words needed per question: ~
                          {contentAnalysis.estimatedWordsPerQuestion}
                        </li>
                      </ul>
                      <p className="text-sm font-medium">
                        Consider either:
                        <ul className="list-disc pl-6 mt-1">
                          <li>
                            Reducing the number of requested questions to{" "}
                            {contentAnalysis.possibleQuestions} or less
                          </li>
                          <li>Adding more detailed content to the PDF</li>
                        </ul>
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

            {/* Success Message after file upload */}
            {uploadedFile && showInsufficientAlert && (
              <Alert variant="destructive" className="mt-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Content Limitation</AlertTitle>
                <AlertDescription className="mt-2">
                  <p>
                    The uploaded PDF content is insufficient for generating the
                    requested number of questions.
                  </p>
                  {contentAnalysis && (
                    <div className="mt-2 space-y-1">
                      <p>• Content Analysis:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Total words: {contentAnalysis.wordCount}</li>
                        <li>
                          Maximum possible questions:{" "}
                          {contentAnalysis.possibleQuestions}
                        </li>
                        <li>{contentAnalysis.recommendation}</li>
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {contentAnalysis && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">
                  {contentAnalysis.recommendation}
                </p>
                {contentAnalysis.possibleQuestions <
                  parseInt(customQuestionCount) && (
                  <p className="text-xs text-red-500 mt-1">
                    Warning: Requested questions exceed content capacity.
                    Consider reducing the number of questions or adding more
                    content.
                  </p>
                )}
              </div>
            )}

            {/* Form Buttons */}
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
                disabled={
                  !isValid ||
                  isSubmitting ||
                  !uploadedFile ||
                  parseInt(customQuestionCount) > 15 ||
                  parseInt(customQuestionCount) < 1 ||
                  parseInt(customQuestionCount) > maxPossibleQuestions ||
                  !contentAnalysis?.isContentSufficient
                }
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

      {/* PDF Viewer Modal */}
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

//OLD CODEEEEE
