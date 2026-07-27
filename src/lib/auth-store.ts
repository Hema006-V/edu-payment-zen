// Client-side auth state management.
// Stores authenticated user info in localStorage for persistence across refreshes.

import { useSyncExternalStore } from "react";
import type { Role } from "./types";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

const STORAGE_KEY = "school_auth_user";
const listeners = new Set<() => void>();

function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

let cachedUser: AuthUser | null = getStoredUser();

function notify() {
  listeners.forEach((l) => l());
}

export function getAuthUser(): AuthUser | null {
  return cachedUser;
}

export function setAuthUser(user: AuthUser | null) {
  cachedUser = user;
  if (typeof window !== "undefined") {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
  notify();
}

export function logout() {
  setAuthUser(null);
}

export function useAuth(): [AuthUser | null, (user: AuthUser | null) => void] {
  const user = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => cachedUser,
    () => null // SSR returns null
  );
  return [user, setAuthUser];
}
