import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  User, 
  Calendar, 
  Phone, 
  MapPin, 
  Mail, 
  Award, 
  CheckCircle2, 
  DollarSign, 
  FileText, 
  Send, 
  Home, 
  Laptop, 
  BookOpen,
  Clock,
  Printer,
  Download,
  Plus,
  Edit,
  Trash2,
  Check,
  AlertCircle,
  TrendingUp,
  Layers,
  ChevronRight,
  Receipt,
  CreditCard,
  RotateCcw
} from 'lucide-react';
import { 
  Student, 
  AttendanceRecord, 
  AttendanceStatus, 
  TestScore, 
  FeeRecord, 
  SubjectSyllabus, 
  SyllabusChapter, 
  SyllabusTopic,
  PaymentMethod,
  PaymentStatus 
} from '../types';
import { 
  formatCurrency, 
  getGradeBadgeColor, 
  calculateGrade, 
  generateWhatsAppProgressReport, 
  generateWhatsAppFeeReminder,
  getTodayDateString,
  getCurrentMonthYearString,
  formatDisplayDate
} from '../utils/formatters';
import { downloadStudentProgressTrackerPdf } from '../utils/pdfExport';

interface StudentDetailModalProps {
  student: Student | null;
  onClose: () => void;
  attendance: AttendanceRecord[];
  testScores: TestScore[];
  fees: FeeRecord[];
  syllabus: SubjectSyllabus[];
  isLocked?: boolean;
  todayDate: string;
  onUpdateAttendance: (records: AttendanceRecord[]) => void;
  onUpdateTestScores: (scores: TestScore[]) => void;
  onUpdateSyllabus: (syllabus: SubjectSyllabus[]) => void;
  onUpdateFees: (fees: FeeRecord[]) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onGenerateReportCard: (student: Student) => void;
  onRecordFee: (student: Student) => void;
  onOpenReceiptModal: (student: Student, fee: FeeRecord) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  onClose,
  attendance,
  testScores,
  fees,
  syllabus,
  isLocked = true,
  todayDate,
  onUpdateAttendance,
  onUpdateTestScores,
  onUpdateSyllabus,
  onUpdateFees,
  onEditStudent,
  onDeleteStudent,
  onGenerateReportCard,
  onRecordFee,
  onOpenReceiptModal,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'attendance' | 'tests' | 'syllabus' | 'fees'>('profile');

  // Sub-modal states for Add / Edit activities
  const [attendanceModal, setAttendanceModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    recordId?: string;
    date: string;
    status: AttendanceStatus;
    topicCovered: string;
    remarks: string;
  }>({
    isOpen: false,
    mode: 'add',
    date: todayDate,
    status: 'present',
    topicCovered: '',
    remarks: '',
  });

  const [testModal, setTestModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    testId?: string;
    subject: string;
    testTitle: string;
    testDate: string;
    maxMarks: number;
    obtainedMarks: number;
    remarks: string;
  }>({
    isOpen: false,
    mode: 'add',
    subject: 'Physics',
    testTitle: '',
    testDate: todayDate,
    maxMarks: 50,
    obtainedMarks: 40,
    remarks: '',
  });

  const [topicModal, setTopicModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    subjectId: string;
    chapterId: string;
    topicId?: string;
    title: string;
    status: 'pending' | 'in-progress' | 'completed' | 'revised';
    notes: string;
    completedDate?: string;
    newChapterNumber?: string;
    newChapterTitle?: string;
    isCreatingNewChapter?: boolean;
  }>({
    isOpen: false,
    mode: 'add',
    subjectId: '',
    chapterId: '',
    title: '',
    status: 'pending',
    notes: '',
  });

  const [feeModal, setFeeModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    feeId?: string;
    month: string;
    year: number;
    totalFee: number;
    discount: number;
    paidAmount: number;
    dueDate: string;
    paidDate: string;
    paymentMethod: PaymentMethod;
    receiptNo: string;
    remarks: string;
  }>({
    isOpen: false,
    mode: 'add',
    month: getCurrentMonthYearString(),
    year: new Date().getFullYear(),
    totalFee: 15000,
    discount: 0,
    paidAmount: 15000,
    dueDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-05`,
    paidDate: todayDate,
    paymentMethod: 'Bank Transfer',
    receiptNo: '',
    remarks: '',
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Selected subject inside the syllabus tab
  const [selectedSyllabusSubjectId, setSelectedSyllabusSubjectId] = useState<string>('');

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && student && !attendanceModal.isOpen && !testModal.isOpen && !topicModal.isOpen && !feeModal.isOpen && !deleteConfirm.isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [student, onClose, attendanceModal.isOpen, testModal.isOpen, topicModal.isOpen, feeModal.isOpen, deleteConfirm.isOpen]);

  // Set default syllabus subject on student change
  useEffect(() => {
    if (student && syllabus.length > 0) {
      // Find matching subject from student's enrolled subjects
      const match = syllabus.find(s => 
        student.subjects.some(sub => sub.toLowerCase() === s.subject.toLowerCase())
      );
      setSelectedSyllabusSubjectId(match ? match.id : syllabus[0].id);
    }
  }, [student, syllabus]);

  if (!student) return null;

  // Student specific data
  const studentAttendance = attendance
    .filter(a => a.studentId === student.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const presentCount = studentAttendance.filter(a => a.status === 'present').length;
  const lateCount = studentAttendance.filter(a => a.status === 'late').length;
  const absentCount = studentAttendance.filter(a => a.status === 'absent').length;
  const excusedCount = studentAttendance.filter(a => a.status === 'excused').length;
  const attendanceRate = studentAttendance.length > 0
    ? Math.round(((presentCount + lateCount) / studentAttendance.length) * 100)
    : 100;

  const studentTests = testScores
    .filter(t => t.studentId === student.id)
    .sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime());
  
  const avgTestScore = studentTests.length > 0
    ? Math.round(studentTests.reduce((acc, t) => acc + t.percentage, 0) / studentTests.length)
    : null;

  const studentFees = fees
    .filter(f => f.studentId === student.id)
    .sort((a, b) => b.year - a.year || b.month.localeCompare(a.month));

  const totalFeePaid = studentFees.reduce((acc, f) => acc + f.paidAmount, 0);
  const totalFeeDue = studentFees.reduce((acc, f) => acc + f.dueAmount, 0);
  const latestFee = studentFees[0];

  // Syllabus stats for student's subjects
  const studentSubjectsSyllabus = syllabus.filter(s => 
    student.subjects.some(sub => sub.toLowerCase().includes(s.subject.toLowerCase()) || s.subject.toLowerCase().includes(sub.toLowerCase()))
  );
  const syllabusListToDisplay = studentSubjectsSyllabus.length > 0 ? studentSubjectsSyllabus : syllabus;
  const currentSyllabusSubject = syllabus.find(s => s.id === selectedSyllabusSubjectId) || syllabusListToDisplay[0];

  let totalSubjectTopics = 0;
  let completedSubjectTopics = 0;
  if (currentSyllabusSubject) {
    currentSyllabusSubject.chapters.forEach(ch => {
      ch.topics.forEach(top => {
        totalSubjectTopics++;
        if (top.status === 'completed' || top.status === 'revised') {
          completedSubjectTopics++;
        }
      });
    });
  }
  const currentSubjectProgress = totalSubjectTopics > 0
    ? Math.round((completedSubjectTopics / totalSubjectTopics) * 100)
    : 0;

  const waProgressLink = generateWhatsAppProgressReport(student, studentTests, attendanceRate, currentSubjectProgress);

  // ----------------------------------------------------
  // ATTENDANCE HANDLERS (ADD / EDIT / DELETE / TOGGLE)
  // ----------------------------------------------------
  const handleOpenAddAttendance = () => {
    setAttendanceModal({
      isOpen: true,
      mode: 'add',
      date: todayDate,
      status: 'present',
      topicCovered: '',
      remarks: '',
    });
  };

  const handleOpenEditAttendance = (rec: AttendanceRecord) => {
    setAttendanceModal({
      isOpen: true,
      mode: 'edit',
      recordId: rec.id,
      date: rec.date,
      status: rec.status,
      topicCovered: rec.topicCovered || '',
      remarks: rec.remarks || '',
    });
  };

  const handleSaveAttendanceForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendanceModal.date) return;

    let updated = [...attendance];
    if (attendanceModal.mode === 'add') {
      const newRec: AttendanceRecord = {
        id: `att-${Date.now()}-${student.id}`,
        studentId: student.id,
        date: attendanceModal.date,
        status: attendanceModal.status,
        topicCovered: attendanceModal.topicCovered.trim() || undefined,
        remarks: attendanceModal.remarks.trim() || undefined,
      };
      // Check if already exists for that date
      const existingIdx = updated.findIndex(a => a.studentId === student.id && a.date === attendanceModal.date);
      if (existingIdx >= 0) {
        updated[existingIdx] = newRec;
      } else {
        updated = [newRec, ...updated];
      }
    } else if (attendanceModal.recordId) {
      updated = updated.map(a => {
        if (a.id === attendanceModal.recordId) {
          return {
            ...a,
            date: attendanceModal.date,
            status: attendanceModal.status,
            topicCovered: attendanceModal.topicCovered.trim() || undefined,
            remarks: attendanceModal.remarks.trim() || undefined,
          };
        }
        return a;
      });
    }

    onUpdateAttendance(updated);
    setAttendanceModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleQuickToggleAttendanceStatus = (record: AttendanceRecord) => {
    const statusCycle: AttendanceStatus[] = ['present', 'late', 'absent', 'excused'];
    const nextIdx = (statusCycle.indexOf(record.status) + 1) % statusCycle.length;
    const nextStatus = statusCycle[nextIdx];

    const updated = attendance.map(a => 
      a.id === record.id ? { ...a, status: nextStatus } : a
    );
    onUpdateAttendance(updated);
  };

  const handleDeleteAttendanceRecord = (recordId: string, recDate: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Delete Attendance Session',
      message: `Are you sure you want to remove attendance log for ${recDate}?`,
      onConfirm: () => {
        const updated = attendance.filter(a => a.id !== recordId);
        onUpdateAttendance(updated);
        setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // ----------------------------------------------------
  // TEST SCORES HANDLERS (ADD / EDIT / DELETE)
  // ----------------------------------------------------
  const handleOpenAddTest = () => {
    setTestModal({
      isOpen: true,
      mode: 'add',
      subject: student.subjects[0] || 'Physics',
      testTitle: '',
      testDate: todayDate,
      maxMarks: 50,
      obtainedMarks: 40,
      remarks: '',
    });
  };

  const handleOpenEditTest = (test: TestScore) => {
    setTestModal({
      isOpen: true,
      mode: 'edit',
      testId: test.id,
      subject: test.subject,
      testTitle: test.testTitle,
      testDate: test.testDate,
      maxMarks: test.maxMarks,
      obtainedMarks: test.obtainedMarks,
      remarks: test.remarks || '',
    });
  };

  const handleSaveTestForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testModal.testTitle.trim() || testModal.maxMarks <= 0) return;

    const percentage = Math.round((testModal.obtainedMarks / testModal.maxMarks) * 100);
    const grade = calculateGrade(percentage);

    let updated = [...testScores];
    if (testModal.mode === 'add') {
      const newScore: TestScore = {
        id: `test-${Date.now()}-${student.id}`,
        studentId: student.id,
        subject: testModal.subject.trim(),
        testTitle: testModal.testTitle.trim(),
        testDate: testModal.testDate,
        maxMarks: testModal.maxMarks,
        obtainedMarks: testModal.obtainedMarks,
        percentage,
        grade,
        remarks: testModal.remarks.trim() || undefined,
      };
      updated = [newScore, ...updated];
    } else if (testModal.testId) {
      updated = updated.map(t => {
        if (t.id === testModal.testId) {
          return {
            ...t,
            subject: testModal.subject.trim(),
            testTitle: testModal.testTitle.trim(),
            testDate: testModal.testDate,
            maxMarks: testModal.maxMarks,
            obtainedMarks: testModal.obtainedMarks,
            percentage,
            grade,
            remarks: testModal.remarks.trim() || undefined,
          };
        }
        return t;
      });
    }

    onUpdateTestScores(updated);
    setTestModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleDeleteTestScore = (testId: string, testTitle: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Delete Test Record',
      message: `Are you sure you want to delete "${testTitle}" test score?`,
      onConfirm: () => {
        const updated = testScores.filter(t => t.id !== testId);
        onUpdateTestScores(updated);
        setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // ----------------------------------------------------
  // SYLLABUS HANDLERS (ADD TOPIC / EDIT / STATUS / DELETE)
  // ----------------------------------------------------
  const handleOpenAddTopic = (chapterId?: string) => {
    if (!currentSyllabusSubject) return;
    const targetChapter = chapterId || currentSyllabusSubject.chapters[0]?.id || '';
    setTopicModal({
      isOpen: true,
      mode: 'add',
      subjectId: currentSyllabusSubject.id,
      chapterId: targetChapter,
      title: '',
      status: 'pending',
      notes: '',
      isCreatingNewChapter: !targetChapter,
      newChapterNumber: `${currentSyllabusSubject.chapters.length + 1}`,
      newChapterTitle: '',
    });
  };

  const handleOpenEditTopic = (subjectId: string, chapterId: string, topic: SyllabusTopic) => {
    setTopicModal({
      isOpen: true,
      mode: 'edit',
      subjectId,
      chapterId,
      topicId: topic.id,
      title: topic.title,
      status: topic.status,
      notes: topic.notes || '',
      completedDate: topic.completedDate || todayDate,
    });
  };

  const handleSaveTopicForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicModal.title.trim() || !topicModal.subjectId) return;

    let updatedSyllabus = [...syllabus];
    const subjIdx = updatedSyllabus.findIndex(s => s.id === topicModal.subjectId);
    if (subjIdx === -1) return;

    const subj = { ...updatedSyllabus[subjIdx] };
    let chapters = [...subj.chapters];

    if (topicModal.mode === 'add') {
      let targetChapterId = topicModal.chapterId;

      // If user is creating a new chapter first
      if (topicModal.isCreatingNewChapter && topicModal.newChapterTitle?.trim()) {
        const newCh: SyllabusChapter = {
          id: `ch-${Date.now()}`,
          chapterNumber: topicModal.newChapterNumber?.trim() || `${chapters.length + 1}`,
          title: topicModal.newChapterTitle.trim(),
          topics: [],
        };
        chapters.push(newCh);
        targetChapterId = newCh.id;
      }

      const newTopic: SyllabusTopic = {
        id: `top-${Date.now()}`,
        title: topicModal.title.trim(),
        status: topicModal.status,
        completedDate: (topicModal.status === 'completed' || topicModal.status === 'revised') ? (topicModal.completedDate || todayDate) : undefined,
        notes: topicModal.notes.trim() || undefined,
      };

      chapters = chapters.map(ch => {
        if (ch.id === targetChapterId) {
          return { ...ch, topics: [...ch.topics, newTopic] };
        }
        return ch;
      });
    } else if (topicModal.topicId) {
      chapters = chapters.map(ch => {
        if (ch.id === topicModal.chapterId) {
          const updatedTopics = ch.topics.map(t => {
            if (t.id === topicModal.topicId) {
              return {
                ...t,
                title: topicModal.title.trim(),
                status: topicModal.status,
                completedDate: (topicModal.status === 'completed' || topicModal.status === 'revised') ? (topicModal.completedDate || todayDate) : undefined,
                notes: topicModal.notes.trim() || undefined,
              };
            }
            return t;
          });
          return { ...ch, topics: updatedTopics };
        }
        return ch;
      });
    }

    subj.chapters = chapters;
    updatedSyllabus[subjIdx] = subj;
    onUpdateSyllabus(updatedSyllabus);
    setTopicModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleToggleTopicStatus = (subjectId: string, chapterId: string, topicId: string, currentStatus: string) => {
    const cycle: ('pending' | 'in-progress' | 'completed' | 'revised')[] = ['pending', 'in-progress', 'completed', 'revised'];
    const nextIdx = (cycle.indexOf(currentStatus as any) + 1) % cycle.length;
    const nextStatus = cycle[nextIdx];

    const updated = syllabus.map(subj => {
      if (subj.id !== subjectId) return subj;
      const chs = subj.chapters.map(ch => {
        if (ch.id !== chapterId) return ch;
        const tops = ch.topics.map(top => {
          if (top.id !== topicId) return top;
          return {
            ...top,
            status: nextStatus,
            completedDate: (nextStatus === 'completed' || nextStatus === 'revised') ? (top.completedDate || todayDate) : undefined,
          };
        });
        return { ...ch, topics: tops };
      });
      return { ...subj, chapters: chs };
    });

    onUpdateSyllabus(updated);
  };

  const handleDeleteTopic = (subjectId: string, chapterId: string, topicId: string, topicTitle: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Delete Syllabus Topic',
      message: `Are you sure you want to delete topic "${topicTitle}"?`,
      onConfirm: () => {
        const updated = syllabus.map(subj => {
          if (subj.id !== subjectId) return subj;
          const chs = subj.chapters.map(ch => {
            if (ch.id !== chapterId) return ch;
            return { ...ch, topics: ch.topics.filter(t => t.id !== topicId) };
          });
          return { ...subj, chapters: chs };
        });
        onUpdateSyllabus(updated);
        setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // ----------------------------------------------------
  // FEES HANDLERS (ADD / EDIT / DELETE)
  // ----------------------------------------------------
  const handleOpenAddFee = () => {
    const now = new Date();
    const currentMonth = getCurrentMonthYearString();
    const ymCode = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const randomSuffix = Math.floor(Math.random() * 89 + 10);
    const dueDay = String(student.feeDueDay || 5).padStart(2, '0');
    const monthNum = String(now.getMonth() + 1).padStart(2, '0');

    setFeeModal({
      isOpen: true,
      mode: 'add',
      month: currentMonth,
      year: now.getFullYear(),
      totalFee: student.monthlyFee,
      discount: 0,
      paidAmount: student.monthlyFee,
      dueDate: `${now.getFullYear()}-${monthNum}-${dueDay}`,
      paidDate: todayDate,
      paymentMethod: 'Bank Transfer',
      receiptNo: `SAP-REC-${ymCode}-${randomSuffix}`,
      remarks: 'Full payment received',
    });
  };

  const handleOpenEditFee = (fee: FeeRecord) => {
    setFeeModal({
      isOpen: true,
      mode: 'edit',
      feeId: fee.id,
      month: fee.month,
      year: fee.year,
      totalFee: fee.totalFee,
      discount: fee.discount || 0,
      paidAmount: fee.paidAmount,
      dueDate: fee.dueDate,
      paidDate: fee.paidDate || todayDate,
      paymentMethod: fee.paymentMethod || 'Bank Transfer',
      receiptNo: fee.receiptNo || '',
      remarks: fee.remarks || '',
    });
  };

  const handleSaveFeeForm = (e: React.FormEvent) => {
    e.preventDefault();
    const netPayable = Math.max(0, feeModal.totalFee - feeModal.discount);
    const dueAmount = Math.max(0, netPayable - feeModal.paidAmount);
    let status: PaymentStatus = 'pending';
    if (dueAmount === 0 && feeModal.paidAmount > 0) {
      status = 'paid';
    } else if (feeModal.paidAmount > 0 && dueAmount > 0) {
      status = 'partial';
    } else if (new Date(feeModal.dueDate) < new Date(todayDate)) {
      status = 'overdue';
    }

    let updated = [...fees];
    if (feeModal.mode === 'add') {
      const newFee: FeeRecord = {
        id: `fee-${Date.now()}-${student.id}`,
        studentId: student.id,
        month: feeModal.month,
        year: feeModal.year,
        totalFee: feeModal.totalFee,
        discount: feeModal.discount,
        paidAmount: feeModal.paidAmount,
        dueAmount,
        status,
        dueDate: feeModal.dueDate,
        paidDate: feeModal.paidAmount > 0 ? feeModal.paidDate : undefined,
        paymentMethod: feeModal.paidAmount > 0 ? feeModal.paymentMethod : undefined,
        receiptNo: feeModal.receiptNo.trim() || undefined,
        remarks: feeModal.remarks.trim() || undefined,
      };
      // If record for this month already exists, replace it
      const existingIdx = updated.findIndex(f => f.studentId === student.id && f.month === feeModal.month && f.year === feeModal.year);
      if (existingIdx >= 0) {
        updated[existingIdx] = newFee;
      } else {
        updated = [newFee, ...updated];
      }
    } else if (feeModal.feeId) {
      updated = updated.map(f => {
        if (f.id === feeModal.feeId) {
          return {
            ...f,
            month: feeModal.month,
            year: feeModal.year,
            totalFee: feeModal.totalFee,
            discount: feeModal.discount,
            paidAmount: feeModal.paidAmount,
            dueAmount,
            status,
            dueDate: feeModal.dueDate,
            paidDate: feeModal.paidAmount > 0 ? feeModal.paidDate : undefined,
            paymentMethod: feeModal.paidAmount > 0 ? feeModal.paymentMethod : undefined,
            receiptNo: feeModal.receiptNo.trim() || undefined,
            remarks: feeModal.remarks.trim() || undefined,
          };
        }
        return f;
      });
    }

    onUpdateFees(updated);
    setFeeModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleDeleteFeeRecord = (feeId: string, monthName: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Delete Fee Record',
      message: `Are you sure you want to remove fee record for ${monthName}?`,
      onConfirm: () => {
        const updated = fees.filter(f => f.id !== feeId);
        onUpdateFees(updated);
        setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-[#1F231D]/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-[#E0E4D9] overflow-hidden my-6 flex flex-col max-h-[92vh] animate-fadeIn">
        
        {/* Top Modal Header */}
        <div className="bg-[#3A4035] p-5 sm:p-6 text-white relative border-b border-[#4E5745]">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-[#CAD3C0] hover:text-white hover:bg-[#2D3329]/80 rounded-full transition cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-8">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${student.avatarBg || 'bg-[#5C6652]'} text-white font-bold text-xl sm:text-2xl flex items-center justify-center shadow-lg border-2 border-white/20 font-serif shrink-0`}>
                {student.name.slice(0, 2).toUpperCase()}
              </div>
              
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-white font-serif">{student.name}</h2>
                  <span className="font-mono text-xs bg-white/10 px-2 py-0.5 rounded text-[#CAD3C0] border border-white/10">
                    {student.rollNo}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                    student.tuitionMode === 'home' 
                      ? 'bg-[#E9EDE0] text-[#3D4736] border-[#CAD3C0]' 
                      : 'bg-[#E8EDEB] text-[#3D5A5B] border-[#CAD8D5]'
                  }`}>
                    {student.tuitionMode === 'home' ? <Home className="w-3 h-3" /> : <Laptop className="w-3 h-3" />}
                    {student.tuitionMode === 'home' ? 'Home Tuition' : 'Online Session'}
                  </span>
                </div>
                
                <p className="text-xs text-[#D1D8C8] mt-1">
                  {student.grade} • {student.board} • <span className="text-white/90 font-medium">{student.subjects.join(', ')}</span>
                </p>
              </div>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="student-detail-download-tracker-pdf-btn"
                onClick={() => downloadStudentProgressTrackerPdf(student, testScores, attendance, syllabus)}
                className="bg-[#5C6652] hover:bg-[#4E5745] text-white text-xs font-semibold px-3 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="Download this student's Progress & Assessment Tracker as PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tracker PDF</span>
              </button>

              <button
                id="student-detail-report-card-pdf-btn"
                onClick={() => onGenerateReportCard(student)}
                className="bg-[#2D3329]/60 hover:bg-[#2D3329] text-white text-xs font-semibold px-3 py-2 rounded-xl border border-[#5C6652] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="View & Download PDF Progress Report Card"
              >
                <FileText className="w-3.5 h-3.5 text-[#CAD3C0]" />
                <span>Report Card</span>
              </button>

              <a
                href={waProgressLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 text-[#CAD3C0] hover:text-white text-xs font-medium px-3 py-2 rounded-xl border border-white/20 transition flex items-center gap-1.5 cursor-pointer"
                title="Send WhatsApp Progress Summary to Parents"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 sm:gap-2 mt-5 border-t border-[#4E5745] pt-3 overflow-x-auto no-scrollbar">
            {[
              { id: 'profile', label: 'Student Profile' },
              { id: 'attendance', label: `Attendance (${studentAttendance.length})` },
              { id: 'tests', label: `Progress & Tests (${studentTests.length})` },
              { id: 'syllabus', label: 'Syllabus Tracker' },
              { id: 'fees', label: `Fee Ledger (${studentFees.length})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#5C6652] text-white shadow-xs'
                    : 'text-[#D1D8C8] hover:text-white hover:bg-[#2D3329]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* ========================================================================= */}
          {/* TAB 1: PROFILE & BIO */}
          {/* ========================================================================= */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-[#FAFBF9] p-3 rounded-2xl border border-[#E0E4D9]">
                  <span className="text-[10px] text-[#707969] uppercase font-semibold">Attendance Rate</span>
                  <div className={`text-lg font-bold font-serif ${attendanceRate >= 80 ? 'text-[#3D4736]' : 'text-[#9E6547]'}`}>
                    {attendanceRate}%
                  </div>
                  <span className="text-[10px] text-[#707969]">{presentCount} Present / {studentAttendance.length} Total</span>
                </div>

                <div className="bg-[#FAFBF9] p-3 rounded-2xl border border-[#E0E4D9]">
                  <span className="text-[10px] text-[#707969] uppercase font-semibold">Avg Test Score</span>
                  <div className="text-lg font-bold font-serif text-[#5C6652]">
                    {avgTestScore !== null ? `${avgTestScore}%` : 'N/A'}
                  </div>
                  <span className="text-[10px] text-[#707969]">{studentTests.length} Assessments</span>
                </div>

                <div className="bg-[#FAFBF9] p-3 rounded-2xl border border-[#E0E4D9]">
                  <span className="text-[10px] text-[#707969] uppercase font-semibold">Monthly Tuition Fee</span>
                  <div className="text-lg font-bold font-serif text-[#2D3329]">
                    {formatCurrency(student.monthlyFee)}
                  </div>
                  <span className="text-[10px] text-[#707969]">Due: {student.feeDueDay || 5}th of Month</span>
                </div>

                <div className="bg-[#FAFBF9] p-3 rounded-2xl border border-[#E0E4D9]">
                  <span className="text-[10px] text-[#707969] uppercase font-semibold">Syllabus Progress</span>
                  <div className="text-lg font-bold font-serif text-[#3D5A5B]">
                    {currentSubjectProgress}%
                  </div>
                  <span className="text-[10px] text-[#707969]">{completedSubjectTopics} / {totalSubjectTopics} Topics</span>
                </div>
              </div>

              {/* Information Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                {/* Academic Box */}
                <div className="bg-[#FAFBF9] p-4 rounded-2xl border border-[#E0E4D9] space-y-2.5">
                  <h4 className="font-bold text-[#2D3329] font-serif flex items-center gap-1.5 text-sm">
                    <BookOpen className="w-4 h-4 text-[#5C6652]" />
                    Academic Details
                  </h4>
                  <div className="space-y-1.5 text-[#42473E]">
                    <div><span className="text-[#707969]">Class/Grade:</span> <span className="font-semibold text-[#2D3329]">{student.grade}</span></div>
                    <div><span className="text-[#707969]">Board / Curriculum:</span> <span className="font-semibold text-[#2D3329]">{student.board}</span></div>
                    <div><span className="text-[#707969]">Enrolled Subjects:</span> <span className="font-semibold text-[#2D3329]">{student.subjects.join(', ')}</span></div>
                    <div><span className="text-[#707969]">Joined Since:</span> <span className="font-semibold text-[#2D3329]">{student.joiningDate}</span></div>
                  </div>
                </div>

                {/* Logistics & Timings */}
                <div className="bg-[#FAFBF9] p-4 rounded-2xl border border-[#E0E4D9] space-y-2.5">
                  <h4 className="font-bold text-[#2D3329] font-serif flex items-center gap-1.5 text-sm">
                    <Clock className="w-4 h-4 text-[#3D5A5B]" />
                    Class Timings & Venue
                  </h4>
                  <div className="space-y-1.5 text-[#42473E]">
                    <div><span className="text-[#707969]">Time Slot:</span> <span className="font-semibold text-[#2D3329]">{student.timeSlot}</span></div>
                    <div><span className="text-[#707969]">Tuition Type:</span> <span className="font-semibold text-[#2D3329]">{student.tuitionMode === 'home' ? 'Home Tuition Visit' : 'Online Interactive'}</span></div>
                    <div>
                      <span className="text-[#707969]">Location / Meeting:</span> 
                      <p className="font-semibold text-[#2D3329] mt-0.5">{student.addressOrLocation || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bg-[#FAFBF9] p-4 rounded-2xl border border-[#E0E4D9] space-y-2.5">
                  <h4 className="font-bold text-[#2D3329] font-serif flex items-center gap-1.5 text-sm">
                    <Phone className="w-4 h-4 text-[#5C6652]" />
                    Contact & Guardians
                  </h4>
                  <div className="space-y-1.5 text-[#42473E]">
                    <div><span className="text-[#707969]">Student Phone:</span> <span className="font-semibold text-[#2D3329]">{student.phone || 'N/A'}</span></div>
                    <div><span className="text-[#707969]">Parent/Guardian Name:</span> <span className="font-semibold text-[#2D3329]">{student.parentName}</span></div>
                    <div><span className="text-[#707969]">Parent Phone:</span> <span className="font-semibold text-[#2D3329]">{student.parentPhone}</span></div>
                    <div><span className="text-[#707969]">Email:</span> <span className="font-semibold text-[#2D3329]">{student.email || 'N/A'}</span></div>
                  </div>
                </div>

                {/* Notes & Focus Areas */}
                <div className="bg-[#FAFBF9] p-4 rounded-2xl border border-[#E0E4D9] space-y-2.5">
                  <h4 className="font-bold text-[#2D3329] font-serif flex items-center gap-1.5 text-sm">
                    <FileText className="w-4 h-4 text-[#707969]" />
                    Teacher Focus Notes
                  </h4>
                  <p className="text-[#42473E] italic">
                    "{student.notes || 'No custom notes logged yet.'}"
                  </p>
                </div>

              </div>

              {/* Edit & Delete Student Buttons */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#E0E4D9]">
                <button
                  onClick={() => {
                    setDeleteConfirm({
                      isOpen: true,
                      title: 'Delete Student',
                      message: `Are you sure you want to permanently remove ${student.name} from the active roster?`,
                      onConfirm: () => {
                        onDeleteStudent(student.id);
                        onClose();
                      }
                    });
                  }}
                  className="text-[#995353] hover:bg-[#FCECEC] px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Student</span>
                </button>

                <button
                  onClick={() => onEditStudent(student)}
                  className="bg-[#5C6652] hover:bg-[#4E5745] text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Student Information</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: ATTENDANCE MANAGEMENT (ADD / EDIT / DELETE) */}
          {/* ========================================================================= */}
          {activeTab === 'attendance' && (
            <div className="space-y-4 text-xs">
              {/* Top Controls & Stats */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAFBF9] p-4 rounded-2xl border border-[#E0E4D9]">
                <div className="flex items-center gap-3">
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    <div className="bg-[#E9EDE0] px-2.5 py-1 rounded-lg border border-[#CAD3C0]">
                      <span className="text-[9px] text-[#3D4736] font-semibold block">Present</span>
                      <span className="font-bold text-[#3D4736]">{presentCount}</span>
                    </div>
                    <div className="bg-[#FAF0E4] px-2.5 py-1 rounded-lg border border-[#EAD5C3]">
                      <span className="text-[9px] text-[#8C5D39] font-semibold block">Late</span>
                      <span className="font-bold text-[#8C5D39]">{lateCount}</span>
                    </div>
                    <div className="bg-[#FCECEC] px-2.5 py-1 rounded-lg border border-[#E8C5C5]">
                      <span className="text-[9px] text-[#995353] font-semibold block">Absent</span>
                      <span className="font-bold text-[#995353]">{absentCount}</span>
                    </div>
                    <div className="bg-[#E8EDEB] px-2.5 py-1 rounded-lg border border-[#CAD8D5]">
                      <span className="text-[9px] text-[#3D5A5B] font-semibold block">Rate</span>
                      <span className="font-bold text-[#3D5A5B]">{attendanceRate}%</span>
                    </div>
                  </div>
                </div>

                <button
                  id="add-attendance-for-student-btn"
                  onClick={handleOpenAddAttendance}
                  className="bg-[#5C6652] hover:bg-[#4E5745] text-white font-semibold px-3.5 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Attendance Session</span>
                </button>
              </div>

              {/* Attendance Records List */}
              {studentAttendance.length === 0 ? (
                <div className="py-12 text-center text-[#707969] bg-[#FAFBF9] rounded-2xl border border-[#E0E4D9]">
                  <Calendar className="w-8 h-8 text-[#CAD3C0] mx-auto mb-2" />
                  <p className="font-medium text-[#2D3329]">No attendance records logged for {student.name} yet.</p>
                  <button
                    onClick={handleOpenAddAttendance}
                    className="mt-3 text-xs text-[#5C6652] font-semibold hover:underline cursor-pointer"
                  >
                    + Add first session attendance
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#E0E4D9] border border-[#E0E4D9] rounded-2xl overflow-hidden bg-white shadow-xs">
                  {studentAttendance.map((a) => (
                    <div key={a.id} className="p-3.5 sm:p-4 hover:bg-[#FAFBF9] transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#2D3329] text-sm">{a.date}</span>
                          <span className="text-[#707969] text-[11px]">
                            ({new Date(a.date).toLocaleDateString('en-PK', { weekday: 'short' })})
                          </span>
                        </div>
                        {a.topicCovered && (
                          <p className="text-[#42473E] font-medium text-xs mt-1">
                            <span className="text-[#707969]">Topic:</span> {a.topicCovered}
                          </p>
                        )}
                        {a.remarks && (
                          <p className="text-[#707969] text-[11px] italic mt-0.5">
                            Note: {a.remarks}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {/* 1-Click Status Toggle Badge */}
                        <button
                          type="button"
                          onClick={() => handleQuickToggleAttendanceStatus(a)}
                          className={`px-3 py-1 rounded-full font-bold text-xs capitalize border transition cursor-pointer hover:opacity-80 active:scale-95 ${
                            a.status === 'present' ? 'bg-[#E9EDE0] text-[#3D4736] border-[#CAD3C0]' :
                            a.status === 'absent' ? 'bg-[#FCECEC] text-[#995353] border-[#E8C5C5]' :
                            a.status === 'late' ? 'bg-[#FAF0E4] text-[#8C5D39] border-[#EAD5C3]' : 'bg-[#E8EDEB] text-[#3D5A5B] border-[#CAD8D5]'
                          }`}
                          title="Click to toggle status (Present / Late / Absent / Excused)"
                        >
                          {a.status} ↻
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditAttendance(a)}
                          className="p-1.5 text-[#707969] hover:text-[#2D3329] hover:bg-[#F0F2EA] rounded-lg transition cursor-pointer"
                          title="Edit session details"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteAttendanceRecord(a.id, a.date)}
                          className="p-1.5 text-[#707969] hover:text-[#995353] hover:bg-[#FCECEC] rounded-lg transition cursor-pointer"
                          title="Delete session record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: PROGRESS & TEST SCORES (ADD / EDIT / DELETE) */}
          {/* ========================================================================= */}
          {activeTab === 'tests' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAFBF9] p-4 rounded-2xl border border-[#E0E4D9]">
                <div>
                  <h4 className="font-bold text-[#2D3329] font-serif text-sm">Assessment & Examination Log</h4>
                  <p className="text-xs text-[#707969] mt-0.5">
                    Record test marks, quizzes, mock papers, and calculate grades automatically.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadStudentProgressTrackerPdf(student, testScores, attendance, syllabus)}
                    className="bg-white hover:bg-[#F0F2EA] text-[#2D3329] text-xs font-semibold px-3 py-2 rounded-xl border border-[#CAD3C0] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Download Student Progress & Assessment Tracker as PDF"
                  >
                    <Download className="w-3.5 h-3.5 text-[#5C6652]" />
                    <span className="hidden sm:inline">Tracker PDF</span>
                  </button>

                  <button
                    id="add-test-for-student-btn"
                    onClick={handleOpenAddTest}
                    className="bg-[#5C6652] hover:bg-[#4E5745] text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Record Test Score</span>
                  </button>
                </div>
              </div>

              {studentTests.length === 0 ? (
                <div className="py-12 text-center text-[#707969] bg-[#FAFBF9] rounded-2xl border border-[#E0E4D9] text-xs">
                  <Award className="w-8 h-8 text-[#CAD3C0] mx-auto mb-2" />
                  <p className="font-medium text-[#2D3329]">No test scores recorded for {student.name} yet.</p>
                  <button
                    onClick={handleOpenAddTest}
                    className="mt-3 text-xs text-[#5C6652] font-semibold hover:underline cursor-pointer"
                  >
                    + Record first assessment score
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#E0E4D9] border border-[#E0E4D9] rounded-2xl overflow-hidden text-xs bg-white shadow-xs">
                  {studentTests.map((t) => (
                    <div key={t.id} className="p-4 hover:bg-[#FAFBF9] transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-[#2D3329] text-sm">{t.testTitle}</span>
                          <span className="bg-[#F0F2EA] text-[#42473E] font-semibold px-2 py-0.5 rounded-md text-[10px] border border-[#E0E4D9]">
                            {t.subject}
                          </span>
                        </div>
                        <p className="text-[#707969] text-xs mt-1">
                          Date: <span className="font-medium text-[#2D3329]">{t.testDate}</span>
                          {t.remarks && <span> • Remarks: <span className="italic text-[#42473E]">{t.remarks}</span></span>}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div className="text-right">
                          <span className="font-bold text-[#2D3329] text-sm">{t.obtainedMarks} / {t.maxMarks}</span>
                          <span className="text-[#707969] text-[11px] block">({t.percentage}%)</span>
                        </div>

                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getGradeBadgeColor(t.grade)}`}>
                          {t.grade}
                        </span>

                        <div className="flex items-center gap-1 border-l border-[#E0E4D9] pl-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditTest(t)}
                            className="p-1.5 text-[#707969] hover:text-[#2D3329] hover:bg-[#F0F2EA] rounded-lg transition cursor-pointer"
                            title="Edit test result"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteTestScore(t.id, t.testTitle)}
                            className="p-1.5 text-[#707969] hover:text-[#995353] hover:bg-[#FCECEC] rounded-lg transition cursor-pointer"
                            title="Delete test result"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: SYLLABUS & CURRICULUM (ADD / EDIT / DELETE) */}
          {/* ========================================================================= */}
          {activeTab === 'syllabus' && (
            <div className="space-y-4 text-xs">
              
              {/* Subject Tabs & Overall Progress */}
              <div className="bg-[#FAFBF9] p-4 rounded-2xl border border-[#E0E4D9] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-[#707969] mr-1">Subject:</span>
                    {syllabusListToDisplay.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedSyllabusSubjectId(s.id)}
                        className={`px-3 py-1.5 rounded-xl font-semibold transition text-xs cursor-pointer ${
                          selectedSyllabusSubjectId === s.id
                            ? 'bg-[#5C6652] text-white shadow-xs'
                            : 'bg-white text-[#2D3329] border border-[#E0E4D9] hover:bg-[#F0F2EA]'
                        }`}
                      >
                        {s.subject} ({s.grade})
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenAddTopic()}
                    className="bg-[#5C6652] hover:bg-[#4E5745] text-white font-semibold px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer self-start sm:self-auto shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Topic / Chapter</span>
                  </button>
                </div>

                {/* Progress Bar */}
                {currentSyllabusSubject && (
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-[#42473E] mb-1">
                      <span>{currentSyllabusSubject.subject} Coverage</span>
                      <span>{currentSubjectProgress}% Completed ({completedSubjectTopics}/{totalSubjectTopics} Topics)</span>
                    </div>
                    <div className="w-full bg-[#E0E4D9] h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#5C6652] h-full rounded-full transition-all duration-300"
                        style={{ width: `${currentSubjectProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Chapters & Topics Accordion */}
              {!currentSyllabusSubject || currentSyllabusSubject.chapters.length === 0 ? (
                <div className="py-12 text-center text-[#707969] bg-[#FAFBF9] rounded-2xl border border-[#E0E4D9]">
                  <BookOpen className="w-8 h-8 text-[#CAD3C0] mx-auto mb-2" />
                  <p className="font-medium text-[#2D3329]">No syllabus chapters found for this subject.</p>
                  <button
                    onClick={() => handleOpenAddTopic()}
                    className="mt-3 text-xs text-[#5C6652] font-semibold hover:underline cursor-pointer"
                  >
                    + Add chapter & syllabus topic
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentSyllabusSubject.chapters.map((ch) => (
                    <div key={ch.id} className="border border-[#E0E4D9] rounded-2xl overflow-hidden bg-white shadow-xs">
                      {/* Chapter Header */}
                      <div className="bg-[#FAFBF9] p-3.5 border-b border-[#E0E4D9] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="bg-[#5C6652] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            Ch {ch.chapterNumber}
                          </span>
                          <span className="font-bold text-[#2D3329] text-sm font-serif">{ch.title}</span>
                          <span className="text-[10px] text-[#707969]">({ch.topics.length} topics)</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenAddTopic(ch.id)}
                          className="text-[11px] text-[#5C6652] hover:text-[#4E5745] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Topic</span>
                        </button>
                      </div>

                      {/* Topics List */}
                      <div className="divide-y divide-[#E0E4D9]">
                        {ch.topics.length === 0 ? (
                          <div className="p-3 text-center text-[#707969] text-xs">No topics in this chapter yet.</div>
                        ) : (
                          ch.topics.map((top) => (
                            <div key={top.id} className="p-3 hover:bg-[#FAFBF9] transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                              <div className="flex-1">
                                <div className="font-medium text-[#2D3329]">{top.title}</div>
                                {top.completedDate && (
                                  <span className="text-[10px] text-[#707969]">Completed: {top.completedDate}</span>
                                )}
                                {top.notes && (
                                  <span className="text-[10px] text-[#5C6652] italic block">Notes: {top.notes}</span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-center">
                                {/* 1-Click Status Badge */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleTopicStatus(currentSyllabusSubject.id, ch.id, top.id, top.status)}
                                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize border transition cursor-pointer hover:opacity-80 active:scale-95 ${
                                    top.status === 'completed' ? 'bg-[#E9EDE0] text-[#3D4736] border-[#CAD3C0]' :
                                    top.status === 'revised' ? 'bg-[#E8EDEB] text-[#3D5A5B] border-[#CAD8D5]' :
                                    top.status === 'in-progress' ? 'bg-[#FAF0E4] text-[#8C5D39] border-[#EAD5C3]' : 'bg-[#F0F2EA] text-[#707969] border-[#E0E4D9]'
                                  }`}
                                  title="Click to toggle status (Pending / In Progress / Completed / Revised)"
                                >
                                  {top.status.replace('-', ' ')} ↻
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenEditTopic(currentSyllabusSubject.id, ch.id, top)}
                                  className="p-1 text-[#707969] hover:text-[#2D3329] hover:bg-[#F0F2EA] rounded-lg transition cursor-pointer"
                                  title="Edit topic"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteTopic(currentSyllabusSubject.id, ch.id, top.id, top.title)}
                                  className="p-1 text-[#707969] hover:text-[#995353] hover:bg-[#FCECEC] rounded-lg transition cursor-pointer"
                                  title="Delete topic"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: FEE LEDGER & PAYMENTS (ADD / EDIT / DELETE) */}
          {/* ========================================================================= */}
          {activeTab === 'fees' && (
            <div className="space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAFBF9] p-4 rounded-2xl border border-[#E0E4D9]">
                <div>
                  <h4 className="font-bold text-[#2D3329] font-serif text-sm">Monthly Fee Billing Ledger</h4>
                  <div className="flex items-center gap-3 mt-1 text-[#707969]">
                    <span>Monthly Rate: <strong className="text-[#2D3329]">{formatCurrency(student.monthlyFee)}</strong></span>
                    <span>•</span>
                    <span>Total Paid: <strong className="text-[#3D4736]">{formatCurrency(totalFeePaid)}</strong></span>
                    {totalFeeDue > 0 && (
                      <>
                        <span>•</span>
                        <span>Pending Due: <strong className="text-[#995353]">{formatCurrency(totalFeeDue)}</strong></span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  id="add-fee-for-student-btn"
                  onClick={handleOpenAddFee}
                  className="bg-[#5C6652] hover:bg-[#4E5745] text-white font-semibold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Record Fee Payment</span>
                </button>
              </div>

              {studentFees.length === 0 ? (
                <div className="py-12 text-center text-[#707969] bg-[#FAFBF9] rounded-2xl border border-[#E0E4D9]">
                  <DollarSign className="w-8 h-8 text-[#CAD3C0] mx-auto mb-2" />
                  <p className="font-medium text-[#2D3329]">No fee payment records found for {student.name}.</p>
                  <button
                    onClick={handleOpenAddFee}
                    className="mt-3 text-xs text-[#5C6652] font-semibold hover:underline cursor-pointer"
                  >
                    + Record first month payment
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#E0E4D9] border border-[#E0E4D9] rounded-2xl overflow-hidden bg-white shadow-xs">
                  {studentFees.map((f) => (
                    <div key={f.id} className="p-4 hover:bg-[#FAFBF9] transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#2D3329] text-sm">{f.month}</span>
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                            f.status === 'paid' ? 'bg-[#E9EDE0] text-[#3D4736] border-[#CAD3C0]' :
                            f.status === 'overdue' ? 'bg-[#FCECEC] text-[#995353] border-[#E8C5C5]' : 'bg-[#FAF0E4] text-[#8C5D39] border-[#EAD5C3]'
                          }`}>
                            {f.status}
                          </span>
                        </div>

                        <div className="text-[#707969] mt-1 space-x-2">
                          <span>Total: <strong className="text-[#2D3329]">{formatCurrency(f.totalFee)}</strong></span>
                          <span>•</span>
                          <span>Paid: <strong className="text-[#3D4736]">{formatCurrency(f.paidAmount)}</strong></span>
                          {f.dueAmount > 0 && (
                            <>
                              <span>•</span>
                              <span>Due: <strong className="text-[#995353]">{formatCurrency(f.dueAmount)}</strong></span>
                            </>
                          )}
                        </div>

                        {f.receiptNo && (
                          <div className="text-[11px] text-[#707969] font-mono mt-0.5">
                            Receipt: {f.receiptNo} ({f.paymentMethod || 'Bank Transfer'})
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {/* Printable Receipt */}
                        <button
                          type="button"
                          onClick={() => onOpenReceiptModal(student, f)}
                          className="p-1.5 text-[#5C6652] hover:bg-[#E9EDE0] rounded-lg transition inline-flex items-center gap-1 font-semibold text-xs cursor-pointer border border-[#CAD3C0]"
                          title="Generate Printable PDF Receipt"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Receipt</span>
                        </button>

                        {/* WhatsApp Fee Reminder */}
                        {f.dueAmount > 0 && (
                          <a
                            href={generateWhatsAppFeeReminder(student, f)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-[#5C6652] hover:text-[#3D4736] hover:bg-[#E9EDE0] rounded-lg transition inline-flex items-center"
                            title="Send WhatsApp Fee Reminder"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {/* Edit Fee */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditFee(f)}
                          className="p-1.5 text-[#707969] hover:text-[#2D3329] hover:bg-[#F0F2EA] rounded-lg transition cursor-pointer"
                          title="Edit fee payment"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Fee */}
                        <button
                          type="button"
                          onClick={() => handleDeleteFeeRecord(f.id, f.month)}
                          className="p-1.5 text-[#707969] hover:text-[#995353] hover:bg-[#FCECEC] rounded-lg transition cursor-pointer"
                          title="Delete fee record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#FAFBF9] border-t border-[#E0E4D9] flex items-center justify-between">
          <span className="text-xs text-[#707969]">Sir Ali Preparations Academic Portal</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#F0F2EA] hover:bg-[#E0E4D9] text-[#2D3329] font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SUB-MODAL 1: ADD / EDIT ATTENDANCE */}
      {/* ========================================================================= */}
      {attendanceModal.isOpen && (
        <div className="fixed inset-0 bg-[#1F231D]/80 backdrop-blur-xs flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E0E4D9] space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#E0E4D9] pb-3">
              <h3 className="font-bold text-base text-[#2D3329] font-serif flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#5C6652]" />
                <span>{attendanceModal.mode === 'add' ? 'Log Attendance Session' : 'Edit Attendance Record'}</span>
              </h3>
              <button
                onClick={() => setAttendanceModal(prev => ({ ...prev, isOpen: false }))}
                className="text-[#707969] hover:text-[#2D3329] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAttendanceForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#2D3329] mb-1">Session Date *</label>
                <input
                  type="date"
                  required
                  value={attendanceModal.date}
                  onChange={(e) => setAttendanceModal(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2D3329] mb-1">Attendance Status *</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['present', 'late', 'absent', 'excused'] as AttendanceStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setAttendanceModal(prev => ({ ...prev, status: st }))}
                      className={`py-2 rounded-xl text-xs font-bold capitalize border transition cursor-pointer ${
                        attendanceModal.status === st
                          ? st === 'present' ? 'bg-[#5C6652] text-white border-[#5C6652]' :
                            st === 'late' ? 'bg-[#8C5D39] text-white border-[#8C5D39]' :
                            st === 'absent' ? 'bg-[#995353] text-white border-[#995353]' : 'bg-[#3D5A5B] text-white border-[#3D5A5B]'
                          : 'bg-[#FAFBF9] text-[#707969] border-[#E0E4D9] hover:bg-[#F0F2EA]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2D3329] mb-1">Topic / Lesson Covered</label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 3: Projectile Motion Numericals"
                  value={attendanceModal.topicCovered}
                  onChange={(e) => setAttendanceModal(prev => ({ ...prev, topicCovered: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2D3329] mb-1">Teacher Remarks / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Completed assignment, attentive and prompt"
                  value={attendanceModal.remarks}
                  onChange={(e) => setAttendanceModal(prev => ({ ...prev, remarks: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E0E4D9]">
                <button
                  type="button"
                  onClick={() => setAttendanceModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 border border-[#E0E4D9] text-[#707969] hover:text-[#2D3329] hover:bg-[#F0F2EA] rounded-xl font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5C6652] hover:bg-[#4E5745] text-white rounded-xl font-semibold transition cursor-pointer shadow-xs"
                >
                  Save Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-MODAL 2: ADD / EDIT TEST SCORE */}
      {/* ========================================================================= */}
      {testModal.isOpen && (
        <div className="fixed inset-0 bg-[#1F231D]/80 backdrop-blur-xs flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E0E4D9] space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#E0E4D9] pb-3">
              <h3 className="font-bold text-base text-[#2D3329] font-serif flex items-center gap-2">
                <Award className="w-4 h-4 text-[#5C6652]" />
                <span>{testModal.mode === 'add' ? 'Record Test Result' : 'Edit Test Result'}</span>
              </h3>
              <button
                onClick={() => setTestModal(prev => ({ ...prev, isOpen: false }))}
                className="text-[#707969] hover:text-[#2D3329] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTestForm} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2D3329] mb-1">Subject *</label>
                  <select
                    value={testModal.subject}
                    onChange={(e) => setTestModal(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652] font-medium"
                  >
                    {student.subjects.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                    {!student.subjects.includes('Physics') && <option value="Physics">Physics</option>}
                    {!student.subjects.includes('Mathematics') && <option value="Mathematics">Mathematics</option>}
                    {!student.subjects.includes('Chemistry') && <option value="Chemistry">Chemistry</option>}
                    {!student.subjects.includes('Computer Science') && <option value="Computer Science">Computer Science</option>}
                    {!student.subjects.includes('Biology') && <option value="Biology">Biology</option>}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#2D3329] mb-1">Test Date *</label>
                  <input
                    type="date"
                    required
                    value={testModal.testDate}
                    onChange={(e) => setTestModal(prev => ({ ...prev, testDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2D3329] mb-1">Test / Quiz Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 2 Vectors & Equilibrium Test"
                  value={testModal.testTitle}
                  onChange={(e) => setTestModal(prev => ({ ...prev, testTitle: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2D3329] mb-1">Maximum Marks *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={testModal.maxMarks}
                    onChange={(e) => setTestModal(prev => ({ ...prev, maxMarks: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2D3329] mb-1">Obtained Marks *</label>
                  <input
                    type="number"
                    min="0"
                    max={testModal.maxMarks}
                    required
                    value={testModal.obtainedMarks}
                    onChange={(e) => setTestModal(prev => ({ ...prev, obtainedMarks: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
                  />
                </div>
              </div>

              {/* Calculated Score Preview */}
              <div className="bg-[#FAFBF9] p-3 rounded-xl border border-[#E0E4D9] flex items-center justify-between">
                <span className="text-[#707969] font-medium">Calculated Percentage:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#2D3329]">
                    {testModal.maxMarks > 0 ? Math.round((testModal.obtainedMarks / testModal.maxMarks) * 100) : 0}%
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getGradeBadgeColor(
                    calculateGrade(testModal.maxMarks > 0 ? Math.round((testModal.obtainedMarks / testModal.maxMarks) * 100) : 0)
                  )}`}>
                    Grade {calculateGrade(testModal.maxMarks > 0 ? Math.round((testModal.obtainedMarks / testModal.maxMarks) * 100) : 0)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2D3329] mb-1">Teacher Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Excellent conceptual clarity, minor unit error"
                  value={testModal.remarks}
                  onChange={(e) => setTestModal(prev => ({ ...prev, remarks: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E0E4D9]">
                <button
                  type="button"
                  onClick={() => setTestModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 border border-[#E0E4D9] text-[#707969] hover:text-[#2D3329] hover:bg-[#F0F2EA] rounded-xl font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5C6652] hover:bg-[#4E5745] text-white rounded-xl font-semibold transition cursor-pointer shadow-xs"
                >
                  Save Test Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-MODAL 3: ADD / EDIT SYLLABUS TOPIC */}
      {/* ========================================================================= */}
      {topicModal.isOpen && (
        <div className="fixed inset-0 bg-[#1F231D]/80 backdrop-blur-xs flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E0E4D9] space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#E0E4D9] pb-3">
              <h3 className="font-bold text-base text-[#2D3329] font-serif flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#5C6652]" />
                <span>{topicModal.mode === 'add' ? 'Add Syllabus Topic' : 'Edit Syllabus Topic'}</span>
              </h3>
              <button
                onClick={() => setTopicModal(prev => ({ ...prev, isOpen: false }))}
                className="text-[#707969] hover:text-[#2D3329] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTopicForm} className="space-y-3.5 text-xs">
              {topicModal.mode === 'add' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-[#2D3329]">Chapter</label>
                    <button
                      type="button"
                      onClick={() => setTopicModal(prev => ({ ...prev, isCreatingNewChapter: !prev.isCreatingNewChapter }))}
                      className="text-[11px] text-[#5C6652] font-semibold hover:underline"
                    >
                      {topicModal.isCreatingNewChapter ? 'Choose Existing Chapter' : '+ Create New Chapter'}
                    </button>
                  </div>

                  {topicModal.isCreatingNewChapter ? (
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <input
                          type="text"
                          placeholder="Ch #"
                          value={topicModal.newChapterNumber}
                          onChange={(e) => setTopicModal(prev => ({ ...prev, newChapterNumber: e.target.value }))}
                          className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Chapter Title"
                          value={topicModal.newChapterTitle}
                          onChange={(e) => setTopicModal(prev => ({ ...prev, newChapterTitle: e.target.value }))}
                          className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
                        />
                      </div>
                    </div>
                  ) : (
                    <select
                      value={topicModal.chapterId}
                      onChange={(e) => setTopicModal(prev => ({ ...prev, chapterId: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652] font-medium"
                    >
                      {currentSyllabusSubject?.chapters.map(ch => (
                        <option key={ch.id} value={ch.id}>Ch {ch.chapterNumber}: {ch.title}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              <div>
                <label className="block font-semibold text-[#2D3329] mb-1">Topic Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electromagnetic Induction - Faraday's Law"
                  value={topicModal.title}
                  onChange={(e) => setTopicModal(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2D3329] mb-1">Status</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['pending', 'in-progress', 'completed', 'revised'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setTopicModal(prev => ({ ...prev, status: st }))}
                      className={`py-2 rounded-xl text-xs font-bold capitalize border transition cursor-pointer ${
                        topicModal.status === st
                          ? 'bg-[#5C6652] text-white border-[#5C6652]'
                          : 'bg-[#FAFBF9] text-[#707969] border-[#E0E4D9] hover:bg-[#F0F2EA]'
                      }`}
                    >
                      {st.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2D3329] mb-1">Teacher Notes / Focus</label>
                <input
                  type="text"
                  placeholder="e.g. Practiced 5 past paper derivations"
                  value={topicModal.notes}
                  onChange={(e) => setTopicModal(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E0E4D9]">
                <button
                  type="button"
                  onClick={() => setTopicModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 border border-[#E0E4D9] text-[#707969] hover:text-[#2D3329] hover:bg-[#F0F2EA] rounded-xl font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5C6652] hover:bg-[#4E5745] text-white rounded-xl font-semibold transition cursor-pointer shadow-xs"
                >
                  Save Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-MODAL 4: ADD / EDIT FEE RECORD */}
      {/* ========================================================================= */}
      {feeModal.isOpen && (
        <div className="fixed inset-0 bg-[#1F231D]/80 backdrop-blur-xs flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E0E4D9] space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#E0E4D9] pb-3">
              <h3 className="font-bold text-base text-[#2D3329] font-serif flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#5C6652]" />
                <span>{feeModal.mode === 'add' ? 'Record Fee Payment' : 'Edit Fee Payment'}</span>
              </h3>
              <button
                onClick={() => setFeeModal(prev => ({ ...prev, isOpen: false }))}
                className="text-[#707969] hover:text-[#2D3329] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFeeForm} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2D3329] mb-1">Billing Month *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. August 2026"
                    value={feeModal.month}
                    onChange={(e) => setFeeModal(prev => ({ ...prev, month: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652] font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2D3329] mb-1">Payment Method</label>
                  <select
                    value={feeModal.paymentMethod}
                    onChange={(e) => setFeeModal(prev => ({ ...prev, paymentMethod: e.target.value as PaymentMethod }))}
                    className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652] font-medium"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="EasyPaisa">EasyPaisa</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-[#2D3329] mb-1">Total Fee (Rs.)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={feeModal.totalFee}
                    onChange={(e) => setFeeModal(prev => ({ ...prev, totalFee: Number(e.target.value) }))}
                    className="w-full px-2.5 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2D3329] mb-1">Discount (Rs.)</label>
                  <input
                    type="number"
                    min="0"
                    value={feeModal.discount}
                    onChange={(e) => setFeeModal(prev => ({ ...prev, discount: Number(e.target.value) }))}
                    className="w-full px-2.5 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2D3329] mb-1">Paid (Rs.)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={feeModal.paidAmount}
                    onChange={(e) => setFeeModal(prev => ({ ...prev, paidAmount: Number(e.target.value) }))}
                    className="w-full px-2.5 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652] font-bold text-[#3D4736]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2D3329] mb-1">Due Date</label>
                  <input
                    type="date"
                    value={feeModal.dueDate}
                    onChange={(e) => setFeeModal(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2D3329] mb-1">Paid Date</label>
                  <input
                    type="date"
                    value={feeModal.paidDate}
                    onChange={(e) => setFeeModal(prev => ({ ...prev, paidDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2D3329] mb-1">Receipt Number</label>
                  <input
                    type="text"
                    placeholder="SAP-REC-..."
                    value={feeModal.receiptNo}
                    onChange={(e) => setFeeModal(prev => ({ ...prev, receiptNo: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652] font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2D3329] mb-1">Remarks</label>
                  <input
                    type="text"
                    placeholder="e.g. Paid online"
                    value={feeModal.remarks}
                    onChange={(e) => setFeeModal(prev => ({ ...prev, remarks: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E0E4D9]">
                <button
                  type="button"
                  onClick={() => setFeeModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 border border-[#E0E4D9] text-[#707969] hover:text-[#2D3329] hover:bg-[#F0F2EA] rounded-xl font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5C6652] hover:bg-[#4E5745] text-white rounded-xl font-semibold transition cursor-pointer shadow-xs"
                >
                  Save Fee Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-MODAL 5: DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-[#1F231D]/80 backdrop-blur-xs flex items-center justify-center p-4 z-70 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#E0E4D9] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAF1EC] text-[#9E6547] flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#2D3329] font-serif">{deleteConfirm.title}</h3>
                <p className="text-xs text-[#707969] mt-0.5">{deleteConfirm.message}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E0E4D9]">
              <button
                type="button"
                onClick={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
                className="px-3.5 py-1.5 rounded-xl border border-[#E0E4D9] text-[#707969] hover:text-[#2D3329] hover:bg-[#F0F2EA] text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteConfirm.onConfirm}
                className="px-3.5 py-1.5 rounded-xl bg-[#9E6547] hover:bg-[#8A5538] text-white text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
