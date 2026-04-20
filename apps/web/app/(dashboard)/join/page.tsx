"use client";

import { JoinMeetingDialog } from "@/components/joinMeetingDialog";

export default function JoinPage() {
  return (
    <div className="h-[calc(100vh-7.5rem)] md:h-[calc(100vh)] flex items-center justify-center p-6">
      <JoinMeetingDialog />
    </div>
  );
}
