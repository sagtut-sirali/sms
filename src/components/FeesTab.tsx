import React, { useState, useMemo, useEffect } from 'react';
import { 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Send, 
  Receipt, 
  Plus, 
  Filter, 
  Search, 
  Calendar,
  CreditCard,
  Building,
  Smartphone,
  Check,
  Users,
  X
} from 'lucide-react';
import { Student, FeeRecord, PaymentStatus, TuitionMode } from '../types';
import { formatCurrency, generateWhatsAppFeeReminder, getCurrentMonthYearString } from '../utils/formatters';
import { Pagination } from './Pagination';

interface FeesTabProps {
  students: Student[];
  fees: FeeRecord[];
  selectedModeFilter: 'all' | TuitionMode;
  isLocked?: boolean;
  onOpenRecordFee: (student?: Student, fee?: FeeRecord) => void;
  onOpenReceiptModal: (student: Student, fee: FeeRecord) => void;
}

export const FeesTab: React.FC<FeesTabProps> = ({
  students,
  fees,
  selectedModeFilter,
  isLocked = true,
  onOpenRecordFee,
  onOpenReceiptModal,
}) => {
  const currentMonth = getCurrentMonthYearString();
  const [selectedMonth, setSelectedMonth] = useState<string>(() => currentMonth);
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Reset page to 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth, selectedStudentFilter, statusFilter, searchQuery, selectedModeFilter]);

  const availableMonths = useMemo(() => {
    const list = Array.from(new Set(fees.map(f => f.month)));
    if (!list.includes(currentMonth)) list.unshift(currentMonth);
    return list;
  }, [fees, currentMonth]);

  // Merge students with fee records for the selected month
  const monthFeeEntries = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthNum = String(now.getMonth() + 1).padStart(2, '0');

    return students
      .filter(s => selectedModeFilter === 'all' ? true : s.tuitionMode === selectedModeFilter)
      .map(student => {
        const feeRecord = fees.find(f => f.studentId === student.id && f.month === selectedMonth);
        
        // If fee record doesn't exist yet for this month, synthesize a default pending record
        if (!feeRecord) {
          const dueDayStr = String(student.feeDueDay || 5).padStart(2, '0');
          const defaultRecord: FeeRecord = {
            id: `fee-synth-${student.id}-${selectedMonth}`,
            studentId: student.id,
            month: selectedMonth,
            year: currentYear,
            totalFee: student.monthlyFee,
            discount: 0,
            paidAmount: 0,
            dueAmount: student.monthlyFee,
            status: 'pending',
            dueDate: `${currentYear}-${currentMonthNum}-${dueDayStr}`,
          };
          return { student, fee: defaultRecord };
        }

        return { student, fee: feeRecord };
      });
  }, [students, fees, selectedMonth, selectedModeFilter]);

  // Filter by student, status & search
  const filteredEntries = useMemo(() => {
    return monthFeeEntries.filter(({ student, fee }) => {
      if (selectedStudentFilter !== 'all' && student.id !== selectedStudentFilter) {
        return false;
      }
      if (statusFilter !== 'all' && fee.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = student.name.toLowerCase().includes(q);
        const matchesRoll = student.rollNo.toLowerCase().includes(q);
        const matchesParent = student.parentName.toLowerCase().includes(q);
        return matchesName || matchesRoll || matchesParent;
      }
      return true;
    });
  }, [monthFeeEntries, selectedStudentFilter, statusFilter, searchQuery]);

  // Paginated records
  const totalFeePages = Math.ceil(filteredEntries.length / pageSize) || 1;
  const paginatedEntries = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredEntries.slice(startIdx, startIdx + pageSize);
  }, [filteredEntries, currentPage, pageSize]);

  // Aggregate stats
  const totalExpected = monthFeeEntries.reduce((acc, { fee }) => acc + (fee.totalFee - fee.discount), 0);
  const totalCollected = monthFeeEntries.reduce((acc, { fee }) => acc + fee.paidAmount, 0);
  const totalPending = monthFeeEntries.reduce((acc, { fee }) => acc + fee.dueAmount, 0);
  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;
  const overdueCount = monthFeeEntries.filter(({ fee }) => fee.status === 'overdue' || (fee.status === 'partial' && fee.dueAmount > 0)).length;

  return (
    <div className="space-y-6">
      
      {/* Top Header & Month Selector */}
      <div className="bg-white rounded-2xl p-5 border border-[#E0E4D9] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#2D3329] font-serif flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#5C6652]" />
            <span>Tuition Fee Records & Billing Ledger</span>
          </h2>
          <p className="text-xs text-[#707969] mt-0.5">
            Track monthly fee collections, issue fee receipts, and dispatch WhatsApp payment reminders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Month Selector */}
          <div className="flex items-center gap-1.5 bg-[#F7F8F3] border border-[#E0E4D9] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#2D3329]">
            <Calendar className="w-4 h-4 text-[#5C6652]" />
            <span className="text-[#707969]">Billing Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-[#2D3329] focus:outline-none cursor-pointer"
            >
              {availableMonths.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => onOpenRecordFee()}
            className="bg-[#5C6652] hover:bg-[#4E5745] text-white font-medium text-xs px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Expected */}
        <div className="bg-white rounded-2xl p-4 border border-[#E0E4D9] shadow-xs">
          <span className="text-[11px] font-semibold text-[#707969] uppercase block">Total Expected</span>
          <span className="text-xl font-bold text-[#2D3329] font-serif mt-1 block">{formatCurrency(totalExpected)}</span>
          <span className="text-xs text-[#707969] mt-0.5 block">{monthFeeEntries.length} students billed</span>
        </div>

        {/* Collected */}
        <div className="bg-white rounded-2xl p-4 border border-[#E0E4D9] shadow-xs">
          <span className="text-[11px] font-semibold text-[#707969] uppercase block">Total Collected</span>
          <span className="text-xl font-bold text-[#3D4736] font-serif mt-1 block">{formatCurrency(totalCollected)}</span>
          <div className="mt-2 w-full bg-[#F0F2EA] h-2 rounded-full overflow-hidden border border-[#E0E4D9]">
            <div className="bg-[#5C6652] h-full rounded-full" style={{ width: `${collectionRate}%` }} />
          </div>
          <span className="text-[11px] text-[#5C6652] font-semibold mt-1 block">{collectionRate}% collected</span>
        </div>

        {/* Outstanding Dues */}
        <div className="bg-white rounded-2xl p-4 border border-[#E0E4D9] shadow-xs">
          <span className="text-[11px] font-semibold text-[#707969] uppercase block">Outstanding Dues</span>
          <span className="text-xl font-bold text-[#995353] font-serif mt-1 block">{formatCurrency(totalPending)}</span>
          <span className="text-xs text-[#995353] font-medium mt-0.5 block">Pending payment</span>
        </div>

        {/* Overdue / Reminder count */}
        <div className="bg-white rounded-2xl p-4 border border-[#E0E4D9] shadow-xs">
          <span className="text-[11px] font-semibold text-[#707969] uppercase block">Overdue / Pending</span>
          <span className="text-xl font-bold text-[#9E6547] font-serif mt-1 block">{overdueCount}</span>
          <span className="text-xs text-[#707969] mt-0.5 block">Requires WhatsApp alert</span>
        </div>

      </div>

      {/* Filter & Search Bar with Student Dropdown */}
      <div className="bg-white rounded-2xl p-4 border border-[#E0E4D9] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#707969] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student or parent name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] placeholder-[#8A9382] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Student Filter Dropdown */}
          <div className="flex items-center gap-2 bg-[#F7F8F3] border border-[#CAD3C0] rounded-xl px-3 py-1.5 shadow-2xs">
            <Users className="w-4 h-4 text-[#5C6652]" />
            <label htmlFor="fees-student-filter-select" className="text-xs font-semibold text-[#42473E] whitespace-nowrap">
              Student:
            </label>
            <select
              id="fees-student-filter-select"
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-[#2D3329] focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">All Registered Students ({students.length})</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.rollNo} • {s.grade})</option>
              ))}
            </select>
          </div>

          {selectedStudentFilter !== 'all' && (
            <button
              onClick={() => setSelectedStudentFilter('all')}
              className="text-xs text-[#5C6652] hover:text-[#2D3329] bg-[#F0F2EA] hover:bg-[#E0E4D9] px-2.5 py-1.5 rounded-xl font-medium transition flex items-center gap-1 cursor-pointer"
              title="Show all registered students"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Show All</span>
            </button>
          )}

          {/* Status filter buttons */}
          <div className="flex items-center gap-1 bg-[#F0F2EA] p-1 rounded-xl text-xs border border-[#E0E4D9]">
            {['all', 'paid', 'partial', 'overdue', 'pending'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition cursor-pointer ${
                  statusFilter === st 
                    ? 'bg-white text-[#2D3329] shadow-xs border border-[#CAD3C0]' 
                    : 'text-[#707969] hover:text-[#2D3329]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fees Ledger Table with Pagination */}
      <div className="bg-white rounded-2xl border border-[#E0E4D9] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F0F2EA] text-[#707969] font-semibold border-b border-[#E0E4D9]">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4">Agreed Fee</th>
                <th className="py-3 px-4">Paid</th>
                <th className="py-3 px-4">Balance Due</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Receipt / Method</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E4D9]">
              {paginatedEntries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-[#707969]">
                    No fee records found matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedEntries.map(({ student, fee }) => {
                  const isPaid = fee.status === 'paid';
                  const isOverdue = fee.status === 'overdue';
                  const isPartial = fee.status === 'partial';

                  const waReminderLink = generateWhatsAppFeeReminder(student, fee);

                  return (
                    <tr key={fee.id} className="hover:bg-[#F9FAF7] transition">
                      <td className="py-3.5 px-4 font-semibold text-[#2D3329]">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedStudentFilter(student.id)}
                            className="w-7 h-7 rounded-lg bg-[#5C6652] text-[#F7F8F3] font-bold text-[10px] flex items-center justify-center hover:bg-[#3D4736] transition cursor-pointer"
                            title={`Filter ledger for ${student.name}`}
                          >
                            {student.name[0]}
                          </button>
                          <div>
                            <div>{student.name}</div>
                            <div className="text-[10px] text-[#707969] font-normal">{student.rollNo}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          student.tuitionMode === 'home' 
                            ? 'bg-[#E9EDE0] text-[#3D4736] border-[#CAD3C0]' 
                            : 'bg-[#E8EDEB] text-[#3D5A5B] border-[#CAD8D5]'
                        }`}>
                          {student.tuitionMode === 'home' ? 'Home' : 'Online'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-[#2D3329]">
                        {formatCurrency(fee.totalFee)}
                        {fee.discount > 0 && (
                          <span className="text-[10px] text-[#707969] block font-normal">
                            Discount: {formatCurrency(fee.discount)}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-[#3D4736]">
                        {formatCurrency(fee.paidAmount)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`font-bold ${fee.dueAmount > 0 ? 'text-[#995353]' : 'text-[#707969]'}`}>
                          {formatCurrency(fee.dueAmount)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                          isPaid 
                            ? 'bg-[#E9EDE0] text-[#3D4736] border-[#CAD3C0]' 
                            : isOverdue 
                            ? 'bg-[#FCECEC] text-[#995353] border-[#E8C5C5]' 
                            : isPartial 
                            ? 'bg-[#FAF0E4] text-[#8C5D39] border-[#EAD5C3]' 
                            : 'bg-[#F0F2EA] text-[#707969] border-[#E0E4D9]'
                        }`}>
                          {fee.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#707969]">
                        {fee.dueDate}
                      </td>

                      <td className="py-3.5 px-4 text-[#42473E]">
                        {fee.receiptNo ? (
                          <div>
                            <span className="font-mono text-[11px] font-semibold text-[#2D3329]">{fee.receiptNo}</span>
                            <span className="text-[10px] text-[#707969] block">{fee.paymentMethod || 'Paid'}</span>
                          </div>
                        ) : (
                          <span className="text-[#8A9382] italic">Unpaid</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Record Payment Button */}
                          <button
                            onClick={() => onOpenRecordFee(student, fee)}
                            className="bg-[#F0F2EA] hover:bg-[#E0E4D9] text-[#2D3329] px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border border-[#CAD3C0]"
                            title="Record or Update Payment"
                          >
                            Update
                          </button>

                          {/* Receipt Modal */}
                          {fee.paidAmount > 0 && (
                            <button
                              onClick={() => onOpenReceiptModal(student, fee)}
                              className="p-1.5 text-[#5C6652] hover:text-[#2D3329] hover:bg-[#E9EDE0] rounded-lg transition cursor-pointer"
                              title="Generate & View Fee Receipt"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* WhatsApp Reminder Button */}
                          {!isPaid && (
                            <a
                              href={waReminderLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-[#8C5D39] hover:text-[#5E381E] hover:bg-[#FAF0E4] rounded-lg transition cursor-pointer"
                              title="Send Fee Reminder on WhatsApp"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredEntries.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalFeePages}
            totalItems={filteredEntries.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[5, 10, 15, 25]}
            itemName="fee records"
            idPrefix="fees-ledger"
          />
        )}
      </div>

    </div>
  );
};
