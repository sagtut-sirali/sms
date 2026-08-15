import React, { useState, useEffect } from 'react';
import { X, Award, Calendar, BookOpen, User, CheckCircle2 } from 'lucide-react';
import { Student, TestScore } from '../types';
import { calculateGrade } from '../utils/formatters';

interface AddTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onSaveTest: (test: TestScore) => void;
  preSelectedStudent?: Student | null;
}

export const AddTestModal: React.FC<AddTestModalProps> = ({
  isOpen,
  onClose,
  students,
  onSaveTest,
  preSelectedStudent,
}) => {
  const [studentId, setStudentId] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [testTitle, setTestTitle] = useState('');
  const [testDate, setTestDate] = useState(new Date().toISOString().slice(0, 10));
  const [maxMarks, setMaxMarks] = useState(50);
  const [obtainedMarks, setObtainedMarks] = useState(42);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (preSelectedStudent) {
      setStudentId(preSelectedStudent.id);
      if (preSelectedStudent.subjects.length > 0) {
        setSubject(preSelectedStudent.subjects[0]);
      }
    } else if (students.length > 0 && !studentId) {
      setStudentId(students[0].id);
      if (students[0].subjects.length > 0) {
        setSubject(students[0].subjects[0]);
      }
    }
  }, [preSelectedStudent, isOpen, students]);

  if (!isOpen) return null;

  const currentStudent = students.find(s => s.id === studentId);

  const percentage = maxMarks > 0 ? Number(((obtainedMarks / maxMarks) * 100).toFixed(1)) : 0;
  const grade = calculateGrade(percentage);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !testTitle.trim()) return;

    const newTest: TestScore = {
      id: `test-${Date.now()}`,
      studentId,
      subject,
      testTitle: testTitle.trim(),
      testDate,
      maxMarks: Number(maxMarks),
      obtainedMarks: Number(obtainedMarks),
      percentage,
      grade,
      remarks: remarks.trim() || undefined,
    };

    onSaveTest(newTest);
    setTestTitle('');
    setRemarks('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#1F231D]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#E0E4D9] overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-[#3A4035] p-6 text-white flex items-center justify-between border-b border-[#4E5745]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#5C6652] text-[#F7F8F3] flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-serif">Record Test / Assessment Score</h3>
              <p className="text-xs text-[#CAD3C0]">Sir Ali Preparations Academic Log</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#CAD3C0] hover:text-white hover:bg-[#2D3329]/80 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Student Selector */}
          <div>
            <label className="block font-semibold text-[#2D3329] mb-1">Student</label>
            <select
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value);
                const st = students.find(s => s.id === e.target.value);
                if (st && st.subjects.length > 0) {
                  setSubject(st.subjects[0]);
                }
              }}
              className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652] font-semibold text-[#2D3329] cursor-pointer"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.rollNo}) - {s.grade}
                </option>
              ))}
            </select>
          </div>

          {/* Subject & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#2D3329] mb-1">Subject</label>
              <input
                type="text"
                required
                placeholder="Physics / Mathematics"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652] font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2D3329] mb-1">Test Date</label>
              <input
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
              />
            </div>
          </div>

          {/* Test Title / Chapter */}
          <div>
            <label className="block font-semibold text-[#2D3329] mb-1">Test Title / Chapter Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Chapter 3: Projectile Motion & 2D Vectors Quiz"
              value={testTitle}
              onChange={(e) => setTestTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652] font-medium"
            />
          </div>

          {/* Marks Calculator Card */}
          <div className="bg-[#FAFBF9] p-4 rounded-2xl border border-[#E0E4D9] space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#707969] font-medium mb-1">Total / Maximum Marks</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-[#E0E4D9] rounded-lg font-bold text-[#2D3329]"
                />
              </div>

              <div>
                <label className="block text-[#707969] font-medium mb-1">Obtained Marks</label>
                <input
                  type="number"
                  min="0"
                  max={maxMarks}
                  step="0.5"
                  required
                  value={obtainedMarks}
                  onChange={(e) => setObtainedMarks(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-[#E0E4D9] rounded-lg font-bold text-[#2D3329]"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#E0E4D9] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#707969]">Calculated Percentage:</span>
                <span className="text-base font-bold text-[#5C6652] block font-serif">{percentage}%</span>
              </div>
              <div>
                <span className="text-[11px] text-[#707969]">Grade:</span>
                <span className="text-base font-bold text-[#2D3329] block font-serif">{grade}</span>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block font-semibold text-[#2D3329] mb-1">Teacher Remarks & Improvement Areas</label>
            <textarea
              rows={2}
              placeholder="e.g. Excellent formula derivations; needs practice on unit conversions..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E0E4D9]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#F0F2EA] hover:bg-[#E0E4D9] text-[#2D3329] font-semibold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#5C6652] hover:bg-[#4E5745] text-white font-medium rounded-xl shadow-xs cursor-pointer"
            >
              Save Test Score
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
