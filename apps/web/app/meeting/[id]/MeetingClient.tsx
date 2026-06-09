"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { StreamProvider } from "@/lib/streamClient";
import { authHeaders } from "@/lib/api";
import {
  Call,
  CallingState,
  StreamCall,
  StreamTheme,
  useCallStateHooks,
  useStreamVideoClient,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { Loader2, Lock, AlertTriangle, ArrowLeft } from "lucide-react";
import { Lobby } from "@/components/meeting/Lobby";
import { MeetingRoom } from "@/components/meeting/MeetingRoom";

type JoinState = {
  token: string;
  callId: string;
  userId: string;
  userName: string;
  userImage?: string;
  meetingTitle: string;
};

export default function MeetingClient({
  meetingId,
  passcode,
}: {
  meetingId: string;
  passcode?: string;
}) {
  const { data: session, status } = useSession();
  const [state, setState] = useState<JoinState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requiresPasscode, setRequiresPasscode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [passcodeInput, setPasscodeInput] = useState(passcode || "");

  const joinMeeting = useCallback(
    async (userId: string, currentPasscode?: string) => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/meetings/join`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(await authHeaders()),
          },
          body: JSON.stringify({ meetingId, passcode: currentPasscode }),
        });

        if (!res.ok) {
          const message = await res.text();
          if (res.status === 403) {
            setRequiresPasscode(true);
            setError("Invalid passcode. Please enter the correct meeting passcode.");
          } else if (res.status === 404) {
            setError("This meeting doesn't exist or has ended.");
          } else {
            setError(message || "Failed to join meeting.");
          }
          return;
        }

        const data = await res.json();
        const user = session?.user as
          | { name?: string | null; email?: string | null; image?: string | null }
          | undefined;

        setRequiresPasscode(false);
        setState({
          token: data.token,
          callId: data.callId,
          userId,
          userName: user?.name || user?.email || "Guest",
          userImage: user?.image ?? undefined,
          meetingTitle: data.meeting?.title ?? "Meeting",
        });
      } catch {
        setError(
          "Cannot reach the meeting server. Please make sure the backend is running and try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [meetingId, session?.user]
  );

  useEffect(() => {
    if (status === "loading") return;
    const currentUserId = (session?.user as { id?: string } | undefined)?.id;
    if (!currentUserId) {
      setLoading(false);
      return;
    }
    if (state) return; // already joined
    void joinMeeting(currentUserId, passcode);
  }, [status, session?.user, passcode, joinMeeting, state]);

  const currentUserId = (session?.user as { id?: string } | undefined)?.id;

  // Not authenticated
  if (status !== "loading" && !currentUserId) {
    return (
      <MeetingShell>
        <Lock className="mb-4 h-10 w-10 text-zinc-500" />
        <h2 className="mb-2 text-xl font-semibold">Sign in required</h2>
        <p className="mb-6 max-w-sm text-zinc-400">
          You need to be signed in to join this meeting.
        </p>
        <Link
          href="/login"
          className="rounded-xl bg-primary px-5 py-2.5 font-medium text-white hover:bg-primary/90"
        >
          Sign in
        </Link>
      </MeetingShell>
    );
  }

  // Passcode prompt
  if (requiresPasscode && !state) {
    return (
      <MeetingShell>
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-left">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-zinc-800 p-2">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Enter passcode</h2>
              <p className="text-sm text-zinc-400">This meeting is protected.</p>
            </div>
          </div>
          <input
            value={passcodeInput}
            onChange={(event) => setPasscodeInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && currentUserId) {
                void joinMeeting(currentUserId, passcodeInput);
              }
            }}
            placeholder="Passcode"
            autoFocus
            className="h-11 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 font-mono uppercase text-white focus:border-primary focus:outline-none"
          />
          {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
          <button
            onClick={() => currentUserId && joinMeeting(currentUserId, passcodeInput)}
            disabled={loading || !passcodeInput.trim()}
            className="mt-4 flex h-11 w-full items-center justify-center rounded-lg bg-primary font-medium text-white hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Join Meeting"}
          </button>
        </div>
      </MeetingShell>
    );
  }

  // Error
  if (error && !state) {
    return (
      <MeetingShell>
        <AlertTriangle className="mb-4 h-10 w-10 text-amber-500" />
        <h2 className="mb-2 text-xl font-semibold">Unable to join</h2>
        <p className="mb-6 max-w-sm text-zinc-400">{error}</p>
        <div className="flex gap-3">
          <Link
            href="/meeting"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-2.5 font-medium text-zinc-200 hover:bg-zinc-800"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          {currentUserId ? (
            <button
              onClick={() => joinMeeting(currentUserId, passcodeInput)}
              className="rounded-xl bg-primary px-5 py-2.5 font-medium text-white hover:bg-primary/90"
            >
              Try again
            </button>
          ) : null}
        </div>
      </MeetingShell>
    );
  }

  // Connecting
  if (loading || !state) {
    return (
      <MeetingShell>
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
        <p className="text-zinc-400">Preparing your meeting...</p>
      </MeetingShell>
    );
  }

  return (
    <StreamProvider
      token={state.token}
      user={{ id: state.userId, name: state.userName, image: state.userImage }}
    >
      <CallExperience
        callId={state.callId}
        meetingId={meetingId}
        meetingTitle={state.meetingTitle}
        userId={state.userId}
        userName={state.userName}
      />
    </StreamProvider>
  );
}

function MeetingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center text-white">
      {children}
    </div>
  );
}

function CallExperience({
  callId,
  meetingId,
  meetingTitle,
  userId,
  userName,
}: {
  callId: string;
  meetingId: string;
  meetingTitle: string;
  userId: string;
  userName: string;
}) {
  const client = useStreamVideoClient();
  const [call, setCall] = useState<Call | null>(null);

  useEffect(() => {
    if (!client) return;
    const newCall = client.call("default", callId);
    setCall(newCall);

    return () => {
      // Only leave a call that was actually joined; leaving an idle call throws.
      const cs = newCall.state.callingState;
      if (cs === CallingState.JOINED || cs === CallingState.JOINING) {
        newCall.leave().catch(() => undefined);
      }
    };
  }, [client, callId]);

  if (!call) {
    return (
      <MeetingShell>
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
        <p className="text-zinc-400">Connecting to call...</p>
      </MeetingShell>
    );
  }

  return (
    <StreamCall call={call}>
      <StreamTheme className="meetflow-stream-theme">
        <RoomGate
          call={call}
          meetingId={meetingId}
          meetingTitle={meetingTitle}
          userId={userId}
          userName={userName}
        />
      </StreamTheme>
    </StreamCall>
  );
}

function RoomGate({
  call,
  meetingId,
  meetingTitle,
  userId,
  userName,
}: {
  call: Call;
  meetingId: string;
  meetingTitle: string;
  userId: string;
  userName: string;
}) {
  const router = useRouter();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      router.push("/meeting");
    }
  }, [callingState, router]);

  if (callingState === CallingState.JOINED) {
    return (
      <MeetingRoom
        meetingId={meetingId}
        meetingTitle={meetingTitle}
        userId={userId}
        onLeave={() => call.leave().catch(() => undefined)}
      />
    );
  }

  if (callingState === CallingState.JOINING) {
    return (
      <MeetingShell>
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
        <p className="text-zinc-400">Joining the call...</p>
      </MeetingShell>
    );
  }

  return (
    <Lobby
      call={call}
      meetingTitle={meetingTitle}
      userName={userName}
      onJoin={() => call.join({ create: true })}
    />
  );
}
