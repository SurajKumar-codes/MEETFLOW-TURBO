export type Meeting = {
  id: string;
  title: string;
  description?: string | null;
  passcode?: string | null;
  startsAt: string;
  endsAt?: string | null;
  hostId: string;
  streamCallId?: string | null;
  host?: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
  _count?: {
    meetingParticipants: number;
  };
};

export type MeetingMessage = {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
};

export async function apiRequest<T>(
  path: string,
  userId: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userId}`,
      ...(options.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();

    try {
      const parsed = JSON.parse(text) as { message?: string };
      throw new Error(parsed.message || "Request failed");
    } catch {
      throw new Error(text || "Request failed");
    }
  }

  return response.json() as Promise<T>;
}
