"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    repeatPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (formData.password !== formData.repeatPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const registerResponse = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      }),
    });

    if (!registerResponse.ok) {
      setLoading(false);
      setError(await registerResponse.text());
      return;
    }

    const loginResponse = await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false,
    });

    setLoading(false);

    if (loginResponse?.error) {
      router.push("/login");
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center px-4 sm:px-0">
      <div className="w-full max-w-md sm:max-w-lg bg-black rounded-2xl p-6 sm:p-10">
        <div className="flex flex-col justify-center items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Create Your Account</h1>
          <p className="mx-auto max-w-75 text-center text-gray-400 leading-relaxed text-sm pb-3 mt-2">
            Join MeetFlow and start scheduling, chatting, and meeting instantly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full mt-4">
          <label htmlFor="name" className="flex flex-col gap-1">
            <span className="text-white text-sm">Full name</span>
            <input
              className="h-10 w-full rounded-2xl px-3 bg-zinc-900 text-sm sm:text-base"
              type="text"
              id="name"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </label>

          <label htmlFor="email" className="flex flex-col gap-1">
            <span className="text-white text-sm">Email</span>
            <input
              className="h-10 w-full rounded-2xl px-3 bg-zinc-900 text-sm sm:text-base"
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
              required
            />
          </label>

          <label htmlFor="password" className="flex flex-col gap-1">
            <span className="text-white text-sm">Password</span>
            <input
              className="h-10 w-full rounded-2xl px-3 bg-zinc-900 text-sm sm:text-base"
              type="password"
              name="password"
              id="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
              required
            />
          </label>

          <label htmlFor="repeatPassword" className="flex flex-col gap-1">
            <span className="text-white text-sm">Repeat password</span>
            <input
              className="h-10 w-full rounded-2xl px-3 bg-zinc-900 text-sm sm:text-base"
              type="password"
              name="repeatPassword"
              id="repeatPassword"
              placeholder="Repeat your password"
              value={formData.repeatPassword}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, repeatPassword: event.target.value }))
              }
              required
            />
          </label>

          {error ? <p className="text-red-500 text-sm">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="h-10 w-full rounded-2xl bg-primary text-white mt-3 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          <div className="w-full text-[12px] mt-1">
            <p className="text-center text-gray-400">
              Already have an account? <Link href="/login" className="text-blue-500">Login</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
