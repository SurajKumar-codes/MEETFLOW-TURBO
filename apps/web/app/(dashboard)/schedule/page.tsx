"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Calendar } from "@/components/ui/calendar";
import { NewMeetingDialog } from "@/components/newMeetingDialog";
import { CalendarDays, Clock, Video, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest, Meeting } from "@/lib/api";

function MeetingCard({ meeting }: { meeting: Meeting }) {
  const startsAt = new Date(meeting.startsAt);
  const endsAt = meeting.endsAt ? new Date(meeting.endsAt) : null;

  return (
    <div className="flex items-start gap-4 p-4 bg-zinc-800/50 rounded-xl hover:bg-zinc-800 transition-colors">
      <div className="p-3 rounded-xl bg-primary/20">
        <Video className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-white mb-1">{meeting.title}</h3>
        <div className="flex items-center gap-4 text-sm text-zinc-400">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {startsAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            {endsAt
              ? ` - ${endsAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
              : ""}
          </span>
          <span>{meeting._count?.meetingParticipants ?? 1} participants</span>
        </div>
      </div>
      <Link href={`/meeting/${meeting.id}`}>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
          Join
        </Button>
      </Link>
    </div>
  );
}

export default function SchedulePage() {
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
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
    loadMeetings();
  }, [userId]);

  const filteredMeetings = useMemo(
    () =>
      meetings.filter((meeting) => {
        if (!selectedDate) return true;
        return new Date(meeting.startsAt).toDateString() === selectedDate.toDateString();
      }),
    [meetings, selectedDate]
  );

  const meetingDates = meetings.map((meeting) => new Date(meeting.startsAt));

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="h-[calc(100vh-7.5rem)] md:h-[calc(100vh)] overflow-y-auto p-4 md:p-6 lg:p-8 scrollbar-hide">
      <div className="max-w-7xl mx-auto pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-white mb-1 md:mb-2">Schedule</h1>
            <p className="text-zinc-400 text-sm md:text-base">Manage your upcoming meetings</p>
          </div>
          <NewMeetingDialog
            onCreated={() => {
              void loadMeetings();
            }}
            trigger={
              <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                New Meeting
              </Button>
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          <div className="lg:col-span-1">
            <div className="bg-zinc-900 rounded-xl md:rounded-2xl p-3 md:p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-lg"
                modifiers={{
                  hasMeeting: meetingDates,
                }}
                modifiersClassNames={{
                  hasMeeting:
                    "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full",
                }}
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-zinc-900 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <CalendarDays className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-white">
                      {selectedDate ? formatDate(selectedDate) : "All meetings"}
                    </h2>
                    <p className="text-sm text-zinc-400">
                      {filteredMeetings.length} meeting{filteredMeetings.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>

              {loading ? <p className="text-zinc-400">Loading meetings...</p> : null}
              {error ? <p className="text-red-400 text-sm">{error}</p> : null}

              <div className="space-y-3">
                {!loading && filteredMeetings.length > 0 ? (
                  filteredMeetings.map((meeting) => <MeetingCard key={meeting.id} meeting={meeting} />)
                ) : null}

                {!loading && !error && filteredMeetings.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarDays className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-zinc-400 mb-2">No meetings scheduled</h3>
                    <p className="text-zinc-500 text-sm mb-4">Create one to start collaborating with your team</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
