export type UserRole = "admin" | "teacher" | "student"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  phone: string
  avatar?: string
  department?: string
  enrollmentNo?: string
  deviceId?: string
  isActive: boolean
  createdAt: string
  password?: string // hashed
}

export interface Classroom {
  id: string
  name: string
  department: string
  semester: number
  section?: string
  createdBy: string
  isArchived: boolean
  createdAt: string
}

export interface Subject {
  id: string
  subjectId: string // unique code like "CS301"
  name: string
  classroomId: string
  teacherId: string
  schedule: ClassSchedule[]
  students: string[]
  roomNo: string
  wifiSSID?: string
  isArchived: boolean
  createdAt: string
}

// Legacy alias for backward compatibility
export type Class = Subject & { code: string }

export interface ClassSchedule {
  day: string
  startTime: string
  endTime: string
}

export interface TimetableSlot {
  id: string
  subjectId: string
  classroomId: string
  teacherId: string
  day: string
  startTime: string
  endTime: string
  roomNo: string
}

export interface Holiday {
  id: string
  date: string
  name: string
  type: "weekend" | "festival" | "institutional" | "custom"
  region?: string
  createdBy?: string
}

export interface AttendanceSession {
  id: string
  classId: string
  subjectId?: string
  teacherId: string
  date: string
  startTime: string
  endTime: string
  qrSecret: string
  isActive: boolean
  geoFence: GeoFence
  records: AttendanceRecord[]
}

export interface AttendanceRecord {
  id: string
  sessionId: string
  studentId: string
  studentName: string
  timestamp: string
  status: "present" | "absent" | "late" | "excused" | "holiday"
  verificationMethod: string[]
  location?: { lat: number; lng: number }
  fraudScore: number
  flagged: boolean
  flagReason?: string
  synced: boolean
  subjectId?: string
}

export interface GeoFence {
  lat: number
  lng: number
  radiusMeters: number
}

export interface EngagementScore {
  studentId: string
  classId: string
  quizParticipation: number
  pollResponses: number
  assignmentSubmissions: number
  questionsAsked: number
  overallScore: number
  trend: "up" | "down" | "stable"
  weeklyScores: number[]
}

export interface Analytics {
  totalStudents: number
  averageAttendance: number
  totalClasses: number
  defaulterCount: number
  attendanceTrend: { date: string; percentage: number }[]
  classWiseAttendance: { className: string; percentage: number; subjectId?: string }[]
  engagementOverview: { metric: string; value: number }[]
}

export interface QRPayload {
  sessionId: string
  secret: string
  timestamp: number
  expiresAt: number
  classId: string
  sequence: number
}

export interface SyncStatus {
  pendingRecords: number
  lastSyncTime: string | null
  isSyncing: boolean
  failedRecords: number
}

export interface DemoConfig {
  isDemo: boolean
  autoPopulate: boolean
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "attendance" | "alert" | "live_class" | "system" | "holiday"
  read: boolean
  timestamp: string
  metadata?: Record<string, string>
}

export interface LiveClassStatus {
  subjectId: string
  subjectName: string
  teacherName: string
  roomNo: string
  startTime: string
  endTime: string
  isLive: boolean
}
