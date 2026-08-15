import React, { useState } from 'react';
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
  Check
} from 'lucide-react';
import { SubjectSyllabus, SyllabusChapter, SyllabusTopic } from '../types';

interface SyllabusTabProps {
  syllabusList: SubjectSyllabus[];
  onUpdateSyllabus: (syllabus: SubjectSyllabus[]) => void;
  todayDate: string;
}

export const SyllabusTab: React.FC<SyllabusTabProps> = ({
  syllabusList,
  onUpdateSyllabus,
  todayDate,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    syllabusList.length > 0 ? syllabusList[0].id : ''
  );
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({
    'ch-1': true,
    'ch-2': true,
    'ch-3': true,
    'ch-m1': true,
    'ch-m2': true,
  });

  // Modal states for adding chapter / topic
  const [isAddChapterOpen, setIsAddChapterOpen] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterNumber, setNewChapterNumber] = useState('');

  const [activeChapterForTopic, setActiveChapterForTopic] = useState<string | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState('');

  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectGrade, setNewSubjectGrade] = useState('');

  const currentSubject = syllabusList.find(s => s.id === selectedSubjectId) || syllabusList[0];

  const toggleChapter = (chId: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chId]: !prev[chId],
    }));
  };

  // Update Topic Status
  const handleTopicStatusChange = (
    chapterId: string, 
    topicId: string, 
    newStatus: 'pending' | 'in-progress' | 'completed' | 'revised'
  ) => {
    if (!currentSubject) return;

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

  // Add Topic Handler
  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !activeChapterForTopic || !currentSubject) return;

    const newTopic: SyllabusTopic = {
      id: `top-${Date.now()}`,
      title: newTopicTitle.trim(),
      status: 'pending',
    };

    const updatedSyllabusList = syllabusList.map(subj => {
      if (subj.id !== currentSubject.id) return subj;

      const updatedChapters = subj.chapters.map(ch => {
        if (ch.id !== activeChapterForTopic) return ch;
        return {
          ...ch,
          topics: [...ch.topics, newTopic],
        };
      });

      return { ...subj, chapters: updatedChapters };
    });

    onUpdateSyllabus(updatedSyllabusList);
    setNewTopicTitle('');
    setActiveChapterForTopic(null);
  };

  // Add Subject Handler
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    const newSubj: SubjectSyllabus = {
      id: `syl-${Date.now()}`,
      subject: newSubjectName.trim(),
      grade: newSubjectGrade.trim() || 'General Batch',
      chapters: [],
    };

    const updated = [...syllabusList, newSubj];
    onUpdateSyllabus(updated);
    setSelectedSubjectId(newSubj.id);
    setNewSubjectName('');
    setNewSubjectGrade('');
    setIsAddSubjectOpen(false);
  };

  // Calculate stats for current subject
  let totalTopicsInSubject = 0;
  let completedTopicsInSubject = 0;
  if (currentSubject) {
    currentSubject.chapters.forEach(ch => {
      ch.topics.forEach(top => {
        totalTopicsInSubject++;
        if (top.status === 'completed' || top.status === 'revised') {
          completedTopicsInSubject++;
        }
      });
    });
  }
  const subjectProgress = totalTopicsInSubject > 0 
    ? Math.round((completedTopicsInSubject / totalTopicsInSubject) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      
      {/* Top Selector Card */}
      <div className="bg-white rounded-2xl p-5 border border-[#E0E4D9] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Subject dropdown & tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {syllabusList.map((s) => {
            const isSelected = s.id === (currentSubject?.id || selectedSubjectId);
            return (
              <button
                key={s.id}
                onClick={() => setSelectedSubjectId(s.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#5C6652] text-white shadow-xs'
                    : 'bg-[#F0F2EA] text-[#42473E] hover:bg-[#E9EDE0]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-[#CAD3C0]" />
                <span>{s.subject}</span>
                <span className="text-[10px] opacity-80 font-normal">({s.grade.split(' ')[0]})</span>
              </button>
            );
          })}

          <button
            onClick={() => setIsAddSubjectOpen(true)}
            className="p-2 bg-[#E9EDE0] hover:bg-[#DEE4D3] text-[#3D4736] border border-[#CAD3C0] rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Subject</span>
          </button>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddChapterOpen(true)}
            className="bg-[#5C6652] hover:bg-[#4E5745] text-white font-medium text-xs px-3.5 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Chapter</span>
          </button>
        </div>

      </div>

      {/* Progress Banner for selected subject */}
      {currentSubject && (
        <div className="bg-[#3A4035] rounded-2xl p-5 text-white shadow-xs border border-[#4E5745] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold text-[#CAD3C0] uppercase tracking-wider">
              {currentSubject.grade}
            </span>
            <h2 className="text-xl font-bold text-white mt-0.5 font-serif">
              {currentSubject.subject} Syllabus Tracker
            </h2>
            <p className="text-xs text-[#D1D8C8] mt-1">
              {completedTopicsInSubject} of {totalTopicsInSubject} subtopics mastered across {currentSubject.chapters.length} chapters.
            </p>
          </div>

          <div className="w-full md:w-64 bg-[#2D3329]/70 p-3.5 rounded-xl border border-[#5C6652]/60">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="text-[#D1D8C8]">Completion Milestone</span>
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

      {/* Chapters & Topics Accordions */}
      <div className="space-y-4">
        {currentSubject?.chapters.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#E0E4D9]">
            <BookOpen className="w-12 h-12 text-[#8A9382] mx-auto mb-3" />
            <h3 className="text-base font-semibold text-[#2D3329] font-serif">No chapters added yet</h3>
            <p className="text-xs text-[#707969] mt-1">Click "Add Chapter" to build the curriculum breakdown.</p>
            <button
              onClick={() => setIsAddChapterOpen(true)}
              className="mt-4 bg-[#5C6652] hover:bg-[#4E5745] text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer"
            >
              Add First Chapter
            </button>
          </div>
        ) : (
          currentSubject?.chapters.map((chapter) => {
            const isExpanded = !!expandedChapters[chapter.id];
            
            const chTotal = chapter.topics.length;
            const chDone = chapter.topics.filter(t => t.status === 'completed' || t.status === 'revised').length;
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
                      chapter.topics.map((topic) => (
                        <div 
                          key={topic.id}
                          className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#707969] mt-2" />
                            <div>
                              <div className="text-xs sm:text-sm font-semibold text-[#2D3329]">
                                {topic.title}
                              </div>
                              {topic.notes && (
                                <p className="text-xs text-[#707969] mt-0.5 italic">
                                  {topic.notes}
                                </p>
                              )}
                              {topic.completedDate && (
                                <p className="text-[10px] text-[#707969] mt-0.5 flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-[#5C6652]" /> Completed: {topic.completedDate}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Status buttons */}
                          <div className="flex items-center gap-1.5 self-end sm:self-auto">
                            <button
                              onClick={() => handleTopicStatusChange(chapter.id, topic.id, 'pending')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                topic.status === 'pending'
                                  ? 'bg-[#42473E] text-white shadow-xs'
                                  : 'bg-white text-[#707969] border border-[#E0E4D9] hover:bg-[#F0F2EA]'
                              }`}
                            >
                              Pending
                            </button>

                            <button
                              onClick={() => handleTopicStatusChange(chapter.id, topic.id, 'in-progress')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
                                topic.status === 'in-progress'
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
                                topic.status === 'completed'
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
                                topic.status === 'revised'
                                  ? 'bg-[#63554A] text-white shadow-xs'
                                  : 'bg-white text-[#63554A] border border-[#D5CCC1] hover:bg-[#EBE7E1]'
                              }`}
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Revised</span>
                            </button>
                          </div>

                        </div>
                      ))
                    )}

                    {/* Add Topic Inline row */}
                    <div className="pt-3">
                      {activeChapterForTopic === chapter.id ? (
                        <form onSubmit={handleAddTopic} className="flex items-center gap-2 mt-2">
                          <input
                            type="text"
                            placeholder="Enter new topic or concept name..."
                            value={newTopicTitle}
                            onChange={(e) => setNewTopicTitle(e.target.value)}
                            autoFocus
                            className="flex-1 text-xs px-3 py-2 bg-white border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5C6652]/20 focus:border-[#5C6652]"
                          />
                          <button
                            type="submit"
                            className="bg-[#5C6652] hover:bg-[#4E5745] text-white text-xs font-semibold px-3.5 py-2 rounded-xl cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveChapterForTopic(null);
                              setNewTopicTitle('');
                            }}
                            className="bg-[#F0F2EA] hover:bg-[#E0E4D9] text-[#42473E] text-xs font-medium px-3 py-2 rounded-xl cursor-pointer"
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <button
                          onClick={() => setActiveChapterForTopic(chapter.id)}
                          className="text-xs font-semibold text-[#5C6652] hover:text-[#2D3329] flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Topic to Chapter {chapter.chapterNumber}</span>
                        </button>
                      )}
                    </div>

                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* Add Chapter Modal */}
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

      {/* Add Subject Modal */}
      {isAddSubjectOpen && (
        <div className="fixed inset-0 bg-[#1F231D]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E0E4D9]">
            <h3 className="text-lg font-bold text-[#2D3329] font-serif">Add New Subject Syllabus</h3>
            
            <form onSubmit={handleAddSubject} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#42473E] mb-1">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science (ICS / O-Level)"
                  required
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#42473E] mb-1">Class / Target Grade</label>
                <input
                  type="text"
                  placeholder="e.g. F.Sc Part 2 / Class 10"
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
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
