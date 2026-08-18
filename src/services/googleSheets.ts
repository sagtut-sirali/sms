import { 
  Student, 
  StudentGroup, 
  AttendanceRecord, 
  TestScore, 
  SubjectSyllabus, 
  FeeRecord 
} from '../types';

export interface SheetTabInfo {
  sheetId: number;
  title: string;
  rowCount?: number;
  columnCount?: number;
}

export interface SpreadsheetDetails {
  id: string;
  title: string;
  url: string;
  sheets: SheetTabInfo[];
}

export interface FullTuitionDataset {
  students: Student[];
  groups: StudentGroup[];
  attendance: AttendanceRecord[];
  testScores: TestScore[];
  syllabus: SubjectSyllabus[];
  fees: FeeRecord[];
}

// Standard Schema Headers for Google Sheets Database Tabs
export const SCHEMA_HEADERS = {
  Students: [
    'ID',
    'Roll No',
    'Full Name',
    'Phone',
    'Parent Name',
    'Parent Phone',
    'Email',
    'Grade',
    'Board',
    'Tuition Mode',
    'Time Slot',
    'Subjects',
    'Monthly Fee',
    'Fee Due Day',
    'Joining Date',
    'Address / Meeting Link',
    'Notes',
    'Is Active'
  ],
  Groups: [
    'ID',
    'Batch Name',
    'Grade',
    'Subject',
    'Tuition Mode',
    'Time Slot',
    'Monthly Fee Per Student',
    'Enrolled Student IDs',
    'Meeting Link / Location',
    'Created At'
  ],
  Attendance: [
    'ID',
    'Date',
    'Student ID',
    'Status',
    'Topic Covered',
    'Remarks'
  ],
  TestScores: [
    'ID',
    'Student ID',
    'Subject',
    'Test Title',
    'Test Date',
    'Max Marks',
    'Obtained Marks',
    'Percentage',
    'Grade',
    'Remarks'
  ],
  Syllabus: [
    'ID',
    'Subject',
    'Grade',
    'Chapters JSON'
  ],
  Fees: [
    'ID',
    'Student ID',
    'Month',
    'Year',
    'Total Fee',
    'Discount',
    'Paid Amount',
    'Due Amount',
    'Status',
    'Due Date',
    'Paid Date',
    'Payment Method',
    'Receipt No',
    'Remarks'
  ]
};

const BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

/**
 * Fetch spreadsheet metadata and list of sheet tabs
 */
export async function fetchSpreadsheetInfo(
  accessToken: string,
  spreadsheetId: string
): Promise<SpreadsheetDetails> {
  const res = await fetch(`${BASE_URL}/${spreadsheetId}?fields=spreadsheetId,properties.title,sheets.properties`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch spreadsheet info (HTTP ${res.status})`);
  }

  const data = await res.json();
  const sheets: SheetTabInfo[] = (data.sheets || []).map((s: any) => ({
    sheetId: s.properties.sheetId,
    title: s.properties.title,
    rowCount: s.properties.gridProperties?.rowCount,
    columnCount: s.properties.gridProperties?.columnCount,
  }));

  return {
    id: data.spreadsheetId,
    title: data.properties?.title || 'Untitled Spreadsheet',
    url: `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
    sheets,
  };
}

/**
 * Create a new ready-to-use Google Sheet database with all standard tabs formatted
 */
export async function createTuitionDatabaseSpreadsheet(
  accessToken: string,
  title: string = 'Sir Ali Preparations - Tuition Database'
): Promise<SpreadsheetDetails> {
  const requestBody = {
    properties: {
      title,
    },
    sheets: [
      { properties: { title: 'Students', gridProperties: { frozenRowCount: 1 } } },
      { properties: { title: 'Groups', gridProperties: { frozenRowCount: 1 } } },
      { properties: { title: 'Attendance', gridProperties: { frozenRowCount: 1 } } },
      { properties: { title: 'TestScores', gridProperties: { frozenRowCount: 1 } } },
      { properties: { title: 'Syllabus', gridProperties: { frozenRowCount: 1 } } },
      { properties: { title: 'Fees', gridProperties: { frozenRowCount: 1 } } },
    ],
  };

  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to create new spreadsheet');
  }

  const created = await res.json();
  return fetchSpreadsheetInfo(accessToken, created.spreadsheetId);
}

/**
 * Read cell values for a given sheet / range
 */
export async function readSheetValues(
  accessToken: string,
  spreadsheetId: string,
  range: string
): Promise<any[][]> {
  const encodedRange = encodeURIComponent(range);
  const res = await fetch(`${BASE_URL}/${spreadsheetId}/values/${encodedRange}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to read range ${range}`);
  }

  const data = await res.json();
  return data.values || [];
}

/**
 * Overwrite / Write cell values to a given sheet
 */
export async function writeSheetValues(
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: any[][]
): Promise<void> {
  const encodedRange = encodeURIComponent(range);
  const res = await fetch(
    `${BASE_URL}/${spreadsheetId}/values/${encodedRange}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to write values to ${range}`);
  }
}

/**
 * Clear values in a sheet
 */
export async function clearSheetValues(
  accessToken: string,
  spreadsheetId: string,
  range: string
): Promise<void> {
  const encodedRange = encodeURIComponent(range);
  const res = await fetch(`${BASE_URL}/${spreadsheetId}/values/${encodedRange}:clear`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to clear ${range}`);
  }
}

/**
 * Add a new tab to existing spreadsheet
 */
export async function addSheetTab(
  accessToken: string,
  spreadsheetId: string,
  title: string
): Promise<void> {
  const body = {
    requests: [
      {
        addSheet: {
          properties: {
            title,
          },
        },
      },
    ],
  };

  const res = await fetch(`${BASE_URL}/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to add tab '${title}'`);
  }
}

/**
 * Delete a tab from the spreadsheet
 */
export async function deleteSheetTab(
  accessToken: string,
  spreadsheetId: string,
  sheetId: number
): Promise<void> {
  const body = {
    requests: [
      {
        deleteSheet: {
          sheetId,
        },
      },
    ],
  };

  const res = await fetch(`${BASE_URL}/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to delete tab`);
  }
}

/**
 * Full Database Sync: Push local data to Google Sheets tabs
 */
export async function syncAllTablesToGoogleSheets(
  accessToken: string,
  spreadsheetId: string,
  dataset: FullTuitionDataset
): Promise<{ success: boolean; timestamp: string }> {
  // 1. Check existing sheets and ensure all required tabs exist
  const info = await fetchSpreadsheetInfo(accessToken, spreadsheetId);
  const existingTabNames = new Set(info.sheets.map((s) => s.title));

  const requiredTabs = ['Students', 'Groups', 'Attendance', 'TestScores', 'Syllabus', 'Fees'];
  for (const tab of requiredTabs) {
    if (!existingTabNames.has(tab)) {
      try {
        await addSheetTab(accessToken, spreadsheetId, tab);
      } catch (e) {
        console.warn(`Tab ${tab} might already exist or could not be created:`, e);
      }
    }
  }

  // 2. Prepare tabular data
  const studentsRows: any[][] = [
    SCHEMA_HEADERS.Students,
    ...dataset.students.map((s) => [
      s.id,
      s.rollNo,
      s.name,
      s.phone || '',
      s.parentName || '',
      s.parentPhone || '',
      s.email || '',
      s.grade || '',
      s.board || '',
      s.tuitionMode,
      s.timeSlot || '',
      s.subjects.join(', '),
      s.monthlyFee,
      s.feeDueDay || 5,
      s.joiningDate || '',
      s.addressOrLocation || '',
      s.notes || '',
      s.isActive !== false ? 'TRUE' : 'FALSE',
    ]),
  ];

  const groupsRows: any[][] = [
    SCHEMA_HEADERS.Groups,
    ...dataset.groups.map((g) => [
      g.id,
      g.name,
      g.grade,
      g.subject,
      g.tuitionMode,
      g.timeSlot,
      g.monthlyFeePerStudent,
      g.studentIds.join(','),
      g.meetingLinkOrLocation || '',
      g.createdAt || '',
    ]),
  ];

  const attendanceRows: any[][] = [
    SCHEMA_HEADERS.Attendance,
    ...dataset.attendance.map((a) => [
      a.id,
      a.date,
      a.studentId,
      a.status,
      a.topicCovered || '',
      a.remarks || '',
    ]),
  ];

  const testScoresRows: any[][] = [
    SCHEMA_HEADERS.TestScores,
    ...dataset.testScores.map((t) => [
      t.id,
      t.studentId,
      t.subject,
      t.testTitle,
      t.testDate,
      t.maxMarks,
      t.obtainedMarks,
      t.percentage,
      t.grade,
      t.remarks || '',
    ]),
  ];

  const syllabusRows: any[][] = [
    SCHEMA_HEADERS.Syllabus,
    ...dataset.syllabus.map((s) => [
      s.id,
      s.subject,
      s.grade,
      JSON.stringify(s.chapters),
    ]),
  ];

  const feesRows: any[][] = [
    SCHEMA_HEADERS.Fees,
    ...dataset.fees.map((f) => [
      f.id,
      f.studentId,
      f.month,
      f.year,
      f.totalFee,
      f.discount,
      f.paidAmount,
      f.dueAmount,
      f.status,
      f.dueDate,
      f.paidDate || '',
      f.paymentMethod || '',
      f.receiptNo || '',
      f.remarks || '',
    ]),
  ];

  // 3. Batch write all tabs
  await Promise.all([
    writeSheetValues(accessToken, spreadsheetId, 'Students!A1:R', studentsRows),
    writeSheetValues(accessToken, spreadsheetId, 'Groups!A1:J', groupsRows),
    writeSheetValues(accessToken, spreadsheetId, 'Attendance!A1:F', attendanceRows),
    writeSheetValues(accessToken, spreadsheetId, 'TestScores!A1:J', testScoresRows),
    writeSheetValues(accessToken, spreadsheetId, 'Syllabus!A1:D', syllabusRows),
    writeSheetValues(accessToken, spreadsheetId, 'Fees!A1:N', feesRows),
  ]);

  return {
    success: true,
    timestamp: new Date().toLocaleTimeString(),
  };
}

/**
 * Pull All Data from Google Sheets Database into app state
 */
export async function pullAllTablesFromGoogleSheets(
  accessToken: string,
  spreadsheetId: string
): Promise<FullTuitionDataset> {
  const [
    studentsRaw,
    groupsRaw,
    attendanceRaw,
    testsRaw,
    syllabusRaw,
    feesRaw,
  ] = await Promise.all([
    readSheetValues(accessToken, spreadsheetId, 'Students!A2:R').catch(() => []),
    readSheetValues(accessToken, spreadsheetId, 'Groups!A2:J').catch(() => []),
    readSheetValues(accessToken, spreadsheetId, 'Attendance!A2:F').catch(() => []),
    readSheetValues(accessToken, spreadsheetId, 'TestScores!A2:J').catch(() => []),
    readSheetValues(accessToken, spreadsheetId, 'Syllabus!A2:D').catch(() => []),
    readSheetValues(accessToken, spreadsheetId, 'Fees!A2:N').catch(() => []),
  ]);

  const students: Student[] = studentsRaw
    .filter((row) => row && row[0] && row[2])
    .map((row) => ({
      id: String(row[0] || `std-${Date.now()}`),
      rollNo: String(row[1] || 'SAP-001'),
      name: String(row[2] || 'Unnamed Student'),
      phone: String(row[3] || ''),
      parentName: String(row[4] || 'Parent'),
      parentPhone: String(row[5] || ''),
      email: row[6] ? String(row[6]) : undefined,
      grade: String(row[7] || "9th / IX"),
      board: String(row[8] || 'Federal Board'),
      tuitionMode: (row[9] === 'online' ? 'online' : 'home'),
      timeSlot: String(row[10] || '04:00 PM - 05:30 PM (Mon, Wed, Fri)'),
      subjects: row[11] ? String(row[11]).split(',').map((s: string) => s.trim()).filter(Boolean) : ['General'],
      monthlyFee: Number(row[12]) || 15000,
      feeDueDay: Number(row[13]) || 5,
      joiningDate: String(row[14] || new Date().toISOString().slice(0, 10)),
      addressOrLocation: row[15] ? String(row[15]) : undefined,
      notes: row[16] ? String(row[16]) : undefined,
      isActive: String(row[17]).toUpperCase() !== 'FALSE',
    }));

  const groups: StudentGroup[] = groupsRaw
    .filter((row) => row && row[0] && row[1])
    .map((row) => ({
      id: String(row[0]),
      name: String(row[1]),
      grade: String(row[2] || '11th / AS'),
      subject: String(row[3] || 'Physics'),
      tuitionMode: (row[4] === 'online' ? 'online' : 'home'),
      timeSlot: String(row[5] || '04:00 PM - 05:30 PM (Mon, Wed, Fri)'),
      monthlyFeePerStudent: Number(row[6]) || 18000,
      studentIds: row[7] ? String(row[7]).split(',').map((id: string) => id.trim()).filter(Boolean) : [],
      meetingLinkOrLocation: row[8] ? String(row[8]) : undefined,
      createdAt: String(row[9] || new Date().toISOString().slice(0, 10)),
    }));

  const attendance: AttendanceRecord[] = attendanceRaw
    .filter((row) => row && row[0] && row[1] && row[2])
    .map((row) => ({
      id: String(row[0]),
      date: String(row[1]),
      studentId: String(row[2]),
      status: (['present', 'absent', 'late', 'excused'].includes(row[3]) ? row[3] : 'present') as any,
      topicCovered: row[4] ? String(row[4]) : undefined,
      remarks: row[5] ? String(row[5]) : undefined,
    }));

  const testScores: TestScore[] = testsRaw
    .filter((row) => row && row[0] && row[1])
    .map((row) => ({
      id: String(row[0]),
      studentId: String(row[1]),
      subject: String(row[2] || 'Physics'),
      testTitle: String(row[3] || 'Class Quiz'),
      testDate: String(row[4] || new Date().toISOString().slice(0, 10)),
      maxMarks: Number(row[5]) || 100,
      obtainedMarks: Number(row[6]) || 0,
      percentage: Number(row[7]) || 0,
      grade: String(row[8] || 'A'),
      remarks: row[9] ? String(row[9]) : undefined,
    }));

  const syllabus: SubjectSyllabus[] = syllabusRaw
    .filter((row) => row && row[0] && row[1])
    .map((row) => {
      let chapters: any[] = [];
      try {
        if (row[3]) {
          chapters = JSON.parse(row[3]);
        }
      } catch (e) {
        chapters = [];
      }
      return {
        id: String(row[0]),
        subject: String(row[1]),
        grade: String(row[2] || '11th / AS'),
        chapters,
      };
    });

  const fees: FeeRecord[] = feesRaw
    .filter((row) => row && row[0] && row[1])
    .map((row) => ({
      id: String(row[0]),
      studentId: String(row[1]),
      month: String(row[2] || 'August 2026'),
      year: Number(row[3]) || 2026,
      totalFee: Number(row[4]) || 15000,
      discount: Number(row[5]) || 0,
      paidAmount: Number(row[6]) || 0,
      dueAmount: Number(row[7]) || 0,
      status: (['paid', 'partial', 'pending', 'overdue'].includes(row[8]) ? row[8] : 'pending') as any,
      dueDate: String(row[9] || new Date().toISOString().slice(0, 10)),
      paidDate: row[10] ? String(row[10]) : undefined,
      paymentMethod: row[11] ? String(row[11]) as any : undefined,
      receiptNo: row[12] ? String(row[12]) : undefined,
      remarks: row[13] ? String(row[13]) : undefined,
    }));

  return {
    students,
    groups,
    attendance,
    testScores,
    syllabus,
    fees,
  };
}
