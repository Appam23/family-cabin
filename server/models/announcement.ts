import { model, Schema } from "mongoose";

const announcementSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    isUrgent: { type: Boolean, default: false },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    publishedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

announcementSchema.index({ isUrgent: -1, publishedAt: -1 });
announcementSchema.index({ authorId: 1 });

export const Announcement = model("Announcement", announcementSchema);
