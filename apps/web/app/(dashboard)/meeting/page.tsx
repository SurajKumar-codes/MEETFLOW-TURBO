"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Video, Plus, Users, Clock, Copy, Check, Loader2 } from "lucide-react";
import { NewMeetingDialog } from "@/components/newMeetingDialog";
import { JoinMeetingDialog } from "@/components/joinMeetingDialog";
import { Button } from "@/components/ui/button";
import { apiRequest, Meeting } from "@/lib/api";

function meetingStatus(meeting: Meeting): "live" | "upcoming" | "ended" {
  const now = Date.now();
  const start = new Date(meeting.startsAt).getTime();
  const end = meeting.endsAt ? new Date(meeting.endsAt).getTime() : start + 60 * 60 * 1000;
  if (now < start) return "upcoming";
  if (now > end) return "ended";
  return "live";
}

const statusStyles: Record<string, string> = {
  live: "bg-red-500/15 text-red-400",
  upcoming: "bg-primary/15 text-primary",
  ended: "bg-zinc-700/40 text-zinc-400",
};

function MeetingRow({ meeting }: { meeting: Meeting }) {
  const [copied, setCopied] = useState(false);
  const status = meetingStatus(meeting);
  const startsAt = new Date(meeting.startsAt);

  const copyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(`${window.location.origin}/meeting/${meeting.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Link
      href={`/meeting/${meeting.id}`}
      className="group block rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-primary/50"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15">
          <Video className="h-5 w-5 text-primary" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate font-medium text-white">{meeting.title}</h2>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${statusStyles[status]}`}>
              {status}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {startsAt.toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {meeting._count?.meetingParticipants ?? 1}
            </span>
            {meeting.host?.name ? <span>Host: {meeting.host.name}</span> : null}
          </div>
        </div>

        <button
          onClick={copyLink}
          className="hidden items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-800 sm:flex"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy link"}
        </button>

        <Button variant="ghost" className="text-primary hover:text-primary">
          Join
        </Button>
      </div>
    </Link>
  );
}

export default function MeetingPage() {
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMeetings = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await apiRequest<Meeting[]>("/meetings");
      setMeetings(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load meetings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMeetings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <div className="h-[calc(100vh-7.5rem)] overflow-y-auto p-4 scrollbar-hide md:h-screen md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-white">Meetings</h1>
            <p className="text-sm text-zinc-400">Your hosted and joined meetings</p>
          </div>
          <div className="flex gap-2">
            <NewMeetingDialog onCreated={() => void loadMeetings()} />
            <JoinMeetingDialog />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[76px] animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/60" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/40 bg-red-900/20 p-6 text-center">
            <p className="mb-3 text-sm text-red-200">{error}</p>
            <Button onClick={() => void loadMeetings()} variant="ghost" className="text-red-200">
              <Loader2 className="mr-2 h-4 w-4" /> Retry
            </Button>
          </div>
        ) : meetings.length > 0 ? (
          <div className="space-y-3">
            {meetings.map((meeting) => (
              <MeetingRow key={meeting.id} meeting={meeting} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-700 p-10 text-center">
            <Video className="mx-auto mb-3 h-8 w-8 text-zinc-500" />
            <p className="mb-1 text-zinc-300">No meetings yet</p>
            <p className="mb-4 text-sm text-zinc-500">Create a meeting to get started</p>
            <NewMeetingDialog
              onCreated={() => void loadMeetings()}
              trigger={
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Meeting
                </Button>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
