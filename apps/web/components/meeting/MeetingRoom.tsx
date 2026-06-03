"use client";

import { useState } from "react";
import {
  CallControls,
  CallParticipantsList,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import {
  LayoutGrid,
  Presentation,
  MessageSquare,
  Users,
  Copy,
  Check,
  X,
} from "lucide-react";
import { MeetingChat } from "./MeetingChat";

type LayoutMode = "grid" | "speaker";
type Panel = "chat" | "participants" | null;

interface MeetingRoomProps {
  meetingId: string;
  meetingTitle: string;
  userId: string;
  onLeave: () => void;
}

export function MeetingRoom({
  meetingId,
  meetingTitle,
  userId,
  onLeave,
}: MeetingRoomProps) {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();

  const [layout, setLayout] = useState<LayoutMode>("grid");
  const [panel, setPanel] = useState<Panel>(null);
  const [copied, setCopied] = useState(false);

  const copyInvite = () => {
    const url = `${window.location.origin}/meeting/${meetingId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const togglePanel = (next: Panel) =>
    setPanel((current) => (current === next ? null : next));

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-zinc-950 text-white">
      {/* Header */}
      <header className="flex h-14 flex-shrink-0 items-center justify-between gap-3 border-b border-zinc-800 px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-red-500" />
          <h1 className="truncate text-sm font-medium sm:text-base">
            {meetingTitle || "Meeting"}
          </h1>
          <span className="hidden flex-shrink-0 rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400 sm:inline">
            {participants.length} {participants.length === 1 ? "person" : "people"}
          </span>
        </div>

        <div className="flex flex-shrink-0 items-center gap-1.5">
          <button
            onClick={copyInvite}
            className="hidden items-center gap-2 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-800 sm:flex"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-400" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Invite
              </>
            )}
          </button>

          {/* Layout toggle */}
          <div className="flex items-center rounded-lg border border-zinc-700 p-0.5">
            <button
              onClick={() => setLayout("grid")}
              className={`rounded-md p-1.5 transition-colors ${
                layout === "grid" ? "bg-primary text-white" : "text-zinc-400 hover:text-white"
              }`}
              aria-label="Grid layout"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setLayout("speaker")}
              className={`rounded-md p-1.5 transition-colors ${
                layout === "speaker" ? "bg-primary text-white" : "text-zinc-400 hover:text-white"
              }`}
              aria-label="Speaker layout"
            >
              <Presentation className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        {/* Video area */}
        <div className="relative flex min-w-0 flex-1 flex-col">
          <div className="str-video__call-area flex min-h-0 flex-1 items-center justify-center p-2 sm:p-4">
            {layout === "grid" ? (
              <PaginatedGridLayout groupSize={9} />
            ) : (
              <SpeakerLayout participantsBarPosition="bottom" />
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-shrink-0 items-center justify-center gap-2 border-t border-zinc-800 px-2 py-3">
            <CallControls onLeave={onLeave} />

            {/* Mobile-friendly panel toggles */}
            <button
              onClick={() => togglePanel("participants")}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                panel === "participants"
                  ? "bg-primary text-white"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
              aria-label="Participants"
            >
              <Users className="h-5 w-5" />
            </button>
            <button
              onClick={() => togglePanel("chat")}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                panel === "chat"
                  ? "bg-primary text-white"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
              aria-label="Chat"
            >
              <MessageSquare className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Side panel */}
        {panel ? (
          <aside className="absolute inset-y-0 right-0 z-20 flex w-full flex-col border-l border-zinc-800 bg-zinc-900 sm:static sm:w-80">
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 sm:hidden">
              <span className="font-medium">
                {panel === "chat" ? "Chat" : "Participants"}
              </span>
              <button onClick={() => setPanel(null)} aria-label="Close panel">
                <X className="h-5 w-5 text-zinc-400" />
              </button>
            </div>

            <div className="min-h-0 flex-1">
              {panel === "chat" ? (
                <MeetingChat meetingId={meetingId} userId={userId} />
              ) : (
                <div className="h-full overflow-y-auto p-2 scrollbar-hide">
                  <CallParticipantsList onClose={() => setPanel(null)} />
                </div>
              )}
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
