// app/api/quizz/generate/route.ts

import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { PrismaClient } from "@prisma/client";
import saveQuizz from "@/components/save-to-db";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const document = body.get("pdf");
  const courseId = body.get("courseId") as string;
  const chapterId = body.get("chapterId") as string;
  const quizId = body.get("quizId") as string | undefined;

  if (!courseId || !chapterId) {
    return NextResponse.json({ error: "Course ID and Chapter ID are required" }, { status: 400 });
  }

  try {
    const pdfLoader = new PDFLoader(document as Blob, {
      parsedItemSeparator: "",
    });
    const docs = await pdfLoader.load();

    const selectedDocuments = docs.filter((doc) => doc.pageContent !== undefined);
    const texts = selectedDocuments.map((doc) => doc.pageContent);

    console.log("Extracted texts:", texts);

    const prompt = `
      Given the text which is a summary of the document, generate a quiz based on the text.
      Return JSON that contains a quiz object with fields: name, description, and questions.
      The questions is an array of objects with fields: questionText and answers.
      The answers is an array of objects with fields: answerText and isCorrect.
    `;

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI API key not provided");
      return NextResponse.json({ error: "OPENAI API key not provided" }, { status: 500 });
    }

    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-3.5-turbo",
    });

    const parser = new JsonOutputFunctionsParser();
    const extractionFunctionSchema = {
      name: "extractor",
      description: "Extracts fields from the input.",
      parameters: {
        type: "object",
        properties: {
          quizz: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    questionText: { type: "string" },
                    answers: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          answerText: { type: "string" },
                          isCorrect: { type: "boolean" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const runnable = model
      .bind({
        functions: [extractionFunctionSchema],
        function_call: { name: "extractor" },
      })
      .pipe(parser);

    const message = new HumanMessage({
      content: [
        {
          type: "text",
          text: prompt + "\n" + texts.join("\n"),
        },
      ],
    });

    const result: any = await runnable.invoke([message]);
    console.log("GPT-3.5 response:", result);

    if (!result.quizz || !result.quizz.name || !result.quizz.description) {
      console.error("Invalid quiz data returned from GPT-3.5");
      return NextResponse.json({ error: "Failed to generate quiz data" }, { status: 500 });
    }

    // Add courseId and chapterId to the quiz data
    const quizzData = {
      ...result.quizz,
      courseId,
      chapterId,
    };

    try {
      let savedQuiz;
      if (quizId) {
        // Update existing quiz
        savedQuiz = await prisma.quiz.update({
          where: { id: parseInt(quizId) },
          data: {
            name: quizzData.name,
            description: quizzData.description,
            questions: {
              deleteMany: {},
              create: quizzData.questions.map((q: any) => ({
                questionText: q.questionText,
                answers: {
                  create: q.answers.map((a: any) => ({
                    answerText: a.answerText,
                    isCorrect: a.isCorrect,
                  })),
                },
              })),
            },
          },
          include: {
            questions: {
              include: {
                answers: true,
              },
            },
          },
        });
      } else {
        // Create new quiz
        savedQuiz = await saveQuizz(quizzData);
      }
      return NextResponse.json({ quizzId: savedQuiz.id, quizName: savedQuiz.name }, { status: 200 });
    } catch (error: any) {
      console.error("Error saving/updating quiz:", error);
      return NextResponse.json({ error: error.message || "Failed to save/update quiz" }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        error: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

//OLD CODE