import type { QRPayload } from "./types"

// QR Code generation and validation utilities
// Dynamic QR refreshes every 10 seconds with rotating secrets

const QR_EXPIRY_MS = 10_000 // 10 seconds

let sequenceCounter = 0

export function generateQRPayload(
  sessionId: string,
  classId: string
): QRPayload {
  const now = Date.now()
  sequenceCounter++

  return {
    sessionId,
    secret: generateSecret(),
    timestamp: now,
    expiresAt: now + QR_EXPIRY_MS,
    classId,
    sequence: sequenceCounter,
  }
}

export function validateQRPayload(payload: QRPayload): {
  valid: boolean
  reason?: string
} {
  const now = Date.now()

  if (now > payload.expiresAt) {
    return { valid: false, reason: "QR code has expired" }
  }

  if (!payload.sessionId || !payload.secret || !payload.classId) {
    return { valid: false, reason: "Invalid QR code data" }
  }

  return { valid: true }
}

export function encodeQRData(payload: QRPayload): string {
  return btoa(JSON.stringify(payload))
}

export function decodeQRData(data: string): QRPayload | null {
  try {
    return JSON.parse(atob(data)) as QRPayload
  } catch {
    return null
  }
}

function generateSecret(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  const array = new Uint8Array(32)
  if (typeof crypto !== "undefined") {
    crypto.getRandomValues(array)
    for (let i = 0; i < 32; i++) {
      result += chars[array[i] % chars.length]
    }
  } else {
    for (let i = 0; i < 32; i++) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }
  }
  return result
}

export function getTimeRemaining(expiresAt: number): number {
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))
}

// Calculate fraud risk score based on multiple signals
export function calculateFraudScore(params: {
  distanceFromTeacher: number // meters
  timeToScan: number // seconds after QR display
  wifiMatch: boolean
  gpsAccuracy: number // meters
  previousFlags: number
}): { score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []

  if (params.distanceFromTeacher > 10) {
    score += 30
    reasons.push("Too far from teacher device")
  } else if (params.distanceFromTeacher > 5) {
    score += 15
    reasons.push("Near boundary of classroom radius")
  }

  if (params.timeToScan < 1) {
    score += 25
    reasons.push("Suspiciously fast scan time")
  }

  if (!params.wifiMatch) {
    score += 20
    reasons.push("WiFi SSID mismatch")
  }

  if (params.gpsAccuracy > 50) {
    score += 15
    reasons.push("Low GPS accuracy")
  }

  if (params.previousFlags > 2) {
    score += 10
    reasons.push("Multiple previous flags")
  }

  return { score: Math.min(100, score), reasons }
}
