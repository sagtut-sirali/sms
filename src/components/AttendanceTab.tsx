import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  HelpCircle, 
  Calendar, 
  Send, 
  Sparkles, 
  Save, 
  Home, 
  Laptop, 
  Search, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Student, AttendanceRecord, AttendanceStatus, TuitionMode } from '../types';
import { generateWhatsAppAbsenceAlert } from '../utils/formatters';

interface AttendanceTabProps {
  students: Student[];
  attendance: AttendanceRecord[];
  selectedModeFilter: 'all' | TuitionMode;
  onUpdateAttendance: (records: AttendanceRecord[]) => void;
  todayDate: string;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({
  students,
  attendance,
  selectedModeFilter,
  onUpdateAttendance,
  todayDate,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(todayDate);
  const [topicCoveredGlobal, setTopicCoveredGlobal] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'daily' | 'monthly'>('daily');

  // Keep selectedDate updated with todayDate if it was set to today's date
  useEffect(() => {
    setSelectedDate(todayDate);
  }, [todayDate]);

  // Filter students based on mode
  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      selectedModeFilter === 'all' ? true : s.tuitionMode === selectedModeFilter
    );
  }, [students, selectedModeFilter]);

  // Current day's records
  const currentDayRecords = useMemo(() => {
    return attendance.filter(a => a.date === selectedDate);
  }, [attendance, selectedDate]);

  // Handle single student status change
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    const existingIndex = attendance.findIndex(a => a.studentId === studentId && a.date === selectedDate);
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
        date: selectedDate,
        status,
        topicCovered: topicCoveredGlobal,
      });
    }

    onUpdateAttendance(updated);
  };

  // Handle topic covered change
  const handleTopicChange = (studentId: string, topic: string) => {
    const existingIndex = attendance.findIndex(a => a.studentId === studentId && a.date === selectedDate);
    let updated = [...attendance];

    if (existingIndex >= 0) {
      updated[existingIndex] = {
        ...updated[existingIndex],
        topicCovered: topic,
      };
    } else {
      updated.push({
        id: `att-${Date.now()}-${studentId}`,
        studentId,
        date: selectedDate,
        status: 'present',
        topicCovered: topic,
      });
    }

    onUpdateAttendance(updated);
  };

  // Mark all present
  const handleMarkAllPresent = () => {
    let updated = [...attendance];
    filteredStudents.forEach(student => {
      const idx = updated.findIndex(a => a.studentId === student.id && a.date === selectedDate);
      if (idx >= 0) {
        updated[idx] = { ...updated[idx], status: 'present' };
      } else {
        updated.push({
          id: `att-${Date.now()}-${student.id}`,
          studentId: student.id,
          date: selectedDate,
          status: 'present',
          topicCovered: topicCoveredGlobal || undefined,
        });
      }
    });
    onUpdateAttendance(updated);
  };

  // Quick stats for selected date
  const presentCount = currentDayRecords.filter(r => r.status === 'present' || r.status === 'late').length;
  const absentCount = currentDayRecords.filter(r => r.status === 'absent').length;
  const lateCount = currentDayRecords.filter(r => r.status === 'late').length;
  const excusedCount = currentDayRecords.filter(r => r.status === 'excused').length;
  const dailyRate = filteredStudents.length > 0 ? Math.round((presentCount / filteredStudents.length) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Attendance Header & Controls */}
      <div className="bg-white rounded-2xl p-5 border border-[#E0E4D9] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Date Selector & Mode */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#F7F8F3] border border-[#E0E4D9] rounded-xl px-3 py-2 text-xs font-semibold text-[#2D3329]">
            <Calendar className="w-4 h-4 text-[#5C6652]" />
            <span>Date:</span>
            <input
              id="attendance-date-picker"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white border border-[#E0E4D9] text-[#2D3329] rounded-lg px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#5C6652] cursor-pointer"
            />
            {selectedDate !== todayDate && (
              <button
                type="button"
                onClick={() => setSelectedDate(todayDate)}
                className="bg-[#5C6652] text-white hover:bg-[#4D5644] px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer"
                title="Jump to Today's Date"
              >
                Today
              </button>
            )}
          </div>

          <div className="inline-flex bg-[#F0F2EA] p-1 rounded-xl border border-[#E0E4D9] text-xs">
            <button
              onClick={() => setActiveSubTab('daily')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeSubTab === 'daily' ? 'bg-white text-[#2D3329] shadow-xs' : 'text-[#707969] hover:text-[#2D3329]'
              }`}
            >
              Daily Register
            </button>
            <button
              onClick={() => setActiveSubTab('monthly')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeSubTab === 'monthly' ? 'bg-white text-[#2D3329] shadow-xs' : 'text-[#707969] hover:text-[#2D3329]'
              }`}
            >
              Monthly Sheet
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="attendance-mark-all-present-btn"
            onClick={handleMarkAllPresent}
            className="bg-[#5C6652] hover:bg-[#4E5745] text-white font-medium text-xs px-3.5 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark All Present</span>
          </button>
        </div>

      </div>

      {/* Daily Metrics Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#E0E4D9] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#707969] uppercase">Present</span>
            <div className="text-xl font-bold text-[#3D4736] font-serif">{presentCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#E9EDE0] text-[#3D4736] flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E0E4D9] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#707969] uppercase">Absent</span>
            <div className="text-xl font-bold text-[#995353] font-serif">{absentCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#FCECEC] text-[#995353] flex items-center justify-center">
            <XCircle className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E0E4D9] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#707969] uppercase">Late</span>
            <div className="text-xl font-bold text-[#9E6547] font-serif">{lateCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#F5EBE6] text-[#9E6547] flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E0E4D9] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#707969] uppercase">Rate for Date</span>
            <div className="text-xl font-bold text-[#5C6652] font-serif">{dailyRate}%</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#E9EDE0] text-[#5C6652] flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Sub Tab 1: Daily Register */}
      {activeSubTab === 'daily' && (
        <div className="bg-white rounded-2xl border border-[#E0E4D9] shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E0E4D9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAFBF9]">
            <div>
              <h3 className="font-bold text-[#2D3329] text-sm sm:text-base font-serif flex items-center gap-2">
                <span>Daily Attendance Register</span>
                <span className="text-xs font-normal text-[#707969]">({selectedDate})</span>
              </h3>
              <p className="text-xs text-[#707969] mt-0.5">
                Toggle status for each student and record syllabus topics taught in this class.
              </p>
            </div>
          </div>

          <div className="divide-y divide-[#E0E4D9]">
            {filteredStudents.length === 0 ? (
              <div className="p-12 text-center text-[#707969] text-xs">
                No students enrolled for selected filter.
              </div>
            ) : (
              filteredStudents.map((student) => {
                const record = attendance.find(a => a.studentId === student.id && a.date === selectedDate);
                const currentStatus: AttendanceStatus | 'unmarked' = record ? record.status : 'unmarked';
                const topic = record?.topicCovered || '';

                const waAbsenceLink = generateWhatsAppAbsenceAlert(student, selectedDate, topic);

                return (
                  <div 
                    key={student.id} 
                    className="p-4 sm:p-5 hover:bg-[#F9FAF7] transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    {/* Student Info */}
                    <div className="flex items-center gap-3 min-w-[240px]">
                      <div className="w-10 h-10 rounded-2xl bg-[#5C6652] text-[#F7F8F3] font-bold text-xs flex items-center justify-center">
                        {student.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#2D3329] text-sm font-serif">{student.name}</span>
                          <span className="text-[10px] font-mono text-[#707969] bg-[#F0F2EA] px-1.5 py-0.2 rounded">
                            {student.rollNo}
                          </span>
                        </div>
                        <div className="text-xs text-[#707969] flex items-center gap-2 mt-0.5">
                          <span>{student.grade}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            {student.tuitionMode === 'home' ? <Home className="w-3 h-3 text-[#3D4736]" /> : <Laptop className="w-3 h-3 text-[#3D5A5B]" />}
                            {student.tuitionMode === 'home' ? 'Home' : 'Online'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Topic Covered in this class */}
                    <div className="flex-1 max-w-md">
                      <input
                        type="text"
                        placeholder="Topic taught / chapter notes..."
                        value={topic}
                        onChange={(e) => handleTopicChange(student.id, e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] placeholder-[#8A9382] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652] focus:bg-white transition"
                      />
                    </div>

                    {/* Status Toggles */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      
                      {/* Present */}
                      <button
                        onClick={() => handleStatusChange(student.id, 'present')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                          currentStatus === 'present'
                            ? 'bg-[#5C6652] text-white shadow-xs'
                            : 'bg-[#F0F2EA] text-[#707969] hover:bg-[#E9EDE0] hover:text-[#2D3329]'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>P</span>
                      </button>

                      {/* Absent */}
                      <button
                        onClick={() => handleStatusChange(student.id, 'absent')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                          currentStatus === 'absent'
                            ? 'bg-[#995353] text-white shadow-xs'
                            : 'bg-[#F0F2EA] text-[#707969] hover:bg-[#FCECEC] hover:text-[#995353]'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>A</span>
                      </button>

                      {/* Late */}
                      <button
                        onClick={() => handleStatusChange(student.id, 'late')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                          currentStatus === 'late'
                            ? 'bg-[#9E6547] text-white shadow-xs'
                            : 'bg-[#F0F2EA] text-[#707969] hover:bg-[#F5EBE6] hover:text-[#9E6547]'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>L</span>
                      </button>

                      {/* Excused */}
                      <button
                        onClick={() => handleStatusChange(student.id, 'excused')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                          currentStatus === 'excused'
                            ? 'bg-[#707969] text-white shadow-xs'
                            : 'bg-[#F0F2EA] text-[#707969] hover:bg-[#E9EDE0] hover:text-[#2D3329]'
                        }`}
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>E</span>
                      </button>

                      {/* WhatsApp alert if absent */}
                      {currentStatus === 'absent' && (
                        <a
                          href={waAbsenceLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 px-2.5 py-1.5 bg-[#FCECEC] hover:bg-[#F8DADA] text-[#995353] border border-[#F5C7C7] rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                          title="Send Absence Alert to Parent on WhatsApp"
                        >
                          <Send className="w-3 h-3" />
                          <span>Parent Alert</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Sub Tab 2: Monthly Matrix Sheet */}
      {activeSubTab === 'monthly' && (
        <div className="bg-white rounded-2xl border border-[#E0E4D9] shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#2D3329] text-base font-serif">Monthly Attendance Matrix</h3>
              <p className="text-xs text-[#707969]">Overview of recent attendance sessions per student</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-[#E0E4D9] rounded-xl">
              <thead className="bg-[#F0F2EA] text-[#707969] font-semibold border-b border-[#E0E4D9]">
                <tr>
                  <th className="p-3">Student</th>
                  <th className="p-3">Grade</th>
                  <th className="p-3 text-center">Total Logged</th>
                  <th className="p-3 text-center">Present</th>
                  <th className="p-3 text-center">Absent</th>
                  <th className="p-3 text-center">Late</th>
                  <th className="p-3 text-center">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E4D9]">
                {filteredStudents.map((student) => {
                  const studentLogs = attendance.filter(a => a.studentId === student.id);
                  const pCount = studentLogs.filter(a => a.status === 'present').length;
                  const aCount = studentLogs.filter(a => a.status === 'absent').length;
                  const lCount = studentLogs.filter(a => a.status === 'late').length;
                  const total = studentLogs.length;
                  const pct = total > 0 ? Math.round(((pCount + lCount) / total) * 100) : 100;

                  return (
                    <tr key={student.id} className="hover:bg-[#F9FAF7]">
                      <td className="p-3 font-semibold text-[#2D3329] flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#5C6652] text-white text-[10px] flex items-center justify-center font-bold">
                          {student.name[0]}
                        </div>
                        <span>{student.name}</span>
                      </td>
                      <td className="p-3 text-[#707969]">{student.grade}</td>
                      <td className="p-3 text-center font-bold text-[#2D3329]">{total}</td>
                      <td className="p-3 text-center font-bold text-[#3D4736]">{pCount}</td>
                      <td className="p-3 text-center font-bold text-[#995353]">{aCount}</td>
                      <td className="p-3 text-center font-bold text-[#9E6547]">{lCount}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.8 rounded-full font-bold text-xs border ${
                          pct >= 85 ? 'bg-[#E9EDE0] text-[#3D4736] border-[#CAD3C0]' : 'bg-[#F5EBE6] text-[#9E6547] border-[#E8D0C5]'
                        }`}>
                          {pct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
