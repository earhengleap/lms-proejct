// app/(dashboard)/(routes)/teacher/courses/[courseId]/chapters/[chapterId]/_components/chapter-quiz-manual.tsx

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
import { useState, useEffect } from "react";
import {
  Edit,
  FileText,
  Trash2,
  X,
  Plus,
  AlertCircle,
  Pencil,
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
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ExtendedQuiz extends Quiz {
  questions: {
    id: number;
    questionText: string;
    answers: {
      id: number;
      answerText: string;
      isCorrect: boolean;
    }[];
  }[];
}

interface ChapterQuizManualProps {
  initialData: ExtendedQuiz | null;
  courseId: string;
  chapterId: string;
  onQuizDeleted?: () => void; // Add this prop
}

interface QuizQuestion {
  id?: number; // Changed from string to number
  questionText: string;
  answers: {
    answerText: string;
    isCorrect: boolean;
  }[];
}

const formSchema = z.object({
  name: z.string().min(1, "Quiz name is required"),
  description: z.string().optional(),
});

const manualQuestionSchema = z.object({
  questionText: z.string().min(1, "Question text is required"),
  answers: z
    .array(
      z.object({
        answerText: z.string().min(1, "Answer text is required"),
        isCorrect: z.boolean(),
      })
    )
    .length(4, "Exactly 4 answers are required"),
});

const getInitialQuestion = () => ({
  questionText: "",
  answers: Array(4).fill({ answerText: "", isCorrect: false }),
});

const ChapterQuizManual = ({
  initialData,
  courseId,
  chapterId,
  onQuizDeleted,
}: ChapterQuizManualProps) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<
    number | null
  >(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion>({
    questionText: "",
    answers: Array(4).fill({ answerText: "", isCorrect: false }),
  });

  useEffect(() => {
    if (initialData?.questions) {
      const formattedQuestions = initialData.questions.map((q) => ({
        id: q.id,
        questionText: q.questionText,
        answers: q.answers.map((a) => ({
          answerText: a.answerText,
          isCorrect: a.isCorrect,
        })),
      }));
      setQuestions(formattedQuestions);
    }
  }, [initialData]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
    mode: "all",
  });

  const handleQuestionEdit = (index: number) => {
    setEditingQuestionIndex(index);
    setCurrentQuestion({
      ...questions[index],
      answers: [...questions[index].answers],
    });
  };

  const handleQuestionDelete = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
    if (editingQuestionIndex === index) {
      resetQuestionForm();
    }
  };

  const toggleEdit = () => {
    setIsEditing((current) => !current);
    if (!isEditing) {
      setQuestions(
        initialData?.questions?.map((q) => ({
          id: q.id,
          questionText: q.questionText,
          answers: q.answers.map((a) => ({
            answerText: a.answerText,
            isCorrect: a.isCorrect,
          })),
        })) || []
      );
      resetQuestionForm();
    }
  };

  const handleAnswerSelect = (value: string) => {
    const newAnswers = currentQuestion.answers.map((answer, i) => ({
      ...answer,
      isCorrect: i.toString() === value,
    }));
    setCurrentQuestion({
      ...currentQuestion,
      answers: newAnswers,
    });
  };

  const onDelete = async () => {
    try {
      setIsDeleting(true);
      await axios.delete(`/api/quizz/${initialData?.id}`, {
        params: { courseId, chapterId },
      });
      toast.success("Quiz deleted successfully");
      onQuizDeleted?.(); // Call the callback after successful deletion
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsDeleting(false);
    }
  };

  const EMPTY_ANSWER = { answerText: "", isCorrect: false };
  const getInitialQuestion = () => ({
    questionText: "",
    answers: Array(4)
      .fill(EMPTY_ANSWER)
      .map(() => ({ ...EMPTY_ANSWER })),
  });

  const resetQuestionForm = () => {
    setCurrentQuestion(getInitialQuestion());
    setEditingQuestionIndex(null);
  };

  const handleQuestionAdd = () => {
    const result = manualQuestionSchema.safeParse(currentQuestion);
    if (!result.success) {
      toast.error("Please fill all fields correctly");
      return;
    }

    const correctAnswers = currentQuestion.answers.filter(
      (a) => a.isCorrect
    ).length;
    if (correctAnswers !== 1) {
      toast.error("Please select exactly one correct answer");
      return;
    }

    if (editingQuestionIndex !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingQuestionIndex] = currentQuestion;
      setQuestions(updatedQuestions);
      setEditingQuestionIndex(null);
    } else {
      setQuestions([...questions, { ...currentQuestion }]);
    }

    // Reset form with new objects to avoid reference issues
    setCurrentQuestion(getInitialQuestion());
  };
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (editingQuestionIndex !== null) {
        toast.error("Please finish editing the current question first");
        return;
      }

      if (!values.name) {
        toast.error("Quiz name is required");
        return;
      }

      if (questions.length === 0) {
        toast.error("Please add at least one question");
        return;
      }

      // Check if there are any changes
      const hasNameChanged = values.name !== initialData?.name;
      const hasDescriptionChanged =
        values.description !== initialData?.description;

      const hasQuestionsChanged =
        JSON.stringify(questions) !==
        JSON.stringify(
          initialData?.questions?.map((q) => ({
            questionText: q.questionText,
            answers: q.answers.map((a) => ({
              answerText: a.answerText,
              isCorrect: a.isCorrect,
            })),
          }))
        );

      if (!hasNameChanged && !hasDescriptionChanged && !hasQuestionsChanged) {
        toast.error("No changes to update");
        return;
      }

      const payload = {
        courseId,
        chapterId,
        name: values.name,
        description: values.description || "",
        questions,
        type: "manual",
        quizId: initialData?.id,
      };

      await axios.post("/api/quizz/manual", payload);
      toast.success(initialData ? "Quiz updated" : "Quiz created");
      toggleEdit();
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="mt-6 border bg-slate-50 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-y-1">
          <h3 className="text-lg font-semibold">
            {initialData ? "Manual Quiz Management" : "Create Manual Quiz"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Create a quiz by adding questions manually
          </p>
        </div>
        <div className="flex items-center gap-x-2">
          {initialData && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive" disabled={isDeleting}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this quiz and all its
                    questions.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
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
                <Edit className="h-4 w-4" />
                {initialData ? "Edit Quiz" : "Create Quiz"}
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
                <p className="text-sm text-slate-500">No manual quiz created</p>
                <Button
                  onClick={toggleEdit}
                  variant="link"
                  className="mt-2 text-blue-500"
                >
                  Create one now
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">{initialData.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Manual quiz ready for students
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
              <Button
                onClick={() =>
                  router.push(
                    `/courses/${courseId}/chapters/${chapterId}/quizz/${initialData.id}`
                  )
                }
                variant="link"
                className="mt-2 text-blue-500 p-0"
              >
                View Quiz Content →
              </Button>
            </div>
          )}
        </div>
      )}

      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <Label>Quiz Name*</Label>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter quiz name"
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <Label>Quiz Description</Label>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter quiz description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-6">
              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">
                    {editingQuestionIndex !== null
                      ? `Editing Question ${editingQuestionIndex + 1}`
                      : `New Question (${questions.length + 1})`}
                  </h4>
                  <Badge variant="secondary">
                    {questions.length} questions total
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Question Text</Label>
                    <Textarea
                      value={currentQuestion.questionText}
                      onChange={(e) =>
                        setCurrentQuestion({
                          ...currentQuestion,
                          questionText: e.target.value,
                        })
                      }
                      placeholder="Enter your question"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Answers</Label>
                      <span className="text-sm text-muted-foreground">
                        Select one correct answer
                      </span>
                    </div>
                    {currentQuestion.answers.map((answer, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center gap-x-3 p-4 rounded-lg transition-colors",
                          answer.isCorrect ? "bg-green-50/50" : "bg-slate-50"
                        )}
                      >
                        <span className="text-sm font-medium w-6">
                          {index + 1}.
                        </span>
                        <Input
                          value={answer.answerText}
                          onChange={(e) => {
                            const newAnswers = [...currentQuestion.answers];
                            newAnswers[index] = {
                              ...newAnswers[index],
                              answerText: e.target.value,
                            };
                            setCurrentQuestion({
                              ...currentQuestion,
                              answers: newAnswers,
                            });
                          }}
                          placeholder={`Answer option ${index + 1}`}
                          className="flex-1"
                        />
                        <RadioGroup
                          value={answer.isCorrect ? index.toString() : ""}
                          onValueChange={handleAnswerSelect}
                          className="flex items-center"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={index.toString()} />
                            <Label className="cursor-pointer">Correct</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button" // Ensure this is type="button"
                    onClick={handleQuestionAdd}
                    className="w-full"
                    variant="secondary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {editingQuestionIndex !== null
                      ? "Update Question"
                      : "Add Question"}
                  </Button>
                </div>
              </div>

              {questions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Added Questions</h4>
                    <Badge>{questions.length} questions</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {questions.map((question, index) => (
                      <div
                        key={index}
                        className="bg-white border rounded-lg p-4 relative group"
                      >
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleQuestionEdit(index)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleQuestionDelete(index)}
                            className="h-8 w-8 p-0 text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Badge variant="outline" className="mb-2">
                          Question {index + 1}
                        </Badge>
                        <p className="font-medium mb-2">
                          {question.questionText}
                        </p>
                        <ul className="space-y-1">
                          {question.answers.map((answer, aIndex) => (
                            <li
                              key={aIndex}
                              className={cn(
                                "text-sm p-2 rounded",
                                answer.isCorrect && "bg-green-50 text-green-700"
                              )}
                            >
                              {answer.answerText}
                              {answer.isCorrect && " (Correct)"}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t">
                <div className="flex items-center text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Add as many questions as needed
                </div>
                <div className="flex items-center gap-x-2">
                  <Button type="button" variant="ghost" onClick={toggleEdit}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!form.getValues("name") || questions.length === 0}
                  >
                    {initialData ? "Update Quiz" : "Create Quiz"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default ChapterQuizManual;
