import React, { useState } from 'react';
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
  Download
} from 'lucide-react';
import { Student, AttendanceRecord, TestScore, FeeRecord, SubjectSyllabus } from '../types';
import { formatCurrency, getGradeBadgeColor, generateWhatsAppProgressReport, generateWhatsAppFeeReminder } from '../utils/formatters';
import { downloadStudentProgressTrackerPdf } from '../utils/pdfExport';

interface StudentDetailModalProps {
  student: Student | null;
  onClose: () => void;
  attendance: AttendanceRecord[];
  testScores: TestScore[];
  fees: FeeRecord[];
  syllabus: SubjectSyllabus[];
  isLocked?: boolean;
  onGenerateReportCard: (student: Student) => void;
  onRecordFee: (student: Student) => void;
  onEditStudent: (student: Student) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  onClose,
  attendance,
  testScores,
  fees,
  syllabus,
  isLocked = true,
  onGenerateReportCard,
  onRecordFee,
  onEditStudent,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'tests' | 'attendance' | 'fees'>('profile');

  // Close modal on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && student) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [student, onClose]);

  if (!student) return null;

  // Student specific data
  const studentAttendance = attendance.filter(a => a.studentId === student.id);
  const presentCount = studentAttendance.filter(a => a.status === 'present').length;
  const lateCount = studentAttendance.filter(a => a.status === 'late').length;
  const absentCount = studentAttendance.filter(a => a.status === 'absent').length;
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

  const latestFee = studentFees[0];

  const waProgressLink = generateWhatsAppProgressReport(student, studentTests, attendanceRate, 65);
  const waFeeLink = latestFee ? generateWhatsAppFeeReminder(student, latestFee) : '#';

  return (
    <div className="fixed inset-0 bg-[#1F231D]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-[#E0E4D9] overflow-hidden my-8 flex flex-col max-h-[90vh]">
        
        {/* Top Modal Header */}
        <div className="bg-[#3A4035] p-6 text-white relative border-b border-[#4E5745]">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-[#CAD3C0] hover:text-white hover:bg-[#2D3329]/80 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl ${student.avatarBg || 'bg-[#5C6652]'} text-white font-bold text-2xl flex items-center justify-center shadow-lg border-2 border-white/20 font-serif`}>
              {student.name.slice(0, 2).toUpperCase()}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-white font-serif">{student.name}</h2>
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
                {student.grade} • {student.board}
              </p>
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
                <span>Download Tracker (PDF)</span>
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
                title="Send WhatsApp Progress Summary"
              >
                <Send className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mt-6 border-t border-[#4E5745] pt-3 overflow-x-auto">
            {[
              { id: 'profile', label: 'Student Profile & Details' },
              { id: 'tests', label: `Test Scores (${studentTests.length})` },
              { id: 'attendance', label: `Attendance (${attendanceRate}%)` },
              { id: 'fees', label: 'Fee History' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap cursor-pointer ${
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
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-[#FAFBF9] p-3 rounded-2xl border border-[#E0E4D9]">
                  <span className="text-[10px] text-[#707969] uppercase font-semibold">Attendance Rate</span>
                  <div className={`text-lg font-bold font-serif ${attendanceRate >= 80 ? 'text-[#3D4736]' : 'text-[#9E6547]'}`}>
                    {attendanceRate}%
                  </div>
                </div>
                <div className="bg-[#FAFBF9] p-3 rounded-2xl border border-[#E0E4D9]">
                  <span className="text-[10px] text-[#707969] uppercase font-semibold">Avg Test Score</span>
                  <div className="text-lg font-bold font-serif text-[#5C6652]">
                    {avgTestScore !== null ? `${avgTestScore}%` : 'N/A'}
                  </div>
                </div>
                <div className="bg-[#FAFBF9] p-3 rounded-2xl border border-[#E0E4D9]">
                  <span className="text-[10px] text-[#707969] uppercase font-semibold">Monthly Tuition Fee</span>
                  <div className="text-lg font-bold font-serif text-[#2D3329]">
                    {formatCurrency(student.monthlyFee)}
                  </div>
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

              {/* Edit button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => onEditStudent(student)}
                  className="bg-[#5C6652] hover:bg-[#4E5745] text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Edit Student Information
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: TESTS */}
          {activeTab === 'tests' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-[#2D3329] font-serif text-sm">Assessment & Examination Log</h4>
                <button
                  onClick={() => downloadStudentProgressTrackerPdf(student, testScores, attendance, syllabus)}
                  className="bg-[#F0F2EA] hover:bg-[#E0E4D9] text-[#2D3329] text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#CAD3C0] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Download Student Progress & Assessment Tracker as PDF"
                >
                  <Download className="w-3.5 h-3.5 text-[#5C6652]" />
                  <span>Download Tracker PDF</span>
                </button>
              </div>

              {studentTests.length === 0 ? (
                <div className="py-12 text-center text-[#707969] text-xs">
                  No test scores recorded for {student.name} yet.
                </div>
              ) : (
                <div className="divide-y divide-[#E0E4D9] border border-[#E0E4D9] rounded-2xl overflow-hidden text-xs">
                  {studentTests.map((t) => (
                    <div key={t.id} className="p-4 hover:bg-[#FAFBF9] transition flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#2D3329]">{t.testTitle}</span>
                          <span className="bg-[#F0F2EA] text-[#42473E] font-medium px-2 py-0.5 rounded text-[10px] border border-[#E0E4D9]">
                            {t.subject}
                          </span>
                        </div>
                        <p className="text-[#707969] text-xs mt-0.5">
                          Date: {t.testDate} • {t.remarks || 'No remarks'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-bold text-[#2D3329]">{t.obtainedMarks} / {t.maxMarks}</span>
                          <span className="text-[#707969] text-[11px] block">({t.percentage}%)</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getGradeBadgeColor(t.grade)}`}>
                          {t.grade}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-[#E9EDE0] p-2.5 rounded-xl border border-[#CAD3C0]">
                  <span className="text-[10px] text-[#3D4736] font-semibold block">Present</span>
                  <span className="font-bold text-[#3D4736] font-serif text-base">{presentCount}</span>
                </div>
                <div className="bg-[#FCECEC] p-2.5 rounded-xl border border-[#E8C5C5]">
                  <span className="text-[10px] text-[#995353] font-semibold block">Absent</span>
                  <span className="font-bold text-[#995353] font-serif text-base">{absentCount}</span>
                </div>
                <div className="bg-[#FAF0E4] p-2.5 rounded-xl border border-[#EAD5C3]">
                  <span className="text-[10px] text-[#8C5D39] font-semibold block">Late</span>
                  <span className="font-bold text-[#8C5D39] font-serif text-base">{lateCount}</span>
                </div>
                <div className="bg-[#E8EDEB] p-2.5 rounded-xl border border-[#CAD8D5]">
                  <span className="text-[10px] text-[#3D5A5B] font-semibold block">Overall Rate</span>
                  <span className="font-bold text-[#3D5A5B] font-serif text-base">{attendanceRate}%</span>
                </div>
              </div>

              <div className="divide-y divide-[#E0E4D9] border border-[#E0E4D9] rounded-2xl overflow-hidden">
                {studentAttendance.length === 0 ? (
                  <div className="p-8 text-center text-[#707969]">No attendance records logged.</div>
                ) : (
                  studentAttendance.map((a) => (
                    <div key={a.id} className="p-3.5 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-[#2D3329]">{a.date}</span>
                        {a.topicCovered && (
                          <span className="text-[#707969] block text-[11px] mt-0.5">
                            Topic: {a.topicCovered}
                          </span>
                        )}
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] capitalize border ${
                        a.status === 'present' ? 'bg-[#E9EDE0] text-[#3D4736] border-[#CAD3C0]' :
                        a.status === 'absent' ? 'bg-[#FCECEC] text-[#995353] border-[#E8C5C5]' :
                        a.status === 'late' ? 'bg-[#FAF0E4] text-[#8C5D39] border-[#EAD5C3]' : 'bg-[#E8EDEB] text-[#3D5A5B] border-[#CAD8D5]'
                      }`}>
                        {a.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: FEES */}
          {activeTab === 'fees' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-[#2D3329] font-serif text-sm">Monthly Fee Billing Ledger</h4>
                <button
                  onClick={() => onRecordFee(student)}
                  className="bg-[#5C6652] text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-[#4E5745] transition flex items-center gap-1 cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Record Payment</span>
                </button>
              </div>

              {studentFees.length === 0 ? (
                <div className="py-10 text-center text-[#707969]">
                  No payment records found for {student.name}.
                </div>
              ) : (
                <div className="divide-y divide-[#E0E4D9] border border-[#E0E4D9] rounded-2xl overflow-hidden">
                  {studentFees.map((f) => (
                    <div key={f.id} className="p-4 hover:bg-[#FAFBF9] transition flex items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-[#2D3329] text-sm">{f.month}</div>
                        <div className="text-[#707969] mt-0.5">
                          Paid: <span className="font-semibold text-[#3D4736]">{formatCurrency(f.paidAmount)}</span> • Due: <span className="font-semibold text-[#995353]">{formatCurrency(f.dueAmount)}</span>
                        </div>
                        {f.receiptNo && (
                          <div className="text-[10px] text-[#707969] font-mono mt-0.5">
                            Receipt: {f.receiptNo} ({f.paymentMethod})
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg font-bold text-xs uppercase border ${
                          f.status === 'paid' ? 'bg-[#E9EDE0] text-[#3D4736] border-[#CAD3C0]' :
                          f.status === 'overdue' ? 'bg-[#FCECEC] text-[#995353] border-[#E8C5C5]' : 'bg-[#FAF0E4] text-[#8C5D39] border-[#EAD5C3]'
                        }`}>
                          {f.status}
                        </span>

                        {/* WhatsApp Fee Reminder (Restricted: only when Admin is logged in) */}
                        {!isLocked && f.dueAmount > 0 && (
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
    </div>
  );
};
