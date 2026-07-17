"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  CornerDownRight,
  Mail,
  BookOpen,
  Inbox,
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  createdAt: Date;
  author: { name: string; email: string };
  course: string;
  chapter: string;
  replyCount: number;
}

export const MessageInbox = ({ messages }: { messages: Message[] }) => {
  const [selectedId, setSelectedId] = useState<string | null>(
    messages[0]?.id ?? null
  );

  const selected = messages.find((m) => m.id === selectedId) || null;

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
          <Inbox className="h-6 w-6 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-600">
          No messages yet
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Course discussions will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* List */}
      <div className="lg:col-span-5">
        <div className="bg-white rounded-2xl border border-slate-200/70 divide-y divide-slate-100 max-h-[640px] overflow-y-auto scrollbar-hide">
          {messages.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedId(m.id)}
              className={cn(
                "w-full text-left px-4 py-3.5 flex gap-3 transition-colors",
                selectedId === m.id
                  ? "bg-slate-50"
                  : "hover:bg-slate-50/60"
              )}
            >
              <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-medium shrink-0">
                {m.author.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {m.author.name}
                  </p>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {formatDistanceToNow(new Date(m.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-sm text-slate-500 line-clamp-1 mt-0.5">
                  {m.text}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 truncate">
                  {m.course} · {m.chapter}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div className="lg:col-span-7">
        <div className="bg-white rounded-2xl border border-slate-200/70 p-6 min-h-[400px]">
          {selected ? (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center font-medium shrink-0">
                  {selected.author.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-slate-900">
                    {selected.author.name}
                  </p>
                  <a
                    href={`mailto:${selected.author.email}`}
                    className="text-sm text-sky-600 hover:text-sky-700 inline-flex items-center gap-1.5 mt-0.5"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {selected.author.email}
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-slate-600">
                  <BookOpen className="h-3.5 w-3.5 text-sky-500" />
                  {selected.course}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-slate-600">
                  <CornerDownRight className="h-3.5 w-3.5 text-violet-500" />
                  {selected.chapter}
                </span>
                {selected.replyCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-slate-600">
                    <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                    {selected.replyCount} repl
                    {selected.replyCount === 1 ? "y" : "ies"}
                  </span>
                )}
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selected.text}
                </p>
              </div>

              <p className="text-xs text-slate-400">
                {new Date(selected.createdAt).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-slate-400">
              Select a message to view
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
