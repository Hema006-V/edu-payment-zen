import { useSyncExternalStore } from "react";
import type { Role } from "./mock-data";

let currentRole: Role = "admin";
const listeners = new Set<() => void>();

export function getRole() { return currentRole; }
export function setRole(r: Role) {
  currentRole = r;
  listeners.forEach(l => l());
}
export function useRole(): [Role, (r: Role) => void] {
  const role = useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => currentRole,
    () => currentRole,
  );
  return [role, setRole];
}
