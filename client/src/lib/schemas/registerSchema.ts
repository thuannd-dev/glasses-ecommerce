import z from "zod";
import { requiredString } from "../util/uitl";

export const registerSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  displayName: requiredString("Display name"),
  password: requiredString("Password").min(6, {
    message: "Password must be at least 6 characters",
  }),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
