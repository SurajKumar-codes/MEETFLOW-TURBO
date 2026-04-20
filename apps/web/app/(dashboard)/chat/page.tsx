"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Send, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiRequest, Meeting, MeetingMessage } from "@/lib/api";

export default function ChatPage() {
  const { data: session } = useSession();
  const user = session?.user as { id?: string; name?: string | null; email?: string | null } | undefined;
  const userId = user?.id;

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MeetingMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selectedMeeting = useMemo(
    () => meetings.find((meeting) => meeting.id === selectedMeetingId) ?? null,
    [meetings, selectedMeetingId]
  );

  useEffect(() => {
    if (!userId) return;

    apiRequest<Meeting[]>("/meetings", userId)
      .then((result) => {
        setMeetings(result);
        const firstMeetingId = result[0]?.id;
        if (!selectedMeetingId && firstMeetingId) {
          setSelectedMeetingId(firstMeetingId);
        }
      })
      .catch((err: Error) => setError(err.message));
  }, [userId]);

  useEffect(() => {
    if (!userId || !selectedMeetingId) {
      setMessages([]);
      return;
    }

    let mounted = true;

    const loadMessages = async () => {
      try {
        const result = await apiRequest<MeetingMessage[]>(
          `/meetings/${selectedMeetingId}/messages`,
          userId
        );

        if (mounted) {
          setMessages(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load messages");
        }
      }
    };

    void loadMessages();
    const timer = setInterval(() => {
      void loadMessages();
    }, 3000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [userId, selectedMeetingId]);

  const onSend = async (event: FormEvent) => {
    event.preventDefault();
    if (!userId || !selectedMeetingId || !newMessage.trim()) return;

    try {
      const created = await apiRequest<MeetingMessage>(
        `/meetings/${selectedMeetingId}/messages`,
        userId,
        {
          method: "POST",
          body: JSON.stringify({ content: newMessage.trim() }),
        }
      );
      setMessages((prev) => [...prev, created]);
      setNewMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    }
  };

  return (
    <div className="h-[calc(100vh-7.5rem)] md:h-[calc(100vh)] flex overflow-hidden">
      <div className="hidden md:block md:w-80 border-r border-zinc-800 bg-zinc-900 overflow-y-auto scrollbar-hide">
        <div className="p-4 border-b border-zinc-800">
          <h1 className="text-white font-semibold text-lg">Meeting Chats</h1>
          <p className="text-zinc-400 text-sm">Select a meeting to chat with participants</p>
        </div>

        <div className="divide-y divide-zinc-800/60">
          {meetings.map((meeting) => (
            <button
              key={meeting.id}
              onClick={() => setSelectedMeetingId(meeting.id)}
              className={`w-full text-left p-4 transition-colors ${
                meeting.id === selectedMeetingId ? "bg-zinc-800" : "hover:bg-zinc-800/40"
              }`}
            >
              <p className="text-white font-medium truncate">{meeting.title}</p>
              <p className="text-zinc-400 text-xs mt-1">
                {new Date(meeting.startsAt).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </button>
          ))}

          {meetings.length === 0 ? (
            <div className="p-6 text-sm text-zinc-400">No meetings yet. Create one from Schedule.</div>
          ) : null}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-zinc-950">
        {selectedMeeting ? (
          <>
            <div className="h-14 px-4 border-b border-zinc-800 flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-white font-medium">{selectedMeeting.title}</h2>
                <p className="text-zinc-400 text-xs">Room chat for this meeting</p>
              </div>
              <div className="ml-auto md:hidden">
                <select
                  className="bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-md px-2 py-1 text-xs"
                  value={selectedMeetingId ?? ""}
                  onChange={(event) => setSelectedMeetingId(event.target.value)}
                >
                  {meetings.map((meeting) => (
                    <option key={meeting.id} value={meeting.id}>
                      {meeting.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
              {messages.map((message) => {
                const mine = message.userId === userId;
                return (
                  <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-xl px-3 py-2 ${
                        mine ? "bg-primary text-white" : "bg-zinc-800 text-zinc-100"
                      }`}
                    >
                      <p className="text-xs opacity-80 mb-1">
                        {mine ? "You" : message.user.name || message.user.email || "Guest"}
                      </p>
                      <p className="text-sm leading-5">{message.content}</p>
                      <p className="text-[11px] opacity-70 mt-1 text-right">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}

              {messages.length === 0 ? (
                <p className="text-zinc-500 text-sm">No messages yet. Start the conversation.</p>
              ) : null}
            </div>

            <form onSubmit={onSend} className="p-3 border-t border-zinc-800 flex gap-2">
              <Input
                value={newMessage}
                onChange={(event) => setNewMessage(event.target.value)}
                placeholder="Type a message..."
                className="bg-zinc-900 border-zinc-700"
              />
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-500">
            Pick a meeting to open chat.
          </div>
        )}
      </div>

      {error ? (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-96 rounded-lg border border-red-500/50 bg-red-900/40 p-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}
    </div>
  );
}
