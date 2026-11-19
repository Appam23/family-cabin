import { Router } from "express";
import { requireAuth } from "../middleware/require-auth.js";
import { Project } from "../models/project.js";
import { User } from "../models/user.js";

export const projectRouter = Router();

projectRouter.use(requireAuth);

projectRouter.get("/", async (request, response) => {
  const { status, priority, search } = request.query as {
    status?: string;
    priority?: string;
    search?: string;
  };
  const filter: Record<string, unknown> = {};

  if (["open", "in_progress", "completed"].includes(status ?? "")) {
    filter.status = status;
  }
  if (["low", "medium", "high", "urgent"].includes(priority ?? "")) {
    filter.priority = priority;
  }
  if (search?.trim()) {
    const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { title: { $regex: escapedSearch, $options: "i" } },
      { description: { $regex: escapedSearch, $options: "i" } }
    ];
  }

  const projects = await Project.find(filter).sort({ updatedAt: -1 }).lean();
  response.json({
    projects: projects.map((project) => ({
      ...project,
      canUnclaim: project.assigneeId?.toString() === request.session.userId,
      canComplete:
        project.assigneeId?.toString() === request.session.userId &&
        project.status !== "completed",
      canReopen:
        project.assigneeId?.toString() === request.session.userId &&
        project.status === "completed"
    }))
  });
});

projectRouter.post("/", async (request, response) => {
  const { title, description, priority, dueDate } = request.body as {
    title?: string;
    description?: string;
    priority?: string;
    dueDate?: string;
  };

  if (!title?.trim() || !description?.trim()) {
    response.status(422).json({
      error: "Validation failed",
      details: ["Title and description are required"]
    });
    return;
  }

  const project = await Project.create({
    title: title.trim(),
    description: description.trim(),
    priority: priority ?? "medium",
    dueDate: dueDate || null,
    createdById: request.session.userId
  });

  response.status(201).json({ project });
});

projectRouter.get("/:projectId", async (request, response) => {
  const project = await Project.findById(request.params.projectId).lean();

  if (!project) {
    response.status(404).json({ error: "Project not found" });
    return;
  }

  const currentUser = await User.findById(request.session.userId).lean();
  const canManage =
    project.createdById.toString() === request.session.userId ||
    currentUser?.role === "admin";

  response.json({ project: { ...project, canManage } });
});

projectRouter.patch("/:projectId", async (request, response) => {
  const project = await Project.findById(request.params.projectId);

  if (!project) {
    response.status(404).json({ error: "Project not found" });
    return;
  }

  const currentUser = await User.findById(request.session.userId).lean();
  if (
    project.createdById.toString() !== request.session.userId &&
    currentUser?.role !== "admin"
  ) {
    response.status(403).json({
      error: "Only the creator or an administrator can edit this project"
    });
    return;
  }

  const { title, description, priority, dueDate } = request.body as {
    title?: string;
    description?: string;
    priority?: string;
    dueDate?: string | null;
  };

  if (typeof title === "string") project.title = title.trim();
  if (typeof description === "string") project.description = description.trim();
  if (priority && ["low", "medium", "high", "urgent"].includes(priority)) {
    project.priority = priority;
  }
  if (dueDate !== undefined)
    project.dueDate = dueDate ? new Date(dueDate) : null;

  if (!project.title.trim() || !project.description.trim()) {
    response.status(422).json({
      error: "Validation failed",
      details: ["Title and description are required"]
    });
    return;
  }

  await project.save();
  response.json({ project });
});

projectRouter.delete("/:projectId", async (request, response) => {
  const project = await Project.findById(request.params.projectId);

  if (!project) {
    response.status(404).json({ error: "Project not found" });
    return;
  }

  const currentUser = await User.findById(request.session.userId).lean();
  if (
    project.createdById.toString() !== request.session.userId &&
    currentUser?.role !== "admin"
  ) {
    response.status(403).json({
      error: "Only the creator or an administrator can delete this project"
    });
    return;
  }

  await project.deleteOne();
  response.status(204).send();
});

projectRouter.post("/:projectId/claim", async (request, response) => {
  const project = await Project.findById(request.params.projectId);

  if (!project) {
    response.status(404).json({ error: "Project not found" });
    return;
  }

  if (project.assigneeId) {
    response.status(409).json({ error: "This project is already assigned" });
    return;
  }

  project.assigneeId = request.session.userId;
  project.status = "in_progress";
  await project.save();

  response.json({ project });
});

projectRouter.delete("/:projectId/assignee", async (request, response) => {
  const project = await Project.findById(request.params.projectId);

  if (!project) {
    response.status(404).json({ error: "Project not found" });
    return;
  }

  if (project.assigneeId?.toString() !== request.session.userId) {
    response
      .status(403)
      .json({ error: "Only the assigned user can unclaim this project" });
    return;
  }

  project.assigneeId = null;
  project.status = "open";
  await project.save();

  response.status(204).send();
});

projectRouter.post("/:projectId/complete", async (request, response) => {
  const project = await Project.findById(request.params.projectId);

  if (!project) {
    response.status(404).json({ error: "Project not found" });
    return;
  }

  if (project.assigneeId?.toString() !== request.session.userId) {
    response
      .status(403)
      .json({ error: "Only the assigned user can complete this project" });
    return;
  }

  project.status = "completed";
  project.completedAt = new Date();
  await project.save();

  response.json({ project });
});

projectRouter.post("/:projectId/reopen", async (request, response) => {
  const project = await Project.findById(request.params.projectId);

  if (!project) {
    response.status(404).json({ error: "Project not found" });
    return;
  }

  if (project.assigneeId?.toString() !== request.session.userId) {
    response
      .status(403)
      .json({ error: "Only the assigned user can reopen this project" });
    return;
  }

  project.status = "open";
  project.completedAt = null;
  await project.save();

  response.json({ project });
});
