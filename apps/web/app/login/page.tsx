"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [callbackUrl, setCallbackUrl] = useState("/");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("callbackUrl") || "/";
    setCallbackUrl(value);
  }, []);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (response?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center px-4">
      <div className="w-full max-w-md bg-black rounded-2xl p-6 sm:p-10">
        <h1 className="text-3xl font-bold text-white text-center">Welcome Back</h1>
        <p className="text-center text-gray-400 text-sm mt-2">Sign in to your MeetFlow account</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-8">
          <label className="flex flex-col gap-1">
            <span className="text-white text-sm">Email</span>
            <input
              className="h-10 w-full rounded-xl px-3 bg-zinc-900 text-sm"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-white text-sm">Password</span>
            <input
              className="h-10 w-full rounded-xl px-3 bg-zinc-900 text-sm"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error ? <p className="text-red-500 text-sm">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="h-10 w-full rounded-xl bg-primary text-white mt-2 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="h-10 w-full rounded-xl bg-zinc-900 text-sm text-white"
          >
            Continue with Google
          </button>

          <p className="text-xs text-center text-gray-400 mt-2">
            Don&apos;t have an account? <Link href="/Signup" className="text-blue-500">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
