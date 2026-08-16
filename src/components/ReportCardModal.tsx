import React, { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  Send, 
  Award, 
  GraduationCap, 
  Calendar, 
  CheckCircle2, 
  TrendingUp, 
  Download, 
  Loader2,
  FileCheck,
  FileText
} from 'lucide-react';
import { Student, TestScore, AttendanceRecord, SubjectSyllabus } from '../types';
import { getGradeBadgeColor, generateWhatsAppProgressReport } from '../utils/formatters';
import { downloadElementAsPdf } from '../utils/pdfExport';

interface ReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  tests: TestScore[];
  attendance: AttendanceRecord[];
  syllabus: SubjectSyllabus[];
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({
  isOpen,
  onClose,
  student,
  tests,
  attendance,
  syllabus,
}) => {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !student) return null;

  const studentTests = tests
    .filter(t => t.studentId === student.id)
    .sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime());

  const studentAttendance = attendance.filter(a => a.studentId === student.id);
  const presentCount = studentAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const attendanceRate = studentAttendance.length > 0 
    ? Math.round((presentCount / studentAttendance.length) * 100) 
    : 100;

  const avgPercentage = studentTests.length > 0
    ? Math.round(studentTests.reduce((acc, t) => acc + t.percentage, 0) / studentTests.length)
    : 0;

  const waLink = generateWhatsAppProgressReport(student, studentTests, attendanceRate, 70);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    const fileName = `Progress_Report_${student.name.replace(/\s+/g, '_')}_${student.rollNo}_${new Date().toISOString().slice(0, 10)}.pdf`;
    setIsDownloadingPdf(true);
    const success = await downloadElementAsPdf('printable-report', fileName, (loading) => {
      setIsDownloadingPdf(loading);
    });
    if (success) {
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-[#1F231D]/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-[#E0E4D9] overflow-hidden my-6 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Action Header Bar (Hidden on Print) */}
        <div className="bg-[#2D3329] p-4 sm:p-5 text-white flex flex-wrap items-center justify-between gap-3 border-b border-[#3E4639] print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#444D3E] flex items-center justify-center text-[#CAD3C0]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Student Progress Report Card</span>
              <span className="text-[11px] text-[#CAD3C0] block">{student.name} • {student.rollNo}</span>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Download PDF Button */}
            <button
              id="report-card-download-pdf-btn"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className={`font-semibold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 ${
                downloadSuccess 
                  ? 'bg-emerald-700 text-white' 
                  : 'bg-[#5C6652] hover:bg-[#4D5644] text-white'
              }`}
              title="Download Progress Report as PDF File"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>PDF Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="bg-[#3E4639] hover:bg-[#4E5745] text-[#F0F2EA] hover:text-white font-medium text-xs px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Print Report Card"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* WhatsApp Share Button */}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#3E4639] hover:bg-[#4E5745] text-[#CAD3C0] hover:text-white font-medium text-xs px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Share report summary on WhatsApp"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            {/* Close Modal Button (Header) */}
            <button
              id="report-card-close-btn"
              onClick={onClose}
              className="p-2 text-[#CAD3C0] hover:text-white hover:bg-[#444D3E] rounded-xl transition cursor-pointer ml-1"
              title="Close Modal (Esc)"
              aria-label="Close Report Card Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Report Card Content */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-8 bg-white text-[#2D3329] space-y-6 print:p-0 print:m-0" id="printable-report">
          
          {/* Institution Header */}
          <div className="flex items-start justify-between border-b-2 border-[#3A4035] pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-[#3A4035] text-[#CAD3C0] flex items-center justify-center font-bold shadow-md shrink-0">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#2D3329] tracking-tight font-serif">SIR ALI PREPARATIONS</h1>
                <p className="text-xs text-[#5C6652] font-bold uppercase tracking-wider">Student Academic Progress & Assessment Report</p>
                <p className="text-[11px] text-[#707969]">Home Tuitions & Online Live Coaching • Cell: +92 300 1234567</p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="inline-block bg-[#E9EDE0] text-[#3D4736] font-bold text-xs px-3 py-1 rounded-md border border-[#CAD3C0]">
                OFFICIAL REPORT
              </span>
              <div className="text-xs text-[#707969] mt-1">
                Date: {new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Student Profile Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F7F8F3] p-4 rounded-2xl border border-[#E0E4D9] text-xs">
            <div>
              <span className="text-[10px] text-[#707969] font-semibold uppercase block">Student Name</span>
              <span className="font-bold text-[#2D3329] text-sm block mt-0.5">{student.name}</span>
            </div>

            <div>
              <span className="text-[10px] text-[#707969] font-semibold uppercase block">Roll Number</span>
              <span className="font-mono font-bold text-[#2D3329] block mt-0.5">{student.rollNo}</span>
            </div>

            <div>
              <span className="text-[10px] text-[#707969] font-semibold uppercase block">Class / Board</span>
              <span className="font-bold text-[#2D3329] block mt-0.5">{student.grade} ({student.board})</span>
            </div>

            <div>
              <span className="text-[10px] text-[#707969] font-semibold uppercase block">Tuition Mode</span>
              <span className="font-bold text-[#5C6652] block mt-0.5 capitalize">
                {student.tuitionMode === 'home' ? 'Home Tuition' : 'Online Live Session'}
              </span>
            </div>
          </div>

          {/* Performance Summary KPI Row */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 bg-[#FAFBF9] border border-[#E0E4D9] rounded-xl">
              <span className="text-[10px] text-[#707969] uppercase font-semibold">Attendance Record</span>
              <div className="text-xl font-bold text-[#3D4736] font-serif mt-0.5">{attendanceRate}%</div>
              <span className="text-[10px] text-[#707969]">{presentCount} of {studentAttendance.length} sessions attended</span>
            </div>

            <div className="p-3 bg-[#FAFBF9] border border-[#E0E4D9] rounded-xl">
              <span className="text-[10px] text-[#707969] uppercase font-semibold">Overall Test Average</span>
              <div className="text-xl font-bold text-[#5C6652] font-serif mt-0.5">{avgPercentage}%</div>
              <span className="text-[10px] text-[#707969]">{studentTests.length} examinations evaluated</span>
            </div>

            <div className="p-3 bg-[#FAFBF9] border border-[#E0E4D9] rounded-xl">
              <span className="text-[10px] text-[#707969] uppercase font-semibold">Academic Standing</span>
              <div className="text-xl font-bold text-[#2D3329] font-serif mt-0.5">
                {avgPercentage >= 90 ? 'Outstanding (A*)' : avgPercentage >= 80 ? 'Excellent (A)' : avgPercentage >= 70 ? 'Very Good (B)' : 'Needs Practice (C)'}
              </div>
              <span className="text-[10px] text-[#5C6652] font-semibold">Active & Progressive</span>
            </div>
          </div>

          {/* Test Scores Breakdown Table */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#2D3329] flex items-center gap-1.5 text-sm font-serif">
                <Award className="w-4 h-4 text-[#5C6652]" />
                Recent Examination & Assessment Results
              </h3>
              <span className="text-[11px] text-[#707969]">Total Tests: {studentTests.length}</span>
            </div>

            <div className="border border-[#E0E4D9] rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left">
                <thead className="bg-[#F0F2EA] text-[#2D3329] font-bold border-b border-[#E0E4D9]">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Subject</th>
                    <th className="p-2.5">Test Title / Topic</th>
                    <th className="p-2.5">Marks</th>
                    <th className="p-2.5">Score %</th>
                    <th className="p-2.5">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E4D9]">
                  {studentTests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-5 text-center text-[#707969]">
                        No test records logged for this student yet.
                      </td>
                    </tr>
                  ) : (
                    studentTests.map(t => (
                      <tr key={t.id} className="hover:bg-[#FAFBF9]">
                        <td className="p-2.5 text-[#707969]">{t.testDate}</td>
                        <td className="p-2.5 font-semibold text-[#2D3329]">{t.subject}</td>
                        <td className="p-2.5 text-[#42473E]">{t.testTitle}</td>
                        <td className="p-2.5 font-bold text-[#2D3329]">{t.obtainedMarks} / {t.maxMarks}</td>
                        <td className="p-2.5 font-semibold text-[#5C6652]">{t.percentage}%</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getGradeBadgeColor(t.grade)}`}>
                            {t.grade}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Teacher's Evaluation Notes */}
          <div className="bg-[#FAFBF9] p-4 rounded-2xl border border-[#E0E4D9] text-xs space-y-1.5">
            <span className="font-bold text-[#2D3329] uppercase text-[10px] tracking-wider block">Teacher's Evaluation & Recommendation:</span>
            <p className="text-[#42473E] italic leading-relaxed">
              "{student.notes || 'The student shows consistent punctuality and sincere dedication. To secure top board/CAIE positions, regular revision of past paper derivations and numerical problem-solving is strongly advised.'}"
            </p>
          </div>

          {/* Footer & Signatures */}
          <div className="pt-6 flex items-end justify-between text-xs border-t border-[#E0E4D9]">
            <div className="text-center">
              <div className="w-36 border-b-2 border-[#3A4035] pb-1 text-[#2D3329] font-medium">
                {student.parentName}
              </div>
              <span className="text-[10px] text-[#707969] uppercase tracking-wider block mt-1">
                Parent Signature
              </span>
            </div>

            <div className="text-center">
              <div className="w-36 border-b-2 border-[#3A4035] pb-1 font-serif italic text-[#2D3329] font-bold text-sm">
                Sir Ali
              </div>
              <span className="text-[10px] text-[#707969] uppercase tracking-wider block mt-1 font-bold">
                Instructor & Academic Head
              </span>
            </div>
          </div>

        </div>

        {/* Modal Bottom Footer (Hidden on Print) */}
        <div className="bg-[#F7F8F3] px-6 py-3.5 border-t border-[#E0E4D9] flex items-center justify-between text-xs print:hidden">
          <span className="text-[#707969] text-xs hidden sm:inline">
            Official Academic Record • Sir Ali Preparations
          </span>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="px-4 py-2 bg-[#5C6652] hover:bg-[#4D5644] text-white font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Preparing PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              id="report-card-footer-close-btn"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-[#E0E4D9] border border-[#CAD3C0] text-[#2D3329] font-semibold rounded-xl transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
