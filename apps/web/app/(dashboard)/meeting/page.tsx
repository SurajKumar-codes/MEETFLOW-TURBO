"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Video, Plus } from "lucide-react";
import { NewMeetingDialog } from "@/components/newMeetingDialog";
import { JoinMeetingDialog } from "@/components/joinMeetingDialog";
import { Button } from "@/components/ui/button";
import { apiRequest, Meeting } from "@/lib/api";

export default function MeetingPage() {
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const loadMeetings = async () => {
    if (!userId) return;
    const result = await apiRequest<Meeting[]>("/meetings", userId);
    setMeetings(result);
  };

  useEffect(() => {
    void loadMeetings();
  }, [userId]);

  return (
    <div className="p-4 md:p-8 h-[calc(100vh-7.5rem)] md:h-[calc(100vh)] overflow-y-auto scrollbar-hide">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-white">Meetings</h1>
          <div className="flex gap-2">
            <NewMeetingDialog
              onCreated={() => {
                void loadMeetings();
              }}
            />
            <JoinMeetingDialog />
          </div>
        </div>

        <div className="space-y-3">
          {meetings.map((meeting) => (
            <Link
              key={meeting.id}
              href={`/meeting/${meeting.id}`}
              className="block rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white font-medium">{meeting.title}</h2>
                  <p className="text-zinc-400 text-sm mt-1">
                    {new Date(meeting.startsAt).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <Button variant="ghost" className="text-primary hover:text-primary">
                  Join
                </Button>
              </div>
            </Link>
          ))}

          {meetings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-700 p-8 text-center">
              <Video className="mx-auto h-8 w-8 text-zinc-500 mb-3" />
              <p className="text-zinc-300 mb-1">No meetings found</p>
              <p className="text-zinc-500 text-sm mb-4">Create a meeting to get started</p>
              <NewMeetingDialog
                onCreated={() => {
                  void loadMeetings();
                }}
                trigger={
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Meeting
                  </Button>
                }
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
