import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Home, 
  Laptop, 
  Phone, 
  MapPin, 
  BookOpen, 
  DollarSign, 
  Award, 
  FileText, 
  MoreVertical, 
  Edit, 
  Trash2, 
  CheckCircle2,
  Send,
  Calendar,
  Grid,
  List,
  Download
} from 'lucide-react';
import { Student, AttendanceRecord, TestScore, FeeRecord, TuitionMode } from '../types';
import { formatCurrency, generateWhatsAppProgressReport } from '../utils/formatters';
import { downloadStudentProgressTrackerPdf } from '../utils/pdfExport';

interface StudentsTabProps {
  students: Student[];
  attendance: AttendanceRecord[];
  testScores: TestScore[];
  fees: FeeRecord[];
  selectedModeFilter: 'all' | TuitionMode;
  onSelectStudent: (student: Student) => void;
  onOpenAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onGenerateReportCard: (student: Student) => void;
  onRecordFeeForStudent: (student: Student) => void;
}

export const StudentsTab: React.FC<StudentsTabProps> = ({
  students,
  attendance,
  testScores,
  fees,
  selectedModeFilter,
  onSelectStudent,
  onOpenAddStudent,
  onEditStudent,
  onDeleteStudent,
  onGenerateReportCard,
  onRecordFeeForStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Extract unique grades
  const uniqueGrades = useMemo(() => {
    return Array.from(new Set(students.map(s => s.grade))).filter(Boolean);
  }, [students]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Mode filter
      if (selectedModeFilter !== 'all' && student.tuitionMode !== selectedModeFilter) {
        return false;
      }
      // Grade filter
      if (gradeFilter !== 'all' && student.grade !== gradeFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = student.name.toLowerCase().includes(query);
        const matchesRoll = student.rollNo.toLowerCase().includes(query);
        const matchesParent = student.parentName.toLowerCase().includes(query);
        const matchesSubjects = student.subjects.some(sub => sub.toLowerCase().includes(query));
        const matchesGrade = student.grade.toLowerCase().includes(query);
        return matchesName || matchesRoll || matchesParent || matchesSubjects || matchesGrade;
      }
      return true;
    });
  }, [students, selectedModeFilter, gradeFilter, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Top Controls Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E0E4D9] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#707969] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="student-search-input"
            type="text"
            placeholder="Search by student name, roll no, subject, grade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#F7F8F3] border border-[#E0E4D9] rounded-xl text-[#2D3329] placeholder-[#8A9382] focus:outline-none focus:ring-2 focus:ring-[#5C6652]/20 focus:border-[#5C6652] transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#707969] hover:text-[#2D3329] cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Grade Selector */}
          <div className="flex items-center gap-1.5 bg-[#F7F8F3] border border-[#E0E4D9] rounded-xl px-3 py-1.5 text-xs text-[#42473E]">
            <Filter className="w-3.5 h-3.5 text-[#707969]" />
            <select
              id="student-grade-filter"
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-medium focus:outline-none text-[#2D3329] cursor-pointer"
            >
              <option value="all">All Grades / Classes</option>
              {uniqueGrades.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Grid / Table Toggle */}
          <div className="bg-[#F0F2EA] p-1 rounded-xl flex items-center border border-[#E0E4D9] text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-[#2D3329] shadow-xs' : 'text-[#707969] hover:text-[#2D3329]'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-[#2D3329] shadow-xs' : 'text-[#707969] hover:text-[#2D3329]'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Add Student Button */}
          <button
            id="students-add-new-btn"
            onClick={onOpenAddStudent}
            className="bg-[#5C6652] hover:bg-[#4E5745] text-white font-medium text-xs px-3.5 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>

      </div>

      {/* Roster Display */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E0E4D9]">
          <Users className="w-12 h-12 text-[#8A9382] mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[#2D3329] font-serif">No students found</h3>
          <p className="text-xs text-[#707969] mt-1 max-w-sm mx-auto">
            Try adjusting your search query or filters, or add a new student to the roster.
          </p>
          <button
            onClick={onOpenAddStudent}
            className="mt-4 bg-[#5C6652] hover:bg-[#4E5745] text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            Add Student
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStudents.map((student) => {
            // Student specific metrics
            const studentAttendance = attendance.filter(a => a.studentId === student.id);
            const presentCount = studentAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
            const attRate = studentAttendance.length > 0 
              ? Math.round((presentCount / studentAttendance.length) * 100) 
              : 100;

            const studentTests = testScores.filter(t => t.studentId === student.id);
            const avgScore = studentTests.length > 0
              ? Math.round(studentTests.reduce((acc, t) => acc + t.percentage, 0) / studentTests.length)
              : null;

            return (
              <div
                key={student.id}
                className="bg-white rounded-2xl border border-[#E0E4D9] shadow-xs hover:shadow-sm transition-all duration-200 overflow-hidden flex flex-col justify-between group"
              >
                {/* Header */}
                <div className="p-5 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#5C6652] text-[#F7F8F3] font-bold text-base flex items-center justify-center shadow-xs">
                        {student.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 
                            onClick={() => onSelectStudent(student)}
                            className="font-bold text-[#2D3329] text-base font-serif hover:text-[#5C6652] cursor-pointer transition"
                          >
                            {student.name}
                          </h3>
                          <span className="text-[11px] font-mono font-medium text-[#707969] bg-[#F0F2EA] px-1.5 py-0.2 rounded-md">
                            {student.rollNo}
                          </span>
                        </div>
                        <p className="text-xs text-[#707969] mt-0.5 font-medium">
                          {student.grade}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-semibold px-2.5 py-0.8 rounded-full flex items-center gap-1 border ${
                      student.tuitionMode === 'home'
                        ? 'bg-[#E9EDE0] text-[#3D4736] border-[#CAD3C0]'
                        : 'bg-[#E8EDEB] text-[#3D5A5B] border-[#CAD8D5]'
                    }`}>
                      {student.tuitionMode === 'home' ? <Home className="w-3 h-3" /> : <Laptop className="w-3 h-3" />}
                      {student.tuitionMode === 'home' ? 'Home' : 'Online'}
                    </span>
                  </div>

                  {/* Subjects Tag Row */}
                  <div className="mt-3.5 flex flex-wrap gap-1">
                    {student.subjects.map((sub, i) => (
                      <span key={i} className="text-[10px] font-medium bg-[#F0F2EA] text-[#42473E] px-2 py-0.5 rounded-md border border-[#E0E4D9]">
                        {sub}
                      </span>
                    ))}
                  </div>

                  {/* Quick Info details */}
                  <div className="mt-3.5 pt-3 border-t border-[#E0E4D9] space-y-1.5 text-xs text-[#42473E]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#707969] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#5C6652]" /> Slot:
                      </span>
                      <span className="font-medium text-[#2D3329] text-right truncate max-w-[180px]">
                        {student.timeSlot}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#707969] flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-[#5C6652]" /> Monthly Fee:
                      </span>
                      <span className="font-semibold text-[#2D3329]">
                        {formatCurrency(student.monthlyFee)}
                        <span className="text-[10px] text-[#707969] font-normal ml-1">(Due {student.feeDueDay}th)</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#707969] flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-[#5C6652]" /> Parent ({student.parentName}):
                      </span>
                      <span className="font-medium text-[#2D3329]">
                        {student.parentPhone}
                      </span>
                    </div>
                  </div>

                  {/* Stats Mini Pill bar */}
                  <div className="mt-3.5 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="bg-[#FAFBF9] p-2 rounded-xl border border-[#E0E4D9]">
                      <span className="text-[10px] text-[#707969] block">Attendance</span>
                      <span className={`font-bold text-xs ${attRate >= 80 ? 'text-[#3D4736]' : 'text-[#9E6547]'}`}>
                        {attRate}%
                      </span>
                    </div>
                    <div className="bg-[#FAFBF9] p-2 rounded-xl border border-[#E0E4D9]">
                      <span className="text-[10px] text-[#707969] block">Avg. Test Score</span>
                      <span className="font-bold text-xs text-[#5C6652]">
                        {avgScore !== null ? `${avgScore}%` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-3 bg-[#FAFBF9] border-t border-[#E0E4D9] flex items-center justify-between gap-1 text-xs">
                  
                  <button
                    onClick={() => onSelectStudent(student)}
                    className="text-[#5C6652] hover:text-[#2D3329] font-semibold px-2 py-1 rounded transition text-xs cursor-pointer"
                  >
                    View 360° Profile
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => downloadStudentProgressTrackerPdf(student, testScores, attendance)}
                      title="Download Progress Tracker PDF"
                      className="p-1.5 text-[#5C6652] hover:text-[#2D3329] hover:bg-[#E9EDE0] rounded-lg transition cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onGenerateReportCard(student)}
                      title="Generate Academic Report Card"
                      className="p-1.5 text-[#707969] hover:text-[#2D3329] hover:bg-[#E9EDE0] rounded-lg transition cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRecordFeeForStudent(student)}
                      title="Record Tuition Fee"
                      className="p-1.5 text-[#707969] hover:text-[#5C6652] hover:bg-[#E9EDE0] rounded-lg transition cursor-pointer"
                    >
                      <DollarSign className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditStudent(student)}
                      title="Edit Student Info"
                      className="p-1.5 text-[#707969] hover:text-[#2D3329] hover:bg-[#E9EDE0] rounded-lg transition cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteStudent(student.id)}
                      title="Remove Student"
                      className="p-1.5 text-[#707969] hover:text-[#995353] hover:bg-[#FCECEC] rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-[#E0E4D9] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F0F2EA] text-[#707969] font-semibold border-b border-[#E0E4D9]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Class / Board</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Time Slot</th>
                  <th className="py-3 px-4">Monthly Fee</th>
                  <th className="py-3 px-4">Parent Contact</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E4D9]">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-[#F9FAF7] transition">
                    <td className="py-3.5 px-4">
                      <div 
                        className="flex items-center gap-2.5 cursor-pointer"
                        onClick={() => onSelectStudent(student)}
                      >
                        <div className="w-8 h-8 rounded-xl bg-[#5C6652] text-[#F7F8F3] font-bold text-xs flex items-center justify-center">
                          {student.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-[#2D3329] hover:text-[#5C6652] transition">
                            {student.name}
                          </div>
                          <div className="text-[11px] text-[#707969]">
                            {student.subjects.join(', ')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-[#707969]">{student.rollNo}</td>
                    <td className="py-3.5 px-4 text-[#42473E]">
                      <div className="font-medium text-[#2D3329]">{student.grade}</div>
                      <div className="text-[11px] text-[#707969]">{student.board}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 w-max border ${
                        student.tuitionMode === 'home' ? 'bg-[#E9EDE0] text-[#3D4736] border-[#CAD3C0]' : 'bg-[#E8EDEB] text-[#3D5A5B] border-[#CAD8D5]'
                      }`}>
                        {student.tuitionMode === 'home' ? <Home className="w-3 h-3" /> : <Laptop className="w-3 h-3" />}
                        {student.tuitionMode === 'home' ? 'Home' : 'Online'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#42473E]">{student.timeSlot}</td>
                    <td className="py-3.5 px-4 font-bold text-[#2D3329]">{formatCurrency(student.monthlyFee)}</td>
                    <td className="py-3.5 px-4 text-[#42473E]">
                      <div>{student.parentName}</div>
                      <div className="text-[11px] text-[#707969]">{student.parentPhone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => downloadStudentProgressTrackerPdf(student, testScores, attendance)}
                          title="Download Progress Tracker PDF"
                          className="p-1.5 text-[#5C6652] hover:text-[#2D3329] hover:bg-[#E9EDE0] rounded-lg cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onGenerateReportCard(student)}
                          title="Report Card"
                          className="p-1.5 text-[#707969] hover:text-[#2D3329] hover:bg-[#E9EDE0] rounded-lg cursor-pointer"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditStudent(student)}
                          title="Edit"
                          className="p-1.5 text-[#707969] hover:text-[#2D3329] hover:bg-[#E9EDE0] rounded-lg cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteStudent(student.id)}
                          title="Delete"
                          className="p-1.5 text-[#707969] hover:text-[#995353] hover:bg-[#FCECEC] rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
