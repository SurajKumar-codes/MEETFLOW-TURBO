"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { User, Mail, LogOut } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="p-8 text-zinc-400">Loading profile...</div>;
  }

  return (
    <div className="h-[calc(100vh-7.5rem)] md:h-[calc(100vh)] overflow-y-auto p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-semibold text-white mb-6">Profile</h1>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-white font-medium">{session?.user?.name || "Unnamed User"}</p>
              <p className="text-zinc-400 text-sm">MeetFlow account</p>
            </div>
          </div>

          <div className="rounded-xl bg-zinc-800/50 p-4 flex items-center gap-3">
            <Mail className="h-5 w-5 text-zinc-300" />
            <div>
              <p className="text-zinc-400 text-xs">Email</p>
              <p className="text-white text-sm">{session?.user?.email || "No email"}</p>
            </div>
          </div>

          <Button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
