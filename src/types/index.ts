export type TuitionMode = 'home' | 'online';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export type PaymentStatus = 'paid' | 'partial' | 'pending' | 'overdue';

export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'EasyPaisa' | 'JazzCash' | 'Other';

export interface StudentGroup {
  id: string;
  name: string; // e.g. "A-Levels Physics Alpha Batch", "O'Levels CAIE Stars Group"
  description?: string;
  grade: string; // e.g. "11th / XI year / AS / A1", "12th / XII year / A2", "O'levels Final"
  subject: string; // e.g. "Physics (9702)", "Mathematics (9709)", "Physics & Math"
  tuitionMode: TuitionMode; // 'home' | 'online'
  timeSlot: string; // e.g. "4:00 PM - 5:30 PM (Mon, Wed, Fri)"
  monthlyFeePerStudent: number;
  studentIds: string[]; // Enrolled student IDs
  avatarBg?: string;
  meetingLinkOrLocation?: string; // Zoom / Google Meet Link or Physical Venue
  createdAt: string;
}

export interface StudentSyllabusRecord {
  status: 'pending' | 'in-progress' | 'completed' | 'revised';
  completedDate?: string;
  notes?: string;
}

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  email?: string;
  grade: string; // e.g., "8th / VIII", "9th / IX", "10th / X", "O'levels Final", "11th / XI year / AS / A1", "12th / XII year / A2"
  board: string; // e.g., "Cambridge - CAIE", "Edexcel (Pearson)", "Karachi Board", "Federal Board", "AKU-EB", "Punjab Board"
  tuitionMode: TuitionMode; // 'home' or 'online'
  addressOrLocation?: string; // For home tuition: student address; For online: Zoom/Google Meet link or notes
  timeSlot: string; // e.g., "4:00 PM - 5:30 PM (Mon, Wed, Fri)"
  subjects: string[]; // e.g. ["Physics", "Mathematics", "Chemistry"]
  monthlyFee: number;
  feeDueDay: number; // e.g. 5th of every month
  joiningDate: string; // YYYY-MM-DD
  avatarBg?: string;
  notes?: string;
  groupId?: string; // Primary group ID if assigned
  groupName?: string; // Cached primary group name
  isActive: boolean;
  syllabusProgress?: Record<string, StudentSyllabusRecord>; // [topicId]: record
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  status: AttendanceStatus;
  topicCovered?: string;
  remarks?: string;
}

export interface TestScore {
  id: string;
  studentId: string;
  subject: string;
  testTitle: string; // e.g. "Chapter 3: Vectors & Equilibrium Quiz"
  testDate: string; // YYYY-MM-DD
  maxMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string; // A*, A, B, C, D, F
  remarks?: string;
}

export interface SyllabusTopic {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed' | 'revised';
  completedDate?: string;
  notes?: string;
}

export interface SyllabusChapter {
  id: string;
  chapterNumber: number | string;
  title: string;
  topics: SyllabusTopic[];
}

export interface SubjectSyllabus {
  id: string;
  subject: string;
  grade: string;
  chapters: SyllabusChapter[];
}

export interface FeeRecord {
  id: string;
  studentId: string;
  month: string; // e.g., "August 2026", "July 2026"
  year: number;
  totalFee: number;
  discount: number;
  paidAmount: number;
  dueAmount: number;
  status: PaymentStatus;
  dueDate: string; // YYYY-MM-DD
  paidDate?: string; // YYYY-MM-DD
  paymentMethod?: PaymentMethod;
  receiptNo?: string;
  remarks?: string;
}

export type ActiveTab = 'overview' | 'students' | 'groups' | 'attendance' | 'syllabus' | 'progress' | 'fees' | 'sheets';

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  spreadsheetTitle: string;
  spreadsheetUrl: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

