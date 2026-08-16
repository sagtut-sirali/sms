export type TuitionMode = 'home' | 'online';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export type PaymentStatus = 'paid' | 'partial' | 'pending' | 'overdue';

export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'EasyPaisa' | 'JazzCash' | 'Other';

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  email?: string;
  grade: string; // e.g., "Class 9 (Matric)", "Class 10", "F.Sc Part 1", "F.Sc Part 2", "O Level (IGCSE)", "A Level"
  board: string; // e.g., "CAIE (Cambridge)", "Federal Board (FBISE)", "Karachi Board (BIEK/BSEK)", "AKU-EB"
  tuitionMode: TuitionMode; // 'home' or 'online'
  addressOrLocation?: string; // For home tuition: student address; For online: Zoom/Google Meet link or notes
  timeSlot: string; // e.g., "4:00 PM - 5:30 PM (Mon, Wed, Fri)"
  subjects: string[]; // e.g. ["Physics", "Mathematics", "Chemistry"]
  monthlyFee: number;
  feeDueDay: number; // e.g. 5th of every month
  joiningDate: string; // YYYY-MM-DD
  avatarBg?: string;
  notes?: string;
  isActive: boolean;
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

export type ActiveTab = 'overview' | 'students' | 'attendance' | 'syllabus' | 'progress' | 'fees';
