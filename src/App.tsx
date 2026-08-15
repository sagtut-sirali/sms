/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  getStoredStudents, 
  setStoredStudents, 
  getStoredAttendance, 
  setStoredAttendance, 
  getStoredTests, 
  setStoredTests, 
  getStoredSyllabus, 
  setStoredSyllabus, 
  getStoredFees, 
  setStoredFees,
  exportAllDataJSON,
  resetToInitialSampleData 
} from './utils/storage';
import { Student, AttendanceRecord, TestScore, SubjectSyllabus, FeeRecord, ActiveTab, TuitionMode } from './types';
import { Header } from './components/Header';
import { OverviewTab } from './components/OverviewTab';
import { StudentsTab } from './components/StudentsTab';
import { AttendanceTab } from './components/AttendanceTab';
import { SyllabusTab } from './components/SyllabusTab';
import { ProgressTab } from './components/ProgressTab';
import { FeesTab } from './components/FeesTab';
import { StudentDetailModal } from './components/StudentDetailModal';
import { AddStudentModal } from './components/AddStudentModal';
import { RecordFeeModal } from './components/RecordFeeModal';
import { AddTestModal } from './components/AddTestModal';
import { FeeReceiptModal } from './components/FeeReceiptModal';
import { ReportCardModal } from './components/ReportCardModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const todayDate = '2026-08-15'; // Current system context date

  // Core Data States with localStorage persistence
  const [students, setStudents] = useState<Student[]>(() => getStoredStudents());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => getStoredAttendance());
  const [testScores, setTestScores] = useState<TestScore[]>(() => getStoredTests());
  const [syllabus, setSyllabus] = useState<SubjectSyllabus[]>(() => getStoredSyllabus());
  const [fees, setFees] = useState<FeeRecord[]>(() => getStoredFees());

  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedModeFilter, setSelectedModeFilter] = useState<'all' | TuitionMode>('all');

  // Modal States
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  const [isRecordFeeOpen, setIsRecordFeeOpen] = useState(false);
  const [preSelectedFeeStudent, setPreSelectedFeeStudent] = useState<Student | null>(null);
  const [preSelectedFee, setPreSelectedFee] = useState<FeeRecord | null>(null);

  const [isAddTestOpen, setIsAddTestOpen] = useState(false);
  const [preSelectedTestStudent, setPreSelectedTestStudent] = useState<Student | null>(null);

  const [selectedDetailStudent, setSelectedDetailStudent] = useState<Student | null>(null);
  
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptStudent, setReceiptStudent] = useState<Student | null>(null);
  const [receiptFee, setReceiptFee] = useState<FeeRecord | null>(null);

  const [isReportCardOpen, setIsReportCardOpen] = useState(false);
  const [reportCardStudent, setReportCardStudent] = useState<Student | null>(null);

  // Custom in-app confirmation dialog (avoids browser iframe window.confirm blocking)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync to localStorage
  useEffect(() => {
    setStoredStudents(students);
  }, [students]);

  useEffect(() => {
    setStoredAttendance(attendance);
  }, [attendance]);

  useEffect(() => {
    setStoredTests(testScores);
  }, [testScores]);

  useEffect(() => {
    setStoredSyllabus(syllabus);
  }, [syllabus]);

  useEffect(() => {
    setStoredFees(fees);
  }, [fees]);

  // Handlers for Students
  const handleSaveStudent = (savedStudent: Student) => {
    const exists = students.some(s => s.id === savedStudent.id);
    let updated: Student[];
    if (exists) {
      updated = students.map(s => s.id === savedStudent.id ? savedStudent : s);
      showToast(`Updated student: ${savedStudent.name}`);
    } else {
      updated = [savedStudent, ...students];
      showToast(`Enrolled new student: ${savedStudent.name}`);
      try {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      } catch (e) {
        // Safe fallback
      }
    }
    setStudents(updated);
  };

  const handleDeleteStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Student',
      message: `Are you sure you want to remove ${student.name} from Sir Ali Preparations?`,
      onConfirm: () => {
        setStudents(prev => prev.filter(s => s.id !== studentId));
        showToast(`Removed ${student.name} from active roster.`);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleEditStudent = (student: Student) => {
    setStudentToEdit(student);
    setIsAddStudentOpen(true);
    setSelectedDetailStudent(null);
  };

  // Handlers for Quick Attendance
  const handleQuickMarkAttendance = (studentId: string, status: 'present' | 'absent') => {
    const existingIndex = attendance.findIndex(a => a.studentId === studentId && a.date === todayDate);
    let updated = [...attendance];

    if (existingIndex >= 0) {
      updated[existingIndex] = {
        ...updated[existingIndex],
        status,
      };
    } else {
      updated.push({
        id: `att-${Date.now()}-${studentId}`,
        studentId,
        date: todayDate,
        status,
      });
    }

    setAttendance(updated);
    const student = students.find(s => s.id === studentId);
    showToast(`Marked ${student?.name || 'Student'} as ${status.toUpperCase()} for today.`);
  };

  // Handlers for Fees
  const handleSaveFee = (savedFee: FeeRecord) => {
    const existingIdx = fees.findIndex(f => f.id === savedFee.id);
    let updated: FeeRecord[];
    if (existingIdx >= 0) {
      updated = fees.map(f => f.id === savedFee.id ? savedFee : f);
    } else {
      updated = [savedFee, ...fees];
    }
    setFees(updated);
    showToast(`Fee record updated: ${savedFee.month}`);
    if (savedFee.status === 'paid') {
      try {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      } catch (e) {
        // Safe fallback
      }
    }
  };

  const handleOpenRecordFee = (student?: Student, fee?: FeeRecord) => {
    setPreSelectedFeeStudent(student || null);
    setPreSelectedFee(fee || null);
    setIsRecordFeeOpen(true);
  };

  const handleOpenReceiptModal = (student: Student, fee: FeeRecord) => {
    setReceiptStudent(student);
    setReceiptFee(fee);
    setIsReceiptOpen(true);
  };

  // Handlers for Tests
  const handleSaveTest = (savedTest: TestScore) => {
    setTestScores([savedTest, ...testScores]);
    showToast(`Logged test marks: ${savedTest.testTitle}`);
  };

  const handleDeleteTest = (testId: string) => {
    setTestScores(testScores.filter(t => t.id !== testId));
    showToast('Deleted test record.');
  };

  // Handlers for Report Cards
  const handleGenerateReportCard = (student: Student) => {
    setReportCardStudent(student);
    setIsReportCardOpen(true);
  };

  // Export / Reset Handlers
  const handleExportData = () => {
    exportAllDataJSON();
    showToast('Downloaded complete database backup JSON.');
  };

  const handleResetData = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reset Portal Data',
      message: 'Reset database back to initial sample records for Sir Ali Preparations?',
      onConfirm: () => {
        resetToInitialSampleData();
        setStudents(getStoredStudents());
        setAttendance(getStoredAttendance());
        setTestScores(getStoredTests());
        setSyllabus(getStoredSyllabus());
        setFees(getStoredFees());
        showToast('Database reset to authentic initial sample data.');
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Counts for header badge
  const studentCounts = {
    total: students.length,
    home: students.filter(s => s.tuitionMode === 'home').length,
    online: students.filter(s => s.tuitionMode === 'online').length,
  };

  return (
    <div className="min-h-screen bg-[#F7F8F3] text-[#42473E] flex flex-col font-sans selection:bg-[#CAD3C0] selection:text-[#2D3329]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#3A4035] text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-[#4E5745] flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#CAD3C0]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Application Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedModeFilter={selectedModeFilter}
        setSelectedModeFilter={setSelectedModeFilter}
        onOpenAddStudent={() => {
          setStudentToEdit(null);
          setIsAddStudentOpen(true);
        }}
        onOpenRecordFee={() => handleOpenRecordFee()}
        onOpenAddTest={() => {
          setPreSelectedTestStudent(null);
          setIsAddTestOpen(true);
        }}
        onExportData={handleExportData}
        onResetData={handleResetData}
        studentCounts={studentCounts}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <OverviewTab
            students={students}
            attendance={attendance}
            testScores={testScores}
            syllabus={syllabus}
            fees={fees}
            todayDate={todayDate}
            selectedModeFilter={selectedModeFilter}
            onNavigateTab={setActiveTab}
            onQuickMarkAttendance={handleQuickMarkAttendance}
            onSelectStudent={(student) => setSelectedDetailStudent(student)}
            onOpenAddStudent={() => {
              setStudentToEdit(null);
              setIsAddStudentOpen(true);
            }}
            onOpenRecordFee={() => handleOpenRecordFee()}
            onOpenAddTest={() => {
              setPreSelectedTestStudent(null);
              setIsAddTestOpen(true);
            }}
          />
        )}

        {/* STUDENTS TAB */}
        {activeTab === 'students' && (
          <StudentsTab
            students={students}
            attendance={attendance}
            testScores={testScores}
            fees={fees}
            selectedModeFilter={selectedModeFilter}
            onSelectStudent={(student) => setSelectedDetailStudent(student)}
            onOpenAddStudent={() => {
              setStudentToEdit(null);
              setIsAddStudentOpen(true);
            }}
            onEditStudent={handleEditStudent}
            onDeleteStudent={handleDeleteStudent}
            onGenerateReportCard={handleGenerateReportCard}
            onRecordFeeForStudent={(student) => handleOpenRecordFee(student)}
          />
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === 'attendance' && (
          <AttendanceTab
            students={students}
            attendance={attendance}
            selectedModeFilter={selectedModeFilter}
            onUpdateAttendance={setAttendance}
            todayDate={todayDate}
          />
        )}

        {/* SYLLABUS TAB */}
        {activeTab === 'syllabus' && (
          <SyllabusTab
            syllabusList={syllabus}
            onUpdateSyllabus={setSyllabus}
            todayDate={todayDate}
          />
        )}

        {/* PROGRESS TAB */}
        {activeTab === 'progress' && (
          <ProgressTab
            students={students}
            testScores={testScores}
            attendance={attendance}
            syllabus={syllabus}
            onOpenAddTest={() => {
              setPreSelectedTestStudent(null);
              setIsAddTestOpen(true);
            }}
            onDeleteTest={handleDeleteTest}
            onGenerateReportCard={handleGenerateReportCard}
          />
        )}

        {/* FEES TAB */}
        {activeTab === 'fees' && (
          <FeesTab
            students={students}
            fees={fees}
            selectedModeFilter={selectedModeFilter}
            onOpenRecordFee={handleOpenRecordFee}
            onOpenReceiptModal={handleOpenReceiptModal}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E0E4D9] py-4 text-center text-xs text-[#707969] print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-medium text-[#2D3329]">
            Sir Ali Preparations © 2026 • Private Home & Online Tuitions Management System
          </p>
          <div className="flex items-center gap-4 text-xs text-[#707969]">
            <span>FBISE / CAIE / Punjab Board Coaching</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <StudentDetailModal
        student={selectedDetailStudent}
        onClose={() => setSelectedDetailStudent(null)}
        attendance={attendance}
        testScores={testScores}
        fees={fees}
        syllabus={syllabus}
        onGenerateReportCard={handleGenerateReportCard}
        onRecordFee={(st) => {
          setSelectedDetailStudent(null);
          handleOpenRecordFee(st);
        }}
        onEditStudent={handleEditStudent}
      />

      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => {
          setIsAddStudentOpen(false);
          setStudentToEdit(null);
        }}
        onSave={handleSaveStudent}
        studentToEdit={studentToEdit}
      />

      <RecordFeeModal
        isOpen={isRecordFeeOpen}
        onClose={() => {
          setIsRecordFeeOpen(false);
          setPreSelectedFeeStudent(null);
          setPreSelectedFee(null);
        }}
        students={students}
        onSaveFee={handleSaveFee}
        preSelectedStudent={preSelectedFeeStudent}
        preSelectedFee={preSelectedFee}
      />

      <AddTestModal
        isOpen={isAddTestOpen}
        onClose={() => {
          setIsAddTestOpen(false);
          setPreSelectedTestStudent(null);
        }}
        students={students}
        onSaveTest={handleSaveTest}
        preSelectedStudent={preSelectedTestStudent}
      />

      <FeeReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => {
          setIsReceiptOpen(false);
          setReceiptStudent(null);
          setReceiptFee(null);
        }}
        student={receiptStudent}
        fee={receiptFee}
      />

      <ReportCardModal
        isOpen={isReportCardOpen}
        onClose={() => {
          setIsReportCardOpen(false);
          setReportCardStudent(null);
        }}
        student={reportCardStudent}
        tests={testScores}
        attendance={attendance}
        syllabus={syllabus}
      />

      {/* In-App Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-[#1F231D]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#E0E4D9] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAF1EC] text-[#9E6547] flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#2D3329] font-serif">{confirmDialog.title}</h3>
                <p className="text-xs text-[#707969] mt-0.5">{confirmDialog.message}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E0E4D9]">
              <button
                type="button"
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                className="px-3.5 py-1.5 rounded-xl border border-[#E0E4D9] text-[#707969] hover:text-[#2D3329] hover:bg-[#F0F2EA] text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="px-3.5 py-1.5 rounded-xl bg-[#9E6547] hover:bg-[#8A5538] text-white text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
