import React, { useState, useEffect } from 'react';
import { X, User, BookOpen, Calendar, Phone, MapPin, DollarSign, Home, Laptop, Clock, CalendarCheck, Check, Layers } from 'lucide-react';
import { Student, TuitionMode, StudentGroup } from '../types';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student, assignedGroupId?: string) => void;
  studentToEdit?: Student | null;
  groups?: StudentGroup[];
}

const AVATAR_COLORS = [
  'bg-blue-600',
  'bg-emerald-600',
  'bg-purple-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-teal-600',
  'bg-indigo-600',
];

export const GRADE_OPTIONS = [
  '8th / VIII',
  '9th / IX',
  '10th / X',
  "O'levels Final",
  '11th / XI year / AS / A1',
  '12th / XII year / A2',
];

export const BOARD_OPTIONS = [
  'Cambridge - CAIE',
  'Edexcel (Pearson)',
  'Karachi Board',
  'Federal Board',
  'AKU-EB',
  'Punjab Board',
];

export const TIME_SLOT_OPTIONS = [
  '03:00 PM - 04:00 PM',
  '03:30 PM - 05:00 PM',
  '04:00 PM - 05:00 PM',
  '04:00 PM - 05:30 PM',
  '04:30 PM - 06:00 PM',
  '05:00 PM - 06:00 PM',
  '05:00 PM - 06:30 PM',
  '05:30 PM - 07:00 PM',
  '06:00 PM - 07:00 PM',
  '06:00 PM - 07:15 PM',
  '06:00 PM - 07:30 PM',
  '06:30 PM - 08:00 PM',
  '07:00 PM - 08:00 PM',
  '07:00 PM - 08:30 PM',
  '07:30 PM - 09:00 PM',
  '08:00 PM - 09:00 PM',
  '08:00 PM - 09:30 PM',
  '08:30 PM - 10:00 PM',
  '09:00 PM - 10:00 PM',
  'Flexible / Custom Time',
];

export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const DAY_PRESETS = [
  { label: 'MWF', days: ['Mon', 'Wed', 'Fri'] },
  { label: 'TTS', days: ['Tue', 'Thu', 'Sat'] },
  { label: 'Mon-Fri', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  { label: 'Weekend', days: ['Sat', 'Sun'] },
  { label: 'All Days', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
];

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  studentToEdit,
  groups = [],
}) => {
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [phone, setPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [email, setEmail] = useState('');
  const [grade, setGrade] = useState<string>('9th / IX');
  const [board, setBoard] = useState<string>('Federal Board');
  const [tuitionMode, setTuitionMode] = useState<TuitionMode>('home');
  const [addressOrLocation, setAddressOrLocation] = useState('');
  const [selectedTime, setSelectedTime] = useState('04:00 PM - 05:30 PM');
  const [customTime, setCustomTime] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [subjectsInput, setSubjectsInput] = useState('Physics, Mathematics');
  const [monthlyFee, setMonthlyFee] = useState(15000);
  const [feeDueDay, setFeeDueDay] = useState(5);
  const [notes, setNotes] = useState('');
  const [avatarBg, setAvatarBg] = useState('bg-blue-600');
  const [assignedGroupId, setAssignedGroupId] = useState('');

  // Helper to parse legacy timeSlot string (e.g. "4:00 PM - 5:30 PM (Mon, Wed, Fri)")
  const parseTimeAndDays = (slotString?: string) => {
    if (!slotString) {
      return { time: '04:00 PM - 05:30 PM', custom: '', days: ['Mon', 'Wed', 'Fri'] };
    }

    const match = slotString.match(/^(.*?)(?:\s*\((.*?)\))?$/);
    const rawTime = match && match[1] ? match[1].trim() : slotString;
    const rawDays = match && match[2] ? match[2].trim() : '';

    let days: string[] = [];
    if (rawDays) {
      if (rawDays.toLowerCase().includes('daily') || rawDays.toLowerCase().includes('mon-fri')) {
        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      } else if (rawDays.toLowerCase().includes('weekend')) {
        days = ['Sat', 'Sun'];
      } else {
        days = rawDays.split(',').map((d) => d.trim()).filter((d) => WEEK_DAYS.includes(d));
      }
    }

    if (days.length === 0) {
      days = ['Mon', 'Wed', 'Fri'];
    }

    const matchedTimeOption = TIME_SLOT_OPTIONS.find((t) => t.toLowerCase() === rawTime.toLowerCase());
    if (matchedTimeOption) {
      return { time: matchedTimeOption, custom: '', days };
    } else if (rawTime) {
      return { time: 'Flexible / Custom Time', custom: rawTime, days };
    }

    return { time: '04:00 PM - 05:30 PM', custom: '', days };
  };

  const handleToggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length === 1) return; // Keep at least one day
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      // Keep sorted by week order
      const newDays = [...selectedDays, day].sort(
        (a, b) => WEEK_DAYS.indexOf(a) - WEEK_DAYS.indexOf(b)
      );
      setSelectedDays(newDays);
    }
  };

  const handleApplyPreset = (presetDays: string[]) => {
    setSelectedDays(presetDays);
  };

  useEffect(() => {
    if (studentToEdit) {
      setName(studentToEdit.name);
      setRollNo(studentToEdit.rollNo);
      setPhone(studentToEdit.phone || '');
      setParentName(studentToEdit.parentName || '');
      setParentPhone(studentToEdit.parentPhone || '');
      setEmail(studentToEdit.email || '');
      setGrade(studentToEdit.grade);
      setBoard(studentToEdit.board);
      setTuitionMode(studentToEdit.tuitionMode);
      setAddressOrLocation(studentToEdit.addressOrLocation || '');
      
      const parsed = parseTimeAndDays(studentToEdit.timeSlot);
      setSelectedTime(parsed.time);
      setCustomTime(parsed.custom);
      setSelectedDays(parsed.days);

      setSubjectsInput(studentToEdit.subjects.join(', '));
      setMonthlyFee(studentToEdit.monthlyFee);
      setFeeDueDay(studentToEdit.feeDueDay || 5);
      setNotes(studentToEdit.notes || '');
      setAvatarBg(studentToEdit.avatarBg || 'bg-blue-600');

      const existingGroup = groups.find((g) => g.studentIds.includes(studentToEdit.id));
      setAssignedGroupId(existingGroup ? existingGroup.id : '');
    } else {
      // Default new student values
      setName('');
      setRollNo(`SAP-00${Math.floor(Math.random() * 90 + 10)}`);
      setPhone('');
      setParentName('');
      setParentPhone('');
      setEmail('');
      setGrade('9th / IX');
      setBoard('Federal Board');
      setTuitionMode('home');
      setAddressOrLocation('');
      setSelectedTime('04:00 PM - 05:30 PM');
      setCustomTime('');
      setSelectedDays(['Mon', 'Wed', 'Fri']);
      setSubjectsInput('Physics, Mathematics');
      setMonthlyFee(18000);
      setFeeDueDay(5);
      setNotes('');
      setAvatarBg(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
      setAssignedGroupId('');
    }
  }, [studentToEdit, isOpen, groups]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const subjects = subjectsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    // Formatted time slot string
    const finalTime = selectedTime === 'Flexible / Custom Time' && customTime.trim()
      ? customTime.trim()
      : selectedTime;
    const finalDaysStr = selectedDays.length > 0 ? `(${selectedDays.join(', ')})` : '';
    const formattedTimeSlot = `${finalTime} ${finalDaysStr}`.trim();

    const savedStudent: Student = {
      id: studentToEdit ? studentToEdit.id : `std-${Date.now()}`,
      rollNo: rollNo.trim() || `SAP-${Math.floor(Math.random() * 900 + 100)}`,
      name: name.trim(),
      phone: phone.trim(),
      parentName: parentName.trim() || 'Parent',
      parentPhone: parentPhone.trim() || phone.trim() || '+92 300 0000000',
      email: email.trim() || undefined,
      grade,
      board,
      tuitionMode,
      addressOrLocation: addressOrLocation.trim() || undefined,
      timeSlot: formattedTimeSlot || 'Flexible Time',
      subjects: subjects.length > 0 ? subjects : ['General'],
      monthlyFee: Number(monthlyFee) || 0,
      feeDueDay: Number(feeDueDay) || 5,
      joiningDate: studentToEdit ? studentToEdit.joiningDate : new Date().toISOString().slice(0, 10),
      avatarBg,
      notes: notes.trim() || undefined,
      isActive: true,
    };

    onSave(savedStudent, assignedGroupId || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#1F231D]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-[#E0E4D9] overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-[#3A4035] p-6 text-white flex items-center justify-between border-b border-[#4E5745]">
          <div>
            <h3 className="text-lg font-bold text-white font-serif">
              {studentToEdit ? 'Edit Student Details' : 'Enroll New Student'}
            </h3>
            <p className="text-xs text-[#CAD3C0] mt-0.5">
              Sir Ali Preparations • Home & Online Student Register
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#CAD3C0] hover:text-white hover:bg-[#2D3329]/80 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* Row 1: Mode, Name, Roll No */}
          <div className="bg-[#F7F8F3] p-3.5 rounded-2xl border border-[#E0E4D9] space-y-3">
            <label className="block text-xs font-bold text-[#2D3329]">Tuition Delivery Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTuitionMode('home')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
                  tuitionMode === 'home'
                    ? 'bg-[#5C6652] text-white border-[#5C6652] shadow-xs'
                    : 'bg-white text-[#42473E] border-[#E0E4D9] hover:bg-[#F0F2EA]'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Home Tuition Visit</span>
              </button>

              <button
                type="button"
                onClick={() => setTuitionMode('online')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
                  tuitionMode === 'online'
                    ? 'bg-[#3D5A5B] text-white border-[#3D5A5B] shadow-xs'
                    : 'bg-white text-[#42473E] border-[#E0E4D9] hover:bg-[#F0F2EA]'
                }`}
              >
                <Laptop className="w-4 h-4" />
                <span>Online Live Class</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#2D3329] mb-1">Student Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Hamza Tariq"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2D3329] mb-1">Roll / ID Number</label>
              <input
                type="text"
                placeholder="e.g. SAP-007"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652] font-mono"
              />
            </div>
          </div>

          {/* Row 2: Grade & Board */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#2D3329] mb-1">Grade / Class Level</label>
              <select
                id="enroll-student-grade-select"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652] cursor-pointer font-medium"
              >
                {grade && !GRADE_OPTIONS.includes(grade) && (
                  <option value={grade}>{grade}</option>
                )}
                {GRADE_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#2D3329] mb-1">Exam Board / System</label>
              <select
                id="enroll-student-board-select"
                value={board}
                onChange={(e) => setBoard(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652] cursor-pointer font-medium"
              >
                {board && !BOARD_OPTIONS.includes(board) && (
                  <option value={board}>{board}</option>
                )}
                {BOARD_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Enrolled Subjects */}
          <div>
            <label className="block font-semibold text-[#2D3329] mb-1">Enrolled Subjects (comma separated)</label>
            <input
              type="text"
              placeholder="Physics, Mathematics, Chemistry"
              value={subjectsInput}
              onChange={(e) => setSubjectsInput(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
            />
          </div>

          {/* Row 4: Class Time Slot (Dropdown) & Days Selection (Multi-Select) */}
          <div className="bg-[#FAFBF9] p-4 rounded-2xl border border-[#E0E4D9] space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#5C6652]" />
                <span className="font-semibold text-[#2D3329] text-sm">Class Schedule (Time Slot & Days)</span>
              </div>
              <span className="text-xs text-[#707969] bg-white px-2.5 py-1 rounded-full border border-[#E0E4D9] font-mono">
                {selectedTime === 'Flexible / Custom Time' && customTime
                  ? customTime
                  : selectedTime}{' '}
                ({selectedDays.join(', ')})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#42473E] mb-1">
                  Class Time Slot (Dropdown)
                </label>
                <select
                  id="enroll-student-time-select"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652] cursor-pointer text-sm font-medium"
                >
                  {TIME_SLOT_OPTIONS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                {selectedTime === 'Flexible / Custom Time' && (
                  <input
                    type="text"
                    placeholder="Enter custom timing (e.g. 10:30 AM - 12:00 PM)"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="w-full mt-2 px-3 py-1.5 bg-white border border-[#E0E4D9] text-[#2D3329] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
                  />
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#42473E]">
                    Class Days (Select Multiple)
                  </label>
                  <span className="text-[11px] text-[#707969]">
                    {selectedDays.length} day{selectedDays.length === 1 ? '' : 's'} selected
                  </span>
                </div>

                {/* Day toggle buttons */}
                <div className="grid grid-cols-7 gap-1">
                  {WEEK_DAYS.map((day) => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleToggleDay(day)}
                        className={`py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-[#3A4035] text-white border-[#3A4035] shadow-xs'
                            : 'bg-white text-[#5C6652] border-[#E0E4D9] hover:bg-[#F0F2EB]'
                        }`}
                        title={`Toggle ${day}`}
                      >
                        <span>{day}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[10px] uppercase font-bold text-[#707969] tracking-wider">
                    Presets:
                  </span>
                  {DAY_PRESETS.map((preset) => {
                    const isActive =
                      preset.days.length === selectedDays.length &&
                      preset.days.every((d) => selectedDays.includes(d));
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handleApplyPreset(preset.days)}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition cursor-pointer ${
                          isActive
                            ? 'bg-[#5C6652] text-white border-[#5C6652]'
                            : 'bg-white text-[#42473E] border-[#E0E4D9] hover:bg-[#EAEFE5]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Row 4: Fee & Due Day */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAFBF9] p-3.5 rounded-2xl border border-[#E0E4D9]">
            <div>
              <label className="block font-semibold text-[#2D3329] mb-1">Agreed Monthly Fee (PKR)</label>
              <input
                type="number"
                min="0"
                step="500"
                required
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-[#E0E4D9] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652] font-bold text-[#2D3329]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2D3329] mb-1">Fee Due Day of Month</label>
              <select
                value={feeDueDay}
                onChange={(e) => setFeeDueDay(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
              >
                <option value={1}>1st of Month</option>
                <option value={5}>5th of Month</option>
                <option value={7}>7th of Month</option>
                <option value={10}>10th of Month</option>
                <option value={15}>15th of Month</option>
              </select>
            </div>
          </div>

          {/* Row 5: Parents & Contacts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#2D3329] mb-1">Parent / Guardian Name</label>
              <input
                type="text"
                placeholder="e.g. Tariq Mehmood"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2D3329] mb-1">Parent WhatsApp / Phone *</label>
              <input
                type="text"
                placeholder="+92 300 1234567"
                required
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
              />
            </div>
          </div>

          {/* Row 6: Address or Online link */}
          <div>
            <label className="block font-semibold text-[#2D3329] mb-1">
              {tuitionMode === 'home' ? 'Home Tuition Address' : 'Online Zoom / Google Meet Link & Batch'}
            </label>
            <input
              type="text"
              placeholder={tuitionMode === 'home' ? 'House #, Street, Sector / Colony' : 'Google Meet URL or Zoom Meeting ID'}
              value={addressOrLocation}
              onChange={(e) => setAddressOrLocation(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
            />
          </div>

          {/* Group / Batch Assignment */}
          {groups.length > 0 && (
            <div>
              <label className="block font-semibold text-[#2D3329] mb-1 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#5C6652]" />
                <span>Assign to Tuition Group / Batch</span>
                <span className="text-xs font-normal text-[#707969]">(Optional)</span>
              </label>
              <select
                value={assignedGroupId}
                onChange={(e) => setAssignedGroupId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
              >
                <option value="">-- No Group / Individual Student --</option>
                {groups.map((grp) => (
                  <option key={grp.id} value={grp.id}>
                    {grp.name} ({grp.subject} - {grp.grade}) [{grp.studentIds.length} students]
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Teacher Notes */}
          <div>
            <label className="block font-semibold text-[#2D3329] mb-1">Special Academic Notes & Goals</label>
            <textarea
              rows={2}
              placeholder="e.g. Target NUST entry test, needs more drill on past papers..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E0E4D9]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#F0F2EA] hover:bg-[#E0E4D9] text-[#2D3329] font-semibold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#5C6652] hover:bg-[#4E5745] text-white font-medium rounded-xl shadow-xs transition cursor-pointer"
            >
              {studentToEdit ? 'Save Changes' : 'Enroll Student'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
