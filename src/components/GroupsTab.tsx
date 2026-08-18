import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  DollarSign,
  BookOpen,
  Send,
  Clock,
  Home,
  Laptop,
  Edit,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Award,
  Sparkles,
  UserPlus,
  UserCheck,
  Layers,
  ChevronRight,
  AlertCircle,
  FileText,
  X,
  PlusCircle,
  Share2
} from 'lucide-react';
import {
  StudentGroup,
  Student,
  AttendanceRecord,
  TestScore,
  SubjectSyllabus,
  FeeRecord,
  TuitionMode,
  AttendanceStatus,
  PaymentStatus,
  PaymentMethod
} from '../types';
import { formatCurrency, getCurrentMonthYearString, formatDisplayDate } from '../utils/formatters';
import { Pagination } from './Pagination';

interface GroupsTabProps {
  groups: StudentGroup[];
  students: Student[];
  attendance: AttendanceRecord[];
  testScores: TestScore[];
  syllabus: SubjectSyllabus[];
  fees: FeeRecord[];
  todayDate: string;
  selectedModeFilter: 'all' | TuitionMode;
  isLocked?: boolean;
  onUpdateGroups: (groups: StudentGroup[]) => void;
  onBatchAttendance: (
    groupId: string,
    date: string,
    topic: string,
    remarks: string,
    memberStatuses: Record<string, AttendanceStatus>
  ) => void;
  onBatchFee: (
    groupId: string,
    month: string,
    year: number,
    amount: number,
    status: PaymentStatus,
    method: PaymentMethod,
    dueDate: string,
    paidDate?: string
  ) => void;
  onBatchSyllabus: (
    groupId: string,
    subjectId: string,
    chapterId: string,
    topicId: string,
    status: 'completed' | 'in-progress' | 'pending'
  ) => void;
  onBatchTest: (
    groupId: string,
    testTitle: string,
    subject: string,
    testDate: string,
    maxMarks: number,
    scores: { studentId: string; obtainedMarks: number; remarks?: string }[]
  ) => void;
  onSyncSchedule: (groupId: string, timeSlot: string, meetingLinkOrLocation?: string) => void;
  onSelectStudent?: (student: Student) => void;
  onShowToast: (message: string) => void;
}

const GROUP_COLORS = [
  'bg-indigo-600',
  'bg-emerald-600',
  'bg-blue-600',
  'bg-amber-600',
  'bg-purple-600',
  'bg-rose-600',
  'bg-teal-600',
];

export const GroupsTab: React.FC<GroupsTabProps> = ({
  groups,
  students,
  attendance,
  testScores,
  syllabus,
  fees,
  todayDate,
  selectedModeFilter,
  isLocked = true,
  onUpdateGroups,
  onBatchAttendance,
  onBatchFee,
  onBatchSyllabus,
  onBatchTest,
  onSyncSchedule,
  onSelectStudent,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState<StudentGroup | null>(null);

  // Modal Dialog States
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<StudentGroup | null>(null);

  // 1-Click Action Modals
  const [attendanceModalGroup, setAttendanceModalGroup] = useState<StudentGroup | null>(null);
  const [feeModalGroup, setFeeModalGroup] = useState<StudentGroup | null>(null);
  const [syllabusModalGroup, setSyllabusModalGroup] = useState<StudentGroup | null>(null);
  const [testModalGroup, setTestModalGroup] = useState<StudentGroup | null>(null);
  const [broadcastModalGroup, setBroadcastModalGroup] = useState<StudentGroup | null>(null);
  const [manageMembersGroup, setManageMembersGroup] = useState<StudentGroup | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<StudentGroup | null>(null);

  // Attendance batch state
  const [batchAttDate, setBatchAttDate] = useState(todayDate);
  const [batchAttTopic, setBatchAttTopic] = useState('');
  const [batchAttRemarks, setBatchAttRemarks] = useState('');
  const [batchMemberStatuses, setBatchMemberStatuses] = useState<Record<string, AttendanceStatus>>({});

  // Fee batch state
  const currentMonthStr = getCurrentMonthYearString();
  const [batchFeeMonth, setBatchFeeMonth] = useState(currentMonthStr);
  const [batchFeeAmount, setBatchFeeAmount] = useState(20000);
  const [batchFeeStatus, setBatchFeeStatus] = useState<PaymentStatus>('paid');
  const [batchFeeMethod, setBatchFeeMethod] = useState<PaymentMethod>('Bank Transfer');
  const [batchFeeDueDate, setBatchFeeDueDate] = useState(todayDate);

  // Syllabus batch state
  const [batchSyllabusSubjectId, setBatchSyllabusSubjectId] = useState('');
  const [batchSyllabusChapterId, setBatchSyllabusChapterId] = useState('');
  const [batchSyllabusTopicId, setBatchSyllabusTopicId] = useState('');
  const [batchSyllabusStatus, setBatchSyllabusStatus] = useState<'completed' | 'in-progress'>('completed');

  // Test batch state
  const [batchTestTitle, setBatchTestTitle] = useState('Chapter Test & Quiz');
  const [batchTestSubject, setBatchTestSubject] = useState('Physics');
  const [batchTestDate, setBatchTestDate] = useState(todayDate);
  const [batchTestMaxMarks, setBatchTestMaxMarks] = useState(50);
  const [batchTestScores, setBatchTestScores] = useState<Record<string, number>>({});

  // Broadcast state
  const [broadcastTemplate, setBroadcastTemplate] = useState<'class_reminder' | 'test_notice' | 'fee_reminder' | 'custom'>('class_reminder');
  const [customBroadcastText, setCustomBroadcastText] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Manage members state
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);

  // Create / Edit Group Form State
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupSubject, setGroupSubject] = useState('Physics (9702)');
  const [groupGrade, setGroupGrade] = useState('12th / XII year / A2');
  const [groupMode, setGroupMode] = useState<TuitionMode>('online');
  const [groupTimeSlot, setGroupTimeSlot] = useState('07:30 PM - 09:00 PM (Mon, Wed, Fri)');
  const [groupFee, setGroupFee] = useState(25000);
  const [groupLocation, setGroupLocation] = useState('https://meet.google.com/');
  const [groupColor, setGroupColor] = useState('bg-indigo-600');
  const [groupInitialStudentIds, setGroupInitialStudentIds] = useState<string[]>([]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setGroupToEdit(null);
    setGroupName('');
    setGroupDescription('');
    setGroupSubject('Physics (9702)');
    setGroupGrade('12th / XII year / A2');
    setGroupMode('online');
    setGroupTimeSlot('07:30 PM - 09:00 PM (Mon, Wed, Fri)');
    setGroupFee(25000);
    setGroupLocation('https://meet.google.com/sap-batch');
    setGroupColor(GROUP_COLORS[Math.floor(Math.random() * GROUP_COLORS.length)]);
    setGroupInitialStudentIds([]);
    setIsCreateGroupOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (grp: StudentGroup) => {
    setGroupToEdit(grp);
    setGroupName(grp.name);
    setGroupDescription(grp.description || '');
    setGroupSubject(grp.subject);
    setGroupGrade(grp.grade);
    setGroupMode(grp.tuitionMode);
    setGroupTimeSlot(grp.timeSlot);
    setGroupFee(grp.monthlyFeePerStudent);
    setGroupLocation(grp.meetingLinkOrLocation || '');
    setGroupColor(grp.avatarBg || 'bg-indigo-600');
    setGroupInitialStudentIds(grp.studentIds || []);
    setIsCreateGroupOpen(true);
  };

  // Save Group
  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    if (groupToEdit) {
      // Update existing
      const updated: StudentGroup = {
        ...groupToEdit,
        name: groupName.trim(),
        description: groupDescription.trim(),
        subject: groupSubject.trim(),
        grade: groupGrade.trim(),
        tuitionMode: groupMode,
        timeSlot: groupTimeSlot.trim(),
        monthlyFeePerStudent: Number(groupFee) || 0,
        meetingLinkOrLocation: groupLocation.trim(),
        avatarBg: groupColor,
        studentIds: groupInitialStudentIds,
      };
      const updatedList = groups.map((g) => (g.id === groupToEdit.id ? updated : g));
      onUpdateGroups(updatedList);
      onShowToast(`Updated group "${groupName}" successfully!`);
    } else {
      // Create new
      const newGroup: StudentGroup = {
        id: `grp-${Date.now()}`,
        name: groupName.trim(),
        description: groupDescription.trim(),
        subject: groupSubject.trim(),
        grade: groupGrade.trim(),
        tuitionMode: groupMode,
        timeSlot: groupTimeSlot.trim(),
        monthlyFeePerStudent: Number(groupFee) || 0,
        meetingLinkOrLocation: groupLocation.trim(),
        avatarBg: groupColor,
        studentIds: groupInitialStudentIds,
        createdAt: todayDate,
      };
      onUpdateGroups([...groups, newGroup]);
      onShowToast(`Created new group "${groupName}" with ${groupInitialStudentIds.length} students!`);
    }

    setIsCreateGroupOpen(false);
  };

  // Delete Group
  const handleDeleteGroup = (groupId: string) => {
    const grp = groups.find((g) => g.id === groupId);
    const updated = groups.filter((g) => g.id !== groupId);
    onUpdateGroups(updated);
    setGroupToDelete(null);
    onShowToast(`Group "${grp?.name || ''}" removed successfully.`);
  };

  // Filter groups
  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      if (selectedModeFilter !== 'all' && g.tuitionMode !== selectedModeFilter) {
        return false;
      }
      if (gradeFilter !== 'all' && g.grade !== gradeFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = g.name.toLowerCase().includes(q);
        const matchesSubject = g.subject.toLowerCase().includes(q);
        const matchesGrade = g.grade.toLowerCase().includes(q);
        const matchesStudent = g.studentIds.some((sId) => {
          const st = students.find((s) => s.id === sId);
          return st && st.name.toLowerCase().includes(q);
        });
        return matchesName || matchesSubject || matchesGrade || matchesStudent;
      }
      return true;
    });
  }, [groups, selectedModeFilter, gradeFilter, searchQuery, students]);

  // Paginated groups
  const totalPages = Math.ceil(filteredGroups.length / pageSize) || 1;
  const paginatedGroups = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredGroups.slice(startIdx, startIdx + pageSize);
  }, [filteredGroups, currentPage, pageSize]);

  // Overall Statistics
  const totalEnrolledInGroups = useMemo(() => {
    const uniqueIds = new Set<string>();
    groups.forEach((g) => g.studentIds.forEach((id) => uniqueIds.add(id)));
    return uniqueIds.size;
  }, [groups]);

  const totalGroupRevenue = useMemo(() => {
    return groups.reduce((acc, g) => acc + (g.monthlyFeePerStudent || 0) * g.studentIds.length, 0);
  }, [groups]);

  const onlineGroupsCount = groups.filter((g) => g.tuitionMode === 'online').length;
  const homeGroupsCount = groups.filter((g) => g.tuitionMode === 'home').length;

  // Open Attendance 1-Click Modal
  const openAttendanceModal = (grp: StudentGroup) => {
    setAttendanceModalGroup(grp);
    setBatchAttDate(todayDate);
    setBatchAttTopic(`${grp.subject} Group Session`);
    setBatchAttRemarks('Regular batch class');
    const initialStatuses: Record<string, AttendanceStatus> = {};
    grp.studentIds.forEach((sId) => {
      initialStatuses[sId] = 'present';
    });
    setBatchMemberStatuses(initialStatuses);
  };

  // Submit Attendance 1-Click
  const handleExecuteAttendance = (preset?: 'all_present' | 'all_late' | 'all_absent') => {
    if (!attendanceModalGroup) return;

    let finalStatuses = { ...batchMemberStatuses };
    if (preset === 'all_present') {
      attendanceModalGroup.studentIds.forEach((id) => (finalStatuses[id] = 'present'));
    } else if (preset === 'all_late') {
      attendanceModalGroup.studentIds.forEach((id) => (finalStatuses[id] = 'late'));
    } else if (preset === 'all_absent') {
      attendanceModalGroup.studentIds.forEach((id) => (finalStatuses[id] = 'absent'));
    }

    onBatchAttendance(
      attendanceModalGroup.id,
      batchAttDate,
      batchAttTopic,
      batchAttRemarks,
      finalStatuses
    );

    onShowToast(`Recorded attendance for ${attendanceModalGroup.studentIds.length} students in "${attendanceModalGroup.name}"!`);
    setAttendanceModalGroup(null);
  };

  // Open Fee 1-Click Modal
  const openFeeModal = (grp: StudentGroup) => {
    setFeeModalGroup(grp);
    setBatchFeeMonth(currentMonthStr);
    setBatchFeeAmount(grp.monthlyFeePerStudent || 20000);
    setBatchFeeStatus('paid');
    setBatchFeeMethod('Bank Transfer');
    setBatchFeeDueDate(todayDate);
  };

  // Submit Fee 1-Click
  const handleExecuteFee = () => {
    if (!feeModalGroup) return;
    const year = new Date(batchFeeDueDate).getFullYear() || 2026;
    onBatchFee(
      feeModalGroup.id,
      batchFeeMonth,
      year,
      batchFeeAmount,
      batchFeeStatus,
      batchFeeMethod,
      batchFeeDueDate,
      batchFeeStatus === 'paid' ? todayDate : undefined
    );
    onShowToast(`Recorded ${batchFeeStatus.toUpperCase()} fee for all students in "${feeModalGroup.name}"!`);
    setFeeModalGroup(null);
  };

  // Open Syllabus 1-Click Modal
  const openSyllabusModal = (grp: StudentGroup) => {
    setSyllabusModalGroup(grp);
    if (syllabus.length > 0) {
      const matchSubj = syllabus.find((s) => s.subject.toLowerCase().includes(grp.subject.split(' ')[0].toLowerCase())) || syllabus[0];
      setBatchSyllabusSubjectId(matchSubj.id);
      if (matchSubj.chapters.length > 0) {
        setBatchSyllabusChapterId(matchSubj.chapters[0].id);
        if (matchSubj.chapters[0].topics.length > 0) {
          setBatchSyllabusTopicId(matchSubj.chapters[0].topics[0].id);
        }
      }
    }
  };

  // Execute Syllabus 1-Click
  const handleExecuteSyllabus = () => {
    if (!syllabusModalGroup || !batchSyllabusSubjectId || !batchSyllabusChapterId || !batchSyllabusTopicId) return;
    onBatchSyllabus(
      syllabusModalGroup.id,
      batchSyllabusSubjectId,
      batchSyllabusChapterId,
      batchSyllabusTopicId,
      batchSyllabusStatus
    );
    onShowToast(`Marked syllabus topic as ${batchSyllabusStatus} for group "${syllabusModalGroup.name}"!`);
    setSyllabusModalGroup(null);
  };

  // Open Test 1-Click Modal
  const openTestModal = (grp: StudentGroup) => {
    setTestModalGroup(grp);
    setBatchTestTitle(`${grp.subject} Mid-Term Assessment`);
    setBatchTestSubject(grp.subject);
    setBatchTestDate(todayDate);
    setBatchTestMaxMarks(50);
    const initialScores: Record<string, number> = {};
    grp.studentIds.forEach((id) => {
      initialScores[id] = 42; // default reasonable marks
    });
    setBatchTestScores(initialScores);
  };

  // Execute Test 1-Click
  const handleExecuteTest = () => {
    if (!testModalGroup) return;
    const scoresArray = testModalGroup.studentIds.map((sId) => ({
      studentId: sId,
      obtainedMarks: batchTestScores[sId] ?? 40,
      remarks: 'Batch Test Evaluation',
    }));
    onBatchTest(
      testModalGroup.id,
      batchTestTitle,
      batchTestSubject,
      batchTestDate,
      batchTestMaxMarks,
      scoresArray
    );
    onShowToast(`Recorded test scores for ${scoresArray.length} students in "${testModalGroup.name}"!`);
    setTestModalGroup(null);
  };

  // Open Manage Members Modal
  const openManageMembers = (grp: StudentGroup) => {
    setManageMembersGroup(grp);
    setSelectedMemberIds([...grp.studentIds]);
    setMemberSearchQuery('');
  };

  // Save Managed Members
  const handleSaveManagedMembers = () => {
    if (!manageMembersGroup) return;
    const updated = groups.map((g) =>
      g.id === manageMembersGroup.id ? { ...g, studentIds: selectedMemberIds } : g
    );
    onUpdateGroups(updated);
    onShowToast(`Updated roster for "${manageMembersGroup.name}" (${selectedMemberIds.length} students enrolled)!`);
    setManageMembersGroup(null);
  };

  // Open Broadcast Modal
  const openBroadcastModal = (grp: StudentGroup) => {
    setBroadcastModalGroup(grp);
    setBroadcastTemplate('class_reminder');
    setCustomBroadcastText('');
  };

  // Generate Broadcast Message
  const getBroadcastMessage = (grp: StudentGroup) => {
    if (broadcastTemplate === 'class_reminder') {
      return `📢 *Sir Ali Preparations - Class Reminder*\n\nDear Students & Parents of *${grp.name}*,\nThis is a reminder for our scheduled class:\n📅 Timing: *${grp.timeSlot}*\n📚 Subject: *${grp.subject}*\n${
        grp.tuitionMode === 'online'
          ? `💻 Online Class Link: ${grp.meetingLinkOrLocation || 'Link will be shared shortly'}`
          : `📍 Venue: ${grp.meetingLinkOrLocation || 'Assigned Home Tuition Location'}`
      }\n\nPlease join 5 minutes early with notebooks and past paper assignments ready.\n\nRegards,\n*Sir Ali*`;
    }
    if (broadcastTemplate === 'test_notice') {
      return `📝 *Sir Ali Preparations - Upcoming Test Notification*\n\nDear Students of *${grp.name}*,\nPrepare thoroughly for our upcoming subject assessment:\n🎯 Subject: *${grp.subject}*\n📅 Date: *${todayDate}*\n\nTopics include recent derivations, conceptual MCQs, and past paper numericals. Best of luck!\n\nRegards,\n*Sir Ali*`;
    }
    if (broadcastTemplate === 'fee_reminder') {
      return `💳 *Sir Ali Preparations - Monthly Tuition Fee Reminder*\n\nRespected Parents of *${grp.name}*,\nThis is a polite reminder regarding the tuition fee for the month of *${currentMonthStr}*.\n💵 Amount per student: *${formatCurrency(grp.monthlyFeePerStudent)}*\n\nKindly clear via Bank Transfer / EasyPaisa / Cash at your earliest convenience.\n\nThank you for your cooperation.\n*Sir Ali*`;
    }
    return customBroadcastText || `📢 *Announcement for ${grp.name}*\n\nPlease take note of academy updates.`;
  };

  const copyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(identifier);
    onShowToast('Copied to clipboard!');
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E0E4D9] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#E9EDE0] text-[#5C6652] flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#2D3329] font-serif">{groups.length}</div>
            <div className="text-xs text-[#707969] font-medium">Total Tuition Batches</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E0E4D9] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#E6F0FA] text-[#2563EB] flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#2D3329] font-serif">{totalEnrolledInGroups}</div>
            <div className="text-xs text-[#707969] font-medium">Enrolled Group Students</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E0E4D9] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-[#2D3329] font-serif truncate">
              {formatCurrency(totalGroupRevenue)}
            </div>
            <div className="text-xs text-[#707969] font-medium">Monthly Batch Revenue Pool</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E0E4D9] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#2D3329] flex items-center gap-1.5">
              <span>{onlineGroupsCount} Online</span>
              <span className="text-[#A4AD9B]">•</span>
              <span>{homeGroupsCount} Home</span>
            </div>
            <div className="text-xs text-[#707969] font-medium">Batch Breakdown</div>
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E0E4D9] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707969]" />
            <input
              type="text"
              placeholder="Search batches by name, subject, grade, or student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#F7F8F3] border border-[#E0E4D9] rounded-xl text-[#2D3329] focus:outline-none focus:ring-2 focus:ring-[#5C6652]/20 focus:border-[#5C6652]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#707969]" />
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="text-xs bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#5C6652] cursor-pointer"
            >
              <option value="all">All Grades</option>
              <option value="12th / XII year / A2">12th / A2</option>
              <option value="11th / XI year / AS / A1">11th / AS</option>
              <option value="O'levels Final">O'Levels</option>
              <option value="10th / X">10th / Matric</option>
              <option value="9th / IX">9th / IX</option>
            </select>
          </div>
        </div>

        {/* Create Group Button */}
        <button
          id="groups-create-batch-btn"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-1.5 bg-[#5C6652] hover:bg-[#4D5644] text-white font-medium text-xs px-4 py-2.5 rounded-xl transition shadow-xs active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Group</span>
        </button>
      </div>

      {/* Group Cards Grid */}
      {filteredGroups.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E0E4D9]">
          <div className="w-12 h-12 rounded-2xl bg-[#F0F2EA] text-[#5C6652] mx-auto flex items-center justify-center mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#2D3329]">No Tuition Groups Found</h3>
          <p className="text-xs text-[#707969] mt-1 max-w-sm mx-auto">
            Create your first tuition batch or study group to assign attendance, fees, syllabus progress, and broadcasts in a single click!
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-4 px-4 py-2 bg-[#5C6652] hover:bg-[#4D5644] text-white text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            + Create First Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedGroups.map((group) => {
            const memberStudents = group.studentIds
              .map((id) => students.find((s) => s.id === id))
              .filter(Boolean) as Student[];

            const groupMonthlyTotal = (group.monthlyFeePerStudent || 0) * memberStudents.length;

            return (
              <div
                key={group.id}
                className="bg-white rounded-2xl border border-[#E0E4D9] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group/card relative"
              >
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl ${
                          group.avatarBg || 'bg-indigo-600'
                        } text-white flex items-center justify-center font-bold text-sm shadow-xs`}
                      >
                        {group.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#2D3329] text-base leading-tight font-serif">
                          {group.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-[#5C6652] font-semibold">
                            {group.subject}
                          </span>
                          <span className="text-[#CAD3C0]">•</span>
                          <span className="text-[10px] bg-[#F0F2EA] text-[#42473E] px-2 py-0.5 rounded-md font-medium">
                            {group.grade}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mode Tag */}
                    <div className="flex items-center gap-1">
                      {group.tuitionMode === 'online' ? (
                        <span className="inline-flex items-center gap-1 bg-[#EFF6FF] text-[#1D4ED8] border border-[#DBEAFE] text-[10px] font-semibold px-2 py-0.5 rounded-lg">
                          <Laptop className="w-3 h-3" /> Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-[#ECFDF5] text-[#047857] border border-[#D1FAE5] text-[10px] font-semibold px-2 py-0.5 rounded-lg">
                          <Home className="w-3 h-3" /> Home
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description if any */}
                  {group.description && (
                    <p className="text-xs text-[#707969] mt-2.5 line-clamp-2 leading-relaxed">
                      {group.description}
                    </p>
                  )}

                  {/* Schedule & Venue Info */}
                  <div className="mt-3.5 space-y-1.5 bg-[#FAFBF9] p-3 rounded-xl border border-[#EBEFE5]">
                    <div className="flex items-center justify-between text-xs text-[#42473E]">
                      <span className="flex items-center gap-1.5 text-[#707969]">
                        <Clock className="w-3.5 h-3.5 text-[#5C6652]" /> Timing:
                      </span>
                      <span className="font-semibold text-[#2D3329]">{group.timeSlot}</span>
                    </div>

                    {group.meetingLinkOrLocation && (
                      <div className="flex items-center justify-between text-xs text-[#42473E] pt-1 border-t border-[#EBEFE5]">
                        <span className="flex items-center gap-1.5 text-[#707969] truncate">
                          {group.tuitionMode === 'online' ? (
                            <Laptop className="w-3.5 h-3.5 text-[#5C6652]" />
                          ) : (
                            <Home className="w-3.5 h-3.5 text-[#5C6652]" />
                          )}
                          {group.tuitionMode === 'online' ? 'Meet Link:' : 'Venue:'}
                        </span>
                        <div className="flex items-center gap-1">
                          {group.tuitionMode === 'online' && group.meetingLinkOrLocation.startsWith('http') ? (
                            <a
                              href={group.meetingLinkOrLocation}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#2563EB] hover:underline font-medium text-[11px] flex items-center gap-1"
                            >
                              <span>Join Call</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="font-medium text-[#2D3329] text-[11px] truncate max-w-[140px]">
                              {group.meetingLinkOrLocation}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-[#42473E] pt-1 border-t border-[#EBEFE5]">
                      <span className="flex items-center gap-1.5 text-[#707969]">
                        <DollarSign className="w-3.5 h-3.5 text-[#5C6652]" /> Total Pool:
                      </span>
                      <span className="font-bold text-[#2D3329]">
                        {formatCurrency(groupMonthlyTotal)}{' '}
                        <span className="text-[10px] font-normal text-[#707969]">
                          ({formatCurrency(group.monthlyFeePerStudent)}/student)
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Enrolled Students Roster with Quick Avatar Stack */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-[#707969] uppercase tracking-wider flex items-center gap-1">
                        <Users className="w-3 h-3 text-[#5C6652]" />
                        Enrolled Students ({memberStudents.length})
                      </span>
                      <button
                        onClick={() => openManageMembers(group)}
                        className="text-[11px] font-semibold text-[#5C6652] hover:text-[#2D3329] flex items-center gap-1 cursor-pointer"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>Manage Roster</span>
                      </button>
                    </div>

                    {memberStudents.length === 0 ? (
                      <div className="p-3 bg-[#F7F8F3] border border-dashed border-[#CAD3C0] rounded-xl text-center">
                        <span className="text-xs text-[#707969]">No students assigned yet.</span>
                        <button
                          onClick={() => openManageMembers(group)}
                          className="block mx-auto mt-1 text-xs font-semibold text-[#5C6652] hover:underline cursor-pointer"
                        >
                          + Assign Students
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-1.5 max-h-24 overflow-y-auto pr-1">
                        {memberStudents.map((st) => (
                          <div
                            key={st.id}
                            onClick={() => onSelectStudent && onSelectStudent(st)}
                            title={`Click to view profile of ${st.name} (${st.rollNo})`}
                            className="inline-flex items-center gap-1.5 bg-[#F0F2EA] hover:bg-[#E2E8D8] text-[#2D3329] px-2 py-1 rounded-lg text-xs font-medium cursor-pointer transition"
                          >
                            <span className="w-2 h-2 rounded-full bg-[#5C6652]" />
                            <span className="truncate max-w-[110px]">{st.name.split(' ')[0]}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 1-CLICK GROUP ACTIONS BAR (THE CORE FEATURE) */}
                <div className="mt-5 pt-3.5 border-t border-[#E0E4D9] space-y-2">
                  <div className="text-[10px] font-bold text-[#707969] uppercase tracking-wider">
                    ⚡ 1-Click Group Actions
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {/* 1-Click Attendance */}
                    <button
                      onClick={() => openAttendanceModal(group)}
                      className="p-2 bg-[#E9EDE0] hover:bg-[#DEE4D3] text-[#2D3329] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
                      title="Mark attendance for all group students in 1 click"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#5C6652]" />
                      <span>Mark Attendance</span>
                    </button>

                    {/* 1-Click Record Fee */}
                    <button
                      onClick={() => openFeeModal(group)}
                      className="p-2 bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#065F46] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
                      title="Record monthly fee payment or generate invoices for group"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-[#059669]" />
                      <span>Record Fees</span>
                    </button>

                    {/* 1-Click Assign Syllabus */}
                    <button
                      onClick={() => openSyllabusModal(group)}
                      className="p-2 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
                      title="Mark syllabus progress or homework for the group"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#4B5563]" />
                      <span>Update Syllabus</span>
                    </button>

                    {/* 1-Click Group Test */}
                    <button
                      onClick={() => openTestModal(group)}
                      className="p-2 bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#92400E] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
                      title="Record quiz and exam marks for group members"
                    >
                      <Award className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>Record Test</span>
                    </button>
                  </div>

                  {/* Secondary Actions (Broadcast, Edit, Delete) */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => openBroadcastModal(group)}
                      className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>WhatsApp Broadcast</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(group)}
                        className="p-1.5 text-[#707969] hover:text-[#2D3329] hover:bg-[#F0F2EA] rounded-lg transition cursor-pointer"
                        title="Edit Batch"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setGroupToDelete(group)}
                        className="p-1.5 text-[#9E6547] hover:text-[#7A3E26] hover:bg-[#FAF1EC] rounded-lg transition cursor-pointer"
                        title="Delete Batch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {filteredGroups.length > pageSize && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredGroups.length}
          pageSize={pageSize}
        />
      )}

      {/* ========================================================================= */}
      {/* 1-CLICK ATTENDANCE MODAL */}
      {/* ========================================================================= */}
      {attendanceModalGroup && (
        <div className="fixed inset-0 bg-[#1F231D]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E0E4D9]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E4D9]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#E9EDE0] text-[#5C6652] flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#2D3329] font-serif">
                    1-Click Group Attendance
                  </h3>
                  <p className="text-xs text-[#707969]">
                    Batch: <span className="font-semibold text-[#2D3329]">{attendanceModalGroup.name}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAttendanceModalGroup(null)}
                className="text-[#707969] hover:text-[#2D3329] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#42473E] mb-1">Session Date</label>
                  <input
                    type="date"
                    value={batchAttDate}
                    onChange={(e) => setBatchAttDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] rounded-xl text-[#2D3329]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#42473E] mb-1">Topic Covered</label>
                  <input
                    type="text"
                    value={batchAttTopic}
                    onChange={(e) => setBatchAttTopic(e.target.value)}
                    placeholder="e.g. Chapter 4 Past Papers"
                    className="w-full text-xs px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] rounded-xl text-[#2D3329]"
                  />
                </div>
              </div>

              {/* 1-Click Fast Actions */}
              <div>
                <label className="block text-[11px] font-semibold text-[#707969] uppercase tracking-wider mb-1.5">
                  1-Click Fast Actions
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleExecuteAttendance('all_present')}
                    className="py-2.5 px-3 bg-[#5C6652] hover:bg-[#4D5644] text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>All Present</span>
                  </button>
                  <button
                    onClick={() => handleExecuteAttendance('all_late')}
                    className="py-2.5 px-3 bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Clock className="w-4 h-4" />
                    <span>All Late</span>
                  </button>
                  <button
                    onClick={() => handleExecuteAttendance('all_absent')}
                    className="py-2.5 px-3 bg-[#FAF1EC] hover:bg-[#F5E2D6] text-[#9E6547] border border-[#EBD0C2] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <X className="w-4 h-4" />
                    <span>All Absent</span>
                  </button>
                </div>
              </div>

              {/* Member Roster & Custom Toggles */}
              <div>
                <label className="block text-[11px] font-semibold text-[#707969] uppercase tracking-wider mb-1.5">
                  Group Member Statuses ({attendanceModalGroup.studentIds.length})
                </label>
                <div className="max-h-48 overflow-y-auto border border-[#E0E4D9] rounded-xl divide-y divide-[#E0E4D9] bg-[#FAFBF9]">
                  {attendanceModalGroup.studentIds.map((sId) => {
                    const st = students.find((s) => s.id === sId);
                    if (!st) return null;
                    const cur = batchMemberStatuses[sId] || 'present';

                    return (
                      <div key={sId} className="p-2.5 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-[#2D3329]">{st.name}</div>
                          <div className="text-[10px] text-[#707969]">{st.rollNo}</div>
                        </div>

                        <div className="flex items-center gap-1">
                          {(['present', 'late', 'absent', 'excused'] as AttendanceStatus[]).map((stKey) => (
                            <button
                              key={stKey}
                              type="button"
                              onClick={() =>
                                setBatchMemberStatuses((prev) => ({ ...prev, [sId]: stKey }))
                              }
                              className={`px-2 py-1 rounded-md text-[10px] font-bold capitalize transition cursor-pointer ${
                                cur === stKey
                                  ? stKey === 'present'
                                    ? 'bg-[#5C6652] text-white'
                                    : stKey === 'late'
                                    ? 'bg-[#D97706] text-white'
                                    : stKey === 'absent'
                                    ? 'bg-[#9E6547] text-white'
                                    : 'bg-[#4B5563] text-white'
                                  : 'bg-[#F0F2EA] text-[#707969] hover:bg-[#E9EDE0]'
                              }`}
                            >
                              {stKey}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-[#E0E4D9]">
              <button
                type="button"
                onClick={() => setAttendanceModalGroup(null)}
                className="px-4 py-2 text-xs font-semibold text-[#707969] hover:bg-[#F0F2EA] rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleExecuteAttendance()}
                className="px-5 py-2 text-xs font-semibold bg-[#5C6652] hover:bg-[#4D5644] text-white rounded-xl cursor-pointer shadow-xs active:scale-95"
              >
                Save Attendance Records
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1-CLICK FEE / INVOICING MODAL */}
      {/* ========================================================================= */}
      {feeModalGroup && (
        <div className="fixed inset-0 bg-[#1F231D]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E0E4D9]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E4D9]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#2D3329] font-serif">
                    1-Click Group Fee Invoicing
                  </h3>
                  <p className="text-xs text-[#707969]">
                    Batch: <span className="font-semibold text-[#2D3329]">{feeModalGroup.name}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFeeModalGroup(null)}
                className="text-[#707969] hover:text-[#2D3329] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#42473E] mb-1">Target Billing Month</label>
                <input
                  type="text"
                  value={batchFeeMonth}
                  onChange={(e) => setBatchFeeMonth(e.target.value)}
                  placeholder="e.g. August 2026"
                  className="w-full text-xs px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] rounded-xl text-[#2D3329]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#42473E] mb-1">Fee Per Student (Rs)</label>
                  <input
                    type="number"
                    value={batchFeeAmount}
                    onChange={(e) => setBatchFeeAmount(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] rounded-xl text-[#2D3329]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#42473E] mb-1">Payment Status</label>
                  <select
                    value={batchFeeStatus}
                    onChange={(e) => setBatchFeeStatus(e.target.value as PaymentStatus)}
                    className="w-full text-xs px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] rounded-xl text-[#2D3329]"
                  >
                    <option value="paid">Paid (Instant Clearance)</option>
                    <option value="pending">Pending (Generate Invoice)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#42473E] mb-1">Payment Method</label>
                  <select
                    value={batchFeeMethod}
                    onChange={(e) => setBatchFeeMethod(e.target.value as PaymentMethod)}
                    className="w-full text-xs px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] rounded-xl text-[#2D3329]"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="EasyPaisa">EasyPaisa</option>
                    <option value="JazzCash">JazzCash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#42473E] mb-1">Due Date</label>
                  <input
                    type="date"
                    value={batchFeeDueDate}
                    onChange={(e) => setBatchFeeDueDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] rounded-xl text-[#2D3329]"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl text-xs text-[#166534]">
                <div className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Ready to process for {feeModalGroup.studentIds.length} students:
                </div>
                <div className="mt-1">
                  Total batch transaction:{' '}
                  <span className="font-bold">
                    {formatCurrency(batchFeeAmount * feeModalGroup.studentIds.length)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-[#E0E4D9]">
              <button
                type="button"
                onClick={() => setFeeModalGroup(null)}
                className="px-4 py-2 text-xs font-semibold text-[#707969] hover:bg-[#F0F2EA] rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteFee}
                className="px-5 py-2 text-xs font-semibold bg-[#059669] hover:bg-[#047857] text-white rounded-xl cursor-pointer shadow-xs active:scale-95"
              >
                1-Click Apply to All ({feeModalGroup.studentIds.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1-CLICK SYLLABUS ASSIGNMENT MODAL */}
      {/* ========================================================================= */}
      {syllabusModalGroup && (
        <div className="fixed inset-0 bg-[#1F231D]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E0E4D9]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E4D9]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#F3F4F6] text-[#4B5563] flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#2D3329] font-serif">
                    1-Click Syllabus Progress
                  </h3>
                  <p className="text-xs text-[#707969]">
                    Batch: <span className="font-semibold text-[#2D3329]">{syllabusModalGroup.name}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSyllabusModalGroup(null)}
                className="text-[#707969] hover:text-[#2D3329] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-[#42473E] mb-1">Select Subject</label>
                <select
                  value={batchSyllabusSubjectId}
                  onChange={(e) => {
                    setBatchSyllabusSubjectId(e.target.value);
                    const sub = syllabus.find((s) => s.id === e.target.value);
                    if (sub && sub.chapters.length > 0) {
                      setBatchSyllabusChapterId(sub.chapters[0].id);
                      if (sub.chapters[0].topics.length > 0) {
                        setBatchSyllabusTopicId(sub.chapters[0].topics[0].id);
                      }
                    }
                  }}
                  className="w-full text-xs px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] rounded-xl text-[#2D3329]"
                >
                  {syllabus.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.subject} ({s.grade})
                    </option>
                  ))}
                </select>
              </div>

              {/* Chapter */}
              {(() => {
                const currentSubj = syllabus.find((s) => s.id === batchSyllabusSubjectId);
                const currentChap = currentSubj?.chapters.find((c) => c.id === batchSyllabusChapterId);

                return (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-[#42473E] mb-1">Select Chapter</label>
                      <select
                        value={batchSyllabusChapterId}
                        onChange={(e) => {
                          setBatchSyllabusChapterId(e.target.value);
                          const chap = currentSubj?.chapters.find((c) => c.id === e.target.value);
                          if (chap && chap.topics.length > 0) {
                            setBatchSyllabusTopicId(chap.topics[0].id);
                          }
                        }}
                        className="w-full text-xs px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] rounded-xl text-[#2D3329]"
                      >
                        {currentSubj?.chapters.map((c) => (
                          <option key={c.id} value={c.id}>
                            Ch {c.chapterNumber}: {c.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#42473E] mb-1">Select Topic / Lesson</label>
                      <select
                        value={batchSyllabusTopicId}
                        onChange={(e) => setBatchSyllabusTopicId(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] rounded-xl text-[#2D3329]"
                      >
                        {currentChap?.topics.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.title} [{t.status}]
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                );
              })()}

              <div>
                <label className="block text-xs font-semibold text-[#42473E] mb-1">Assign Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBatchSyllabusStatus('completed')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      batchSyllabusStatus === 'completed'
                        ? 'bg-[#5C6652] text-white shadow-xs'
                        : 'bg-[#F0F2EA] text-[#42473E]'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Completed</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBatchSyllabusStatus('in-progress')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      batchSyllabusStatus === 'in-progress'
                        ? 'bg-[#D97706] text-white shadow-xs'
                        : 'bg-[#F0F2EA] text-[#42473E]'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>In-Progress</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-[#E0E4D9]">
              <button
                type="button"
                onClick={() => setSyllabusModalGroup(null)}
                className="px-4 py-2 text-xs font-semibold text-[#707969] hover:bg-[#F0F2EA] rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSyllabus}
                className="px-5 py-2 text-xs font-semibold bg-[#5C6652] hover:bg-[#4D5644] text-white rounded-xl cursor-pointer shadow-xs active:scale-95"
              >
                1-Click Update Syllabus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1-CLICK TEST / EXAM RECORDING MODAL */}
      {/* ========================================================================= */}
      {testModalGroup && (
        <div className="fixed inset-0 bg-[#1F231D]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E0E4D9]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E4D9]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#2D3329] font-serif">
                    1-Click Group Test Scores
                  </h3>
                  <p className="text-xs text-[#707969]">
                    Batch: <span className="font-semibold text-[#2D3329]">{testModalGroup.name}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTestModalGroup(null)}
                className="text-[#707969] hover:text-[#2D3329] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#42473E] mb-1">Test Title</label>
                <input
                  type="text"
                  value={batchTestTitle}
                  onChange={(e) => setBatchTestTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] rounded-xl text-[#2D3329]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#42473E] mb-1">Subject</label>
                  <input
                    type="text"
                    value={batchTestSubject}
                    onChange={(e) => setBatchTestSubject(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] rounded-xl text-[#2D3329]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#42473E] mb-1">Test Date</label>
                  <input
                    type="date"
                    value={batchTestDate}
                    onChange={(e) => setBatchTestDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] rounded-xl text-[#2D3329]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#42473E] mb-1">Max Marks</label>
                  <input
                    type="number"
                    value={batchTestMaxMarks}
                    onChange={(e) => setBatchTestMaxMarks(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] rounded-xl text-[#2D3329]"
                  />
                </div>
              </div>

              {/* Student Marks Table */}
              <div>
                <label className="block text-[11px] font-semibold text-[#707969] uppercase tracking-wider mb-1.5">
                  Enter Scores per Student (Max: {batchTestMaxMarks})
                </label>
                <div className="max-h-48 overflow-y-auto border border-[#E0E4D9] rounded-xl divide-y divide-[#E0E4D9] bg-[#FAFBF9]">
                  {testModalGroup.studentIds.map((sId) => {
                    const st = students.find((s) => s.id === sId);
                    if (!st) return null;
                    const marks = batchTestScores[sId] ?? 40;
                    const pct = Math.round((marks / (batchTestMaxMarks || 1)) * 100);

                    return (
                      <div key={sId} className="p-2.5 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-[#2D3329]">{st.name}</div>
                          <div className="text-[10px] text-[#707969]">{st.rollNo}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max={batchTestMaxMarks}
                            value={marks}
                            onChange={(e) =>
                              setBatchTestScores((prev) => ({
                                ...prev,
                                [sId]: Number(e.target.value),
                              }))
                            }
                            className="w-16 text-xs font-bold text-center px-2 py-1 bg-white border border-[#CAD3C0] rounded-lg text-[#2D3329]"
                          />
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                              pct >= 80
                                ? 'bg-[#DCFCE7] text-[#15803D]'
                                : pct >= 60
                                ? 'bg-[#FEF9C3] text-[#A16207]'
                                : 'bg-[#FEE2E2] text-[#B91C1C]'
                            }`}
                          >
                            {pct}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-[#E0E4D9]">
              <button
                type="button"
                onClick={() => setTestModalGroup(null)}
                className="px-4 py-2 text-xs font-semibold text-[#707969] hover:bg-[#F0F2EA] rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteTest}
                className="px-5 py-2 text-xs font-semibold bg-[#D97706] hover:bg-[#B45309] text-white rounded-xl cursor-pointer shadow-xs active:scale-95"
              >
                1-Click Save Group Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1-CLICK WHATSAPP BROADCAST MODAL */}
      {/* ========================================================================= */}
      {broadcastModalGroup && (
        <div className="fixed inset-0 bg-[#1F231D]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E0E4D9]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E4D9]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#2D3329] font-serif">
                    WhatsApp Group Broadcast
                  </h3>
                  <p className="text-xs text-[#707969]">
                    Broadcast to parents & students of <span className="font-semibold text-[#2D3329]">{broadcastModalGroup.name}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBroadcastModalGroup(null)}
                className="text-[#707969] hover:text-[#2D3329] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#42473E] mb-1.5">Select Broadcast Template</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'class_reminder', label: 'Class & Link Reminder' },
                    { id: 'test_notice', label: 'Upcoming Test Notice' },
                    { id: 'fee_reminder', label: 'Fee Reminder Notice' },
                    { id: 'custom', label: 'Custom Announcement' },
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setBroadcastTemplate(tpl.id as any)}
                      className={`p-2 rounded-xl text-xs font-semibold text-left transition cursor-pointer ${
                        broadcastTemplate === tpl.id
                          ? 'bg-[#2563EB] text-white shadow-xs'
                          : 'bg-[#F0F2EA] text-[#42473E] hover:bg-[#E9EDE0]'
                      }`}
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {broadcastTemplate === 'custom' && (
                <div>
                  <label className="block text-xs font-semibold text-[#42473E] mb-1">Custom Message Text</label>
                  <textarea
                    rows={3}
                    value={customBroadcastText}
                    onChange={(e) => setCustomBroadcastText(e.target.value)}
                    placeholder="Type your message announcement for the group..."
                    className="w-full text-xs p-3 bg-[#F7F8F3] border border-[#E0E4D9] rounded-xl text-[#2D3329]"
                  />
                </div>
              )}

              {/* Live Preview */}
              <div>
                <label className="block text-[11px] font-semibold text-[#707969] uppercase tracking-wider mb-1">
                  Message Preview
                </label>
                <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl text-xs text-[#14532D] whitespace-pre-line font-sans max-h-36 overflow-y-auto">
                  {getBroadcastMessage(broadcastModalGroup)}
                </div>
              </div>

              {/* One-Click Direct WhatsApp Chat Launchers */}
              <div>
                <label className="block text-[11px] font-semibold text-[#707969] uppercase tracking-wider mb-1.5">
                  Direct Parent WhatsApp Chats ({broadcastModalGroup.studentIds.length})
                </label>
                <div className="max-h-36 overflow-y-auto border border-[#E0E4D9] rounded-xl divide-y divide-[#E0E4D9] bg-[#FAFBF9]">
                  {broadcastModalGroup.studentIds.map((sId) => {
                    const st = students.find((s) => s.id === sId);
                    if (!st) return null;
                    const cleanPhone = (st.parentPhone || st.phone || '').replace(/[^0-9]/g, '');
                    const encodedMsg = encodeURIComponent(getBroadcastMessage(broadcastModalGroup));
                    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;

                    return (
                      <div key={sId} className="p-2 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-[#2D3329]">{st.name}</div>
                          <div className="text-[10px] text-[#707969]">Parent: {st.parentName} ({st.parentPhone})</div>
                        </div>

                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Send className="w-3 h-3" />
                          <span>Send WA</span>
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-[#E0E4D9]">
              <button
                type="button"
                onClick={() => setBroadcastModalGroup(null)}
                className="px-4 py-2 text-xs font-semibold text-[#707969] hover:bg-[#F0F2EA] rounded-xl cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    getBroadcastMessage(broadcastModalGroup),
                    'broadcast_copied'
                  )
                }
                className="px-4 py-2 text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                {copiedLink === 'broadcast_copied' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Broadcast Text</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MANAGE GROUP ROSTER / MEMBERS MODAL */}
      {/* ========================================================================= */}
      {manageMembersGroup && (
        <div className="fixed inset-0 bg-[#1F231D]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E0E4D9]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E4D9]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#E9EDE0] text-[#5C6652] flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#2D3329] font-serif">
                    Assign Students to Batch
                  </h3>
                  <p className="text-xs text-[#707969]">
                    Group: <span className="font-semibold text-[#2D3329]">{manageMembersGroup.name}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setManageMembersGroup(null)}
                className="text-[#707969] hover:text-[#2D3329] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick search and select all / clear all */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#707969]" />
                  <input
                    type="text"
                    placeholder="Search students to assign..."
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F7F8F3] border border-[#E0E4D9] rounded-xl text-[#2D3329]"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedMemberIds(students.map((s) => s.id))}
                    className="text-[11px] font-semibold text-[#5C6652] hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-[#CAD3C0]">•</span>
                  <button
                    type="button"
                    onClick={() => setSelectedMemberIds([])}
                    className="text-[11px] font-semibold text-[#9E6547] hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Student Checklist */}
              <div className="max-h-60 overflow-y-auto border border-[#E0E4D9] rounded-xl divide-y divide-[#E0E4D9] bg-[#FAFBF9]">
                {students
                  .filter((s) => {
                    if (!memberSearchQuery.trim()) return true;
                    const q = memberSearchQuery.toLowerCase();
                    return (
                      s.name.toLowerCase().includes(q) ||
                      s.rollNo.toLowerCase().includes(q) ||
                      s.grade.toLowerCase().includes(q)
                    );
                  })
                  .map((st) => {
                    const isSelected = selectedMemberIds.includes(st.id);

                    return (
                      <label
                        key={st.id}
                        className={`p-2.5 flex items-center justify-between hover:bg-[#F0F2EA] transition cursor-pointer ${
                          isSelected ? 'bg-[#F0F2EA]' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMemberIds([...selectedMemberIds, st.id]);
                              } else {
                                setSelectedMemberIds(selectedMemberIds.filter((id) => id !== st.id));
                              }
                            }}
                            className="w-4 h-4 rounded text-[#5C6652] accent-[#5C6652]"
                          />
                          <div>
                            <div className="text-xs font-bold text-[#2D3329]">{st.name}</div>
                            <div className="text-[10px] text-[#707969]">
                              {st.rollNo} • {st.grade} • {st.tuitionMode === 'online' ? 'Online' : 'Home'}
                            </div>
                          </div>
                        </div>

                        <span className="text-[11px] font-medium text-[#5C6652]">
                          {formatCurrency(st.monthlyFee)}
                        </span>
                      </label>
                    );
                  })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-[#E0E4D9]">
              <button
                type="button"
                onClick={() => setManageMembersGroup(null)}
                className="px-4 py-2 text-xs font-semibold text-[#707969] hover:bg-[#F0F2EA] rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveManagedMembers}
                className="px-5 py-2 text-xs font-semibold bg-[#5C6652] hover:bg-[#4D5644] text-white rounded-xl cursor-pointer shadow-xs active:scale-95"
              >
                Save Roster ({selectedMemberIds.length} Students)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE / EDIT GROUP MODAL */}
      {/* ========================================================================= */}
      {isCreateGroupOpen && (
        <div className="fixed inset-0 bg-[#1F231D]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E0E4D9] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E4D9]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#E9EDE0] text-[#5C6652] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#2D3329] font-serif">
                    {groupToEdit ? 'Edit Tuition Group' : 'Create New Tuition Group / Batch'}
                  </h3>
                  <p className="text-xs text-[#707969]">
                    Manage group students and apply 1-click attendance, fees, and tests
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateGroupOpen(false)}
                className="text-[#707969] hover:text-[#2D3329] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#42473E] mb-1">Group / Batch Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. A-Levels Physics Alpha Batch"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-[#F7F8F3] border border-[#E0E4D9] rounded-xl text-[#2D3329] focus:outline-none focus:ring-2 focus:ring-[#5C6652]/20 focus:border-[#5C6652]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#42473E] mb-1">Target Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Physics (9702)"
                    value={groupSubject}
                    onChange={(e) => setGroupSubject(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] rounded-xl text-[#2D3329]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#42473E] mb-1">Target Grade *</label>
                  <select
                    value={groupGrade}
                    onChange={(e) => setGroupGrade(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] rounded-xl text-[#2D3329]"
                  >
                    <option value="12th / XII year / A2">12th / XII year / A2</option>
                    <option value="11th / XI year / AS / A1">11th / XI year / AS / A1</option>
                    <option value="O'levels Final">O'levels Final</option>
                    <option value="10th / X">10th / X (Matric)</option>
                    <option value="9th / IX">9th / IX (Matric)</option>
                    <option value="8th / VIII">8th / VIII</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#42473E] mb-1">Tuition Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGroupMode('online')}
                      className={`p-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                        groupMode === 'online'
                          ? 'bg-[#5C6652] text-white shadow-xs'
                          : 'bg-[#F0F2EA] text-[#42473E]'
                      }`}
                    >
                      <Laptop className="w-3.5 h-3.5" />
                      <span>Online</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGroupMode('home')}
                      className={`p-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                        groupMode === 'home'
                          ? 'bg-[#5C6652] text-white shadow-xs'
                          : 'bg-[#F0F2EA] text-[#42473E]'
                      }`}
                    >
                      <Home className="w-3.5 h-3.5" />
                      <span>Home</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#42473E] mb-1">Monthly Fee Per Student</label>
                  <input
                    type="number"
                    value={groupFee}
                    onChange={(e) => setGroupFee(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] rounded-xl text-[#2D3329]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#42473E] mb-1">Time Slot & Class Days</label>
                <input
                  type="text"
                  placeholder="e.g. 07:30 PM - 09:00 PM (Mon, Wed, Fri)"
                  value={groupTimeSlot}
                  onChange={(e) => setGroupTimeSlot(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] rounded-xl text-[#2D3329]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#42473E] mb-1">
                  {groupMode === 'online' ? 'Google Meet / Zoom Meeting Link' : 'Home Tuition Venue Address'}
                </label>
                <input
                  type="text"
                  placeholder={
                    groupMode === 'online'
                      ? 'https://meet.google.com/xyz-abc'
                      : 'e.g. Sector F-10/2, Islamabad'
                  }
                  value={groupLocation}
                  onChange={(e) => setGroupLocation(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] rounded-xl text-[#2D3329]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#42473E] mb-1">Batch Theme Color</label>
                <div className="flex items-center gap-2">
                  {GROUP_COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setGroupColor(col)}
                      className={`w-6 h-6 rounded-full ${col} transition transform ${
                        groupColor === col ? 'ring-2 ring-offset-2 ring-[#5C6652] scale-110' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Initial Student Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#42473E] mb-1">
                  Assign Initial Students ({groupInitialStudentIds.length} Selected)
                </label>
                <div className="max-h-36 overflow-y-auto border border-[#E0E4D9] rounded-xl divide-y divide-[#E0E4D9] bg-[#FAFBF9]">
                  {students.map((st) => {
                    const isSel = groupInitialStudentIds.includes(st.id);
                    return (
                      <label
                        key={st.id}
                        className={`p-2 flex items-center justify-between hover:bg-[#F0F2EA] transition cursor-pointer text-xs ${
                          isSel ? 'bg-[#F0F2EA]' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSel}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setGroupInitialStudentIds([...groupInitialStudentIds, st.id]);
                              } else {
                                setGroupInitialStudentIds(
                                  groupInitialStudentIds.filter((id) => id !== st.id)
                                );
                              }
                            }}
                            className="w-3.5 h-3.5 rounded text-[#5C6652] accent-[#5C6652]"
                          />
                          <span className="font-bold text-[#2D3329]">{st.name}</span>
                          <span className="text-[10px] text-[#707969]">({st.rollNo})</span>
                        </div>
                        <span className="text-[10px] text-[#5C6652] font-semibold">{st.grade}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E0E4D9]">
                <button
                  type="button"
                  onClick={() => setIsCreateGroupOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#707969] hover:bg-[#F0F2EA] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-[#5C6652] hover:bg-[#4D5644] text-white rounded-xl cursor-pointer shadow-xs active:scale-95 transition"
                >
                  {groupToEdit ? 'Save Changes' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE GROUP CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {groupToDelete && (
        <div className="fixed inset-0 bg-[#1F231D]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E0E4D9]">
            <div className="w-10 h-10 rounded-xl bg-[#FAF1EC] text-[#9E6547] flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#2D3329] font-serif">Remove Tuition Group?</h3>
            <p className="text-xs text-[#707969] mt-1">
              Are you sure you want to remove <span className="font-bold text-[#2D3329]">{groupToDelete.name}</span>? Enrolled student records will remain intact in your academy portal.
            </p>

            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setGroupToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-[#707969] hover:bg-[#F0F2EA] rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteGroup(groupToDelete.id)}
                className="px-4 py-2 text-xs font-semibold bg-[#9E6547] hover:bg-[#855337] text-white rounded-xl cursor-pointer shadow-xs"
              >
                Yes, Remove Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
