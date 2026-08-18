import { Student, AttendanceRecord, TestScore, SubjectSyllabus, FeeRecord, StudentGroup } from '../types';
import { INITIAL_STUDENTS, INITIAL_ATTENDANCE, INITIAL_TEST_SCORES, INITIAL_SYLLABUS, INITIAL_FEES, INITIAL_GROUPS } from '../data/initialData';

const KEYS = {
  STUDENTS: 'sir_ali_prep_students_v1',
  GROUPS: 'sir_ali_prep_groups_v1',
  ATTENDANCE: 'sir_ali_prep_attendance_v1',
  TESTS: 'sir_ali_prep_tests_v1',
  SYLLABUS: 'sir_ali_prep_syllabus_v1',
  FEES: 'sir_ali_prep_fees_v1',
  MASTER_PIN: 'sir_ali_prep_master_pin_v1',
  IS_LOCKED: 'sir_ali_prep_is_locked_v1',
  FAILED_ATTEMPTS: 'sir_ali_prep_failed_attempts_v1',
  LOCKOUT_UNTIL: 'sir_ali_prep_lockout_until_v1',
  SECURITY_QUESTION: 'sir_ali_prep_sec_q_v1',
  SECURITY_ANSWER: 'sir_ali_prep_sec_a_v1',
  AUTO_LOCK_MINUTES: 'sir_ali_prep_autolock_mins_v1',
  SECURITY_LOGS: 'sir_ali_prep_sec_logs_v1',
  SHEETS_CONFIG: 'sir_ali_prep_sheets_config_v1',
};

export const DEFAULT_MASTER_PIN = '1234';
export const DEFAULT_SECURITY_QUESTION = 'What is the academy secret passkey?';
export const DEFAULT_SECURITY_ANSWER = 'physics';

// In-memory fallback in case iframe blocks localStorage access
const memoryCache: Record<string, string> = {};

const safeGetItem = (key: string): string | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const val = window.localStorage.getItem(key);
      if (val !== null) return val;
    }
  } catch (e) {
    console.warn(`localStorage read failed for "${key}", using fallback memory`, e);
  }
  return memoryCache[key] ?? null;
};

const safeSetItem = (key: string, value: string) => {
  memoryCache[key] = value;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch (e) {
    console.warn(`localStorage write failed for "${key}", preserved in memory`, e);
  }
};

export const getStoredStudents = (): Student[] => {
  try {
    const raw = safeGetItem(KEYS.STUDENTS);
    return raw ? JSON.parse(raw) : INITIAL_STUDENTS;
  } catch (e) {
    console.error('Failed to parse students from storage', e);
    return INITIAL_STUDENTS;
  }
};

export const setStoredStudents = (students: Student[]) => {
  safeSetItem(KEYS.STUDENTS, JSON.stringify(students));
};

export const getStoredGroups = (): StudentGroup[] => {
  try {
    const raw = safeGetItem(KEYS.GROUPS);
    return raw ? JSON.parse(raw) : INITIAL_GROUPS;
  } catch (e) {
    console.error('Failed to parse groups from storage', e);
    return INITIAL_GROUPS;
  }
};

export const setStoredGroups = (groups: StudentGroup[]) => {
  safeSetItem(KEYS.GROUPS, JSON.stringify(groups));
};

export const getStoredAttendance = (): AttendanceRecord[] => {
  try {
    const raw = safeGetItem(KEYS.ATTENDANCE);
    return raw ? JSON.parse(raw) : INITIAL_ATTENDANCE;
  } catch (e) {
    console.error('Failed to parse attendance from storage', e);
    return INITIAL_ATTENDANCE;
  }
};

export const setStoredAttendance = (attendance: AttendanceRecord[]) => {
  safeSetItem(KEYS.ATTENDANCE, JSON.stringify(attendance));
};

export const getStoredTests = (): TestScore[] => {
  try {
    const raw = safeGetItem(KEYS.TESTS);
    return raw ? JSON.parse(raw) : INITIAL_TEST_SCORES;
  } catch (e) {
    console.error('Failed to parse test scores from storage', e);
    return INITIAL_TEST_SCORES;
  }
};

export const setStoredTests = (tests: TestScore[]) => {
  safeSetItem(KEYS.TESTS, JSON.stringify(tests));
};

export const getStoredSyllabus = (): SubjectSyllabus[] => {
  try {
    const raw = safeGetItem(KEYS.SYLLABUS);
    return raw ? JSON.parse(raw) : INITIAL_SYLLABUS;
  } catch (e) {
    console.error('Failed to parse syllabus from storage', e);
    return INITIAL_SYLLABUS;
  }
};

export const setStoredSyllabus = (syllabus: SubjectSyllabus[]) => {
  safeSetItem(KEYS.SYLLABUS, JSON.stringify(syllabus));
};

export const getStoredFees = (): FeeRecord[] => {
  try {
    const raw = safeGetItem(KEYS.FEES);
    return raw ? JSON.parse(raw) : INITIAL_FEES;
  } catch (e) {
    console.error('Failed to parse fees from storage', e);
    return INITIAL_FEES;
  }
};

export const setStoredFees = (fees: FeeRecord[]) => {
  safeSetItem(KEYS.FEES, JSON.stringify(fees));
};

export const exportAllDataJSON = () => {
  const data = {
    app: 'Sir Ali Preparations - Student Management System',
    exportedAt: new Date().toISOString(),
    students: getStoredStudents(),
    attendance: getStoredAttendance(),
    tests: getStoredTests(),
    syllabus: getStoredSyllabus(),
    fees: getStoredFees()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sir_ali_preparations_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const resetToInitialSampleData = () => {
  setStoredStudents(INITIAL_STUDENTS);
  setStoredAttendance(INITIAL_ATTENDANCE);
  setStoredTests(INITIAL_TEST_SCORES);
  setStoredSyllabus(INITIAL_SYLLABUS);
  setStoredFees(INITIAL_FEES);
};

// ========================
// ADVANCED SECURITY MODULE
// ========================

export const getStoredMasterPin = (): string => {
  const pin = safeGetItem(KEYS.MASTER_PIN);
  if (!pin || pin === 'undefined' || pin === 'null' || pin.trim() === '') {
    return DEFAULT_MASTER_PIN;
  }
  return pin.trim();
};

export const setStoredMasterPin = (newPin: string) => {
  safeSetItem(KEYS.MASTER_PIN, newPin.trim());
};

export const resetMasterPinToDefault = () => {
  safeSetItem(KEYS.MASTER_PIN, DEFAULT_MASTER_PIN);
  safeSetItem(KEYS.FAILED_ATTEMPTS, '0');
  safeSetItem(KEYS.LOCKOUT_UNTIL, '0');
  safeSetItem(KEYS.SECURITY_QUESTION, DEFAULT_SECURITY_QUESTION);
  safeSetItem(KEYS.SECURITY_ANSWER, DEFAULT_SECURITY_ANSWER);
};

export const getStoredIsLocked = (): boolean => {
  const raw = safeGetItem(KEYS.IS_LOCKED);
  return raw === null ? true : raw === 'true';
};

export const setStoredIsLocked = (isLocked: boolean) => {
  safeSetItem(KEYS.IS_LOCKED, isLocked ? 'true' : 'false');
};

export const getStoredFailedAttempts = (): number => {
  const raw = safeGetItem(KEYS.FAILED_ATTEMPTS);
  return raw ? parseInt(raw, 10) || 0 : 0;
};

export const setStoredFailedAttempts = (attempts: number) => {
  safeSetItem(KEYS.FAILED_ATTEMPTS, attempts.toString());
};

export const getStoredLockoutUntil = (): number => {
  const raw = safeGetItem(KEYS.LOCKOUT_UNTIL);
  return raw ? parseInt(raw, 10) || 0 : 0;
};

export const setStoredLockoutUntil = (timestampMs: number) => {
  safeSetItem(KEYS.LOCKOUT_UNTIL, timestampMs.toString());
};

export const getStoredSecurityQuestion = (): { question: string; answer: string } => {
  const question = safeGetItem(KEYS.SECURITY_QUESTION) || DEFAULT_SECURITY_QUESTION;
  const answer = safeGetItem(KEYS.SECURITY_ANSWER) || DEFAULT_SECURITY_ANSWER;
  return { question, answer };
};

export const setStoredSecurityQuestion = (question: string, answer: string) => {
  safeSetItem(KEYS.SECURITY_QUESTION, question);
  safeSetItem(KEYS.SECURITY_ANSWER, answer.toLowerCase().trim());
};

export interface SecurityLogItem {
  id: string;
  timestamp: string;
  type: 'success' | 'failed' | 'lockout' | 'pin_changed' | 'recovery_reset';
  details: string;
}

export const getStoredSecurityLogs = (): SecurityLogItem[] => {
  try {
    const raw = safeGetItem(KEYS.SECURITY_LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const addSecurityLog = (type: SecurityLogItem['type'], details: string) => {
  try {
    const logs = getStoredSecurityLogs();
    const newLog: SecurityLogItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: 'short' }),
      type,
      details,
    };
    const updated = [newLog, ...logs].slice(0, 20); // Keep last 20 events
    safeSetItem(KEYS.SECURITY_LOGS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to write security log', e);
  }
};

export interface StoredSheetsConfig {
  spreadsheetId: string;
  spreadsheetTitle: string;
  spreadsheetUrl: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

export const getStoredSheetsConfig = (): StoredSheetsConfig | null => {
  try {
    const raw = safeGetItem(KEYS.SHEETS_CONFIG);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const setStoredSheetsConfig = (config: StoredSheetsConfig | null) => {
  if (config) {
    safeSetItem(KEYS.SHEETS_CONFIG, JSON.stringify(config));
  } else {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(KEYS.SHEETS_CONFIG);
      }
    } catch (e) {}
  }
};

