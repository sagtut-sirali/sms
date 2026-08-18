import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  RotateCcw, 
  Sparkles, 
  Calendar, 
  Layers,
  Edit,
  Trash2,
  Check,
  Users,
  UserCheck,
  GraduationCap,
  Filter,
  X,
  PlusCircle,
  FolderPlus,
  BookMarked,
  Search,
  CheckCheck,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { SubjectSyllabus, SyllabusChapter, SyllabusTopic, Student, StudentSyllabusRecord } from '../types';
import { 
  autoDetectChapterForTopic, 
  searchCurriculumTopics, 
  getTopicStatusForStudent, 
  updateStudentTopicProgress,
  CurriculumTopicMatch 
} from '../data/curriculumDatabase';
import { Pagination } from './Pagination';

interface SyllabusTabProps {
  syllabusList: SubjectSyllabus[];
  students?: Student[];
  onUpdateSyllabus: (syllabus: SubjectSyllabus[]) => void;
  onUpdateStudents?: (students: Student[]) => void;
  todayDate: string;
  onSelectStudent?: (student: Student) => void;
}

export const SyllabusTab: React.FC<SyllabusTabProps> = ({
  syllabusList,
  students = [],
  onUpdateSyllabus,
  onUpdateStudents,
  todayDate,
  onSelectStudent,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    syllabusList.length > 0 ? syllabusList[0].id : ''
  );
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({
    'ch-1': true,
    'ch-2': true,
    'ch-3': true,
    'ch-m1': true,
    'ch-m2': true,
    'ch-c1': true,
  });

  // Pagination for chapters
  const [currentChapterPage, setCurrentChapterPage] = useState<number>(1);
  const [chaptersPerPage, setChaptersPerPage] = useState<number>(5);

  // Search within syllabus
  const [topicSearchQuery, setTopicSearchQuery] = useState('');

  // Add Chapter Modal states
  const [isAddChapterOpen, setIsAddChapterOpen] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterNumber, setNewChapterNumber] = useState('');

  // Smart Add Topic Modal states (with automatic chapter/unit detection & student assignment)
  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);
  const [topicFormTitle, setTopicFormTitle] = useState('');
  const [topicFormSubjectId, setTopicFormSubjectId] = useState('');
  const [topicFormChapterChoice, setTopicFormChapterChoice] = useState<'auto' | 'existing' | 'new'>('auto');
  const [topicFormSelectedChapterId, setTopicFormSelectedChapterId] = useState('');
  const [topicFormNewChapterNum, setTopicFormNewChapterNum] = useState('');
  const [topicFormNewChapterTitle, setTopicFormNewChapterTitle] = useState('');
  const [topicFormStudentId, setTopicFormStudentId] = useState<string>('all');
  const [topicFormStatus, setTopicFormStatus] = useState<'pending' | 'in-progress' | 'completed' | 'revised'>('pending');
  const [topicFormNotes, setTopicFormNotes] = useState('');
  const [topicFormDate, setTopicFormDate] = useState(todayDate);

  // Auto-detection results state
  const [detectedChapterInfo, setDetectedChapterInfo] = useState<{
    matched: boolean;
    chapterNumber: string | number;
    chapterTitle: string;
    matchedTopicSuggestion?: string;
    source: 'existing' | 'curriculum' | 'smart_fallback';
    confidence: number;
  } | null>(null);

  // Live curriculum suggestions
  const [curriculumSuggestions, setCurriculumSuggestions] = useState<CurriculumTopicMatch[]>([]);

  // Add Subject Modal
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectGrade, setNewSubjectGrade] = useState('');

  // Confirmation dialog for subject / topic deletion
  const [subjectToDelete, setSubjectToDelete] = useState<SubjectSyllabus | null>(null);
  const [topicToDelete, setTopicToDelete] = useState<{
    subjectId: string;
    chapterId: string;
    topicId: string;
    title: string;
  } | null>(null);

  // Selected Student Object
  const selectedStudent = useMemo(() => {
    if (selectedStudentId === 'all') return null;
    return students.find(s => s.id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  // Filter syllabus subjects based on selected student's enrolled subjects
  const availableSyllabusList = useMemo(() => {
    if (!selectedStudent) return syllabusList;
    
    // Match by student's subjects list or grade
    const studentSubjectsLower = selectedStudent.subjects.map(s => s.toLowerCase());
    const matched = syllabusList.filter(s => {
      const sNameLower = s.subject.toLowerCase();
      return studentSubjectsLower.some(sub => sNameLower.includes(sub) || sub.includes(sNameLower));
    });

    return matched.length > 0 ? matched : syllabusList;
  }, [syllabusList, selectedStudent]);

  // Ensure selectedSubjectId is valid when student or syllabusList changes
  useEffect(() => {
    if (availableSyllabusList.length > 0) {
      const exists = availableSyllabusList.some(s => s.id === selectedSubjectId);
      if (!exists) {
        setSelectedSubjectId(availableSyllabusList[0].id);
      }
    }
  }, [availableSyllabusList, selectedSubjectId]);

  // Reset chapter pagination when subject or student filter changes
  useEffect(() => {
    setCurrentChapterPage(1);
  }, [selectedSubjectId, selectedStudentId]);

  const currentSubject = availableSyllabusList.find(s => s.id === selectedSubjectId) || availableSyllabusList[0] || syllabusList[0];

  const toggleChapter = (chId: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chId]: !prev[chId],
    }));
  };

  // Run automatic chapter & unit detection whenever topicFormTitle changes
  useEffect(() => {
    if (!isAddTopicModalOpen) return;
    
    const subj = syllabusList.find(s => s.id === topicFormSubjectId) || currentSubject;
    const subjName = subj?.subject;
    const chapters = subj?.chapters || [];

    if (topicFormTitle.trim().length >= 2) {
      const detection = autoDetectChapterForTopic(topicFormTitle, subjName, chapters);
      setDetectedChapterInfo(detection);

      // Search live curriculum suggestions
      const suggestions = searchCurriculumTopics(topicFormTitle, subjName, 4);
      setCurriculumSuggestions(suggestions);

      // If in auto mode, update the pre-filled new chapter or existing chapter
      if (topicFormChapterChoice === 'auto') {
        const existingMatch = chapters.find(ch => 
          ch.title.toLowerCase().includes(detection.chapterTitle.toLowerCase()) ||
          detection.chapterTitle.toLowerCase().includes(ch.title.toLowerCase())
        );

        if (existingMatch) {
          setTopicFormSelectedChapterId(existingMatch.id);
        } else {
          setTopicFormNewChapterNum(detection.chapterNumber.toString());
          setTopicFormNewChapterTitle(detection.chapterTitle);
        }
      }
    } else {
      setDetectedChapterInfo(null);
      setCurriculumSuggestions([]);
    }
  }, [topicFormTitle, topicFormSubjectId, isAddTopicModalOpen, topicFormChapterChoice, currentSubject, syllabusList]);

  // Open Add Topic modal with smart defaults
  const handleOpenAddTopicModal = (chapterId?: string) => {
    const activeSubjId = currentSubject?.id || (syllabusList[0] ? syllabusList[0].id : '');
    const activeSubj = syllabusList.find(s => s.id === activeSubjId);
    
    setTopicFormSubjectId(activeSubjId);
    setTopicFormTitle('');
    setTopicFormStatus('pending');
    setTopicFormNotes('');
    setTopicFormDate(todayDate);
    setTopicFormStudentId(selectedStudentId); // Pre-fill with current selected student
    setDetectedChapterInfo(null);
    setCurriculumSuggestions([]);

    if (chapterId) {
      setTopicFormChapterChoice('existing');
      setTopicFormSelectedChapterId(chapterId);
      const ch = activeSubj?.chapters.find(c => c.id === chapterId);
      setTopicFormNewChapterNum(ch?.chapterNumber.toString() || '');
      setTopicFormNewChapterTitle(ch?.title || '');
    } else {
      setTopicFormChapterChoice('auto');
      setTopicFormSelectedChapterId(activeSubj?.chapters[0]?.id || '');
      setTopicFormNewChapterNum(`${(activeSubj?.chapters.length || 0) + 1}`);
      setTopicFormNewChapterTitle('');
    }

    setIsAddTopicModalOpen(true);
  };

  // Select a suggestion from live curriculum search
  const handleSelectCurriculumSuggestion = (item: CurriculumTopicMatch) => {
    setTopicFormTitle(item.topicTitle);
    
    const subj = syllabusList.find(s => s.id === topicFormSubjectId) || currentSubject;
    const chapters = subj?.chapters || [];
    
    // Check if chapter already exists in subject
    const existingCh = chapters.find(ch => 
      ch.title.toLowerCase().includes(item.chapterTitle.toLowerCase()) ||
      item.chapterTitle.toLowerCase().includes(ch.title.toLowerCase())
    );

    if (existingCh) {
      setTopicFormChapterChoice('existing');
      setTopicFormSelectedChapterId(existingCh.id);
    } else {
      setTopicFormChapterChoice('new');
      setTopicFormNewChapterNum(item.chapterNumber.toString());
      setTopicFormNewChapterTitle(item.chapterTitle);
    }
  };

  // Submit Smart Add Topic
  const handleSaveTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicFormTitle.trim() || !topicFormSubjectId) return;

    const subjIndex = syllabusList.findIndex(s => s.id === topicFormSubjectId);
    if (subjIndex === -1) return;

    const subj = { ...syllabusList[subjIndex] };
    let chapters = [...subj.chapters];

    let targetChapterId = topicFormSelectedChapterId;

    // Determine target chapter
    if (topicFormChapterChoice === 'auto') {
      // If detected chapter matches an existing chapter, use it
      if (detectedChapterInfo) {
        const existingMatch = chapters.find(ch => 
          ch.title.toLowerCase().includes(detectedChapterInfo.chapterTitle.toLowerCase()) ||
          detectedChapterInfo.chapterTitle.toLowerCase().includes(ch.title.toLowerCase())
        );

        if (existingMatch) {
          targetChapterId = existingMatch.id;
        } else {
          // Create auto-detected chapter
          const newCh: SyllabusChapter = {
            id: `ch-${Date.now()}`,
            chapterNumber: detectedChapterInfo.chapterNumber.toString(),
            title: detectedChapterInfo.chapterTitle,
            topics: []
          };
          chapters.push(newCh);
          targetChapterId = newCh.id;
        }
      } else if (chapters.length > 0) {
        targetChapterId = chapters[0].id;
      } else {
        const newCh: SyllabusChapter = {
          id: `ch-${Date.now()}`,
          chapterNumber: '1',
          title: 'Unit 1: Fundamentals',
          topics: []
        };
        chapters.push(newCh);
        targetChapterId = newCh.id;
      }
    } else if (topicFormChapterChoice === 'new' && topicFormNewChapterTitle.trim()) {
      const newCh: SyllabusChapter = {
        id: `ch-${Date.now()}`,
        chapterNumber: topicFormNewChapterNum.trim() || `${chapters.length + 1}`,
        title: topicFormNewChapterTitle.trim(),
        topics: []
      };
      chapters.push(newCh);
      targetChapterId = newCh.id;
    } else if (!targetChapterId && chapters.length > 0) {
      targetChapterId = chapters[0].id;
    }

    const newTopicId = `top-${Date.now()}`;
    const newTopic: SyllabusTopic = {
      id: newTopicId,
      title: topicFormTitle.trim(),
      status: topicFormStatus,
      completedDate: (topicFormStatus === 'completed' || topicFormStatus === 'revised') ? topicFormDate : undefined,
      notes: topicFormNotes.trim() || undefined,
    };

    // Insert topic into chapter
    chapters = chapters.map(ch => {
      if (ch.id === targetChapterId) {
        return {
          ...ch,
          topics: [...ch.topics, newTopic]
        };
      }
      return ch;
    });

    subj.chapters = chapters;
    const updatedSyllabusList = [...syllabusList];
    updatedSyllabusList[subjIndex] = subj;
    onUpdateSyllabus(updatedSyllabusList);

    // Save with specific student if selected
    if (topicFormStudentId !== 'all' && onUpdateStudents) {
      const studentToUpdate = students.find(s => s.id === topicFormStudentId);
      if (studentToUpdate) {
        const updatedStudent = updateStudentTopicProgress(
          studentToUpdate,
          newTopicId,
          topicFormStatus,
          topicFormDate,
          topicFormNotes.trim() || undefined
        );
        const updatedStudentsList = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
        onUpdateStudents(updatedStudentsList);
      }
    }

    // Expand target chapter
    if (targetChapterId) {
      setExpandedChapters(prev => ({ ...prev, [targetChapterId]: true }));
    }

    setIsAddTopicModalOpen(false);
  };

  // Update Topic Status (Handles both student-specific and master curriculum)
  const handleTopicStatusChange = (
    chapterId: string, 
    topicId: string, 
    newStatus: 'pending' | 'in-progress' | 'completed' | 'revised'
  ) => {
    if (!currentSubject) return;

    // 1. If a specific student is selected, update that student's record
    if (selectedStudent && onUpdateStudents) {
      const updatedStudent = updateStudentTopicProgress(
        selectedStudent,
        topicId,
        newStatus,
        todayDate
      );
      const updatedStudentsList = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
      onUpdateStudents(updatedStudentsList);
    }

    // 2. Also update master syllabus representation
    const updatedSyllabusList = syllabusList.map(subj => {
      if (subj.id !== currentSubject.id) return subj;

      const updatedChapters = subj.chapters.map(ch => {
        if (ch.id !== chapterId) return ch;

        const updatedTopics = ch.topics.map(top => {
          if (top.id !== topicId) return top;
          return {
            ...top,
            status: newStatus,
            completedDate: (newStatus === 'completed' || newStatus === 'revised') ? (top.completedDate || todayDate) : undefined,
          };
        });

        return { ...ch, topics: updatedTopics };
      });

      return { ...subj, chapters: updatedChapters };
    });

    onUpdateSyllabus(updatedSyllabusList);
  };

  // Add Chapter Handler
  const handleAddChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterTitle.trim() || !currentSubject) return;

    const newChapter: SyllabusChapter = {
      id: `ch-${Date.now()}`,
      chapterNumber: newChapterNumber.trim() || (currentSubject.chapters.length + 1).toString(),
      title: newChapterTitle.trim(),
      topics: [],
    };

    const updatedSyllabusList = syllabusList.map(subj => {
      if (subj.id !== currentSubject.id) return subj;
      return {
        ...subj,
        chapters: [...subj.chapters, newChapter],
      };
    });

    onUpdateSyllabus(updatedSyllabusList);
    setExpandedChapters(prev => ({ ...prev, [newChapter.id]: true }));
    setNewChapterTitle('');
    setNewChapterNumber('');
    setIsAddChapterOpen(false);
  };

  // Add Subject Handler
  const handleAddSubject = (e?: React.FormEvent, customName?: string, customGrade?: string) => {
    if (e) e.preventDefault();
    const name = (customName || newSubjectName).trim();
    if (!name) return;

    const grade = (customGrade || newSubjectGrade).trim() || 'General Batch';

    const newSubj: SubjectSyllabus = {
      id: `syl-${Date.now()}`,
      subject: name,
      grade: grade,
      chapters: [],
    };

    const updated = [...syllabusList, newSubj];
    onUpdateSyllabus(updated);
    setSelectedSubjectId(newSubj.id);
    setNewSubjectName('');
    setNewSubjectGrade('');
    setIsAddSubjectOpen(false);
  };

  // Delete Subject Handler
  const handleDeleteSubject = (subjId: string) => {
    const updated = syllabusList.filter(s => s.id !== subjId);
    onUpdateSyllabus(updated);
    if (selectedSubjectId === subjId) {
      setSelectedSubjectId(updated.length > 0 ? updated[0].id : '');
    }
    setSubjectToDelete(null);
  };

  // Delete Topic Handler
  const handleConfirmDeleteTopic = () => {
    if (!topicToDelete) return;
    const { subjectId, chapterId, topicId } = topicToDelete;

    const updated = syllabusList.map(subj => {
      if (subj.id !== subjectId) return subj;
      const chs = subj.chapters.map(ch => {
        if (ch.id !== chapterId) return ch;
        return { ...ch, topics: ch.topics.filter(t => t.id !== topicId) };
      });
      return { ...subj, chapters: chs };
    });

    onUpdateSyllabus(updated);
    setTopicToDelete(null);
  };

  // Calculate stats for current subject
  let totalTopicsInSubject = 0;
  let completedTopicsInSubject = 0;
  if (currentSubject) {
    currentSubject.chapters.forEach(ch => {
      ch.topics.forEach(top => {
        totalTopicsInSubject++;
        const topicStatus = selectedStudent 
          ? getTopicStatusForStudent(selectedStudent, top).status
          : top.status;
        if (topicStatus === 'completed' || topicStatus === 'revised') {
          completedTopicsInSubject++;
        }
      });
    });
  }
  const subjectProgress = totalTopicsInSubject > 0 
    ? Math.round((completedTopicsInSubject / totalTopicsInSubject) * 100) 
    : 0;

  // Filter chapters by topicSearchQuery
  const filteredChapters = useMemo(() => {
    if (!currentSubject) return [];
    if (!topicSearchQuery.trim()) return currentSubject.chapters;

    const q = topicSearchQuery.toLowerCase();
    return currentSubject.chapters.filter(ch => {
      const matchCh = ch.title.toLowerCase().includes(q) || ch.chapterNumber.toString().includes(q);
      const matchTop = ch.topics.some(t => t.title.toLowerCase().includes(q) || (t.notes && t.notes.toLowerCase().includes(q)));
      return matchCh || matchTop;
    });
  }, [currentSubject, topicSearchQuery]);

  // Paginated chapters calculation
  const totalChapters = filteredChapters.length;
  const totalChapterPages = Math.ceil(totalChapters / chaptersPerPage) || 1;
  const paginatedChapters = useMemo(() => {
    const startIndex = (currentChapterPage - 1) * chaptersPerPage;
    return filteredChapters.slice(startIndex, startIndex + chaptersPerPage);
  }, [filteredChapters, currentChapterPage, chaptersPerPage]);

  return (
    <div className="space-y-6">
      
      {/* Top Selector Card with Student Dropdown, Subject Selector & Action Buttons */}
      <div className="bg-white rounded-2xl p-5 border border-[#E0E4D9] shadow-xs space-y-4">
        
        {/* Header row with Student Selector Dropdown & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E0E4D9]">
          
          {/* Registered Student Dropdown Menu */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-[#F7F8F3] border border-[#CAD3C0] rounded-xl px-3 py-1.5 shadow-2xs">
              <Users className="w-4 h-4 text-[#5C6652]" />
              <label htmlFor="syllabus-student-filter-select" className="text-xs font-semibold text-[#42473E] whitespace-nowrap">
                Student:
              </label>
              <select
                id="syllabus-student-filter-select"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-[#2D3329] focus:outline-none cursor-pointer pr-2"
              >
                <option value="all">All Registered Students (Master View)</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.rollNo} • {s.grade})
                  </option>
                ))}
              </select>
            </div>

            {selectedStudent && (
              <button
                onClick={() => setSelectedStudentId('all')}
                className="text-xs text-[#5C6652] hover:text-[#2D3329] bg-[#F0F2EA] hover:bg-[#E0E4D9] px-2.5 py-1.5 rounded-xl font-medium transition flex items-center gap-1 cursor-pointer"
                title="Show all registered students"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset to Master</span>
              </button>
            )}
          </div>

          {/* Action buttons: Smart Add Topic, Add Chapter, Add Subject */}
          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            <button
              id="syllabus-smart-add-topic-btn"
              onClick={() => handleOpenAddTopicModal()}
              className="bg-[#5C6652] hover:bg-[#4E5745] text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Add a syllabus topic with automatic chapter/unit detection and student assignment"
            >
              <Sparkles className="w-4 h-4 text-[#CAD3C0]" />
              <span>+ Add Syllabus Topic</span>
            </button>

            <button
              id="syllabus-add-chapter-top-btn"
              onClick={() => setIsAddChapterOpen(true)}
              className="bg-[#E9EDE0] hover:bg-[#DEE4D3] text-[#2D3329] border border-[#CAD3C0] font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Add a new chapter or unit"
            >
              <Plus className="w-4 h-4 text-[#5C6652]" />
              <span>Add Chapter</span>
            </button>

            <button
              id="syllabus-add-subject-top-btn"
              onClick={() => setIsAddSubjectOpen(true)}
              className="bg-[#F0F2EA] hover:bg-[#E0E4D9] text-[#42473E] border border-[#CAD3C0] font-semibold text-xs px-3 py-2 rounded-xl transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
              title="Add a new subject"
            >
              <BookMarked className="w-4 h-4 text-[#5C6652]" />
              <span>+ Subject</span>
            </button>
          </div>
        </div>

        {/* Selected Student Information Dossier Banner */}
        {selectedStudent && (
          <div className="bg-[#FAFBF9] border border-[#CAD3C0] rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div 
                onClick={() => onSelectStudent && onSelectStudent(selectedStudent)}
                className={`w-9 h-9 rounded-xl bg-[#5C6652] text-[#F7F8F3] font-bold text-xs flex items-center justify-center ${onSelectStudent ? 'cursor-pointer hover:bg-[#4E5745]' : ''}`}
                title="Click to view student profile"
              >
                {selectedStudent.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span 
                    onClick={() => onSelectStudent && onSelectStudent(selectedStudent)}
                    className={`font-bold text-sm text-[#2D3329] font-serif ${onSelectStudent ? 'cursor-pointer hover:underline hover:text-[#5C6652]' : ''}`}
                  >
                    {selectedStudent.name}
                  </span>
                  <span className="text-[10px] font-mono text-[#707969] bg-[#E9EDE0] px-1.5 py-0.5 rounded">
                    {selectedStudent.rollNo}
                  </span>
                  <span className="text-[10px] font-medium text-[#5C6652] bg-[#E9EDE0] px-2 py-0.5 rounded-full">
                    {selectedStudent.grade}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCheck className="w-3 h-3" /> Student-Specific Progress Active
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-[#707969]">
                  <span className="font-medium text-[#42473E]">Enrolled Subjects:</span>
                  {selectedStudent.subjects.map((sub, i) => (
                    <span key={i} className="bg-white border border-[#E0E4D9] px-2 py-0.2 rounded text-[10px] font-semibold text-[#2D3329]">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[#707969] block">Student Progress Status</span>
              <span className="text-xs font-bold text-[#5C6652]">
                {completedTopicsInSubject} of {totalTopicsInSubject} topics completed ({subjectProgress}%)
              </span>
            </div>
          </div>
        )}

        {/* Subject tabs & Search */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-[#707969] uppercase tracking-wider">
              Subjects ({availableSyllabusList.length})
            </span>

            {/* Quick search input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#707969] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search topics or concepts..."
                value={topicSearchQuery}
                onChange={(e) => setTopicSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F7F8F3] border border-[#E0E4D9] rounded-xl text-[#2D3329] focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
              />
              {topicSearchQuery && (
                <button
                  onClick={() => setTopicSearchQuery('')}
                  className="absolute right-2.5 top-2 text-[#707969] hover:text-[#2D3329]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {availableSyllabusList.map((s) => {
              const isSelected = s.id === (currentSubject?.id || selectedSubjectId);
              return (
                <div key={s.id} className="inline-flex items-center group">
                  <button
                    onClick={() => setSelectedSubjectId(s.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#5C6652] text-white shadow-xs'
                        : 'bg-[#F0F2EA] text-[#42473E] hover:bg-[#E9EDE0]'
                    }`}
                  >
                    <BookOpen className={`w-3.5 h-3.5 ${isSelected ? 'text-[#CAD3C0]' : 'text-[#707969]'}`} />
                    <span>{s.subject}</span>
                    <span className="text-[10px] opacity-80 font-normal">({s.grade.split(' ')[0]})</span>
                  </button>

                  {/* Delete button on hover if not the only subject */}
                  {availableSyllabusList.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSubjectToDelete(s);
                      }}
                      className="ml-1 p-1 text-[#9E6547] opacity-0 group-hover:opacity-100 hover:bg-[#FAF1EC] rounded-md transition cursor-pointer"
                      title={`Remove ${s.subject}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}

            <button
              id="syllabus-add-subject-pill-btn"
              onClick={() => setIsAddSubjectOpen(true)}
              className="px-3 py-2 bg-[#E9EDE0] hover:bg-[#DEE4D3] text-[#2D3329] border border-[#CAD3C0] rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-[#5C6652]" />
              <span>Add Subject</span>
            </button>
          </div>
        </div>

      </div>

      {/* Progress Banner for selected subject */}
      {currentSubject && (
        <div className="bg-[#3A4035] rounded-2xl p-5 text-white shadow-xs border border-[#4E5745] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#CAD3C0] uppercase tracking-wider">
                {currentSubject.grade}
              </span>
              {selectedStudent && (
                <span className="text-[10px] bg-[#5C6652] text-white px-2 py-0.5 rounded-full font-medium">
                  {selectedStudent.name}'s Tracker
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white mt-0.5 font-serif">
              {currentSubject.subject} Syllabus Tracker
            </h2>
            <p className="text-xs text-[#D1D8C8] mt-1">
              {completedTopicsInSubject} of {totalTopicsInSubject} subtopics mastered across {currentSubject.chapters.length} chapters.
            </p>
          </div>

          <div className="w-full md:w-64 bg-[#2D3329]/70 p-3.5 rounded-xl border border-[#5C6652]/60">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="text-[#D1D8C8]">
                {selectedStudent ? `${selectedStudent.name}'s Milestone` : 'Master Milestone'}
              </span>
              <span className="text-[#CAD3C0] font-bold font-serif text-sm">{subjectProgress}%</span>
            </div>
            <div className="w-full bg-[#1F231D] h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#8DA376] to-[#CAD3C0] h-full rounded-full transition-all duration-500" 
                style={{ width: `${subjectProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Chapters & Topics Accordions with Pagination */}
      <div className="bg-white rounded-2xl border border-[#E0E4D9] shadow-xs overflow-hidden">
        
        {/* Header Bar showing chapter count */}
        <div className="p-4 bg-[#FAFBF9] border-b border-[#E0E4D9] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-semibold text-[#42473E]">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#5C6652]" />
            <span>
              Curriculum Units ({totalChapters} {totalChapters === 1 ? 'Chapter' : 'Chapters'})
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenAddTopicModal()}
              className="text-[#5C6652] hover:text-[#2D3329] text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>+ Add Topic (Auto-fetch Unit)</span>
            </button>

            {totalChapters > 0 && (
              <span className="text-[#707969] font-normal border-l border-[#E0E4D9] pl-3">
                Page {currentChapterPage} of {totalChapterPages}
              </span>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {filteredChapters.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#E0E4D9]">
              <BookOpen className="w-12 h-12 text-[#8A9382] mx-auto mb-3" />
              <h3 className="text-base font-semibold text-[#2D3329] font-serif">
                {topicSearchQuery ? 'No matching syllabus topics found' : 'No chapters added yet'}
              </h3>
              <p className="text-xs text-[#707969] mt-1">
                {topicSearchQuery 
                  ? `No topics found matching "${topicSearchQuery}". Try clearing search.`
                  : 'Click "+ Add Syllabus Topic" to automatically match and create chapters from curriculum.'
                }
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                {topicSearchQuery ? (
                  <button
                    onClick={() => setTopicSearchQuery('')}
                    className="bg-[#5C6652] hover:bg-[#4E5745] text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Clear Search
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenAddTopicModal()}
                    className="bg-[#5C6652] hover:bg-[#4E5745] text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Add First Topic</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            paginatedChapters.map((chapter) => {
              const isExpanded = !!expandedChapters[chapter.id];
              
              const chTotal = chapter.topics.length;
              const chDone = chapter.topics.filter(t => {
                const st = selectedStudent ? getTopicStatusForStudent(selectedStudent, t).status : t.status;
                return st === 'completed' || st === 'revised';
              }).length;
              const chPct = chTotal > 0 ? Math.round((chDone / chTotal) * 100) : 0;

              return (
                <div 
                  key={chapter.id}
                  className="bg-white rounded-2xl border border-[#E0E4D9] shadow-xs overflow-hidden transition"
                >
                  {/* Chapter Header Bar */}
                  <div 
                    onClick={() => toggleChapter(chapter.id)}
                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-[#F9FAF7] transition select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#E9EDE0] text-[#3D4736] font-bold text-xs flex items-center justify-center border border-[#CAD3C0]">
                        Ch {chapter.chapterNumber}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#2D3329] text-sm sm:text-base font-serif">
                          {chapter.title}
                        </h4>
                        <p className="text-xs text-[#707969] mt-0.5">
                          {chDone} / {chTotal} topics completed ({chPct}%)
                          {selectedStudent && (
                            <span className="ml-2 text-[10px] text-[#5C6652] font-semibold bg-[#E9EDE0] px-1.5 py-0.2 rounded">
                              For {selectedStudent.name}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="hidden sm:block w-28 bg-[#F0F2EA] h-2 rounded-full overflow-hidden border border-[#E0E4D9]">
                        <div 
                          className="bg-[#5C6652] h-full rounded-full" 
                          style={{ width: `${chPct}%` }}
                        />
                      </div>
                      <div className="text-[#707969]">
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Topics List Body */}
                  {isExpanded && (
                    <div className="border-t border-[#E0E4D9] bg-[#FAFBF9] p-4 sm:p-5 divide-y divide-[#E0E4D9]">
                      
                      {chapter.topics.length === 0 ? (
                        <div className="py-4 text-center text-xs text-[#707969]">
                          No topics listed in this chapter yet.
                        </div>
                      ) : (
                        chapter.topics.map((topic) => {
                          // Get student-specific or master status
                          const topicInfo = selectedStudent 
                            ? getTopicStatusForStudent(selectedStudent, topic)
                            : { status: topic.status, completedDate: topic.completedDate, notes: topic.notes, isStudentSpecific: false };

                          return (
                            <div 
                              key={topic.id}
                              className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                            >
                              <div className="flex items-start gap-2.5">
                                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                  topicInfo.status === 'completed' ? 'bg-emerald-600' :
                                  topicInfo.status === 'revised' ? 'bg-amber-600' :
                                  topicInfo.status === 'in-progress' ? 'bg-teal-600' :
                                  'bg-slate-400'
                                }`} />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs sm:text-sm font-semibold text-[#2D3329]">
                                      {topic.title}
                                    </span>
                                    {topicInfo.isStudentSpecific && (
                                      <span className="text-[9px] font-medium bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-sans">
                                        Saved for student
                                      </span>
                                    )}
                                  </div>
                                  {topicInfo.notes && (
                                    <p className="text-xs text-[#707969] mt-0.5 italic">
                                      {topicInfo.notes}
                                    </p>
                                  )}
                                  {topicInfo.completedDate && (
                                    <p className="text-[10px] text-[#707969] mt-0.5 flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-[#5C6652]" /> Completed: {topicInfo.completedDate}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Status button controls & Delete */}
                              <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
                                <button
                                  onClick={() => handleTopicStatusChange(chapter.id, topic.id, 'pending')}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                    topicInfo.status === 'pending'
                                      ? 'bg-[#42473E] text-white shadow-xs'
                                      : 'bg-white text-[#707969] border border-[#E0E4D9] hover:bg-[#F0F2EA]'
                                  }`}
                                >
                                  Pending
                                </button>

                                <button
                                  onClick={() => handleTopicStatusChange(chapter.id, topic.id, 'in-progress')}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
                                    topicInfo.status === 'in-progress'
                                      ? 'bg-[#3D5A5B] text-white shadow-xs'
                                      : 'bg-white text-[#3D5A5B] border border-[#CAD8D5] hover:bg-[#E8EDEB]'
                                  }`}
                                >
                                  <Clock className="w-3 h-3" />
                                  <span>In-Progress</span>
                                </button>

                                <button
                                  onClick={() => handleTopicStatusChange(chapter.id, topic.id, 'completed')}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
                                    topicInfo.status === 'completed'
                                      ? 'bg-[#5C6652] text-white shadow-xs'
                                      : 'bg-white text-[#3D4736] border border-[#CAD3C0] hover:bg-[#E9EDE0]'
                                  }`}
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Completed</span>
                                </button>

                                <button
                                  onClick={() => handleTopicStatusChange(chapter.id, topic.id, 'revised')}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
                                    topicInfo.status === 'revised'
                                      ? 'bg-[#63554A] text-white shadow-xs'
                                      : 'bg-white text-[#63554A] border border-[#D5CCC1] hover:bg-[#EBE7E1]'
                                  }`}
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Revised</span>
                                </button>

                                {/* Delete topic button */}
                                {currentSubject && (
                                  <button
                                    onClick={() => setTopicToDelete({
                                      subjectId: currentSubject.id,
                                      chapterId: chapter.id,
                                      topicId: topic.id,
                                      title: topic.title
                                    })}
                                    className="p-1 text-[#9E6547] opacity-0 group-hover:opacity-100 hover:bg-[#FAF1EC] rounded transition cursor-pointer"
                                    title="Delete topic"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                            </div>
                          );
                        })
                      )}

                      {/* Add Topic button on Chapter */}
                      <div className="pt-3">
                        <button
                          onClick={() => handleOpenAddTopicModal(chapter.id)}
                          className="text-xs font-semibold text-[#5C6652] hover:text-[#2D3329] flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Topic to Chapter {chapter.chapterNumber}</span>
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        {/* Chapter Pagination component */}
        {totalChapters > 0 && (
          <Pagination
            currentPage={currentChapterPage}
            totalPages={totalChapterPages}
            totalItems={totalChapters}
            pageSize={chaptersPerPage}
            onPageChange={setCurrentChapterPage}
            onPageSizeChange={setChaptersPerPage}
            pageSizeOptions={[3, 5, 10, 15]}
            itemName="chapters"
            idPrefix="syllabus-chapters"
          />
        )}
      </div>

      {/* ========================================================================= */}
      {/* SMART ADD SYLLABUS TOPIC MODAL (Auto-fetch Chapter/Unit + Student Assignment) */}
      {/* ========================================================================= */}
      {isAddTopicModalOpen && (
        <div className="fixed inset-0 bg-[#1F231D]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-[#E0E4D9] my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E4D9]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E9EDE0] text-[#5C6652] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#2D3329] font-serif">
                    Add Syllabus Topic
                  </h3>
                  <p className="text-xs text-[#707969]">
                    Auto-detects chapter/unit from curriculum & saves with student
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddTopicModalOpen(false)}
                className="text-[#707969] hover:text-[#2D3329] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTopic} className="mt-4 space-y-4">
              
              {/* Target Subject Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#42473E] mb-1">
                  Target Subject
                </label>
                <select
                  value={topicFormSubjectId}
                  onChange={(e) => setTopicFormSubjectId(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
                >
                  {syllabusList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.subject} ({s.grade})
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic Title Input with live detection */}
              <div>
                <label className="block text-xs font-semibold text-[#42473E] mb-1">
                  Topic / Subtopic Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Projectile Motion, Quadratic Formula, Centripetal Acceleration..."
                  required
                  value={topicFormTitle}
                  onChange={(e) => setTopicFormTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5C6652]/30 focus:border-[#5C6652] font-medium"
                />
              </div>

              {/* Live Curriculum Suggestions Pill Row */}
              {curriculumSuggestions.length > 0 && (
                <div className="bg-[#FAFBF9] border border-[#CAD3C0] rounded-xl p-3 space-y-2">
                  <span className="text-[11px] font-semibold text-[#5C6652] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Standard Curriculum Matches:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {curriculumSuggestions.map((item, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => handleSelectCurriculumSuggestion(item)}
                        className="text-left text-[11px] bg-white hover:bg-[#E9EDE0] border border-[#CAD3C0] text-[#2D3329] px-2.5 py-1 rounded-lg transition cursor-pointer"
                      >
                        <span className="font-semibold">{item.topicTitle}</span>
                        <span className="text-[10px] text-[#707969] ml-1">
                          (Ch {item.chapterNumber}: {item.chapterTitle})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Automatic Chapter / Unit Detection Dossier */}
              {detectedChapterInfo && (
                <div className="bg-[#E9EDE0]/80 border border-[#CAD3C0] rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#3D4736] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#5C6652]" />
                      Auto-Matched Chapter / Unit
                    </span>
                    <span className="text-[10px] font-bold text-[#5C6652] bg-white px-2 py-0.5 rounded-full border border-[#CAD3C0]">
                      {detectedChapterInfo.source === 'existing' ? 'Existing Subject Unit' : 'Standard Curriculum Unit'}
                    </span>
                  </div>

                  <div className="bg-white rounded-lg p-2.5 border border-[#CAD3C0] flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#2D3329]">
                        Chapter {detectedChapterInfo.chapterNumber}: {detectedChapterInfo.chapterTitle}
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      Auto-Linked
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-[#42473E] pt-1">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="chapterChoice"
                        checked={topicFormChapterChoice === 'auto'}
                        onChange={() => setTopicFormChapterChoice('auto')}
                        className="text-[#5C6652]"
                      />
                      <span>Use Auto-Detected Unit</span>
                    </label>

                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="chapterChoice"
                        checked={topicFormChapterChoice === 'existing'}
                        onChange={() => setTopicFormChapterChoice('existing')}
                        className="text-[#5C6652]"
                      />
                      <span>Select Existing Unit</span>
                    </label>

                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="chapterChoice"
                        checked={topicFormChapterChoice === 'new'}
                        onChange={() => setTopicFormChapterChoice('new')}
                        className="text-[#5C6652]"
                      />
                      <span>Custom Unit</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Manual Existing Chapter Selector (if chosen or fallback) */}
              {topicFormChapterChoice === 'existing' && (
                <div>
                  <label className="block text-xs font-semibold text-[#42473E] mb-1">
                    Choose Existing Chapter
                  </label>
                  <select
                    value={topicFormSelectedChapterId}
                    onChange={(e) => setTopicFormSelectedChapterId(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
                  >
                    {(syllabusList.find(s => s.id === topicFormSubjectId)?.chapters || []).map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        Chapter {ch.chapterNumber}: {ch.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Custom New Chapter Inputs (if chosen) */}
              {topicFormChapterChoice === 'new' && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-[#42473E] mb-1">
                      Unit #
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 5"
                      value={topicFormNewChapterNum}
                      onChange={(e) => setTopicFormNewChapterNum(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-[#42473E] mb-1">
                      Unit / Chapter Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Nuclear Physics"
                      value={topicFormNewChapterTitle}
                      onChange={(e) => setTopicFormNewChapterTitle(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
                    />
                  </div>
                </div>
              )}

              {/* Student Assignment Selector */}
              <div className="bg-[#FAFBF9] border border-[#E0E4D9] rounded-xl p-3 space-y-2">
                <label className="block text-xs font-bold text-[#42473E] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#5C6652]" />
                  Save Progress With Student:
                </label>
                <select
                  value={topicFormStudentId}
                  onChange={(e) => setTopicFormStudentId(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-[#CAD3C0] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652] font-semibold"
                >
                  <option value="all">All Enrolled Students (Master Curriculum Template)</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.rollNo} • {s.grade})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[#707969]">
                  {topicFormStudentId === 'all'
                    ? 'Adds this topic to the master subject curriculum for all students.'
                    : `Saves this topic and marks progress directly on ${students.find(s => s.id === topicFormStudentId)?.name}'s dossier.`}
                </p>
              </div>

              {/* Initial Status & Notes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#42473E] mb-1">
                    Initial Status
                  </label>
                  <select
                    value={topicFormStatus}
                    onChange={(e) => setTopicFormStatus(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
                  >
                    <option value="pending">Pending (Upcoming)</option>
                    <option value="in-progress">In-Progress</option>
                    <option value="completed">Completed Today</option>
                    <option value="revised">Revised / Mastered</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#42473E] mb-1">
                    Completion / Revision Date
                  </label>
                  <input
                    type="date"
                    value={topicFormDate}
                    onChange={(e) => setTopicFormDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#42473E] mb-1">
                  Preparation Notes / Past Papers Practiced (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Numericals solved, CAIE Paper 2 structured questions reviewed"
                  value={topicFormNotes}
                  onChange={(e) => setTopicFormNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E0E4D9]">
                <button
                  type="button"
                  onClick={() => setIsAddTopicModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#707969] hover:bg-[#F0F2EA] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-[#5C6652] hover:bg-[#4E5745] text-white rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5 active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Topic to Syllabus</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD CHAPTER MODAL */}
      {/* ========================================================================= */}
      {isAddChapterOpen && (
        <div className="fixed inset-0 bg-[#1F231D]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E0E4D9]">
            <h3 className="text-lg font-bold text-[#2D3329] font-serif">Add New Chapter</h3>
            <p className="text-xs text-[#707969] mt-0.5">Subject: {currentSubject?.subject}</p>

            <form onSubmit={handleAddChapter} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#42473E] mb-1">Chapter Number</label>
                <input
                  type="text"
                  placeholder="e.g. 6 or Unit 4"
                  value={newChapterNumber}
                  onChange={(e) => setNewChapterNumber(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#42473E] mb-1">Chapter Title</label>
                <input
                  type="text"
                  placeholder="e.g. Fluid Dynamics / Electrostatics"
                  required
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddChapterOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#707969] hover:bg-[#F0F2EA] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-[#5C6652] hover:bg-[#4E5745] text-white rounded-xl cursor-pointer"
                >
                  Create Chapter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD SUBJECT MODAL */}
      {/* ========================================================================= */}
      {isAddSubjectOpen && (
        <div className="fixed inset-0 bg-[#1F231D]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E0E4D9]">
            <h3 className="text-lg font-bold text-[#2D3329] font-serif">Add New Subject</h3>
            <p className="text-xs text-[#707969] mt-0.5">Create a syllabus curriculum for a new course</p>

            <form onSubmit={handleAddSubject} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#42473E] mb-1">Subject Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Biology (9700), Computer Science, English..."
                  required
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#42473E] mb-1">Target Grade / Board</label>
                <input
                  type="text"
                  placeholder="e.g. A-Levels / O-Levels / F.Sc / 10th Board"
                  value={newSubjectGrade}
                  onChange={(e) => setNewSubjectGrade(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSubjectOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#707969] hover:bg-[#F0F2EA] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-[#5C6652] hover:bg-[#4E5745] text-white rounded-xl cursor-pointer"
                >
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE TOPIC CONFIRMATION DIALOG */}
      {/* ========================================================================= */}
      {topicToDelete && (
        <div className="fixed inset-0 bg-[#1F231D]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-[#E0E4D9]">
            <h3 className="text-base font-bold text-[#2D3329] font-serif">Delete Syllabus Topic</h3>
            <p className="text-xs text-[#707969] mt-2">
              Are you sure you want to remove <strong>"{topicToDelete.title}"</strong> from the curriculum?
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => setTopicToDelete(null)}
                className="px-3.5 py-2 text-xs font-semibold text-[#707969] hover:bg-[#F0F2EA] rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteTopic}
                className="px-4 py-2 text-xs font-semibold bg-[#9E6547] hover:bg-[#854F35] text-white rounded-xl cursor-pointer"
              >
                Delete Topic
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE SUBJECT CONFIRMATION DIALOG */}
      {/* ========================================================================= */}
      {subjectToDelete && (
        <div className="fixed inset-0 bg-[#1F231D]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-[#E0E4D9]">
            <h3 className="text-base font-bold text-[#2D3329] font-serif">Remove Subject</h3>
            <p className="text-xs text-[#707969] mt-2">
              Are you sure you want to remove <strong>"{subjectToDelete.subject}"</strong> and all its chapters?
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => setSubjectToDelete(null)}
                className="px-3.5 py-2 text-xs font-semibold text-[#707969] hover:bg-[#F0F2EA] rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSubject(subjectToDelete.id)}
                className="px-4 py-2 text-xs font-semibold bg-[#9E6547] hover:bg-[#854F35] text-white rounded-xl cursor-pointer"
              >
                Delete Subject
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
