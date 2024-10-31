// app/api/quizz/generate/route.ts

import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { PrismaClient } from "@prisma/client";
import saveQuizz from "@/components/save-to-db";
import { shuffle } from 'lodash';

const prisma = new PrismaClient();

const MAX_QUESTIONS = 10; // Hard limit of 10 questions
const WORDS_PER_QUESTION = 50; // Estimated words needed per quality question


// Add these new functions after your imports and before the POST handler:
function randomizeQuiz(quizData: any) {
  // Shuffle questions
  const shuffledQuestions = shuffle(quizData.questions);
  
  // Shuffle answers for each question
  const randomizedQuestions = shuffledQuestions.map(question => ({
    ...question,
    answers: shuffle(question.answers)
  }));

  return {
    ...quizData,
    questions: randomizedQuestions
  };
}

function validateQuestionDistribution(questions: any[]) {
  // Check correct answer distribution
  const correctAnswerPositions = questions.map(q => 
    q.answers.findIndex((a: any) => a.isCorrect)
  );
  
  // Count occurrences of each position
  const positionCounts = correctAnswerPositions.reduce((acc: any, pos: number) => {
    acc[pos] = (acc[pos] || 0) + 1;
    return acc;
  }, {});

  // Check if any position appears too frequently (more than 40% of questions)
  const maxAllowedCount = Math.ceil(questions.length * 0.4);
  return !Object.values(positionCounts).some((count: any) => count > maxAllowedCount);
}

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const document = body.get("pdf");
  const courseId = body.get("courseId") as string;
  const chapterId = body.get("chapterId") as string;
  const quizId = body.get("quizId") as string | undefined;
  const requestedCount = Math.min(parseInt(body.get("questionCount") as string) || 5, MAX_QUESTIONS);

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
    const words = totalContent.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const meaningfulWords = words.filter(word => word.length > 3).length;
    const contentDensity = meaningfulWords / wordCount;
    
    // Calculate optimal question count
    const maxPossibleQuestions = Math.min(
      Math.floor(meaningfulWords / (WORDS_PER_QUESTION * (contentDensity < 0.7 ? 1.5 : 1))), 
      MAX_QUESTIONS
    );
    
    const finalQuestionCount = Math.min(requestedCount, maxPossibleQuestions);

    console.log("Content analysis:", {
      totalWords: wordCount,
      meaningfulWords,
      contentDensity,
      requestedQuestions: requestedCount,
      maxPossibleQuestions,
      finalQuestionCount
    });

    if (finalQuestionCount < 1) {
      return NextResponse.json({ 
        error: "The provided content is too short to generate meaningful questions",
        analysis: {
          wordCount,
          meaningfulWords,
          contentDensity,
          minimumWordsNeeded: WORDS_PER_QUESTION
        }
      }, { status: 400 });
    }

    const prompt = `
    Analyze the following content and generate a quiz with exactly ${finalQuestionCount} questions.
    
    Content Analysis:
    - Total words: ${wordCount}
    - Meaningful words: ${meaningfulWords}
    - Content density: ${(contentDensity * 100).toFixed(1)}%
    ${finalQuestionCount < requestedCount ? 
      `\n- Note: Reduced from ${requestedCount} to ${finalQuestionCount} questions due to content limitations` : ''}
    
    Requirements:
    1. Generate exactly ${finalQuestionCount} unique and randomized questions
    2. Each question must have exactly 4 answer options
    3. Only one answer should be correct per question
    4. Generate questions with mixed difficulty levels (easy, medium, hard)
    5. Questions should be in random order, not following the text sequence
    6. All content must come strictly from the provided text
    7. Avoid overlapping or redundant questions
    8. Make answers clear and distinct
    9. Create answer options that are logical but not obviously wrong
    10. Vary the position of correct answers (don't put them in the same position)
    
    Format as JSON:
    {
      "quizz": {
        "name": "Descriptive quiz title based on content",
        "description": "Brief overview including question count explanation",
        "questions": [
          {
            "questionText": "Clear question",
            "difficulty": "easy|medium|hard",
            "answers": [
              {
                "answerText": "Answer option",
                "isCorrect": boolean
              }
              // Exactly 4 answers in random order
            ]
          }
          // Questions in random order
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

    if (result.quizz) {
      result.quizz = randomizeQuiz(result.quizz);
    }

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

    if (!validateQuestionDistribution(result.quizz.questions)) {
      console.log("First distribution check failed, re-randomizing...");
      result.quizz = randomizeQuiz(result.quizz);
      
      if (!validateQuestionDistribution(result.quizz.questions)) {
        console.warn("Suboptimal answer distribution after retry");
      }
    }
    
    // Validate each question and its answers with enhanced checks
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
    
      // Validate answer text and check for duplicates
      const answerTexts = new Set();
      for (let j = 0; j < question.answers.length; j++) {
        const answerText = question.answers[j].answerText?.trim();
        if (!answerText) {
          return NextResponse.json({ 
            error: `Answer ${j + 1} in question ${i + 1} has no answer text` 
          }, { status: 500 });
        }
        if (answerTexts.has(answerText.toLowerCase())) {
          return NextResponse.json({ 
            error: `Duplicate answer found in question ${i + 1}` 
          }, { status: 500 });
        }
        answerTexts.add(answerText.toLowerCase());
      }
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
      savedQuiz = await saveQuizz(quizzData);
    }

    const responseData = {
      quizzId: savedQuiz.id,
      quizName: savedQuiz.name,
      generatedQuestions: savedQuiz.questions.length,
      requestedQuestions: requestedCount,
      contentAnalysis: {
        totalWords: wordCount,
        meaningfulWords,
        contentDensity: (contentDensity * 100).toFixed(1) + '%',
        wordsPerQuestion: WORDS_PER_QUESTION,
        maxPossibleQuestions
      }
    };

    // Add appropriate warnings based on content analysis
    if (savedQuiz.questions.length < requestedCount) {
      return NextResponse.json({
        ...responseData,
        warning: `Generated ${savedQuiz.questions.length} questions instead of ${requestedCount} requested. 
          This is the optimal number based on your content length of ${wordCount} words.`,
      }, { status: 200 });
    }

    if (wordCount > MAX_QUESTIONS * WORDS_PER_QUESTION * 2) {
      return NextResponse.json({
        ...responseData,
        notice: `Your content has ${wordCount} words, which could support more questions. 
          However, we're limited to ${MAX_QUESTIONS} questions maximum for optimal quiz length.`
      }, { status: 200 });
    }

    return NextResponse.json({
      ...responseData,
      message: `Successfully generated ${savedQuiz.questions.length} questions from ${wordCount} words of content.`
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

//OLD CODE