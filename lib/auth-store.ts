"use client"

import { type User, type UserRole } from "./types"
import { demoUsers } from "./demo-data"

const AUTH_KEY = "sat-auth-user"

// Backward compatible login method calling the real API under the hood
export async function loginWithCredentials(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success && data.user) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(AUTH_KEY, JSON.stringify(data.user));
      }
      return { success: true, user: data.user };
    }
    return { success: false, error: data.error || "Login failed" };
  } catch (err) {
    return { success: false, error: "Network error occurred." };
  }
}

// Quick demo login (used by home page). 
// Since we generated some default users in prisma db (assuming they match demo emails),
// we can hardcode pass 'demo123' if they're in the DB.
// But to keep it simple, we'll simulate the backend call or fallback to demo state for UI
export async function login(role: UserRole, userId?: string): Promise<User | null> {
  // Find standard demo user
  const user = userId
    ? demoUsers.find((u) => u.id === userId)
    : demoUsers.find((u) => u.role === role)

  if (user) {
    // We do a real login if the user exists in DB. 
    // Wait, the DB is empty on first boot. We should do local login so the demo doesn't break,
    // OR require setting up DB accounts.
    // For now, write to session storage directly to preserve existing demo click paths:
    if (typeof window !== "undefined") {
      sessionStorage.setItem(AUTH_KEY, JSON.stringify(user))
    }
    return user
  }
  return null
}

export async function logout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch (e) { }

  if (typeof window !== "undefined") {
    sessionStorage.removeItem(AUTH_KEY)
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null
  const stored = sessionStorage.getItem(AUTH_KEY)
  if (!stored) return null
  try {
    return JSON.parse(stored) as User
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}

export async function createAccount(userData: Omit<User, "id" | "createdAt" | "isActive">, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...userData, password })
    });
    const data = await res.json();
    if (data.success) {
      return { success: true };
    }
    return { success: false, error: data.error };
  } catch (err) {
    return { success: false, error: "Network error occurred." };
  }
}
