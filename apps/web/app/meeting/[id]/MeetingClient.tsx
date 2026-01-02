"use client";

import { useEffect, useState } from "react";
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

export default function MeetingClient({ meetingId }: { meetingId: string }) {
  const [state, setState] = useState<{
    token: string;
    callId: string;
    userId: string;
  } | null>(null);

  useEffect(() => {
    async function join() {
      const userId = "user-123"; // TEMP: Replace with actual user ID from auth

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/meetings/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userId}`,
          },
          body: JSON.stringify({ meetingId, userId }),
        }
      );

      if (!res.ok) {
        console.error("Failed to join meeting:", await res.text());
        return;
      }

      const data = await res.json();
      setState({
        token: data.token,
        callId: data.callId,
        userId,
      });
    }

    join();
  }, [meetingId]);

  if (!state) return <div>Joining...</div>;

  return (
    <StreamProvider
      token={state.token}
      user={{ id: state.userId, name: "Demo user" }}
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
