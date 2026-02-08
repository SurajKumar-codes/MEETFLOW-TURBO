"use client";

import CalendarAndTime from "@/components/calendarAndTime";
import { NewMeetingDialog } from "@/components/newMeetingDialog";
import { JoinMeetingDialog } from "@/components/joinMeetingDialog";
import { useSession } from "next-auth/react";
import { Video, Plus, CalendarDays, Users } from "lucide-react";
import Link from "next/link";

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  href: string;
}

function ActionButton({ icon, label, href }: ActionButtonProps) {
  return (
    <Link href={href} className="flex flex-col items-center gap-2 sm:gap-3 group">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary flex items-center justify-center group-hover:bg-primary/80 transition-all group-hover:scale-105">
        {icon}
      </div>
      <span className="text-xs sm:text-sm text-zinc-300 group-hover:text-white transition-colors">
        {label}
      </span>
    </Link>
  );
}

interface DialogButtonProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}

function DialogButton({ icon, label, children }: DialogButtonProps) {
  return (
    <div className="flex flex-col items-center gap-2 sm:gap-3 group">
      {children}
      <span className="text-xs sm:text-sm text-zinc-300 group-hover:text-white transition-colors">
        {label}
      </span>
    </div>
  );
}

export default function Home() {
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(" ")[0] || "User";

  return (
    <div className="relative w-full h-full min-h-[calc(100vh-7.5rem)] md:min-h-screen">
      {/* Main content - centered */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-7.5rem)] md:min-h-screen px-4">
        {/* Welcome Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white mb-3 sm:mb-4">
            Welcome, {userName}
          </h1>
          <p className="text-zinc-400 max-w-xl mx-auto text-xs sm:text-sm md:text-base px-4">
            Simplify team collaboration and maximize productivity with advanced features
            designed for a more efficient and organized meeting experience.
          </p>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {/* New Meeting - Dialog */}
          <DialogButton
            icon={<Video size={32} className="text-white" />}
            label="New Meeting"
          >
            <NewMeetingDialog 
              trigger={
                <button className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary flex items-center justify-center hover:bg-primary/80 transition-all hover:scale-105">
                  <Video className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </button>
              }
            />
          </DialogButton>

          {/* Join Meeting - Dialog */}
          <DialogButton
            icon={<Plus size={32} className="text-white" />}
            label="Join Meeting"
          >
            <JoinMeetingDialog 
              trigger={
                <button className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary flex items-center justify-center hover:bg-primary/80 transition-all hover:scale-105">
                  <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </button>
              }
            />
          </DialogButton>

          {/* Schedule - Link */}
          <ActionButton
            icon={<CalendarDays className="w-6 h-6 sm:w-8 sm:h-8 text-white" />}
            label="Schedule"
            href="/schedule"
          />

          {/* People - Link */}
          <ActionButton
            icon={<Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />}
            label="People"
            href="/people"
          />
        </div>
      </div>

      {/* Calendar overlay - hidden on mobile */}
      <CalendarAndTime />
    </div>
  );
}
