"use client";

import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { NewMeetingDialog } from "@/components/newMeetingDialog";
import { CalendarDays, Clock, Video, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Meeting {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  participants?: number;
}

// Sample meetings data
const sampleMeetings: Meeting[] = [
  {
    id: "1",
    title: "Design System Discussion",
    date: new Date(2026, 1, 8),
    startTime: "09:00",
    endTime: "10:00",
    participants: 5,
  },
  {
    id: "2",
    title: "Sprint Planning",
    date: new Date(2026, 1, 8),
    startTime: "14:00",
    endTime: "15:30",
    participants: 8,
  },
  {
    id: "3",
    title: "Client Presentation",
    date: new Date(2026, 1, 10),
    startTime: "11:00",
    endTime: "12:00",
    participants: 3,
  },
  {
    id: "4",
    title: "Team Standup",
    date: new Date(2026, 1, 12),
    startTime: "09:30",
    endTime: "10:00",
    participants: 6,
  },
];

function MeetingCard({ meeting }: { meeting: Meeting }) {
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
            {meeting.startTime} - {meeting.endTime}
          </span>
          {meeting.participants && (
            <span>{meeting.participants} participants</span>
          )}
        </div>
      </div>
      <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
        Join
      </Button>
    </div>
  );
}

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Filter meetings for selected date
  const filteredMeetings = sampleMeetings.filter(
    (meeting) =>
      selectedDate &&
      meeting.date.toDateString() === selectedDate.toDateString()
  );

  // Get all meeting dates for highlighting
  const meetingDates = sampleMeetings.map((m) => m.date);

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-white mb-1 md:mb-2">Schedule</h1>
          <p className="text-zinc-400 text-sm md:text-base">Manage your upcoming meetings</p>
        </div>
        <NewMeetingDialog
          trigger={
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Meeting
            </Button>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {/* Calendar Section */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900 rounded-xl md:rounded-2xl p-3 md:p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
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

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-zinc-900 rounded-xl p-4">
              <p className="text-zinc-400 text-sm mb-1">Today</p>
              <p className="text-2xl font-semibold text-white">
                {sampleMeetings.filter(
                  (m) => m.date.toDateString() === new Date().toDateString()
                ).length}
              </p>
              <p className="text-zinc-500 text-sm">meetings</p>
            </div>
            <div className="bg-zinc-900 rounded-xl p-4">
              <p className="text-zinc-400 text-sm mb-1">This Week</p>
              <p className="text-2xl font-semibold text-white">
                {sampleMeetings.length}
              </p>
              <p className="text-zinc-500 text-sm">meetings</p>
            </div>
          </div>
        </div>

        {/* Meetings List Section */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900 rounded-2xl p-6">
            {/* Selected Date Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <CalendarDays className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-white">
                    {selectedDate ? formatDate(selectedDate) : "Select a date"}
                  </h2>
                  <p className="text-sm text-zinc-400">
                    {filteredMeetings.length} meeting
                    {filteredMeetings.length !== 1 ? "s" : ""} scheduled
                  </p>
                </div>
              </div>
            </div>

            {/* Meetings List */}
            <div className="space-y-3">
              {filteredMeetings.length > 0 ? (
                filteredMeetings.map((meeting) => (
                  <MeetingCard key={meeting.id} meeting={meeting} />
                ))
              ) : (
                <div className="text-center py-12">
                  <CalendarDays className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-zinc-400 mb-2">
                    No meetings scheduled
                  </h3>
                  <p className="text-zinc-500 text-sm mb-4">
                    You don&apos;t have any meetings on this day
                  </p>
                  <NewMeetingDialog
                    trigger={
                      <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                        <Plus className="mr-2 h-4 w-4" />
                        Schedule a Meeting
                      </Button>
                    }
                  />
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Meetings */}
          <div className="mt-6 bg-zinc-900 rounded-2xl p-6">
            <h2 className="text-lg font-medium text-white mb-4">
              Upcoming This Week
            </h2>
            <div className="space-y-3">
              {sampleMeetings.slice(0, 3).map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex items-center gap-4 p-3 bg-zinc-800/30 rounded-lg"
                >
                  <div className="text-center min-w-[50px]">
                    <p className="text-xs text-zinc-500">
                      {meeting.date.toLocaleDateString("en-US", { weekday: "short" })}
                    </p>
                    <p className="text-lg font-semibold text-white">
                      {meeting.date.getDate()}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{meeting.title}</p>
                    <p className="text-sm text-zinc-400">
                      {meeting.startTime} - {meeting.endTime}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
