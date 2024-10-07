// File: app/api/comments/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const chapterId = searchParams.get("chapterId");

    if (!chapterId) {
      return new NextResponse("Chapter ID is required", { status: 400 });
    }

    const fetchNestedComments = async (parentId: string | null = null, depth: number = 0): Promise<any[]> => {
      if (depth > 10) return []; // Limit nesting depth to avoid potential issues

      const comments = await db.comment.findMany({
        where: {
          chapterId: chapterId,
          parentId: parentId,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          likes: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const commentsWithReplies = await Promise.all(
        comments.map(async (comment) => {
          const replies = await fetchNestedComments(comment.id, depth + 1);
          return { ...comment, replies };
        })
      );

      return commentsWithReplies;
    };

    const allComments = await fetchNestedComments();

    return NextResponse.json(allComments);
  } catch (error) {
    console.log("[COMMENTS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const { message, chapterId, parentId } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { userId: userId },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const chapter = await db.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter) {
      return new NextResponse("Chapter not found", { status: 404 });
    }

    let post = await db.post.findFirst({
      where: { title: `Chapter ${chapter.id}` },
    });

    if (!post) {
      post = await db.post.create({
        data: {
          title: `Chapter ${chapter.id}`,
          body: `Comments for Chapter ${chapter.id}`,
        },
      });
    }

    const comment = await db.comment.create({
      data: {
        message,
        userId: user.id,
        chapterId: chapterId,
        postId: post.id,
        parentId: parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        likes: true,
      },
    });

    const connections = (global as any).connections;
    if (connections) {
      Object.values(connections).forEach((sendEvent: any) => {
        sendEvent(JSON.stringify({ 
          type: 'newComment', 
          comment: {
            ...comment,
            replies: [],
          }
        }));
      });
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.log("[COMMENTS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = auth();
    const { commentId } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { userId: userId },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    let updatedComment: Prisma.CommentGetPayload<{
      include: {
        user: {
          select: {
            id: true;
            firstName: true;
            lastName: true;
          }
        };
        likes: true;
        replies: {
          include: {
            user: {
              select: {
                id: true;
                firstName: true;
                lastName: true;
              }
            };
            likes: true;
          }
        };
      }
    }> | null = null;

    await db.$transaction(async (prisma) => {
      const existingLike = await prisma.like.findUnique({
        where: {
          userId_commentId: {
            userId: user.id,
            commentId: commentId,
          },
        },
      });

      if (existingLike) {
        await prisma.like.delete({
          where: {
            id: existingLike.id,
          },
        });
      } else {
        await prisma.like.create({
          data: {
            userId: user.id,
            commentId: commentId,
          },
        });
      }

      updatedComment = await prisma.comment.findUnique({
        where: { id: commentId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          likes: true,
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
              likes: true,
            },
          },
        },
      });
    });

    if (!updatedComment) {
      return new NextResponse("Comment not found", { status: 404 });
    }

    const connections = (global as any).connections;
    if (connections) {
      Object.values(connections).forEach((sendEvent: any) => {
        sendEvent(JSON.stringify({ type: 'likeUpdated', comment: updatedComment }));
      });
    }

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.log("[COMMENTS_LIKE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

//working all with realtime comments and like