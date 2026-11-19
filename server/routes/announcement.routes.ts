import { Router } from "express";
import { requireAuth } from "../middleware/require-auth.js";
import { Announcement } from "../models/announcement.js";

export const announcementRouter = Router();

announcementRouter.use(requireAuth);

announcementRouter.get("/", async (request, response) => {
  const announcements = await Announcement.find()
    .sort({ isUrgent: -1, publishedAt: -1 })
    .populate("authorId", "name")
    .lean();

  response.json({ announcements });
});

announcementRouter.post("/", async (request, response) => {
  const { title, body, isUrgent } = request.body as {
    title?: string;
    body?: string;
    isUrgent?: boolean;
  };

  if (!title?.trim() || !body?.trim()) {
    response.status(422).json({
      error: "Validation failed",
      details: ["Title and body are required"]
    });
    return;
  }

  const announcement = await Announcement.create({
    title: title.trim(),
    body: body.trim(),
    isUrgent: Boolean(isUrgent),
    authorId: request.session.userId
  });

  await announcement.populate("authorId", "name");
  response.status(201).json({ announcement });
});

announcementRouter.patch("/:announcementId", async (request, response) => {
  const announcement = await Announcement.findById(
    request.params.announcementId
  );

  if (!announcement) {
    response.status(404).json({ error: "Announcement not found" });
    return;
  }

  if (announcement.authorId.toString() !== request.session.userId) {
    response
      .status(403)
      .json({ error: "Only the author can edit this announcement" });
    return;
  }

  const { title, body, isUrgent } = request.body as {
    title?: string;
    body?: string;
    isUrgent?: boolean;
  };

  if (typeof title === "string") announcement.title = title.trim();
  if (typeof body === "string") announcement.body = body.trim();
  if (typeof isUrgent === "boolean") announcement.isUrgent = isUrgent;

  if (!announcement.title || !announcement.body) {
    response.status(422).json({
      error: "Validation failed",
      details: ["Title and body are required"]
    });
    return;
  }

  await announcement.save();
  await announcement.populate("authorId", "name");
  response.json({ announcement });
});

announcementRouter.delete("/:announcementId", async (request, response) => {
  const announcement = await Announcement.findById(
    request.params.announcementId
  );

  if (!announcement) {
    response.status(404).json({ error: "Announcement not found" });
    return;
  }

  if (announcement.authorId.toString() !== request.session.userId) {
    response
      .status(403)
      .json({ error: "Only the author can remove this announcement" });
    return;
  }

  await announcement.deleteOne();
  response.status(204).send();
});
