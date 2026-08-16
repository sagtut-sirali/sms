import React from 'react';
import { 
  Users, 
  Home, 
  Laptop, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  BookOpen, 
  TrendingUp, 
  Calendar,
  Send,
  Plus,
  ArrowRight,
  Sparkles,
  Award
} from 'lucide-react';
import { Student, AttendanceRecord, TestScore, SubjectSyllabus, FeeRecord, TuitionMode } from '../types';
import { formatCurrency, generateWhatsAppFeeReminder, getGradeBadgeColor } from '../utils/formatters';

interface OverviewTabProps {
  students: Student[];
  attendance: AttendanceRecord[];
  testScores: TestScore[];
  syllabus: SubjectSyllabus[];
  fees: FeeRecord[];
  todayDate: string;
  selectedModeFilter: 'all' | TuitionMode;
  isLocked?: boolean;
  onNavigateTab: (tab: any) => void;
  onQuickMarkAttendance: (studentId: string, status: 'present' | 'absent') => void;
  onSelectStudent: (student: Student) => void;
  onOpenAddStudent: () => void;
  onOpenRecordFee: () => void;
  onOpenAddTest: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  students,
  attendance,
  testScores,
  syllabus,
  fees,
  todayDate,
  selectedModeFilter,
  isLocked = true,
  onNavigateTab,
  onQuickMarkAttendance,
  onSelectStudent,
  onOpenAddStudent,
  onOpenRecordFee,
  onOpenAddTest,
}) => {
  // Filter students based on mode if active
  const filteredStudents = students.filter(s => 
    selectedModeFilter === 'all' ? true : s.tuitionMode === selectedModeFilter
  );

  const homeTuitionCount = students.filter(s => s.tuitionMode === 'home').length;
  const onlineTuitionCount = students.filter(s => s.tuitionMode === 'online').length;

  // Today's attendance stats
  const todayAttendance = attendance.filter(a => a.date === todayDate);
  const presentTodayCount = todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const todayAttendanceRate = filteredStudents.length > 0 
    ? Math.round((presentTodayCount / filteredStudents.length) * 100)
    : 0;

  // Current month fees (August 2026 / current month)
  const currentMonthFees = fees.filter(f => f.month.includes('2026') || f.month.includes('August'));
  const totalExpectedFee = currentMonthFees.reduce((acc, f) => acc + (f.totalFee - f.discount), 0);
  const totalCollectedFee = currentMonthFees.reduce((acc, f) => acc + f.paidAmount, 0);
  const totalPendingFee = currentMonthFees.reduce((acc, f) => acc + f.dueAmount, 0);
  const overdueFeesList = currentMonthFees.filter(f => f.status === 'overdue' || (f.status === 'partial' && f.dueAmount > 0));

  // Syllabus stats
  let totalTopics = 0;
  let completedTopics = 0;
  syllabus.forEach(sub => {
    sub.chapters.forEach(ch => {
      ch.topics.forEach(top => {
        totalTopics++;
        if (top.status === 'completed' || top.status === 'revised') {
          completedTopics++;
        }
      });
    });
  });
  const syllabusProgressRate = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // Recent test scores
  const recentTests = [...testScores].sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Welcome card */}
      <div className="bg-[#2D3329] rounded-3xl p-6 text-[#F7F8F3] shadow-xs border border-[#3D4537] relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full opacity-10 pointer-events-none flex items-center justify-end pr-6">
          <Sparkles className="w-64 h-64 text-[#DDE4D1]" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-[#5C6652] text-[#E9EDE0] text-xs px-3 py-0.5 rounded-full font-medium border border-[#707969]/50">
                Academy Live Control
              </span>
              <span className="text-xs text-[#DDE4D1]/80 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#DDE4D1]" />
                {new Date(todayDate).toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white font-serif">
              Welcome back, Sir Ali! 👋
            </h2>
            <p className="text-[#DDE4D1] text-sm mt-1 max-w-2xl font-sans">
              You are currently managing <span className="font-semibold text-white">{students.length} students</span> across <span className="font-semibold text-[#E9EDE0]">{homeTuitionCount} Home Tuitions</span> and <span className="font-semibold text-[#E9EDE0]">{onlineTuitionCount} Online Batches</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="overview-mark-attendance-shortcut"
              onClick={() => onNavigateTab('attendance')}
              className="bg-[#5C6652] hover:bg-[#4E5745] text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#DDE4D1]" />
              <span>Mark Today's Attendance</span>
            </button>
            <button
              id="overview-add-test-shortcut"
              onClick={onOpenAddTest}
              className="bg-[#3C4435] hover:bg-[#4A5442] text-[#E9EDE0] font-medium text-xs px-3.5 py-2.5 rounded-xl border border-[#5C6652]/60 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Award className="w-4 h-4 text-[#DDE4D1]" />
              <span>Log Test Marks</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Active Enrolled Students */}
        <div 
          onClick={() => onNavigateTab('students')}
          className="bg-white rounded-2xl p-5 border border-[#E0E4D9] shadow-xs hover:shadow-sm transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#707969] uppercase tracking-wider">Total Enrolled</span>
            <div className="w-9 h-9 rounded-xl bg-[#E9EDE0] text-[#5C6652] flex items-center justify-center group-hover:scale-105 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#2D3329] font-serif">{students.length}</span>
            <span className="text-xs text-[#707969]">Students</span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E0E4D9] flex items-center justify-between text-xs text-[#42473E]">
            <span className="flex items-center gap-1">
              <Home className="w-3.5 h-3.5 text-[#5C6652]" />
              {homeTuitionCount} Home
            </span>
            <span className="flex items-center gap-1">
              <Laptop className="w-3.5 h-3.5 text-[#5C6652]" />
              {onlineTuitionCount} Online
            </span>
          </div>
        </div>

        {/* Card 2: Today's Attendance */}
        <div 
          onClick={() => onNavigateTab('attendance')}
          className="bg-white rounded-2xl p-5 border border-[#E0E4D9] shadow-xs hover:shadow-sm transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#707969] uppercase tracking-wider">Today's Attendance</span>
            <div className="w-9 h-9 rounded-xl bg-[#E9EDE0] text-[#5C6652] flex items-center justify-center group-hover:scale-105 transition">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#2D3329] font-serif">{presentTodayCount} / {filteredStudents.length}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
              todayAttendanceRate >= 80 ? 'bg-[#E9EDE0] text-[#3D4736] border-[#CAD3C0]' : 'bg-[#FAF1EC] text-[#9E6547] border-[#ECCDC1]'
            }`}>
              {todayAttendanceRate}%
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E0E4D9] flex items-center justify-between text-xs text-[#707969]">
            <span>For {todayDate}</span>
            <span className="text-[#5C6652] font-semibold flex items-center gap-0.5">
              Manage <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 3: Monthly Fee Collection */}
        <div 
          onClick={() => onNavigateTab('fees')}
          className="bg-white rounded-2xl p-5 border border-[#E0E4D9] shadow-xs hover:shadow-sm transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#707969] uppercase tracking-wider">Fee Collection</span>
            <div className="w-9 h-9 rounded-xl bg-[#E9EDE0] text-[#5C6652] flex items-center justify-center group-hover:scale-105 transition">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold text-[#2D3329] font-serif">{formatCurrency(totalCollectedFee)}</span>
            <span className="text-xs text-[#707969] block mt-0.5">of {formatCurrency(totalExpectedFee)}</span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-[#E0E4D9] flex items-center justify-between text-xs">
            <span className="text-[#8C6D37] font-medium">
              Due: {formatCurrency(totalPendingFee)}
            </span>
            <span className="text-[#707969] font-medium">
              {totalExpectedFee > 0 ? Math.round((totalCollectedFee / totalExpectedFee) * 100) : 0}% collected
            </span>
          </div>
        </div>

        {/* Card 4: Syllabus Progress */}
        <div 
          onClick={() => onNavigateTab('syllabus')}
          className="bg-white rounded-2xl p-5 border border-[#E0E4D9] shadow-xs hover:shadow-sm transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#707969] uppercase tracking-wider">Syllabus Covered</span>
            <div className="w-9 h-9 rounded-xl bg-[#E9EDE0] text-[#5C6652] flex items-center justify-center group-hover:scale-105 transition">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#2D3329] font-serif">{completedTopics} / {totalTopics}</span>
            <span className="text-xs font-semibold bg-[#E9EDE0] text-[#3D4736] border border-[#CAD3C0] px-2 py-0.5 rounded-full">
              {syllabusProgressRate}%
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E0E4D9]">
            <div className="w-full bg-[#F0F2EA] h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#5C6652] h-full rounded-full transition-all duration-500" 
                style={{ width: `${syllabusProgressRate}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Main Row: Today's Schedule & Attendance + Fee Overdue Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Today's Schedule & Fast Attendance */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E0E4D9] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#E0E4D9] flex items-center justify-between bg-[#FAFBF9]">
            <div>
              <h3 className="font-bold text-[#2D3329] text-base font-serif flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#5C6652]" />
                Today's Tuition Schedule & Quick Attendance
              </h3>
              <p className="text-xs text-[#707969] mt-0.5">
                Fast 1-click status marker for today ({todayDate})
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('attendance')}
              className="text-xs font-semibold text-[#5C6652] hover:text-[#2D3329] flex items-center gap-1 cursor-pointer"
            >
              Full Register <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#E0E4D9] max-h-[380px] overflow-y-auto">
            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-[#707969] text-sm">
                No students found for this tuition mode.
              </div>
            ) : (
              filteredStudents.map((student) => {
                const record = attendance.find(a => a.studentId === student.id && a.date === todayDate);
                const currentStatus = record ? record.status : 'pending';

                return (
                  <div 
                    key={student.id} 
                    className="p-4 hover:bg-[#F9FAF7] transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div 
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => onSelectStudent(student)}
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#5C6652] text-[#F7F8F3] flex items-center justify-center font-bold text-sm shadow-xs">
                        {student.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-[#2D3329] hover:text-[#5C6652] transition">
                            {student.name}
                          </h4>
                          <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                            student.tuitionMode === 'home' 
                              ? 'bg-[#E9EDE0] text-[#3D4736] border-[#CAD3C0]' 
                              : 'bg-[#E8EDEB] text-[#3D5A5B] border-[#CAD8D5]'
                          }`}>
                            {student.tuitionMode === 'home' ? <Home className="w-2.5 h-2.5" /> : <Laptop className="w-2.5 h-2.5" />}
                            {student.tuitionMode === 'home' ? 'Home' : 'Online'}
                          </span>
                        </div>
                        <p className="text-xs text-[#707969] mt-0.5">
                          {student.grade} • {student.timeSlot}
                        </p>
                      </div>
                    </div>

                    {/* Quick Attendance Buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        onClick={() => onQuickMarkAttendance(student.id, 'present')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
                          currentStatus === 'present'
                            ? 'bg-[#5C6652] text-white shadow-xs'
                            : 'bg-[#F0F2EA] text-[#42473E] hover:bg-[#E9EDE0] hover:text-[#2D3329]'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Present</span>
                      </button>
                      <button
                        onClick={() => onQuickMarkAttendance(student.id, 'absent')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                          currentStatus === 'absent'
                            ? 'bg-[#995353] text-white shadow-xs'
                            : 'bg-[#F0F2EA] text-[#42473E] hover:bg-[#FCECEC] hover:text-[#995353]'
                        }`}
                      >
                        <span>Absent</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Overdue Fee Alerts & Quick WhatsApp Reminders */}
        <div className="bg-white rounded-2xl border border-[#E0E4D9] shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#E0E4D9] flex items-center justify-between bg-[#FAFBF9]">
            <div>
              <h3 className="font-bold text-[#2D3329] text-base font-serif flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-[#9E6547]" />
                Fee Payment Dues
              </h3>
              <p className="text-xs text-[#707969] mt-0.5">
                Students with pending or overdue fee
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('fees')}
              className="text-xs font-semibold text-[#5C6652] hover:text-[#2D3329] cursor-pointer"
            >
              All Fees
            </button>
          </div>

          <div className="p-4 flex-1 divide-y divide-[#E0E4D9] max-h-[380px] overflow-y-auto">
            {overdueFeesList.length === 0 ? (
              <div className="py-12 text-center text-[#707969] text-xs">
                <CheckCircle2 className="w-8 h-8 text-[#5C6652] mx-auto mb-2" />
                All active student fees are settled up!
              </div>
            ) : (
              overdueFeesList.map((fee) => {
                const student = students.find(s => s.id === fee.studentId);
                if (!student) return null;

                const waLink = generateWhatsAppFeeReminder(student, fee);

                return (
                  <div key={fee.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#2D3329]">{student.name}</span>
                        <span className="text-[10px] font-semibold bg-[#FCECEC] text-[#995353] border border-[#ECCECE] px-2 py-0.2 rounded-full">
                          {fee.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-[#707969] mt-0.5">
                        Due: <span className="font-semibold text-[#995353]">{formatCurrency(fee.dueAmount)}</span> • Due Date: {fee.dueDate}
                      </p>
                    </div>

                    {/* WhatsApp Reminder (Restricted: Visible ONLY when admin is logged in) */}
                    {!isLocked && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-[#5C6652] hover:bg-[#4D5644] text-white text-xs font-semibold px-2.5 py-1.5 rounded-xl transition shadow-xs whitespace-nowrap"
                        title="Send WhatsApp Fee Reminder to Parent"
                      >
                        <Send className="w-3 h-3" />
                        <span>Reminder</span>
                      </a>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3.5 bg-[#FAFBF9] border-t border-[#E0E4D9] flex items-center justify-between">
            <span className="text-xs font-medium text-[#707969]">Total Unpaid:</span>
            <span className="text-xs font-bold text-[#995353]">{formatCurrency(totalPendingFee)}</span>
          </div>
        </div>

      </div>

      {/* Recent Assessment & Tests Spotlight */}
      <div className="bg-white rounded-2xl border border-[#E0E4D9] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E0E4D9] flex items-center justify-between bg-[#FAFBF9]">
          <div>
            <h3 className="font-bold text-[#2D3329] text-base font-serif flex items-center gap-2">
              <Award className="w-4 h-4 text-[#5C6652]" />
              Recent Academic Tests & Assessment Scores
            </h3>
            <p className="text-xs text-[#707969] mt-0.5">
              Latest quiz, past paper, and chapter test outcomes
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('progress')}
            className="text-xs font-semibold text-[#5C6652] hover:text-[#2D3329] flex items-center gap-1 cursor-pointer"
          >
            View All Tests <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F0F2EA] text-[#707969] font-semibold border-b border-[#E0E4D9]">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Test Title</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E4D9]">
              {recentTests.map((t) => {
                const student = students.find(s => s.id === t.studentId);
                return (
                  <tr key={t.id} className="hover:bg-[#F9FAF7] transition">
                    <td className="py-3.5 px-4 font-semibold text-[#2D3329]">
                      {student ? student.name : 'Unknown'}
                    </td>
                    <td className="py-3.5 px-4 text-[#5C6652] font-medium">{t.subject}</td>
                    <td className="py-3.5 px-4 text-[#42473E]">{t.testTitle}</td>
                    <td className="py-3.5 px-4 text-[#707969]">{t.testDate}</td>
                    <td className="py-3.5 px-4 font-bold text-[#2D3329]">
                      {t.obtainedMarks} / {t.maxMarks} <span className="text-[#8A9382] font-normal text-[11px]">({t.percentage}%)</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getGradeBadgeColor(t.grade)}`}>
                        {t.grade}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#707969] max-w-xs truncate" title={t.remarks}>
                      {t.remarks || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
