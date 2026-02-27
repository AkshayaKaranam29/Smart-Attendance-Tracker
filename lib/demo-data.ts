import type {
  User,
  Subject,
  Classroom,
  AttendanceSession,
  AttendanceRecord,
  EngagementScore,
  Analytics,
  SyncStatus,
  Holiday,
  TimetableSlot,
  Notification,
  LiveClassStatus,
} from "./types"

// Demo Users
export const demoUsers: User[] = [
  {
    id: "admin-001",
    name: "Dr. Rajesh Kumar",
    email: "admin@college.edu",
    role: "admin",
    phone: "+91-9876543210",
    department: "Computer Science",
    isActive: true,
    createdAt: "2024-01-15",
  },
  {
    id: "teacher-001",
    name: "Prof. Anita Sharma",
    email: "anita.sharma@college.edu",
    role: "teacher",
    phone: "+91-9876543211",
    department: "Computer Science",
    isActive: true,
    createdAt: "2024-01-15",
  },
  {
    id: "teacher-002",
    name: "Dr. Vikram Patel",
    email: "vikram.patel@college.edu",
    role: "teacher",
    phone: "+91-9876543212",
    department: "Electronics",
    isActive: true,
    createdAt: "2024-02-01",
  },
  {
    id: "student-001",
    name: "Priya Mehta",
    email: "priya.m@student.edu",
    role: "student",
    phone: "+91-9123456780",
    department: "Computer Science",
    enrollmentNo: "CS2024001",
    isActive: true,
    createdAt: "2024-06-01",
  },
  {
    id: "student-002",
    name: "Arjun Singh",
    email: "arjun.s@student.edu",
    role: "student",
    phone: "+91-9123456781",
    department: "Computer Science",
    enrollmentNo: "CS2024002",
    isActive: true,
    createdAt: "2024-06-01",
  },
  {
    id: "student-003",
    name: "Sneha Gupta",
    email: "sneha.g@student.edu",
    role: "student",
    phone: "+91-9123456782",
    department: "Computer Science",
    enrollmentNo: "CS2024003",
    isActive: true,
    createdAt: "2024-06-01",
  },
  {
    id: "student-004",
    name: "Rahul Verma",
    email: "rahul.v@student.edu",
    role: "student",
    phone: "+91-9123456783",
    department: "Computer Science",
    enrollmentNo: "CS2024004",
    isActive: true,
    createdAt: "2024-06-01",
  },
  {
    id: "student-005",
    name: "Kavya Nair",
    email: "kavya.n@student.edu",
    role: "student",
    phone: "+91-9123456784",
    department: "Computer Science",
    enrollmentNo: "CS2024005",
    isActive: true,
    createdAt: "2024-06-01",
  },
  {
    id: "student-006",
    name: "Amit Joshi",
    email: "amit.j@student.edu",
    role: "student",
    phone: "+91-9123456785",
    department: "Computer Science",
    enrollmentNo: "CS2024006",
    isActive: true,
    createdAt: "2024-06-01",
  },
  {
    id: "student-007",
    name: "Deepika Rao",
    email: "deepika.r@student.edu",
    role: "student",
    phone: "+91-9123456786",
    department: "Computer Science",
    enrollmentNo: "CS2024007",
    isActive: true,
    createdAt: "2024-06-01",
  },
  {
    id: "student-008",
    name: "Rohan Pillai",
    email: "rohan.p@student.edu",
    role: "student",
    phone: "+91-9123456787",
    department: "Computer Science",
    enrollmentNo: "CS2024008",
    isActive: true,
    createdAt: "2024-06-01",
  },
]

export const demoStudents = demoUsers.filter((u) => u.role === "student")

// Classrooms
export const demoClassrooms: Classroom[] = [
  {
    id: "classroom-001",
    name: "CS - Semester 3 - Section A",
    department: "Computer Science",
    semester: 3,
    section: "A",
    createdBy: "admin-001",
    isArchived: false,
    createdAt: "2024-06-01",
  },
  {
    id: "classroom-002",
    name: "CS - Semester 3 - Section B",
    department: "Computer Science",
    semester: 3,
    section: "B",
    createdBy: "admin-001",
    isArchived: false,
    createdAt: "2024-06-01",
  },
]

// Subjects (evolved from Classes)
export const demoSubjects: Subject[] = [
  {
    id: "class-001",
    subjectId: "CS301",
    name: "Data Structures & Algorithms",
    classroomId: "classroom-001",
    teacherId: "teacher-001",
    schedule: [
      { day: "Monday", startTime: "09:00", endTime: "10:00" },
      { day: "Wednesday", startTime: "09:00", endTime: "10:00" },
      { day: "Friday", startTime: "09:00", endTime: "10:00" },
    ],
    students: demoUsers.filter((u) => u.role === "student").map((u) => u.id),
    roomNo: "LH-201",
    wifiSSID: "College-LH201",
    isArchived: false,
    createdAt: "2024-06-01",
  },
  {
    id: "class-002",
    subjectId: "CS302",
    name: "Database Management Systems",
    classroomId: "classroom-001",
    teacherId: "teacher-001",
    schedule: [
      { day: "Tuesday", startTime: "11:00", endTime: "12:00" },
      { day: "Thursday", startTime: "11:00", endTime: "12:00" },
    ],
    students: demoUsers
      .filter((u) => u.role === "student")
      .slice(0, 6)
      .map((u) => u.id),
    roomNo: "LH-305",
    wifiSSID: "College-LH305",
    isArchived: false,
    createdAt: "2024-06-01",
  },
  {
    id: "class-003",
    subjectId: "CS303",
    name: "Operating Systems",
    classroomId: "classroom-001",
    teacherId: "teacher-002",
    schedule: [
      { day: "Monday", startTime: "14:00", endTime: "15:00" },
      { day: "Wednesday", startTime: "14:00", endTime: "15:00" },
    ],
    students: demoUsers
      .filter((u) => u.role === "student")
      .slice(2, 8)
      .map((u) => u.id),
    roomNo: "LH-102",
    wifiSSID: "College-LH102",
    isArchived: false,
    createdAt: "2024-06-01",
  },
  {
    id: "class-004",
    subjectId: "CS304",
    name: "Computer Networks",
    classroomId: "classroom-002",
    teacherId: "teacher-002",
    schedule: [
      { day: "Tuesday", startTime: "14:00", endTime: "15:00" },
      { day: "Friday", startTime: "14:00", endTime: "15:00" },
    ],
    students: demoUsers
      .filter((u) => u.role === "student")
      .slice(0, 5)
      .map((u) => u.id),
    roomNo: "LH-102",
    wifiSSID: "College-LH102",
    isArchived: false,
    createdAt: "2024-07-01",
  },
]

// Backward compatibility: map subjects to old Class interface
export const demoClasses = demoSubjects.map((s) => ({
  ...s,
  code: s.subjectId,
}))

// Timetable Slots
export const demoTimetable: TimetableSlot[] = demoSubjects.flatMap((subject) =>
  subject.schedule.map((sch, i) => ({
    id: `tt-${subject.id}-${i}`,
    subjectId: subject.id,
    classroomId: subject.classroomId,
    teacherId: subject.teacherId,
    day: sch.day,
    startTime: sch.startTime,
    endTime: sch.endTime,
    roomNo: subject.roomNo,
  }))
)

// Holidays
export function generateHolidays(): Holiday[] {
  const holidays: Holiday[] = []
  const now = new Date()
  const year = now.getFullYear()

  // Auto-mark weekends for next 60 days
  for (let i = -30; i <= 30; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() + i)
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      holidays.push({
        id: `weekend-${date.toISOString().split("T")[0]}`,
        date: date.toISOString().split("T")[0],
        name: dayOfWeek === 0 ? "Sunday" : "Saturday",
        type: "weekend",
      })
    }
  }

  // Festival/Institutional holidays
  const festivalHolidays: Omit<Holiday, "id">[] = [
    { date: `${year}-01-26`, name: "Republic Day", type: "festival" },
    { date: `${year}-03-14`, name: "Holi", type: "festival" },
    { date: `${year}-08-15`, name: "Independence Day", type: "festival" },
    { date: `${year}-10-02`, name: "Gandhi Jayanti", type: "festival" },
    { date: `${year}-10-24`, name: "Dussehra", type: "festival" },
    { date: `${year}-11-12`, name: "Diwali", type: "festival" },
    { date: `${year}-12-25`, name: "Christmas", type: "festival" },
    { date: `${year}-03-01`, name: "Annual Day", type: "institutional" },
    { date: `${year}-09-05`, name: "Teachers Day", type: "institutional" },
  ]

  festivalHolidays.forEach((h) => {
    holidays.push({ ...h, id: `holiday-${h.date}` })
  })

  return holidays
}

export const demoHolidays = generateHolidays()

export function isHoliday(dateStr: string): Holiday | undefined {
  return demoHolidays.find((h) => h.date === dateStr)
}

// Generate attendance records for the past 30 days
function generateAttendanceRecords(): AttendanceSession[] {
  const sessions: AttendanceSession[] = []
  const now = new Date()

  for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
    const date = new Date(now)
    date.setDate(date.getDate() - dayOffset)
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" })
    const dateStr = date.toISOString().split("T")[0]

    // Skip holidays
    if (isHoliday(dateStr)) continue

    demoSubjects.forEach((subject) => {
      const matchingSchedule = subject.schedule.find((s) => s.day === dayName)
      if (!matchingSchedule) return

      const sessionId = `session-${subject.id}-${dateStr}`
      const records: AttendanceRecord[] = subject.students.map((studentId) => {
        const student = demoUsers.find((u) => u.id === studentId)
        const isPresent = Math.random() > 0.18
        const isLate = isPresent && Math.random() > 0.85
        const fraudScore = Math.random() * 15

        return {
          id: `record-${sessionId}-${studentId}`,
          sessionId,
          studentId,
          studentName: student?.name || "Unknown",
          timestamp: `${dateStr}T${matchingSchedule.startTime}:${String(Math.floor(Math.random() * 59)).padStart(2, "0")}`,
          status: isPresent ? (isLate ? "late" : "present") : "absent",
          verificationMethod: isPresent ? ["qr", "gps", "wifi"] : [],
          location: isPresent
            ? { lat: 19.076 + Math.random() * 0.001, lng: 72.877 + Math.random() * 0.001 }
            : undefined,
          fraudScore,
          flagged: fraudScore > 12,
          flagReason: fraudScore > 12 ? "Unusual location pattern" : undefined,
          synced: dayOffset > 0,
          subjectId: subject.id,
        }
      })

      sessions.push({
        id: sessionId,
        classId: subject.id,
        subjectId: subject.id,
        teacherId: subject.teacherId,
        date: dateStr,
        startTime: matchingSchedule.startTime,
        endTime: matchingSchedule.endTime,
        qrSecret: `secret-${sessionId}-${Date.now()}`,
        isActive: dayOffset === 0,
        geoFence: { lat: 19.076, lng: 72.877, radiusMeters: 5 },
        records,
      })
    })
  }

  return sessions
}

export const demoSessions = generateAttendanceRecords()

// Engagement scores
export const demoEngagement: EngagementScore[] = demoStudents.map(
  (student) => ({
    studentId: student.id,
    classId: "class-001",
    quizParticipation: Math.floor(60 + Math.random() * 40),
    pollResponses: Math.floor(50 + Math.random() * 50),
    assignmentSubmissions: Math.floor(70 + Math.random() * 30),
    questionsAsked: Math.floor(Math.random() * 20),
    overallScore: Math.floor(55 + Math.random() * 45),
    trend: (["up", "down", "stable"] as const)[Math.floor(Math.random() * 3)],
    weeklyScores: Array.from({ length: 8 }, () =>
      Math.floor(40 + Math.random() * 60)
    ),
  })
)

// Analytics
export function getDemoAnalytics(): Analytics {
  const allRecords = demoSessions.flatMap((s) => s.records)
  const presentRecords = allRecords.filter(
    (r) => r.status === "present" || r.status === "late"
  )
  const avgAttendance =
    allRecords.length > 0
      ? Math.round((presentRecords.length / allRecords.length) * 100)
      : 0

  const defaulters = demoStudents.filter((student) => {
    const studentRecords = allRecords.filter(
      (r) => r.studentId === student.id
    )
    const studentPresent = studentRecords.filter(
      (r) => r.status === "present" || r.status === "late"
    )
    return (
      studentRecords.length > 0 &&
      (studentPresent.length / studentRecords.length) * 100 < 75
    )
  })

  const now = new Date()
  const attendanceTrend = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - (29 - i))
    const dateStr = date.toISOString().split("T")[0]
    const daySessions = demoSessions.filter((s) => s.date === dateStr)
    const dayRecords = daySessions.flatMap((s) => s.records)
    const dayPresent = dayRecords.filter(
      (r) => r.status === "present" || r.status === "late"
    )
    const pct =
      dayRecords.length > 0
        ? Math.round((dayPresent.length / dayRecords.length) * 100)
        : 0
    return { date: dateStr, percentage: pct }
  }).filter((d) => d.percentage > 0)

  return {
    totalStudents: demoStudents.length,
    averageAttendance: avgAttendance,
    totalClasses: demoSessions.length,
    defaulterCount: defaulters.length,
    attendanceTrend,
    classWiseAttendance: demoSubjects.map((subject) => {
      const classRecords = demoSessions
        .filter((s) => s.classId === subject.id)
        .flatMap((s) => s.records)
      const classPresent = classRecords.filter(
        (r) => r.status === "present" || r.status === "late"
      )
      return {
        className: subject.name,
        subjectId: subject.id,
        percentage:
          classRecords.length > 0
            ? Math.round(
                (classPresent.length / classRecords.length) * 100
              )
            : 0,
      }
    }),
    engagementOverview: [
      { metric: "Quiz Participation", value: 78 },
      { metric: "Poll Responses", value: 65 },
      { metric: "Assignments", value: 85 },
      { metric: "Questions Asked", value: 42 },
    ],
  }
}

export function getStudentAttendance(studentId: string) {
  const allRecords = demoSessions.flatMap((s) =>
    s.records.filter((r) => r.studentId === studentId)
  )
  const present = allRecords.filter(
    (r) => r.status === "present" || r.status === "late"
  )
  const percentage =
    allRecords.length > 0
      ? Math.round((present.length / allRecords.length) * 100)
      : 0

  return {
    total: allRecords.length,
    present: present.length,
    absent: allRecords.filter((r) => r.status === "absent").length,
    late: allRecords.filter((r) => r.status === "late").length,
    percentage,
    records: allRecords,
  }
}

// Subject-wise attendance for a student
export function getStudentSubjectAttendance(studentId: string) {
  return demoSubjects
    .filter((subject) => subject.students.includes(studentId))
    .map((subject) => {
      const subjectSessions = demoSessions.filter((s) => s.classId === subject.id)
      const subjectRecords = subjectSessions
        .flatMap((s) => s.records)
        .filter((r) => r.studentId === studentId)
      const present = subjectRecords.filter(
        (r) => r.status === "present" || r.status === "late"
      )
      const percentage =
        subjectRecords.length > 0
          ? Math.round((present.length / subjectRecords.length) * 100)
          : 0

      return {
        subjectId: subject.id,
        subjectCode: subject.subjectId,
        subjectName: subject.name,
        teacherId: subject.teacherId,
        teacherName: demoUsers.find((u) => u.id === subject.teacherId)?.name || "Unknown",
        total: subjectRecords.length,
        present: present.length,
        absent: subjectRecords.filter((r) => r.status === "absent").length,
        late: subjectRecords.filter((r) => r.status === "late").length,
        percentage,
        isLow: percentage < 75,
        records: subjectRecords,
      }
    })
}

export function getClassAttendanceForDate(classId: string, date: string) {
  const session = demoSessions.find(
    (s) => s.classId === classId && s.date === date
  )
  return session?.records || []
}

// Live class detection
export function getLiveClasses(): LiveClassStatus[] {
  const now = new Date()
  const currentDay = now.toLocaleDateString("en-US", { weekday: "long" })
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

  return demoSubjects
    .filter((subject) => !subject.isArchived)
    .map((subject) => {
      const todaySlot = subject.schedule.find((s) => s.day === currentDay)
      if (!todaySlot) return null

      const isLive = currentTime >= todaySlot.startTime && currentTime <= todaySlot.endTime
      const teacher = demoUsers.find((u) => u.id === subject.teacherId)

      return {
        subjectId: subject.id,
        subjectName: subject.name,
        teacherName: teacher?.name || "Unknown",
        roomNo: subject.roomNo,
        startTime: todaySlot.startTime,
        endTime: todaySlot.endTime,
        isLive,
      }
    })
    .filter(Boolean) as LiveClassStatus[]
}

// Notifications
export function getStudentNotifications(studentId: string): Notification[] {
  const now = new Date()
  const notifications: Notification[] = []

  // Check recent attendance
  const recentRecords = demoSessions
    .filter((s) => {
      const sessionDate = new Date(s.date)
      const diff = (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
      return diff <= 2
    })
    .flatMap((s) => s.records.filter((r) => r.studentId === studentId))

  recentRecords.forEach((record) => {
    const session = demoSessions.find((s) => s.id === record.sessionId)
    const subject = demoSubjects.find((sub) => sub.id === session?.classId)
    notifications.push({
      id: `notif-${record.id}`,
      userId: studentId,
      title: record.status === "present" || record.status === "late"
        ? `Marked ${record.status} - ${subject?.name || "Unknown"}`
        : `Absent - ${subject?.name || "Unknown"}`,
      message: record.status === "present"
        ? `You were marked present at ${record.timestamp.split("T")[1]?.slice(0, 5) || "N/A"}`
        : record.status === "late"
          ? `You were marked late at ${record.timestamp.split("T")[1]?.slice(0, 5) || "N/A"}`
          : `You were marked absent for ${subject?.name || "this class"}`,
      type: "attendance",
      read: Math.random() > 0.4,
      timestamp: record.timestamp,
    })
  })

  // Live class notifications
  const liveClasses = getLiveClasses()
  liveClasses.filter((lc) => lc.isLive).forEach((lc) => {
    const subject = demoSubjects.find((s) => s.id === lc.subjectId)
    if (subject?.students.includes(studentId)) {
      notifications.push({
        id: `live-${lc.subjectId}`,
        userId: studentId,
        title: "Class is Live Now",
        message: `${lc.subjectName} with ${lc.teacherName} in ${lc.roomNo}`,
        type: "live_class",
        read: false,
        timestamp: new Date().toISOString(),
      })
    }
  })

  // Holiday notification
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split("T")[0]
  const tomorrowHoliday = demoHolidays.find((h) => h.date === tomorrowStr && h.type !== "weekend")
  if (tomorrowHoliday) {
    notifications.push({
      id: `holiday-${tomorrowHoliday.id}`,
      userId: studentId,
      title: "Holiday Tomorrow",
      message: `Tomorrow is ${tomorrowHoliday.name}. No classes scheduled.`,
      type: "holiday",
      read: false,
      timestamp: new Date().toISOString(),
    })
  }

  return notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export const demoSyncStatus: SyncStatus = {
  pendingRecords: 3,
  lastSyncTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  isSyncing: false,
  failedRecords: 0,
}
