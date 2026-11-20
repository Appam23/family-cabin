import bcrypt from "bcryptjs";
import { Router } from "express";
import { requireAuth } from "../middleware/require-auth.js";
import { User } from "../models/user.js";

export const userRouter = Router();

userRouter.use(requireAuth);

userRouter.get("/", async (request, response) => {
  const currentUser = await User.findById(request.session.userId).lean();
  if (currentUser?.role !== "admin") {
    response.status(403).json({ error: "Administrator access required" });
    return;
  }

  const users = await User.find({ isActive: true })
    .select("_id name email role")
    .sort({ name: 1 })
    .lean();
  response.json({
    users: users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    }))
  });
});

userRouter.patch("/me", async (request, response) => {
  const { name, currentPassword, newPassword, confirmPassword } =
    request.body as {
      name?: string;
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    };

  const user = await User.findById(request.session.userId).select(
    "+passwordHash"
  );
  if (!user) {
    response.status(404).json({ error: "Account not found" });
    return;
  }

  if (typeof name === "string" && name.trim()) {
    user.name = name.trim();
  } else if (typeof name === "string") {
    response.status(422).json({
      error: "Validation failed",
      details: ["Name cannot be empty"]
    });
    return;
  }

  if (newPassword || confirmPassword || currentPassword) {
    if (!currentPassword || !newPassword || !confirmPassword) {
      response.status(422).json({
        error: "Validation failed",
        details: [
          "Current password, new password, and confirmation are required"
        ]
      });
      return;
    }

    if (newPassword.length < 8) {
      response.status(422).json({
        error: "Validation failed",
        details: ["New password must be at least 8 characters"]
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      response.status(422).json({
        error: "Validation failed",
        details: ["New passwords must match"]
      });
      return;
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );
    if (!passwordMatches) {
      response.status(401).json({ error: "Current password is incorrect" });
      return;
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
  }

  await user.save();

  response.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});
