"use client";

import {
  StreamVideoClient,
  StreamVideoProvider,
  type User,
} from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * Pending-disconnect timer shared across mounts. React's dev StrictMode mounts
 * the provider, immediately unmounts it, then mounts again. If we disconnect the
 * Stream user synchronously on that first unmount, the remount reuses the same
 * (now-disconnected) singleton client and joining fails with
 * "User token is not set". By deferring the disconnect, the remount can cancel it.
 */
let pendingDisconnect: ReturnType<typeof setTimeout> | null = null;

/**
 * Creates (or reuses) a single Stream video client for the given user and
 * provides it to the React tree.
 */
export function StreamProvider({
  token,
  user,
  children,
}: {
  token: string;
  user: { id: string; name: string; image?: string };
  children: React.ReactNode;
}) {
  const [client, setClient] = useState<StreamVideoClient | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
    if (!apiKey) {
      console.error("Missing NEXT_PUBLIC_STREAM_API_KEY");
      return;
    }

    // Cancel a disconnect scheduled by a previous (StrictMode) unmount.
    if (pendingDisconnect) {
      clearTimeout(pendingDisconnect);
      pendingDisconnect = null;
    }

    const streamUser: User = {
      id: user.id,
      name: user.name,
      image: user.image,
    };

    const streamClient = StreamVideoClient.getOrCreateInstance({
      apiKey,
      user: streamUser,
      token,
    });

    setClient(streamClient);

    return () => {
      // Defer the disconnect; if the provider remounts right away (StrictMode),
      // the effect above clears this timer before it fires.
      pendingDisconnect = setTimeout(() => {
        streamClient.disconnectUser().catch(() => undefined);
        pendingDisconnect = null;
      }, 400);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user.id]);

  if (!client) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-zinc-400">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Connecting...
      </div>
    );
  }

  return <StreamVideoProvider client={client}>{children}</StreamVideoProvider>;
}
