import { Student, AttendanceRecord, TestScore, SubjectSyllabus, FeeRecord } from '../types';
import { INITIAL_STUDENTS, INITIAL_ATTENDANCE, INITIAL_TEST_SCORES, INITIAL_SYLLABUS, INITIAL_FEES } from '../data/initialData';

const KEYS = {
  STUDENTS: 'sir_ali_prep_students_v1',
  ATTENDANCE: 'sir_ali_prep_attendance_v1',
  TESTS: 'sir_ali_prep_tests_v1',
  SYLLABUS: 'sir_ali_prep_syllabus_v1',
  FEES: 'sir_ali_prep_fees_v1',
  MASTER_PIN: 'sir_ali_prep_master_pin_v1',
  IS_LOCKED: 'sir_ali_prep_is_locked_v1',
};

export const DEFAULT_MASTER_PIN = '1234';

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

export const getStoredMasterPin = (): string => {
  const pin = safeGetItem(KEYS.MASTER_PIN);
  return pin || DEFAULT_MASTER_PIN;
};

export const setStoredMasterPin = (newPin: string) => {
  safeSetItem(KEYS.MASTER_PIN, newPin);
};

export const getStoredIsLocked = (): boolean => {
  const raw = safeGetItem(KEYS.IS_LOCKED);
  // Default to locked (true) to protect records on fresh visit
  return raw === null ? true : raw === 'true';
};

export const setStoredIsLocked = (isLocked: boolean) => {
  safeSetItem(KEYS.IS_LOCKED, isLocked ? 'true' : 'false');
};

