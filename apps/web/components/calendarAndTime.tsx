"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Calendar, { Meeting } from "@/components/calendar"

interface Position {
  x: number;
  y: number;
}

// Sample meetings data - replace with actual data from your backend
const sampleMeetings: Meeting[] = [
  {
    id: "1",
    title: "Discuss Brand Guide line",
    startsAt: new Date(new Date().setDate(new Date().getDate() + 1)),
    endsAt: new Date(new Date().setDate(new Date().getDate() + 1)),
    timezone: "(GMT +05.30) India",
    meetingId: "1200-909-321",
  },
  {
    id: "2", 
    title: "Sharing Session DPOP Studio",
    startsAt: new Date(new Date().setDate(new Date().getDate() + 3)),
    endsAt: new Date(new Date().setDate(new Date().getDate() + 3)),
    timezone: "(GMT +05.30) India",
    meetingId: "1200-909-321",
  },
];

// Set proper times for sample meetings
sampleMeetings[0]?.startsAt.setHours(9, 0, 0);
sampleMeetings[0]?.endsAt?.setHours(13, 0, 0);
sampleMeetings[1]?.startsAt.setHours(18, 0, 0);
sampleMeetings[1]?.endsAt?.setHours(19, 0, 0);

export default function CalendarAndTime() {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>(sampleMeetings);
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null);

  const handleDeleteMeeting = (id: string) => {
    setMeetings(prev => prev.filter(meeting => meeting.id !== id));
  };

  // Set initial position to top-right on mount
  useEffect(() => {
    const updatePosition = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const boxWidth = 280;
        setPosition({ x: containerWidth - boxWidth - 20, y: 16 });
      }
    };
    
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStartRef.current || !containerRef.current || !boxRef.current) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    let newX = dragStartRef.current.posX + deltaX;
    let newY = dragStartRef.current.posY + deltaY;

    // Get boundaries
    const container = containerRef.current.getBoundingClientRect();
    const box = boxRef.current.getBoundingClientRect();

    const maxX = container.width - box.width;
    const maxY = container.height - box.height;

    // Constrain position
    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    setPosition({ x: newX, y: newY });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div 
      ref={containerRef}
      className="hidden md:block fixed inset-0 pointer-events-none"
      style={{ zIndex: 100, left: '80px' }} // Offset for sidebar width
    >
      <div 
        ref={boxRef}
        className="pointer-events-auto absolute w-70 bg-black text-white rounded-4xl flex flex-col overflow-hidden max-h-[calc(100vh-40px)] pb-4 shadow-2xl border border-zinc-800"
        style={{
          left: position.x,
          top: position.y,
          zIndex: isDragging ? 9999 : 100,
        }}
      >
        {/* Drag handle - only this part is draggable */}
        <div
          onMouseDown={handleMouseDown}
          className={`h-8 bg-black flex items-center rounded-t-4xl text-xl px-4 flex-shrink-0 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
          <span className="text-white font-medium">Calendar</span>
        </div>
        {/* Content area - clickable */}
        <div className="bg-black text-white w-70 flex-1 overflow-hidden flex flex-col">
          <Calendar 
            meetings={meetings}
            onDeleteMeeting={handleDeleteMeeting}
          />
        </div>
      </div>
    </div>
  );
}
