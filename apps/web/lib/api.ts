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

/**
 * Short-lived backend token, minted server-side from the NextAuth session by
 * `/api/backend-token`. Cached in memory and refreshed shortly before expiry so
 * we don't hit the token endpoint on every request.
 */
let cachedToken: { token: string; expiresAt: number } | null = null;

async function fetchBackendToken(): Promise<string> {
  const res = await fetch("/api/backend-token", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Your session has expired. Please sign in again.");
  }
  const data = (await res.json()) as { token: string; expiresAt: number };
  cachedToken = { token: data.token, expiresAt: data.expiresAt };
  return data.token;
}

async function getBackendToken(forceRefresh = false): Promise<string> {
  // Refresh 30s before the token actually expires to avoid edge-of-expiry 401s.
  if (
    !forceRefresh &&
    cachedToken &&
    cachedToken.expiresAt - 30_000 > Date.now()
  ) {
    return cachedToken.token;
  }
  return fetchBackendToken();
}

/**
 * Authorization header for direct `fetch` calls to the backend (e.g. join flow).
 */
export async function authHeaders(): Promise<{ Authorization: string }> {
  const token = await getBackendToken();
  return { Authorization: `Bearer ${token}` };
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const doFetch = async (token: string) =>
    fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers ?? {}),
      },
      cache: "no-store",
    });

  let response = await doFetch(await getBackendToken());

  // The cached token may have expired server-side; retry once with a fresh one.
  if (response.status === 401) {
    cachedToken = null;
    response = await doFetch(await getBackendToken(true));
  }

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
