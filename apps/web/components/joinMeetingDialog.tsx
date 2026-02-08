"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface JoinMeetingDialogProps {
  trigger?: React.ReactNode;
}

export function JoinMeetingDialog({ trigger }: JoinMeetingDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    meetingId: "",
    passcode: "",
    displayName: "",
  });
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Join Meeting Data:", formData);
    // Navigate to meeting room
    if (formData.meetingId) {
      router.push(`/meeting/${formData.meetingId}`);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Join Meeting
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-md bg-zinc-900 border-zinc-800 text-white mx-2">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-800">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-xl font-semibold">Join Meeting</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Meeting ID */}
          <div className="space-y-2">
            <Label htmlFor="meetingId" className="text-zinc-400 text-sm">
              Meeting ID
            </Label>
            <Input
              id="meetingId"
              placeholder="Enter meeting ID (e.g., 1234-5678-9012)"
              value={formData.meetingId}
              onChange={(e) => setFormData({ ...formData, meetingId: e.target.value })}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-primary"
              required
            />
          </div>

          {/* Passcode */}
          <div className="space-y-2">
            <Label htmlFor="passcode" className="text-zinc-400 text-sm">
              Passcode (if required)
            </Label>
            <Input
              id="passcode"
              placeholder="Enter passcode"
              value={formData.passcode}
              onChange={(e) => setFormData({ ...formData, passcode: e.target.value })}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-primary"
            />
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-zinc-400 text-sm">
              Your Display Name
            </Label>
            <Input
              id="displayName"
              placeholder="How you'll appear in the meeting"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-primary"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
          >
            Join Meeting
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
