"use client";

import React from 'react'
import { Calendar } from "@/components/ui/calendar"
import { Bell, X } from "lucide-react"

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  startsAt: Date;
  endsAt?: Date;
  timezone?: string;
  meetingId?: string;
  isReminder?: boolean;
}

interface CalendarWithMeetingsProps {
  meetings?: Meeting[];
  onDeleteMeeting?: (id: string) => void;
  onDateSelect?: (date: Date | undefined) => void;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

function MeetingCard({ 
  meeting, 
  onDelete 
}: { 
  meeting: Meeting; 
  onDelete?: (id: string) => void;
}) {
  const [isHovered, setIsHovered] = React.useState(false);
  
  const isUpcoming = meeting.startsAt > new Date();
  const isTomorrow = (() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return meeting.startsAt.toDateString() === tomorrow.toDateString();
  })();

  return (
    <div 
      className="relative p-3 bg-zinc-900/80 rounded-xl hover:bg-zinc-800/80 transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Delete button on hover */}
      {isHovered && onDelete && (
        <button
          onClick={() => onDelete(meeting.id)}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300 transition-all"
        >
          <X size={14} />
        </button>
      )}
      
      {/* Header with icon and date */}
      <div className="flex items-center gap-2.5 mb-2">
        <div className="p-2 rounded-lg bg-primary">
          <Bell size={16} className="text-white" />
        </div>
        <div>
          <p className="text-[10px] text-zinc-400 leading-tight">
            {isTomorrow ? 'Tomorrow Reminder' : isUpcoming ? 'Upcoming' : 'Reminder'}
          </p>
          <p className="text-xs font-medium text-white leading-tight">
            {formatDate(meeting.startsAt)}
          </p>
        </div>
      </div>
      
      {/* Meeting title */}
      <h3 className="text-white text-sm font-medium mb-2 pr-6">
        {meeting.title}
      </h3>
      
      {/* Meeting details */}
      <div className="space-y-1.5 text-xs">
        <div>
          <p className="text-zinc-500 text-[10px]">Time</p>
          <p className="text-white">
            {formatTime(meeting.startsAt)}
            {meeting.endsAt && ` - ${formatTime(meeting.endsAt)}`}
          </p>
        </div>
        
        {meeting.timezone && (
          <div>
            <p className="text-zinc-500 text-[10px]">Timezone</p>
            <p className="text-white">{meeting.timezone}</p>
          </div>
        )}
        
        {meeting.meetingId && (
          <div>
            <p className="text-zinc-500 text-[10px]">Meeting ID</p>
            <p className="text-white">{meeting.meetingId}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const CalendarComponent = ({ 
  meetings = [], 
  onDeleteMeeting,
  onDateSelect 
}: CalendarWithMeetingsProps) => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
  // Get meetings for selected date
  const selectedDateMeetings = React.useMemo(() => {
    if (!date) return meetings;
    return meetings.filter(meeting => 
      meeting.startsAt.toDateString() === date.toDateString()
    );
  }, [date, meetings]);

  // Get dates that have meetings for highlighting
  const meetingDates = React.useMemo(() => {
    return meetings.map(m => m.startsAt);
  }, [meetings]);

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    onDateSelect?.(newDate);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Calendar */}
      <div className="flex-shrink-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          className="rounded-lg min-w-full bg-black"
          captionLayout="label"
          modifiers={{
            hasMeeting: meetingDates
          }}
          modifiersClassNames={{
            hasMeeting: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full"
          }}
        />
      </div>
      
      {/* Separator */}
      {meetings.length > 0 && (
        <div className="h-px bg-zinc-800 mx-2 my-2 flex-shrink-0" />
      )}
      
      {/* Meeting list - scrollable */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-3 max-h-72 scrollbar-hide">
        {selectedDateMeetings.length > 0 ? (
          selectedDateMeetings.map((meeting) => (
            <MeetingCard 
              key={meeting.id} 
              meeting={meeting} 
              onDelete={onDeleteMeeting}
            />
          ))
        ) : meetings.length > 0 ? (
          <p className="text-zinc-500 text-sm text-center py-4">
            No meetings on this date
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default CalendarComponent
