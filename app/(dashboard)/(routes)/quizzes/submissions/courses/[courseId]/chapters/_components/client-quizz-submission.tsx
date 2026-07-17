// ClientSideComponent.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Course, Quiz, Chapter } from "@prisma/client";
import {
  ClipboardList,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Lock,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import CountdownTimer from "@/components/count-down-times";

interface ExtendedQuizSubmission {
  id: number;
  score: number;
  createdAt: Date;
  lastAttemptAt: Date;
  attempt: number;
  satisfactoryAttempt: number;
  isLocked: boolean;
  quiz: Quiz & {
    chapter: Chapter;
  };
}

interface ClientSideComponentProps {
  course: Course;
  quizSubmissions: ExtendedQuizSubmission[];
  courseId: string;
}

const MAX_ATTEMPTS = 3;
const COOLDOWN_MINUTES = 2;
const SATISFACTORY_SCORE = 70;

const getScoreStyle = (score: number) => {
  if (score >= 90)
    return { bar: "bg-emerald-500", text: "text-emerald-600", ring: "bg-emerald-50 text-emerald-700" };
  if (score >= 70)
    return { bar: "bg-sky-500", text: "text-sky-600", ring: "bg-sky-50 text-sky-700" };
  if (score >= 50)
    return { bar: "bg-amber-500", text: "text-amber-600", ring: "bg-amber-50 text-amber-700" };
  return { bar: "bg-rose-500", text: "text-rose-600", ring: "bg-rose-50 text-rose-700" };
};

const ClientSideComponent: React.FC<ClientSideComponentProps> = ({
  course,
  quizSubmissions,
  courseId,
}) => {
  const [cooldowns, setCooldowns] = useState<{ [key: number]: Date | null }>(
    {}
  );

  useEffect(() => {
    const newCooldowns: { [key: number]: Date | null } = {};
    quizSubmissions.forEach((submission) => {
      if (submission.attempt >= MAX_ATTEMPTS && !submission.isLocked) {
        const cooldownTime = new Date(submission.lastAttemptAt);
        cooldownTime.setMinutes(cooldownTime.getMinutes() + COOLDOWN_MINUTES);
        if (cooldownTime > new Date()) {
          newCooldowns[submission.id] = cooldownTime;
        }
      }
    });
    setCooldowns(newCooldowns);
  }, [quizSubmissions]);

  const handleCooldownComplete = (submissionId: number) => {
    setCooldowns((prev) => ({ ...prev, [submissionId]: null }));
  };

  const getQuizStatus = (submission: ExtendedQuizSubmission) => {
    if (submission.isLocked) {
      return {
        badge: (
          <Badge className="bg-slate-100 text-slate-600 rounded-full gap-1">
            <Lock className="w-3.5 h-3.5" />
            Locked
          </Badge>
        ),
        actionButton: null,
      };
    } else if (submission.score >= SATISFACTORY_SCORE) {
      return {
        badge: (
          <Badge className="bg-emerald-50 text-emerald-700 rounded-full gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Passed
          </Badge>
        ),
        actionButton: null,
      };
    } else if (cooldowns[submission.id]) {
      return {
        badge: (
          <Badge className="bg-amber-50 text-amber-700 rounded-full gap-1">
            <RefreshCw className="w-3.5 h-3.5" />
            Cooldown
          </Badge>
        ),
        actionButton: null,
      };
    } else {
      return {
        badge: (
          <Badge className="bg-amber-50 text-amber-700 rounded-full gap-1">
            <XCircle className="w-3.5 h-3.5" />
            Not Passed
          </Badge>
        ),
        actionButton: (
          <Button
            className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition-colors"
          >
            {submission.attempt === 0 ? "Start Quiz" : "Retake Quiz"}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        ),
      };
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">
      <header className="mb-6">
        <div className="flex items-center gap-2 text-slate-400 mb-1">
          <ClipboardList className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wider">
            Quiz Submissions
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {course.title}
        </h1>
      </header>

      {quizSubmissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <ClipboardList className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-600">
            No quiz submissions found for this course.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {quizSubmissions.map((submission: ExtendedQuizSubmission, i) => {
            const { badge, actionButton } = getQuizStatus(submission);
            const scoreStyle = getScoreStyle(submission.score);
            return (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <Card className="h-full rounded-2xl border border-slate-200/70 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                  <div className="p-5 flex-1 flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-semibold text-slate-900 leading-snug">
                        {submission.quiz.name}
                      </h3>
                      {badge}
                    </div>

                    {submission.attempt > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-500">
                            Score
                          </span>
                          <span
                            className={`text-sm font-semibold rounded-full px-2.5 py-0.5 ${scoreStyle.ring}`}
                          >
                            {submission.score}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${scoreStyle.bar} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${submission.score}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5 text-sm">
                      <p className="text-slate-500 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        {submission.quiz.chapter.title}
                      </p>
                      {submission.attempt > 0 && (
                        <p className="text-xs text-slate-400">
                          Last attempt:{" "}
                          {new Date(
                            submission.lastAttemptAt
                          ).toLocaleDateString()}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <ClipboardList className="w-3.5 h-3.5" />
                        Attempts: {submission.attempt}/{MAX_ATTEMPTS}
                      </p>
                    </div>

                    <AnimatePresence>
                      {cooldowns[submission.id] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-1"
                        >
                          <p className="text-xs font-medium text-slate-500 mb-2">
                            Cooldown Period
                          </p>
                          <CountdownTimer
                            initialTime={Math.round(
                              (cooldowns[submission.id]!.getTime() - Date.now()) /
                                1000
                            )}
                            onComplete={() =>
                              handleCooldownComplete(submission.id)
                            }
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {actionButton && (
                    <Link
                      href={`/courses/${courseId}/chapters/${submission.quiz.chapterId}/quizz/${submission.quiz.id}`}
                      className="block w-full"
                    >
                      {actionButton}
                    </Link>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientSideComponent;
