"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { StreamProvider } from "@/lib/streamClient";
import {
  StreamCall,
  SpeakerLayout,
  CallControls,
  StreamTheme,
  useStreamVideoClient,
  Call,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";

export default function MeetingClient({
  meetingId,
  passcode,
}: {
  meetingId: string;
  passcode?: string;
}) {
  const { data: session } = useSession();
  const [state, setState] = useState<{
    token: string;
    callId: string;
    userId: string;
    userName: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requiresPasscode, setRequiresPasscode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [passcodeInput, setPasscodeInput] = useState(passcode || "");

  const joinMeeting = async (userId: string, currentPasscode?: string) => {
    setLoading(true);
    setError(null);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/meetings/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userId}`,
      },
      body: JSON.stringify({ meetingId, passcode: currentPasscode }),
    });

    if (!res.ok) {
      const message = await res.text();
      if (res.status === 403) {
        setRequiresPasscode(true);
        setError("Invalid passcode. Please enter the correct meeting passcode.");
      } else {
        setError(message || "Failed to join meeting");
      }
      setLoading(false);
      return;
    }

    const data = await res.json();
    setRequiresPasscode(false);
    setState({
      token: data.token,
      callId: data.callId,
      userId,
      userName: session?.user?.name || session?.user?.email || "Guest",
    });
    setLoading(false);
  };

  useEffect(() => {
    const currentUserId = (session?.user as { id?: string } | undefined)?.id;
    if (!currentUserId) return;
    void joinMeeting(currentUserId, passcode);
  }, [meetingId, passcode, session?.user]);

  if (requiresPasscode) {
    const currentUserId = (session?.user as { id?: string } | undefined)?.id;

    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-950 p-4">
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold text-white mb-2">Enter Meeting Passcode</h2>
          <p className="text-zinc-400 text-sm mb-4">This meeting is protected.</p>
          <input
            value={passcodeInput}
            onChange={(event) => setPasscodeInput(event.target.value)}
            placeholder="Passcode"
            className="w-full h-11 rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-white"
          />
          {error ? <p className="text-red-400 text-sm mt-3">{error}</p> : null}
          <button
            onClick={() => {
              if (!currentUserId) return;
              void joinMeeting(currentUserId, passcodeInput);
            }}
            className="mt-4 w-full h-11 rounded-lg bg-primary text-white hover:bg-primary/90"
          >
            Join Meeting
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-400">{error}</div>;
  }

  if (loading || !state) return <div>Joining...</div>;

  return (
    <StreamProvider
      token={state.token}
      user={{ id: state.userId, name: state.userName }}
    >
      <CallUI callId={state.callId} />
    </StreamProvider>
  );
}

function CallUI({ callId }: { callId: string }) {
  const client = useStreamVideoClient();
  const [call, setCall] = useState<Call | null>(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!client || !callId) return;

    const newCall = client.call("default", callId);
    setCall(newCall);

    newCall
      .join({ create: true })
      .then(() => setJoined(true))
      .catch((err) => console.error("Failed to join:", err));

    return () => {
      newCall.leave().catch(console.error);
    };
  }, [client, callId]);

  if (!call || !joined) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        Joining call...
      </div>
    );
  }

  return (
    <StreamCall call={call}>
      <StreamTheme>
        <div className="h-screen w-screen flex flex-col">
          <div className="flex-1">
            <SpeakerLayout />
          </div>
          <div className="p-4">
            <CallControls />
          </div>
        </div>
      </StreamTheme>
    </StreamCall>
  );
}
