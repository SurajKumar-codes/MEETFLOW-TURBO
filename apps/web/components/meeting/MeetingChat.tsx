"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { apiRequest, MeetingMessage } from "@/lib/api";

interface MeetingChatProps {
  meetingId: string;
  userId: string;
}

/**
 * In-call chat panel. Polls the meeting messages endpoint and optimistically
 * appends sent messages. Shares the same backend as the standalone Chat page.
 */
export function MeetingChat({ meetingId, userId }: MeetingChatProps) {
  const [messages, setMessages] = useState<MeetingMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const result = await apiRequest<MeetingMessage[]>(
          `/meetings/${meetingId}/messages`,
          userId
        );
        if (mounted) setMessages(result);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load chat");
        }
      }
    };

    void load();
    const timer = setInterval(load, 3000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [meetingId, userId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const onSend = async (event: FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;

    setDraft("");
    try {
      const created = await apiRequest<MeetingMessage>(
        `/meetings/${meetingId}/messages`,
        userId,
        { method: "POST", body: JSON.stringify({ content }) }
      );
      setMessages((prev) => [...prev, created]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-800 px-4 py-3">
        <h3 className="font-medium text-white">In-call messages</h3>
        <p className="text-xs text-zinc-500">Visible to everyone in this meeting</p>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-hide">
        {messages.length === 0 ? (
          <p className="text-sm text-zinc-500">No messages yet. Say hello 👋</p>
        ) : null}

        {messages.map((message) => {
          const mine = message.userId === userId;
          return (
            <div key={message.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
              <span className="mb-1 px-1 text-[11px] text-zinc-500">
                {mine ? "You" : message.user.name || message.user.email || "Guest"}
              </span>
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  mine
                    ? "rounded-br-sm bg-primary text-white"
                    : "rounded-bl-sm bg-zinc-800 text-zinc-100"
                }`}
              >
                {message.content}
              </div>
              <span className="mt-1 px-1 text-[10px] text-zinc-600">
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          );
        })}
      </div>

      {error ? (
        <p className="px-4 pb-1 text-xs text-red-400">{error}</p>
      ) : null}

      <form onSubmit={onSend} className="flex items-center gap-2 border-t border-zinc-800 p-3">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Type a message..."
          className="h-10 flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-white placeholder:text-zinc-500 focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
