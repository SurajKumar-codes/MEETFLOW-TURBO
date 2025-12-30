import { Router, Router as ExpressRouter } from "express";
import { prisma } from "@repo/db/client";
import { streamServer } from "../services/stream";
import { requireUser } from "../middleware/auth";

const router: ExpressRouter = Router();


/**
 * CREATE MEETING
 */
router.post("/create", requireUser, async (req, res) => {
  try {
    const { title, startsAt, hostId } = req.body;

    if (!title || !startsAt || !hostId) {
      return res.status(400).json({ message: "Missing Field" });
    }

    // 1️⃣ create DB meeting
    const meeting = await prisma.meeting.create({
      data: {
        title,
        startsAt: new Date(startsAt),
        hostId,
      },
    });

    const callId = meeting.id;

    // 2️⃣ create Stream call
    const call = streamServer.video.call("default", callId);

    await call.getOrCreate({
      data: {
        created_by_id: hostId
      }
    });


    // 3️⃣ set host as member
    await call.updateCallMembers({
      update_members: [{ user_id: hostId, role: "host" }],
    });

    // save call id in DB
    await prisma.meeting.update({
      where: { id: meeting.id },
      data: { streamCallId: callId },
    });

    const updated = await prisma.meeting.findUnique({
      where: { id: meeting.id },
    });

    // 4️⃣ add host to participants table
    await prisma.meetingParticipant.create({
      data: { userId: hostId, meetingId: meeting.id },
    });

    res.json(updated);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create Meeting" });
  }
});

/**
 * GET ALL MEETINGS HOSTED BY USER
 */
router.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;

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
    const { userId, meetingId } = req.body;

    if (!userId || !meetingId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // 1️⃣ check meeting exists
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // 2️⃣ ensure participant exists (or invite automatically)
    let participant = await prisma.meetingParticipant.findFirst({
      where: { userId, meetingId },
    });

    if (!participant) {
      participant = await prisma.meetingParticipant.create({
        data: { userId, meetingId },
      });
    }

    // 3️⃣ generate Stream token for this user
    const token = streamServer.createToken(userId);

    res.json({
      token,
      callId: meeting.streamCallId,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to join meeting" });
  }
});

export default router;
