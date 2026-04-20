"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
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
import { Video, Copy, Check } from "lucide-react";
import { apiRequest, Meeting } from "@/lib/api";

interface NewMeetingDialogProps {
  trigger?: React.ReactNode;
  onCreated?: (meeting: Meeting) => void;
}

export function NewMeetingDialog({ trigger, onCreated }: NewMeetingDialogProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "10:00",
    passcode: generatePasscode(),
  });

  function generatePasscode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  const handleCopyPasscode = () => {
    navigator.clipboard.writeText(formData.passcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) {
      setError("Please sign in to create a meeting.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const startsAt = new Date(`${formData.date}T${formData.startTime}:00`).toISOString();
    const endsAt = new Date(`${formData.date}T${formData.endTime}:00`).toISOString();

    apiRequest<Meeting>("/meetings/create", userId, {
      method: "POST",
      body: JSON.stringify({
        title: formData.title,
        startsAt,
        endsAt,
        passcode: formData.passcode,
      }),
    })
      .then((meeting) => {
        onCreated?.(meeting);
        setOpen(false);
      })
      .catch((err: Error) => {
        const message = err.message || "Failed to create meeting.";
        if (message.toLowerCase().includes("failed to fetch")) {
          setError("Cannot reach API server (http://localhost:3001). Please start http-backend.");
          return;
        }
        setError(message);
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-primary hover:bg-primary/90">
            <Video className="mr-2 h-4 w-4" />
            New Meeting
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-md bg-zinc-900 border-zinc-800 text-white mx-2">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-800">
              <Video className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-xl font-semibold">New Meeting</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-zinc-400 text-sm">
              Title
            </Label>
            <Input
              id="title"
              placeholder="Design System Discussion"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-primary"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-zinc-400 text-sm">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="bg-zinc-800 border-zinc-700 text-white focus:border-primary"
            />
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label className="text-zinc-400 text-sm">Time</Label>
            <div className="flex items-center gap-3">
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white focus:border-primary w-28"
              />
              <span className="text-zinc-500">To</span>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white focus:border-primary w-28"
              />
            </div>
          </div>

          {/* Passcode */}
          <div className="space-y-2">
            <Label className="text-zinc-400 text-sm">Meeting Passcode</Label>
            <div className="flex items-center gap-2">
              <Input
                value={formData.passcode}
                readOnly
                className="bg-zinc-800 border-zinc-700 text-white w-32 font-mono"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleCopyPasscode}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFormData({ ...formData, passcode: generatePasscode() })}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                Regenerate
              </Button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={submitting || !formData.title.trim()}
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
          >
            {submitting ? "Creating..." : "Create Meeting"}
          </Button>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
        </form>
      </DialogContent>
    </Dialog>
  );
}
