"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuizzUploadDocument from "@/app/(course)/courses/[courseId]/chapters/[chapterId]/quizz/_components/quizz-upload-document";
import ChapterQuizManual from "./chapter-quiz-manual";
import { FileText, Edit, AlertCircle, Lock, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Quiz, Question, Answer } from "@prisma/client";
import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ExtendedQuiz extends Quiz {
  questions: Array<
    Question & {
      answers: Answer[];
    }
  >;
}

interface QuizTabsProps {
  automaticQuiz: ExtendedQuiz | null;
  manualQuiz: ExtendedQuiz | null;
  courseId: string;
  chapterId: string;
}

interface TabInfo {
  id: "automatic" | "manual";
  label: string;
  icon: React.ReactNode;
  description: string;
}

export const QuizTabs = ({
  automaticQuiz,
  manualQuiz,
  courseId,
  chapterId,
}: QuizTabsProps) => {
  const [activeTab, setActiveTab] = useState<string>("automatic");
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [quizType, setQuizType] = useState<string | null>(null);

  const loadingVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.98,
      transition: {
        duration: 0.15,
        ease: "easeIn",
      },
    },
  };

  const contentVariants = {
    hidden: {
      opacity: 0,
      scale: 0.98,
      y: 10,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.25,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  const tabs: TabInfo[] = [
    {
      id: "automatic",
      label: "Automatic Quiz",
      icon: <FileText className="h-4 w-4" />,
      description: "Generate quiz questions automatically from PDF content",
    },
    {
      id: "manual",
      label: "Manual Quiz",
      icon: <Edit className="h-4 w-4" />,
      description: "Create and manage quiz questions manually",
    },
  ];

  useEffect(() => {
    if (automaticQuiz) {
      setQuizType("automatic");
      setActiveTab("automatic");
      setIsLocked(true);
    } else if (manualQuiz) {
      setQuizType("manual");
      setActiveTab("manual");
      setIsLocked(true);
    } else {
      setQuizType(null);
      setIsLocked(false);
    }
  }, [automaticQuiz, manualQuiz]);

  const handleTabChange = async (value: string) => {
    if (isLocked && value !== quizType) return;

    setIsTabLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Increased duration for better visibility
    setActiveTab(value);
    setIsTabLoading(false);
  };

  const renderTabTrigger = (tab: TabInfo) => {
    const isTabLocked = isLocked && quizType !== tab.id;
    const isActive = activeTab === tab.id;
    const hasQuiz = tab.id === "automatic" ? automaticQuiz : manualQuiz;

    return (
      <TooltipProvider key={tab.id}>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="w-full">
              <motion.div
                whileHover={!isTabLocked ? { scale: 1.01 } : {}}
                whileTap={!isTabLocked ? { scale: 0.99 } : {}}
                transition={{ duration: 0.1 }}
              >
                <TabsTrigger
                  value={tab.id}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 p-3",
                    "transition-all duration-150 ease-in-out",
                    isTabLocked
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-background/80",
                    isActive && "bg-background shadow-sm"
                  )}
                  disabled={isTabLocked}
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      initial={false}
                      animate={{
                        scale: isActive ? 1.1 : 1,
                        color: isActive ? "var(--primary)" : "currentColor",
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {tab.icon}
                    </motion.div>
                    <span>{tab.label}</span>
                  </div>
                  {hasQuiz && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Badge variant="secondary">Selected</Badge>
                    </motion.div>
                  )}
                  {isTabLocked && <Lock className="h-4 w-4 ml-2" />}
                </TabsTrigger>
              </motion.div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            {isTabLocked ? (
              <p>
                You already have a {quizType} quiz. Delete it first to switch
                types.
              </p>
            ) : (
              <p>{tab.description}</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const onQuizDeleted = useCallback(() => {
    setQuizType(null);
    setIsLocked(false);
    setActiveTab("automatic");
  }, []);

  return (
    <Card className="mt-6 p-6">
      <div className="flex flex-col gap-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Chapter Quiz</h3>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Quiz Type Selection</AlertTitle>
            <AlertDescription>
              {!quizType
                ? "Choose how you want to create your quiz. You can either generate questions automatically from PDF or create them manually."
                : `Currently using ${quizType} quiz generation. Delete the quiz to switch types.`}
            </AlertDescription>
          </Alert>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full space-y-6"
        >
          <TabsList className="grid grid-cols-2 w-full p-1 h-auto gap-2 bg-muted">
            {tabs.map((tab) => renderTabTrigger(tab))}
          </TabsList>

          <div className="relative min-h-[200px]">
            <AnimatePresence mode="wait">
              {isTabLoading && (
                <motion.div
                  variants={loadingVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10 rounded-lg"
                >
                  <motion.div
                    className="flex flex-col items-center gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                  >
                    <div className="relative">
                      <motion.div
                        className="absolute inset-0"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <div className="w-10 h-10 rounded-full border-4 border-primary/30" />
                      </motion.div>
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                    <motion.p
                      className="text-sm text-muted-foreground font-medium"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      Loading {activeTab} quiz...
                    </motion.p>
                  </motion.div>
                </motion.div>
              )}

              <motion.div
                key={activeTab}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <TabsContent
                  value="automatic"
                  className="mt-0 focus-visible:outline-none"
                >
                  <QuizzUploadDocument
                    initialData={automaticQuiz}
                    courseId={courseId}
                    chapterId={chapterId}
                    onQuizDeleted={onQuizDeleted}
                  />
                </TabsContent>

                <TabsContent
                  value="manual"
                  className="mt-0 focus-visible:outline-none"
                >
                  <ChapterQuizManual
                    initialData={manualQuiz}
                    courseId={courseId}
                    chapterId={chapterId}
                    onQuizDeleted={onQuizDeleted}
                  />
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </div>
        </Tabs>

        {quizType && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Using <span className="font-semibold capitalize">{quizType}</span>{" "}
              quiz generation. Delete the quiz to switch types.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Card>
  );
};
