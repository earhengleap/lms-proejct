// actions/save-submission.ts

'use server';

import { db } from "@/lib/db";
import { differenceInMinutes } from "date-fns";

const MAX_ATTEMPTS = 3;
const COOLDOWN_MINUTES = 2;
const SATISFACTORY_SCORE = 70;

export async function saveSubmission(submission: { score: number, quizzId: number, userId: string }) {
  const { score, quizzId, userId } = submission;

  // Fetch the latest submission for this user and quiz
  const latestSubmission = await db.quizSubmission.findFirst({
    where: {
      quizzId,
      userId,
    },
    orderBy: {
      attempt: "desc",
    },
  });

  if (latestSubmission) {
    const timeSinceLastAttempt = differenceInMinutes(new Date(), latestSubmission.lastAttemptAt);
    const isInCooldown = latestSubmission.attempt >= MAX_ATTEMPTS && timeSinceLastAttempt < COOLDOWN_MINUTES;
    
    if (isInCooldown) {
      throw new Error(`You need to wait for ${COOLDOWN_MINUTES} minutes before retaking the quiz.`);
    }

    let newAttempt: number;
    let newSatisfactoryAttempt: number;
    let isLocked: boolean = false;

    if (latestSubmission.attempt >= MAX_ATTEMPTS && timeSinceLastAttempt >= COOLDOWN_MINUTES) {
      // Reset attempts after cooldown
      newAttempt = 1;
      newSatisfactoryAttempt = 0;
    } else {
      newAttempt = latestSubmission.attempt + 1;
      newSatisfactoryAttempt = latestSubmission.satisfactoryAttempt || 0;
    }

    if (score >= SATISFACTORY_SCORE) {
      newSatisfactoryAttempt += 1;
    }

    // Only lock if there's a satisfactory attempt and max attempts reached
    if (newSatisfactoryAttempt >= 1 && newAttempt > MAX_ATTEMPTS) {
      isLocked = true;
    }

    // Update the existing submission
    const updatedSubmission = await db.quizSubmission.update({
      where: { id: latestSubmission.id },
      data: {
        score,
        attempt: newAttempt,
        satisfactoryAttempt: newSatisfactoryAttempt,
        lastAttemptAt: new Date(),
        isLocked,
      },
    });

    return {
      submissionId: updatedSubmission.id,
      ownerId: userId,
      attempt: newAttempt,
      satisfactoryAttempt: newSatisfactoryAttempt,
      isLocked,
    };
  } else {
    // If no submission exists, create a new one
    const newSubmission = await db.quizSubmission.create({
      data: {
        score,
        quizzId,
        userId,
        attempt: 1,
        satisfactoryAttempt: score >= SATISFACTORY_SCORE ? 1 : 0,
        lastAttemptAt: new Date(),
        isLocked: false,
      },
    });

    return {
      submissionId: newSubmission.id,
      ownerId: userId,
      attempt: 1,
      satisfactoryAttempt: score >= SATISFACTORY_SCORE ? 1 : 0,
      isLocked: false,
    };
  }
}