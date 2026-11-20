import bcrypt from "bcryptjs";
import { Router } from "express";
import { User } from "../models/user.js";
import {
  type LoginInput,
  type RegistrationInput,
  validateLoginInput,
  validateRegistrationInput
} from "../services/auth.validation.js";

export const authRouter = Router();

authRouter.post("/login", async (request, response, next) => {
  const input = request.body as Partial<LoginInput>;
  const errors = validateLoginInput(input);

  if (errors.length > 0) {
    response.status(422).json({ error: "Validation failed", details: errors });
    return;
  }

  const email = input.email?.trim().toLowerCase() ?? "";
  const user = await User.findOne({ email }).select("+passwordHash");
  const passwordMatches = user
    ? await bcrypt.compare(input.password ?? "", user.passwordHash)
    : false;

  if (!user || !passwordMatches || !user.isActive) {
    response.status(401).json({ error: "Invalid email or password" });
    return;
  }

  user.lastLoginAt = new Date();
  await user.save();
  request.session.userId = user.id;
  request.session.save((error) => {
    if (error) {
      next(error);
      return;
    }

    response.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  });
});

authRouter.post("/logout", (request, response, next) => {
  request.session.destroy((error) => {
    if (error) {
      next(error);
      return;
    }

    response.status(204).send();
  });
});

authRouter.get("/me", async (request, response) => {
  if (!request.session.userId) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  const user = await User.findById(request.session.userId).lean();

  if (!user || !user.isActive) {
    request.session.destroy(() => undefined);
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  response.json({
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

authRouter.post("/register", async (request, response) => {
  const input = request.body as Partial<RegistrationInput>;
  const errors = validateRegistrationInput(input);

  if (errors.length > 0) {
    response.status(422).json({ error: "Validation failed", details: errors });
    return;
  }

  const name = input.name?.trim() ?? "";
  const email = input.email?.trim().toLowerCase() ?? "";
  const existingUser = await User.findOne({ email }).lean();

  if (existingUser) {
    response
      .status(409)
      .json({ error: "An account with that email already exists" });
    return;
  }

  const passwordHash = await bcrypt.hash(input.password ?? "", 12);
  const user = await User.create({
    name,
    email,
    passwordHash
  });

  response.status(201).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});
