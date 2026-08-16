import React, { useState, useMemo } from 'react';
import { 
  Award, 
  Plus, 
  Search, 
  TrendingUp, 
  Filter, 
  Calendar, 
  FileText, 
  Send, 
  Trash2, 
  CheckCircle2,
  BarChart3,
  BookOpen,
  Download,
  FileDown,
  UserCheck,
  GraduationCap,
  Sparkles,
  Printer
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';
import { Student, TestScore, AttendanceRecord, SubjectSyllabus } from '../types';
import { calculateGrade, getGradeBadgeColor, generateWhatsAppProgressReport } from '../utils/formatters';
import { downloadClassProgressSummaryPdf, downloadStudentProgressTrackerPdf } from '../utils/pdfExport';

interface ProgressTabProps {
  students: Student[];
  testScores: TestScore[];
  attendance: AttendanceRecord[];
  syllabus: SubjectSyllabus[];
  onOpenAddTest: () => void;
  onDeleteTest: (testId: string) => void;
  onGenerateReportCard: (student: Student) => void;
  onSelectStudent?: (student: Student) => void;
}

export const ProgressTab: React.FC<ProgressTabProps> = ({
  students,
  testScores,
  attendance,
  syllabus,
  onOpenAddTest,
  onDeleteTest,
  onGenerateReportCard,
  onSelectStudent,
}) => {
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExportingStudentPdf, setIsExportingStudentPdf] = useState(false);

  // Selected Student Object
  const selectedStudentObj = useMemo(() => {
    if (selectedStudentFilter === 'all') return null;
    return students.find(s => s.id === selectedStudentFilter) || null;
  }, [students, selectedStudentFilter]);

  // Unique subjects across test scores
  const uniqueSubjects = useMemo(() => {
    return Array.from(new Set(testScores.map(t => t.subject))).filter(Boolean);
  }, [testScores]);

  // Filtered test scores
  const filteredTests = useMemo(() => {
    return testScores.filter(t => {
      if (selectedStudentFilter !== 'all' && t.studentId !== selectedStudentFilter) {
        return false;
      }
      if (selectedSubjectFilter !== 'all' && t.subject !== selectedSubjectFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const student = students.find(s => s.id === t.studentId);
        const nameMatch = student?.name.toLowerCase().includes(query);
        const titleMatch = t.testTitle.toLowerCase().includes(query);
        const subMatch = t.subject.toLowerCase().includes(query);
        return nameMatch || titleMatch || subMatch;
      }
      return true;
    }).sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime());
  }, [testScores, selectedStudentFilter, selectedSubjectFilter, searchQuery, students]);

  // Chart data for selected student or overall tests
  const chartData = useMemo(() => {
    const sorted = [...filteredTests].reverse();
    return sorted.map(t => {
      const student = students.find(s => s.id === t.studentId);
      return {
        date: t.testDate.slice(5),
        title: t.testTitle.slice(0, 15) + '...',
        percentage: t.percentage,
        student: student?.name.split(' ')[0] || 'Std',
        subject: t.subject,
      };
    });
  }, [filteredTests, students]);

  // Top performers count
  const aStarCount = testScores.filter(t => t.grade === 'A*').length;
  const aCount = testScores.filter(t => t.grade === 'A').length;
  const avgOverallPercentage = testScores.length > 0
    ? Math.round(testScores.reduce((acc, t) => acc + t.percentage, 0) / testScores.length)
    : 0;

  // Selected student specific calculations
  const selectedStudentStats = useMemo(() => {
    if (!selectedStudentObj) return null;
    const sTests = testScores.filter(t => t.studentId === selectedStudentObj.id);
    const sAtt = attendance.filter(a => a.studentId === selectedStudentObj.id);
    const sPresent = sAtt.filter(a => a.status === 'present' || a.status === 'late').length;
    const attRate = sAtt.length > 0 ? Math.round((sPresent / sAtt.length) * 100) : 100;
    const avgScore = sTests.length > 0 ? Math.round(sTests.reduce((a, b) => a + b.percentage, 0) / sTests.length) : 0;
    const grade = calculateGrade(avgScore);
    return {
      testsCount: sTests.length,
      attRate,
      presentCount: sPresent,
      totalSessions: sAtt.length,
      avgScore,
      grade,
      sTests,
    };
  }, [selectedStudentObj, testScores, attendance]);

  const handleDownloadStudentPdf = (student: Student) => {
    setIsExportingStudentPdf(true);
    try {
      downloadStudentProgressTrackerPdf(student, testScores, attendance, syllabus);
    } finally {
      setTimeout(() => setIsExportingStudentPdf(false), 800);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Actions */}
      <div className="bg-white rounded-2xl p-5 border border-[#E0E4D9] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#2D3329] font-serif flex items-center gap-2">
            <Award className="w-5 h-5 text-[#5C6652]" />
            <span>Student Progress & Assessment Tracker</span>
          </h2>
          <p className="text-xs text-[#707969] mt-0.5">
            Log quiz results, track grade trajectories, and download student-wise academic progress tracker PDFs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* If a student is filtered, provide their 1-click PDF download button directly in header */}
          {selectedStudentObj ? (
            <button
              id="progress-export-selected-student-pdf-btn"
              onClick={() => handleDownloadStudentPdf(selectedStudentObj)}
              disabled={isExportingStudentPdf}
              className="bg-[#5C6652] hover:bg-[#4D5644] text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
              title={`Download PDF Progress Tracker for ${selectedStudentObj.name}`}
            >
              <Download className="w-4 h-4" />
              <span>Download {selectedStudentObj.name.split(' ')[0]}'s PDF</span>
            </button>
          ) : (
            <button
              id="progress-export-batch-pdf-btn"
              onClick={() => downloadClassProgressSummaryPdf(students, testScores, attendance)}
              className="bg-[#F0F2EA] hover:bg-[#E0E4D9] text-[#2D3329] font-semibold text-xs px-3.5 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer border border-[#CAD3C0]"
              title="Download Full Class Progress Summary as PDF"
            >
              <FileDown className="w-4 h-4 text-[#5C6652]" />
              <span>Export Class PDF</span>
            </button>
          )}

          <button
            id="progress-add-test-btn"
            onClick={onOpenAddTest}
            className="bg-[#2D3329] hover:bg-[#1F231D] text-white font-medium text-xs px-4 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Test Score</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#E0E4D9] shadow-xs">
          <span className="text-[11px] font-semibold text-[#707969] uppercase block">Total Assessments</span>
          <span className="text-2xl font-bold text-[#2D3329] font-serif mt-1 block">{testScores.length}</span>
          <span className="text-xs text-[#707969] mt-0.5 block">Tests logged</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E0E4D9] shadow-xs">
          <span className="text-[11px] font-semibold text-[#707969] uppercase block">Average Score</span>
          <span className="text-2xl font-bold text-[#5C6652] font-serif mt-1 block">{avgOverallPercentage}%</span>
          <span className="text-xs text-[#707969] mt-0.5 block">Across all batches</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E0E4D9] shadow-xs">
          <span className="text-[11px] font-semibold text-[#707969] uppercase block">A* & A Distinctions</span>
          <span className="text-2xl font-bold text-[#3D4736] font-serif mt-1 block">{aStarCount + aCount}</span>
          <span className="text-xs text-[#3D4736] mt-0.5 block font-medium">Top tier performance</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E0E4D9] shadow-xs">
          <span className="text-[11px] font-semibold text-[#707969] uppercase block">Active Students Tested</span>
          <span className="text-2xl font-bold text-[#9E6547] font-serif mt-1 block">
            {new Set(testScores.map(t => t.studentId)).size} / {students.length}
          </span>
          <span className="text-xs text-[#707969] mt-0.5 block">Evaluated so far</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E0E4D9] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#707969] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search test name or student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] placeholder-[#8A9382] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
          />
        </div>

        {/* Filters & Student Selector */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Student Filter */}
          <div className="flex items-center gap-1.5 bg-[#F7F8F3] border border-[#E0E4D9] rounded-xl px-2.5 py-1">
            <span className="text-[11px] text-[#707969] font-medium">Student:</span>
            <select
              id="progress-student-filter-select"
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-[#2D3329] focus:outline-none cursor-pointer"
            >
              <option value="all">All Students ({students.length})</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.rollNo})</option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-1.5 bg-[#F7F8F3] border border-[#E0E4D9] rounded-xl px-2.5 py-1">
            <span className="text-[11px] text-[#707969] font-medium">Subject:</span>
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-medium text-[#2D3329] focus:outline-none cursor-pointer"
            >
              <option value="all">All Subjects</option>
              {uniqueSubjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Selected Student Focused Academic Dossier Banner */}
      {selectedStudentObj && selectedStudentStats && (
        <div className="bg-gradient-to-r from-[#2D3329] to-[#3A4035] rounded-3xl p-5 text-white shadow-md border border-[#444D3E] space-y-4 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Student Info */}
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-[#5C6652] text-[#F7F8F3] flex items-center justify-center font-bold text-lg font-serif shadow-inner shrink-0">
                {selectedStudentObj.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold font-serif">{selectedStudentObj.name}</h3>
                  <span className="text-xs bg-[#444D3E] text-[#CAD3C0] px-2 py-0.5 rounded-md font-mono">
                    {selectedStudentObj.rollNo}
                  </span>
                  <span className="text-[11px] bg-[#E9EDE0] text-[#3D4736] px-2 py-0.5 rounded-md font-bold">
                    Grade: {selectedStudentStats.grade}
                  </span>
                </div>
                <p className="text-xs text-[#CAD3C0] mt-0.5">
                  {selectedStudentObj.grade} ({selectedStudentObj.board}) • {selectedStudentObj.tuitionMode === 'home' ? 'Home Tuition' : 'Online Sessions'} • {selectedStudentObj.parentName} ({selectedStudentObj.parentPhone})
                </p>
              </div>
            </div>

            {/* Student Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="student-dossier-download-pdf-btn"
                onClick={() => handleDownloadStudentPdf(selectedStudentObj)}
                className="bg-[#5C6652] hover:bg-[#4D5644] text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="Download this student's complete Progress & Assessment Tracker as a PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Progress Tracker PDF</span>
              </button>

              <button
                onClick={() => onGenerateReportCard(selectedStudentObj)}
                className="bg-white/10 hover:bg-white/20 text-white font-medium text-xs px-3 py-2 rounded-xl border border-white/20 transition flex items-center gap-1.5 cursor-pointer"
                title="Open Printable Report Card Modal"
              >
                <FileText className="w-3.5 h-3.5 text-[#CAD3C0]" />
                <span>View Report Card</span>
              </button>

              <a
                href={generateWhatsAppProgressReport(
                  selectedStudentObj, 
                  selectedStudentStats.sTests, 
                  selectedStudentStats.attRate, 
                  70
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 text-[#CAD3C0] hover:text-white font-medium text-xs px-3 py-2 rounded-xl border border-white/20 transition flex items-center gap-1.5 cursor-pointer"
                title="Share WhatsApp Progress Report"
              >
                <Send className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick KPI Bar for Selected Student */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/10 text-xs">
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
              <span className="text-[10px] text-[#CAD3C0] uppercase font-semibold block">Assessment Average</span>
              <span className="text-base font-bold text-white font-serif block mt-0.5">{selectedStudentStats.avgScore}%</span>
              <span className="text-[10px] text-[#CAD3C0]">{selectedStudentStats.testsCount} tests recorded</span>
            </div>

            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
              <span className="text-[10px] text-[#CAD3C0] uppercase font-semibold block">Attendance Rate</span>
              <span className="text-base font-bold text-[#CAD3C0] font-serif block mt-0.5">{selectedStudentStats.attRate}%</span>
              <span className="text-[10px] text-[#CAD3C0]">{selectedStudentStats.presentCount} of {selectedStudentStats.totalSessions} attended</span>
            </div>

            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
              <span className="text-[10px] text-[#CAD3C0] uppercase font-semibold block">Enrolled Subjects</span>
              <span className="text-xs font-semibold text-white truncate block mt-0.5">
                {selectedStudentObj.subjects.join(', ')}
              </span>
              <span className="text-[10px] text-[#CAD3C0]">Active Curriculum</span>
            </div>

            <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
              <span className="text-[10px] text-[#CAD3C0] uppercase font-semibold block">Academic Standing</span>
              <span className="text-xs font-bold text-white block mt-0.5">
                {selectedStudentStats.avgScore >= 80 ? 'Distinction Candidate' : 'Regular Progression'}
              </span>
              <span className="text-[10px] text-[#CAD3C0]">{selectedStudentObj.timeSlot}</span>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Chart Box */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-[#E0E4D9] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#2D3329] font-serif flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#5C6652]" />
                <span>
                  {selectedStudentObj 
                    ? `${selectedStudentObj.name}'s Score Trajectory (%)` 
                    : 'Score Trend Analysis (%)'}
                </span>
              </h3>
              <p className="text-xs text-[#707969]">Score percentage progression over recent examinations</p>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E4D9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#707969' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#707969' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#2D3329', borderRadius: '12px', color: '#F7F8F3', fontSize: '12px', border: 'none' }}
                  formatter={(value: any) => [`${value}%`, 'Score']}
                />
                <Line 
                  type="monotone" 
                  dataKey="percentage" 
                  stroke="#5C6652" 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: '#8DA376', strokeWidth: 2, stroke: '#F7F8F3' }} 
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Test Log Table */}
      <div className="bg-white rounded-2xl border border-[#E0E4D9] shadow-xs overflow-hidden">
        <div className="p-4 bg-[#FAFBF9] border-b border-[#E0E4D9] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-xs text-[#2D3329] uppercase tracking-wider font-serif">
              {selectedStudentObj 
                ? `Assessment Record Log for ${selectedStudentObj.name}` 
                : 'All Students Examination & Quiz Logs'}
            </h3>
            <span className="text-[11px] text-[#707969]">
              Showing {filteredTests.length} test records
            </span>
          </div>

          {selectedStudentObj && (
            <button
              onClick={() => setSelectedStudentFilter('all')}
              className="text-xs text-[#5C6652] hover:text-[#2D3329] font-medium cursor-pointer"
            >
              Clear Student Filter (Show All)
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F0F2EA] text-[#707969] font-semibold border-b border-[#E0E4D9]">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Test / Quiz Title</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Marks</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4">Remarks</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E4D9]">
              {filteredTests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#707969]">
                    No test records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredTests.map((test) => {
                  const student = students.find(s => s.id === test.studentId);
                  if (!student) return null;

                  return (
                    <tr key={test.id} className="hover:bg-[#F9FAF7] transition">
                      <td className="py-3.5 px-4 font-semibold text-[#2D3329]">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedStudentFilter(student.id)}
                            className="w-7 h-7 rounded-lg bg-[#5C6652] text-[#F7F8F3] font-bold text-[10px] flex items-center justify-center hover:bg-[#3D4736] transition cursor-pointer"
                            title={`Filter view for ${student.name}`}
                          >
                            {student.name[0]}
                          </button>
                          <div>
                            <button
                              onClick={() => {
                                if (onSelectStudent) {
                                  onSelectStudent(student);
                                } else {
                                  setSelectedStudentFilter(student.id);
                                }
                              }}
                              className="hover:underline hover:text-[#5C6652] text-left font-semibold text-[#2D3329] cursor-pointer"
                              title={`Manage activities for ${student.name}`}
                            >
                              {student.name}
                            </button>
                            <div className="text-[10px] text-[#707969] font-normal">{student.rollNo}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#42473E]">{test.subject}</td>
                      <td className="py-3.5 px-4 font-semibold text-[#2D3329]">{test.testTitle}</td>
                      <td className="py-3.5 px-4 text-[#707969]">{test.testDate}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#2D3329]">{test.obtainedMarks}</span>
                        <span className="text-[#707969]"> / {test.maxMarks}</span>
                        <span className="text-[#5C6652] font-medium ml-1">({test.percentage}%)</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${getGradeBadgeColor(test.grade)}`}>
                          {test.grade}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#707969] max-w-xs truncate" title={test.remarks}>
                        {test.remarks || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Direct PDF Download for this particular student */}
                          <button
                            onClick={() => handleDownloadStudentPdf(student)}
                            title={`Download ${student.name}'s Progress Tracker PDF`}
                            className="p-1.5 text-[#5C6652] hover:text-[#2D3329] hover:bg-[#E9EDE0] rounded-lg transition cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Report Card Modal */}
                          <button
                            onClick={() => onGenerateReportCard(student)}
                            title="Generate & View Report Card Modal"
                            className="inline-flex items-center gap-1 text-[#3D4736] bg-[#F0F2EA] hover:bg-[#E0E4D9] hover:text-[#2D3329] px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer border border-[#CAD3C0]"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#5C6652]" />
                            <span>Report</span>
                          </button>

                          <button
                            onClick={() => onDeleteTest(test.id)}
                            title="Delete Score Record"
                            className="p-1.5 text-[#707969] hover:text-[#995353] hover:bg-[#FCECEC] rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
