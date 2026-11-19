import { model, Schema } from "mongoose";

const projectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["open", "in_progress", "completed"],
      default: "open"
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium"
    },
    assigneeId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    createdById: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dueDate: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    attachmentUrls: { type: [String], default: [] }
  },
  { timestamps: true }
);

projectSchema.index({ status: 1, priority: -1, updatedAt: -1 });
projectSchema.index({ assigneeId: 1 });

export const Project = model("Project", projectSchema);
