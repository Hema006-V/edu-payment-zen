import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, deleteCookie } from "vinxi/http";
import { db } from "../db/db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export const loginFn = createServerFn({ method: "POST" })
  .validator((data: { email: string; password?: string }) => data)
  .handler(async ({ data }) => {
    const { email, password } = data;
    
    // Find user in database
    const user = db.select().from(users).where(eq(users.email, email)).get();
    
    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (password && user.password !== password) {
      throw new Error("Invalid email or password");
    }

    // Set session cookie (valid for 1 day)
    setCookie("session_user_id", user.id, {
      path: "/",
      maxAge: 60 * 60 * 24,
      httpOnly: true,
      sameSite: "strict",
    });

    return { id: user.id, email: user.email, role: user.role, studentId: user.studentId };
  });

export const logoutFn = createServerFn({ method: "POST" })
  .handler(async () => {
    deleteCookie("session_user_id", { path: "/" });
    return { success: true };
  });

export const getCurrentUserFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const userId = getCookie("session_user_id");
    if (!userId) {
      return null;
    }

    const user = db.select().from(users).where(eq(users.id, userId)).get();
    if (!user) {
      return null;
    }

    return { id: user.id, email: user.email, role: user.role, studentId: user.studentId };
  });
