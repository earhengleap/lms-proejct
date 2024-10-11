"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CommentItem, Comment } from "./comment-item";
import { Send } from "lucide-react";

interface CommentsProps {
  chapterId: string;
  hasPurchased: boolean; // Check if the user has purchased
}

export const Comments: React.FC<CommentsProps> = ({
  chapterId,
  hasPurchased,
}) => {
  const { user: currentUser, isLoaded: isUserLoaded } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingMainComment, setIsSubmittingMainComment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/comments?chapterId=${chapterId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [chapterId]);

  const updateCommentInTree = useCallback(
    (comments: Comment[], updatedComment: Comment): Comment[] => {
      return comments.map((comment) => {
        if (comment.id === updatedComment.id) {
          return { ...comment, ...updatedComment };
        } else if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: updateCommentInTree(comment.replies, updatedComment),
          };
        }
        return comment;
      });
    },
    []
  );

  const addCommentToTree = useCallback(
    (comments: Comment[], newComment: Comment): Comment[] => {
      if (!newComment.parentId) {
        return [newComment, ...comments];
      }

      return comments.map((comment) => {
        if (comment.id === newComment.parentId) {
          return {
            ...comment,
            replies: [newComment, ...(comment.replies || [])],
          };
        } else if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: addCommentToTree(comment.replies, newComment),
          };
        }
        return comment;
      });
    },
    []
  );

  useEffect(() => {
    fetchComments();

    const eventSource = new EventSource(
      `/api/comments/sse?chapterId=${chapterId}`
    );

    eventSource.onmessage = (event) => {
      if (event.data === "ping") return;

      const data = JSON.parse(event.data);
      if (data.type === "newComment") {
        setComments((prevComments) =>
          addCommentToTree(prevComments, data.comment)
        );
      } else if (
        data.type === "updatedComment" ||
        data.type === "likeUpdated"
      ) {
        setComments((prevComments) =>
          updateCommentInTree(prevComments, data.comment)
        );
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [fetchComments, chapterId, addCommentToTree, updateCommentInTree]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newComment.trim() ||
      isSubmittingMainComment ||
      !isUserLoaded ||
      !currentUser
    ) {
      if (!newComment.trim()) {
        toast.error("Comment cannot be empty.");
      }
      return;
    }

    setIsSubmittingMainComment(true);
    try {
      await submitComment(newComment);
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to post comment. Please try again.");
    } finally {
      setIsSubmittingMainComment(false);
    }
  };

  const submitComment = async (
    message: string,
    parentId: string | null = null
  ) => {
    const response = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, chapterId, parentId }),
    });

    if (!response.ok) {
      throw new Error("Failed to post comment");
    }
  };

  const handleLikeComment = async (commentId: string): Promise<Comment> => {
    try {
      const response = await fetch("/api/comments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      });

      if (!response.ok) {
        throw new Error("Failed to like comment");
      }

      const updatedComment = await response.json();
      return updatedComment;
    } catch (error) {
      console.error("Error liking comment:", error);
      toast.error("Failed to like comment. Please try again.");
      throw error;
    }
  };

  return (
    <div className="flex flex-col">
      {isUserLoaded &&
        currentUser &&
        hasPurchased && ( // Only show comment box if user has purchased
          <div className="mb-6 bg-white">
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  disabled={isSubmittingMainComment}
                  className="pr-24 resize-none w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-md shadow-sm"
                  rows={3}
                />
                <Button
                  type="submit"
                  disabled={isSubmittingMainComment}
                  className="absolute bottom-3 right-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 px-4 text-sm font-medium transition duration-300 ease-in-out flex items-center"
                >
                  {isSubmittingMainComment ? (
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {isSubmittingMainComment ? "Posting..." : "Post"}
                </Button>
              </div>
            </form>
          </div>
        )}

      <div>
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <svg
              className="animate-spin h-8 w-8 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-gray-500 text-center">No comments yet.</div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onSubmitReply={submitComment}
                onLikeComment={handleLikeComment}
                currentUser={currentUser}
                onCommentUpdate={(updatedComment) => {
                  setComments((prevComments) =>
                    updateCommentInTree(prevComments, updatedComment)
                  );
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
