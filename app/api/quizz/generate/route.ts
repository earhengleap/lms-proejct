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
  const requestedCount = parseInt(body.get("questionCount") as string) || 5;

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
    const totalContent = texts.join(" ");

    // Enhanced content analysis
    const wordCount = totalContent.split(/\s+/).length;
    const maxPossibleQuestions = Math.min(Math.floor(wordCount / 50), 15); // 1 question per 50 words, max 15
    const finalQuestionCount = Math.min(requestedCount, maxPossibleQuestions);

    console.log("Content analysis:", {
      wordCount,
      requestedQuestions: requestedCount,
      maxPossibleQuestions,
      finalQuestionCount,
      contentLength: totalContent.length
    });

    // Check if we can generate enough questions
    if (finalQuestionCount < 1) {
      return NextResponse.json({ 
        error: "The provided content is too short to generate meaningful questions" 
      }, { status: 400 });
    }

    const prompt = `
      Analyze the following content and generate a quiz with exactly ${finalQuestionCount} questions.
      
      Content Analysis:
      - The content has approximately ${wordCount} words
      - Generating ${finalQuestionCount} questions ${finalQuestionCount < requestedCount ? 
        "(reduced from " + requestedCount + " due to content limitations)" : ""}
      
      Requirements:
      1. Generate exactly ${finalQuestionCount} unique and meaningful questions
      2. Each question must have exactly 4 answer options
      3. Only one answer should be correct per question
      4. Ensure questions test different aspects and difficulty levels
      5. Questions should progress from basic understanding to advanced concepts
      6. All questions and answers must be based strictly on the provided content
      7. Avoid redundant or overlapping questions
      8. Make answers clear and distinct from each other
      
      Format the response as a JSON object with:
      {
        "quizz": {
          "name": "Descriptive quiz title based on content",
          "description": "Brief overview including note about question count if reduced",
          "questions": [
            {
              "questionText": "Clear, well-formed question",
              "answers": [
                {
                  "answerText": "Answer option",
                  "isCorrect": boolean
                }
                // Exactly 4 answers per question
              ]
            }
            // Exactly ${finalQuestionCount} questions
          ]
        }
      }
    `;

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI API key not provided");
      return NextResponse.json({ error: "OPENAI API key not provided" }, { status: 500 });
    }

    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-3.5-turbo",
      temperature: 0.7,
      maxTokens: 2500, // Adjust based on content length
    });

    const parser = new JsonOutputFunctionsParser();
    const extractionFunctionSchema = {
      name: "extractor",
      description: "Extracts quiz data ensuring exact question count and format",
      parameters: {
        type: "object",
        properties: {
          quizz: {
            type: "object",
            properties: {
              name: { 
                type: "string",
                description: "Descriptive title for the quiz"
              },
              description: { 
                type: "string",
                description: "Overview of quiz content and any adjustments made"
              },
              questions: {
                type: "array",
                minItems: finalQuestionCount,
                maxItems: finalQuestionCount,
                items: {
                  type: "object",
                  properties: {
                    questionText: { 
                      type: "string",
                      description: "Clear, well-formed question"
                    },
                    answers: {
                      type: "array",
                      minItems: 4,
                      maxItems: 4,
                      items: {
                        type: "object",
                        properties: {
                          answerText: { 
                            type: "string",
                            description: "Clear answer option"
                          },
                          isCorrect: { 
                            type: "boolean",
                            description: "Whether this is the correct answer"
                          },
                        },
                        required: ["answerText", "isCorrect"]
                      },
                    },
                  },
                  required: ["questionText", "answers"]
                },
              },
            },
            required: ["name", "description", "questions"]
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
          text: prompt + "\n\nContent:\n" + texts.join("\n"),
        },
      ],
    });

    const result: any = await runnable.invoke([message]);

    // Enhanced validation
    if (!result.quizz || !result.quizz.name || !result.quizz.description) {
      console.error("Invalid quiz data returned from GPT-3.5");
      return NextResponse.json({ error: "Failed to generate quiz data" }, { status: 500 });
    }

    // Validate questions
    if (!result.quizz.questions || result.quizz.questions.length !== finalQuestionCount) {
      console.error("Invalid number of questions generated");
      return NextResponse.json({ 
        error: `Expected ${finalQuestionCount} questions but got ${result.quizz.questions?.length || 0}` 
      }, { status: 500 });
    }

    // Validate each question and its answers
    for (let i = 0; i < result.quizz.questions.length; i++) {
      const question = result.quizz.questions[i];
      
      if (!question.questionText?.trim()) {
        return NextResponse.json({ 
          error: `Question ${i + 1} has no question text` 
        }, { status: 500 });
      }

      if (!question.answers || question.answers.length !== 4) {
        return NextResponse.json({ 
          error: `Question ${i + 1} does not have exactly 4 answers` 
        }, { status: 500 });
      }

      const correctAnswers = question.answers.filter((a: any) => a.isCorrect).length;
      if (correctAnswers !== 1) {
        return NextResponse.json({ 
          error: `Question ${i + 1} must have exactly one correct answer` 
        }, { status: 500 });
      }

      // Validate answer text
      for (let j = 0; j < question.answers.length; j++) {
        if (!question.answers[j].answerText?.trim()) {
          return NextResponse.json({ 
            error: `Answer ${j + 1} in question ${i + 1} has no answer text` 
          }, { status: 500 });
        }
      }
    }

    // Add metadata to quiz
    const quizzData = {
      ...result.quizz,
      courseId,
      chapterId,
    };

   // Update the response section in your try-catch block where you save the quiz
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

  const responseData = {
    quizzId: savedQuiz.id,
    quizName: savedQuiz.name,
    generatedQuestions: savedQuiz.questions.length,
    requestedQuestions: requestedCount,
  };

  // Check if we generated fewer questions than requested
  if (savedQuiz.questions.length < requestedCount) {
    return NextResponse.json({
      ...responseData,
      warning: `Could only generate ${savedQuiz.questions.length} questions out of ${requestedCount} requested. 
        The PDF content was not sufficient to create ${requestedCount} unique questions.`,
      contentAnalysis: {
        wordCount,
        maxPossibleQuestions,
        actualGenerated: savedQuiz.questions.length,
        contentLength: totalContent.length,
      }
    }, { status: 200 });
  }

  if (finalQuestionCount < requestedCount) {
    return NextResponse.json({
      ...responseData,
      warning: `Due to content limitations, generated ${finalQuestionCount} questions instead of the requested ${requestedCount}. 
        The PDF did not contain enough information for ${requestedCount} unique questions.`,
      contentAnalysis: {
        wordCount,
        maxPossibleQuestions,
        actualGenerated: savedQuiz.questions.length,
        contentLength: totalContent.length,
      }
    }, { status: 200 });
  }

  // If we generated the requested number of questions
  return NextResponse.json({
    ...responseData,
    message: `Successfully generated ${savedQuiz.questions.length} questions as requested.`
  }, { status: 200 });

} catch (error: any) {
  console.error("Error saving/updating quiz:", error);
  return NextResponse.json({ 
    error: error.message || "Failed to save/update quiz" 
  }, { status: 500 });
}
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}