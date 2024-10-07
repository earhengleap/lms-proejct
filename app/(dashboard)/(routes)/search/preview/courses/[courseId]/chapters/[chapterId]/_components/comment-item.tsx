// File: app/(dashboard)/(routes)/search/preview/courses/[courseId]chapters/[chapterId]/_components/comment-item.tsx

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Heart,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Send,
} from "lucide-react";
import { toast } from "sonner";

export interface Like {
  userId: string;
}

export interface Comment {
  id: string;
  message: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
  likes?: Like[];
  replies?: Comment[];
  parentId: string | null;
}

interface CommentItemProps {
  comment: Comment;
  onSubmitReply: (message: string, parentId: string) => Promise<void>;
  onLikeComment: (commentId: string) => Promise<Comment>;
  currentUser: { id: string } | null | undefined;
  depth?: number;
  onCommentUpdate: (updatedComment: Comment) => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onSubmitReply,
  onLikeComment,
  currentUser,
  depth = 0,
  onCommentUpdate,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [localComment, setLocalComment] = useState(comment);

  useEffect(() => {
    setLocalComment(comment);
  }, [comment]);

  const handleReply = () => {
    setIsReplying(true);
  };

  const handleCancelReply = () => {
    setReplyText("");
    setIsReplying(false);
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim() === "") {
      toast.error("Reply cannot be empty.");
      return;
    }
    setIsSubmittingReply(true);
    try {
      await onSubmitReply(replyText, localComment.id);
      setReplyText("");
      setIsReplying(false);
      toast.success("Reply posted successfully!");
    } catch (error) {
      console.error("Error posting reply:", error);
      toast.error("Failed to post reply. Please try again.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleLike = useCallback(async () => {
    if (!currentUser) return;

    try {
      const updatedComment = await onLikeComment(localComment.id);
      setLocalComment(updatedComment);
      onCommentUpdate(updatedComment);
    } catch (error) {
      console.error("Error toggling like on comment:", error);
      toast.error("Failed to update like. Please try again.");
    }
  }, [localComment.id, currentUser, onLikeComment, onCommentUpdate]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const isCurrentUserComment =
    currentUser &&
    currentUser.id &&
    localComment.user &&
    localComment.user.id === currentUser.id;
  const isLikedByCurrentUser =
    currentUser &&
    currentUser.id &&
    localComment.likes &&
    localComment.likes.some((like) => like.userId === currentUser.id);

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const firstInitial = firstName ? firstName[0] : "";
    const lastInitial = lastName ? lastName[0] : "";
    return (firstInitial + lastInitial).toUpperCase() || "?";
  };

  const getTotalReplyCount = useCallback((comment: Comment): number => {
    let count = comment.replies?.length || 0;
    comment.replies?.forEach((reply) => {
      count += getTotalReplyCount(reply);
    });
    return count;
  }, []);

  const totalReplyCount = useMemo(
    () => getTotalReplyCount(localComment),
    [localComment, getTotalReplyCount]
  );

  return (
    <div className={`mb-4 ${depth > 0 ? "border-l pl-4 border-gray-200" : ""}`}>
      <div
        className={`pb-4 rounded-lg ${isCurrentUserComment ? "bg-blue-50 border border-blue-100" : "bg-gray-50 border border-gray-100"}`}
      >
        <div className="flex items-start space-x-3 p-4">
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback
              className={`${isCurrentUserComment ? "bg-blue-500" : "bg-gray-500"} text-white text-xs`}
            >
              {getInitials(
                localComment.user?.firstName,
                localComment.user?.lastName
              )}
            </AvatarFallback>
          </Avatar>
          <div className="flex-grow min-w-0">
            <div className="flex items-center justify-between flex-wrap">
              <h4 className="font-medium text-sm text-gray-900 truncate max-w-[calc(100%-5rem)]">
                {localComment.user?.firstName} {localComment.user?.lastName}
                {isCurrentUserComment && (
                  <span className="ml-2 text-xs font-normal text-blue-600">
                    (You)
                  </span>
                )}
              </h4>
              <span className="text-xs text-gray-500">
                {new Date(localComment.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-700 break-words">
              {localComment.message}
            </p>
            <div className="mt-2 flex items-center space-x-4 text-xs">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`text-gray-500 hover:text-sky-500 p-0 ${isLikedByCurrentUser ? "text-sky-500" : ""}`}
              >
                <Heart
                  className={`w-4 h-4 mr-1 ${isLikedByCurrentUser ? "fill-sky-500" : "fill-none"}`}
                />
                {localComment.likes ? localComment.likes.length : 0}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReply}
                className="text-gray-500 hover:text-blue-600 p-0"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Reply
              </Button>
            </div>
          </div>
        </div>
        {isReplying && currentUser && (
          <form onSubmit={handleSubmitReply} className="mt-3 px-4">
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${localComment.user?.firstName || "User"}...`}
              className="mb-2 resize-none w-full text-sm"
              rows={2}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelReply}
                size="sm"
                className="text-gray-600 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                disabled={isSubmittingReply}
              >
                {isSubmittingReply ? (
                  <span className="flex items-center">
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
                    Posting...
                  </span>
                ) : (
                  <>
                    <Send className="w-3 h-3 mr-1" />
                    Post Reply
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
      {totalReplyCount > 0 && (
        <div className="mt-2 pl-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpanded}
            className="text-blue-600 hover:text-blue-700 p-0 text-xs"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Hide Replies
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Show Replies ({totalReplyCount})
              </>
            )}
          </Button>
          {isExpanded && (
            <div className="mt-2 space-y-4">
              {localComment.replies?.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onSubmitReply={onSubmitReply}
                  onLikeComment={onLikeComment}
                  currentUser={currentUser}
                  depth={depth + 1}
                  onCommentUpdate={(updatedReply) => {
                    const updatedReplies = localComment.replies!.map((r) =>
                      r.id === updatedReply.id ? updatedReply : r
                    );
                    const updatedComment = {
                      ...localComment,
                      replies: updatedReplies,
                    };
                    setLocalComment(updatedComment);
                    onCommentUpdate(updatedComment);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

//working all with realtime comments and like
