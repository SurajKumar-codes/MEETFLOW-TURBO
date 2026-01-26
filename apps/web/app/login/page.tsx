"use client";

import { signIn } from "next-auth/react";

export default function Login() {
  return (
    <div className="h-screen w-screen ">
      <h1 className="text-pm-col">Hello</h1>
      <button onClick={() => signIn("google")}>Sign in with Google</button>
    </div>
  );
}