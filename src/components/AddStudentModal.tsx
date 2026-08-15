import React, { useState, useEffect } from 'react';
import { X, User, BookOpen, Calendar, Phone, MapPin, DollarSign, Home, Laptop } from 'lucide-react';
import { Student, TuitionMode } from '../types';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
  studentToEdit?: Student | null;
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

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  studentToEdit,
}) => {
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [phone, setPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [email, setEmail] = useState('');
  const [grade, setGrade] = useState('F.Sc Part 1 (Pre-Engineering)');
  const [board, setBoard] = useState('Federal Board (FBISE)');
  const [tuitionMode, setTuitionMode] = useState<TuitionMode>('home');
  const [addressOrLocation, setAddressOrLocation] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [subjectsInput, setSubjectsInput] = useState('Physics, Mathematics');
  const [monthlyFee, setMonthlyFee] = useState(15000);
  const [feeDueDay, setFeeDueDay] = useState(5);
  const [notes, setNotes] = useState('');
  const [avatarBg, setAvatarBg] = useState('bg-blue-600');

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
      setTimeSlot(studentToEdit.timeSlot);
      setSubjectsInput(studentToEdit.subjects.join(', '));
      setMonthlyFee(studentToEdit.monthlyFee);
      setFeeDueDay(studentToEdit.feeDueDay || 5);
      setNotes(studentToEdit.notes || '');
      setAvatarBg(studentToEdit.avatarBg || 'bg-blue-600');
    } else {
      // Default new student values
      setName('');
      setRollNo(`SAP-00${Math.floor(Math.random() * 90 + 10)}`);
      setPhone('');
      setParentName('');
      setParentPhone('');
      setEmail('');
      setGrade('F.Sc Part 1 (Pre-Engineering)');
      setBoard('Federal Board (FBISE)');
      setTuitionMode('home');
      setAddressOrLocation('');
      setTimeSlot('4:00 PM - 5:30 PM (Mon, Wed, Fri)');
      setSubjectsInput('Physics, Mathematics');
      setMonthlyFee(18000);
      setFeeDueDay(5);
      setNotes('');
      setAvatarBg(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
    }
  }, [studentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const subjects = subjectsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

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
      timeSlot: timeSlot.trim() || 'Flexible Time',
      subjects: subjects.length > 0 ? subjects : ['General'],
      monthlyFee: Number(monthlyFee) || 0,
      feeDueDay: Number(feeDueDay) || 5,
      joiningDate: studentToEdit ? studentToEdit.joiningDate : new Date().toISOString().slice(0, 10),
      avatarBg,
      notes: notes.trim() || undefined,
      isActive: true,
    };

    onSave(savedStudent);
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
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
              >
                <option value="Class 9 (Matric)">Class 9 (Matric)</option>
                <option value="Class 10 (Matric)">Class 10 (Matric)</option>
                <option value="F.Sc Part 1 (Pre-Engineering)">F.Sc Part 1 (Pre-Engineering)</option>
                <option value="F.Sc Part 1 (Pre-Medical)">F.Sc Part 1 (Pre-Medical)</option>
                <option value="F.Sc Part 2 (Pre-Engineering)">F.Sc Part 2 (Pre-Engineering)</option>
                <option value="F.Sc Part 2 (Pre-Medical)">F.Sc Part 2 (Pre-Medical)</option>
                <option value="O Level (Cambridge IGCSE)">O Level (Cambridge IGCSE)</option>
                <option value="A Level (Cambridge)">A Level (Cambridge)</option>
                <option value="Entry Test Prep (NET / MDCAT / ECAT)">Entry Test Prep (NET / MDCAT / ECAT)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#2D3329] mb-1">Exam Board / System</label>
              <input
                type="text"
                placeholder="e.g. Federal Board (FBISE) / CAIE Cambridge"
                value={board}
                onChange={(e) => setBoard(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
              />
            </div>
          </div>

          {/* Row 3: Subjects & Time Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div>
              <label className="block font-semibold text-[#2D3329] mb-1">Class Time Slot / Days</label>
              <input
                type="text"
                placeholder="e.g. 5:00 PM - 6:30 PM (Mon, Wed, Fri)"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
              />
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
