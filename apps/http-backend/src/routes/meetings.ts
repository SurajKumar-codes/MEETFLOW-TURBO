import { Router, Router as ExpressRouter } from "express";
import { prisma } from "@repo/db/client";
import { streamServer } from "../services/stream";
import { requireUser } from "../middleware/auth";

const router: ExpressRouter = Router();

type AuthenticatedRequest = {
  userId?: string;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unknown error";
}


/**
 * CREATE MEETING
 */
router.post("/create", requireUser, async (req, res) => {
  try {
    const { title, description, startsAt, endsAt, passcode } = req.body;
    const hostId = (req as typeof req & AuthenticatedRequest).userId;

    if (!title || !startsAt || !hostId) {
      return res.status(400).json({ message: "Missing Field" });
    }

    const hostUser = await prisma.user.findUnique({
      where: { id: hostId },
      select: { id: true, name: true, email: true },
    });

    if (!hostUser) {
      return res.status(401).json({ message: "Invalid session user" });
    }

    await streamServer.upsertUsers([
      {
        id: hostUser.id,
        name: hostUser.name || hostUser.email || "MeetFlow User",
      },
    ]);

    // 1 create DB meeting
    const meeting = await prisma.meeting.create({
      data: {
        title: String(title),
        description: description ? String(description) : undefined,
        passcode: passcode ? String(passcode) : undefined,
        startsAt: new Date(startsAt),
        endsAt: endsAt ? new Date(endsAt) : undefined,
        hostId,
      },
    });

    const callId = meeting.id;

    // 2️ create Stream call
    const call = streamServer.video.call("default", callId);

    await call.getOrCreate({
      data: {
        created_by_id: hostId
      }
    });


    // 3️ set host as member
    await call.updateCallMembers({
      update_members: [{ user_id: hostId, role: "call_member" }],
    });

    // save call id in DB
    await prisma.meeting.update({
      where: { id: meeting.id },
      data: { streamCallId: callId },
    });

    const updated = await prisma.meeting.findUnique({
      where: { id: meeting.id },
    });

    // 4️ add host to participants table
    await prisma.meetingParticipant.create({
      data: { userId: hostId, meetingId: meeting.id },
    });

    res.json(updated);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: `Failed to create meeting: ${getErrorMessage(err)}` });
  }
});

/**
 * GET MEETINGS FOR CURRENT USER
 */
router.get("/", requireUser, async (req, res) => {
  try {
    const userId = (req as typeof req & AuthenticatedRequest).userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const meetings = await prisma.meeting.findMany({
      where: {
        OR: [{ hostId: userId }, { meetingParticipants: { some: { userId } } }],
      },
      orderBy: { startsAt: "asc" },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            meetingParticipants: true,
          },
        },
      },
    });

    res.json(meetings);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to fetch meetings" });
  }
});

/**
 * GET ALL MEETINGS HOSTED BY USER
 */
router.get("/user/:id", requireUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as typeof req & AuthenticatedRequest).userId;

    // Only let a user list their own hosted meetings.
    if (id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const meetings = await prisma.meeting.findMany({
      where: { hostId: id },
      orderBy: { startsAt: "desc" },
    });

    res.json(meetings);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to fetch meetings" });
  }
});

/**
 * JOIN MEETING
 */
router.post("/join",requireUser, async (req, res) => {
  try {
    const { meetingId, passcode } = req.body;
    const userId = (req as typeof req & AuthenticatedRequest).userId;

    if (!userId || !meetingId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // 1️ check meeting exists
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    const participantUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!participantUser) {
      return res.status(401).json({ message: "Invalid session user" });
    }

    await streamServer.upsertUsers([
      {
        id: participantUser.id,
        name: participantUser.name || participantUser.email || "MeetFlow User",
      },
    ]);

    const expectedPasscode = meeting.passcode?.trim().toUpperCase();
    const providedPasscode = typeof passcode === "string" ? passcode.trim().toUpperCase() : "";

    // Host can always join their own meeting without re-entering a passcode.
    if (meeting.hostId !== userId && expectedPasscode && expectedPasscode !== providedPasscode) {
      return res.status(403).json({ message: "Invalid passcode" });
    }

    // 2️ ensure participant exists (or invite automatically)
    let participant = await prisma.meetingParticipant.findFirst({
      where: { userId, meetingId },
    });

    if (!participant) {
      participant = await prisma.meetingParticipant.create({
        data: { userId, meetingId },
      });
    }

    const call = streamServer.video.call("default", meeting.streamCallId || meeting.id);
    await call.getOrCreate({
      data: {
        created_by_id: meeting.hostId,
      },
    });

    await call.updateCallMembers({
      update_members: [{ user_id: userId, role: "call_member" }],
    });

    // 3️ generate Stream token for this user
    const token = streamServer.createToken(userId);

    res.json({
      token,
      callId: meeting.streamCallId || meeting.id,
      meeting,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: `Failed to join meeting: ${getErrorMessage(err)}` });
  }
});

/**
 * GET MEETING MESSAGES
 */
router.get("/:meetingId/messages", requireUser, async (req, res) => {
  try {
    const { meetingId } = req.params;
    const userId = (req as typeof req & AuthenticatedRequest).userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!meetingId) {
      return res.status(400).json({ message: "Meeting id is required" });
    }

    const membership = await prisma.meeting.findFirst({
      where: {
        id: meetingId,
        OR: [{ hostId: userId }, { meetingParticipants: { some: { userId } } }],
      },
      select: { id: true },
    });

    if (!membership) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = await prisma.meetingMessage.findMany({
      where: { meetingId },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json(messages);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

/**
 * POST MEETING MESSAGE
 */
router.post("/:meetingId/messages", requireUser, async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { content } = req.body;
    const userId = (req as typeof req & AuthenticatedRequest).userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!meetingId) {
      return res.status(400).json({ message: "Meeting id is required" });
    }

    if (!content || !String(content).trim()) {
      return res.status(400).json({ message: "Message content required" });
    }

    const membership = await prisma.meeting.findFirst({
      where: {
        id: meetingId,
        OR: [{ hostId: userId }, { meetingParticipants: { some: { userId } } }],
      },
      select: { id: true },
    });

    if (!membership) {
      return res.status(403).json({ message: "Access denied" });
    }

    const message = await prisma.meetingMessage.create({
      data: {
        meetingId,
        userId,
        content: String(content).trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(message);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to send message" });
  }
});

export default router;
