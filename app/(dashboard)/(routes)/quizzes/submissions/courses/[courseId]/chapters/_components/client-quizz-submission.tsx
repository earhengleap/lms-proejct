// ClientSideComponent.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Course, Quiz, Chapter } from "@prisma/client";
import {
  ClipboardList,
  ArrowRight,
  CheckCircle,
  XCircle,
  LockIcon,
  RefreshCw,
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 70) return "bg-blue-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getQuizStatus = (submission: ExtendedQuizSubmission) => {
    if (submission.isLocked) {
      return {
        badge: (
          <Badge
            variant="secondary"
            className="bg-gray-100 text-gray-800 flex items-center"
          >
            <LockIcon className="w-4 h-4 mr-1" />
            Locked
          </Badge>
        ),
        actionButton: null,
      };
    } else if (submission.score >= SATISFACTORY_SCORE) {
      return {
        badge: (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 flex items-center"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Passed
          </Badge>
        ),
        actionButton: null,
      };
    } else if (cooldowns[submission.id]) {
      return {
        badge: (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            In Cooldown
          </Badge>
        ),
        actionButton: null,
      };
    } else {
      return {
        badge: (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 flex items-center"
          >
            <XCircle className="w-4 h-4 mr-1" />
            Not Passed
          </Badge>
        ),
        actionButton: (
          <Button className="w-full rounded-none bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center">
            {submission.attempt === 0 ? "Start Quiz" : "Retake Quiz"}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        ),
      };
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
        {course.title} - Quiz Submissions
      </h1>
      {quizSubmissions.length === 0 ? (
        <p className="text-center text-gray-500">
          No quiz submissions found for this course.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizSubmissions.map((submission: ExtendedQuizSubmission) => {
            const { badge, actionButton } = getQuizStatus(submission);
            return (
              <Card
                key={submission.id}
                className="hover:shadow-md transition-shadow overflow-hidden"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base sm:text-lg flex justify-between items-center">
                    <span>{submission.quiz.name}</span>
                    {badge}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    {submission.attempt > 0 && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">
                            Score
                          </span>
                          <Badge
                            variant="secondary"
                            className={`${getScoreColor(submission.score)} text-white`}
                          >
                            {submission.score}%
                          </Badge>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getScoreColor(submission.score)} transition-all duration-500 ease-out`}
                            style={{ width: `${submission.score}%` }}
                          />
                        </div>
                      </>
                    )}
                    <p className="text-xs sm:text-sm text-gray-600">
                      Chapter: {submission.quiz.chapter.title}
                    </p>
                    {submission.attempt > 0 && (
                      <p className="text-xs text-gray-400">
                        Last Attempt:{" "}
                        {new Date(
                          submission.lastAttemptAt
                        ).toLocaleDateString()}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-400 flex items-center">
                        <ClipboardList className="w-4 h-4 mr-1" />
                        Attempts: {submission.attempt}/{MAX_ATTEMPTS}
                      </p>
                    </div>
                    {cooldowns[submission.id] && (
                      <div className="mt-2">
                        <h3 className="text-xs sm:text-sm font-semibold mb-1">
                          Cooldown Period
                        </h3>
                        <CountdownTimer
                          initialTime={Math.round(
                            (cooldowns[submission.id]!.getTime() - Date.now()) /
                              1000
                          )}
                          onComplete={() =>
                            handleCooldownComplete(submission.id)
                          }
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
                {actionButton && (
                  <Link
                    href={`/courses/${courseId}/chapters/${submission.quiz.chapterId}/quizz/${submission.quiz.id}`}
                    className="block w-full"
                  >
                    {actionButton}
                  </Link>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientSideComponent;
