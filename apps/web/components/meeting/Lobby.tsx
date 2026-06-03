"use client";

import { useEffect, useState } from "react";
import {
  Call,
  VideoPreview,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { Mic, MicOff, Video, VideoOff, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface LobbyProps {
  call: Call;
  meetingTitle: string;
  userName: string;
  onJoin: () => Promise<void> | void;
}

/**
 * Pre-join screen: lets the user preview their camera, toggle their mic/camera,
 * and confirm before entering the call.
 */
export function Lobby({ call, meetingTitle, userName, onJoin }: LobbyProps) {
  const { useCameraState, useMicrophoneState } = useCallStateHooks();
  const { camera, isMute: isCamMute } = useCameraState();
  const { microphone, isMute: isMicMute } = useMicrophoneState();
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Enable devices for the preview when the lobby mounts.
  useEffect(() => {
    camera.enable().catch(() => undefined);
    microphone.enable().catch(() => undefined);
    return () => {
      camera.disable().catch(() => undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleJoin = async () => {
    setJoining(true);
    setJoinError(null);
    try {
      await onJoin();
    } catch (err) {
      console.error("Failed to join call:", err);
      setJoinError(
        err instanceof Error ? err.message : "Could not join the call. Please try again."
      );
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-zinc-950 px-4 py-6 text-white">
      <div className="mb-6">
        <Link
          href="/meeting"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to meetings
        </Link>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-8 lg:flex-row">
        {/* Video preview */}
        <div className="w-full max-w-2xl">
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
            {isCamMute ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-zinc-500">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800 text-2xl font-semibold text-zinc-300">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <p className="text-sm">Camera is off</p>
              </div>
            ) : (
              <VideoPreview />
            )}

            {/* Preview controls */}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-3 bg-gradient-to-t from-black/80 to-transparent p-4">
              <button
                onClick={() => (isMicMute ? microphone.enable() : microphone.disable())}
                className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                  isMicMute
                    ? "bg-red-500/90 text-white hover:bg-red-500"
                    : "bg-zinc-700/90 text-white hover:bg-zinc-600"
                }`}
                aria-label={isMicMute ? "Unmute microphone" : "Mute microphone"}
              >
                {isMicMute ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
              <button
                onClick={() => (isCamMute ? camera.enable() : camera.disable())}
                className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                  isCamMute
                    ? "bg-red-500/90 text-white hover:bg-red-500"
                    : "bg-zinc-700/90 text-white hover:bg-zinc-600"
                }`}
                aria-label={isCamMute ? "Turn camera on" : "Turn camera off"}
              >
                {isCamMute ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Join panel */}
        <div className="w-full max-w-sm text-center lg:text-left">
          <h1 className="mb-2 text-2xl font-semibold">{meetingTitle || "Meeting"}</h1>
          <p className="mb-1 text-zinc-400">Ready to join?</p>
          <p className="mb-6 text-sm text-zinc-500">
            Joining as <span className="font-medium text-zinc-300">{userName}</span>
          </p>

          <button
            onClick={handleJoin}
            disabled={joining}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-white transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {joining ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Joining...
              </>
            ) : (
              "Join Meeting"
            )}
          </button>

          {joinError ? (
            <p className="mt-3 rounded-lg border border-red-500/40 bg-red-900/20 px-3 py-2 text-sm text-red-300">
              {joinError}
            </p>
          ) : null}

          <p className="mt-4 text-xs text-zinc-600">
            {call.id ? `Meeting ID: ${call.id}` : null}
          </p>
        </div>
      </div>
    </div>
  );
}
