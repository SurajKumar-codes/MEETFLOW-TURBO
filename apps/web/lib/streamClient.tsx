"use client";

import {
  StreamVideoClient,
  StreamVideoProvider,
} from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";

export function StreamProvider({
  token,
  user,
  children,
}: {
  token: string;
  user: { id: string; name: string };
  children: React.ReactNode;
}) {
  const [client, setClient] = useState<StreamVideoClient | null>(null);

  useEffect(() => {
    const streamClient = new StreamVideoClient({
      apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
      user,
      token,
    });
    setClient(streamClient);

    return () => {
      streamClient.disconnectUser();
    };
  }, [token, user.id]);

  if (!client) return <div>Loading...</div>;

  return <StreamVideoProvider client={client}>{children}</StreamVideoProvider>;
}