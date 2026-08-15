import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, CreditCard, Receipt, User, CheckCircle2 } from 'lucide-react';
import { Student, FeeRecord, PaymentMethod, PaymentStatus } from '../types';
import { formatCurrency } from '../utils/formatters';

interface RecordFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onSaveFee: (fee: FeeRecord) => void;
  preSelectedStudent?: Student | null;
  preSelectedFee?: FeeRecord | null;
}

export const RecordFeeModal: React.FC<RecordFeeModalProps> = ({
  isOpen,
  onClose,
  students,
  onSaveFee,
  preSelectedStudent,
  preSelectedFee,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [month, setMonth] = useState('August 2026');
  const [totalFee, setTotalFee] = useState(15000);
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(15000);
  const [dueDate, setDueDate] = useState('2026-08-05');
  const [paidDate, setPaidDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [receiptNo, setReceiptNo] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (preSelectedStudent) {
      setSelectedStudentId(preSelectedStudent.id);
      setTotalFee(preSelectedStudent.monthlyFee);
      setPaidAmount(preSelectedStudent.monthlyFee);
    } else if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
      setTotalFee(students[0].monthlyFee);
      setPaidAmount(students[0].monthlyFee);
    }

    if (preSelectedFee) {
      setMonth(preSelectedFee.month);
      setTotalFee(preSelectedFee.totalFee);
      setDiscount(preSelectedFee.discount || 0);
      setPaidAmount(preSelectedFee.paidAmount);
      setDueDate(preSelectedFee.dueDate);
      setPaidDate(preSelectedFee.paidDate || new Date().toISOString().slice(0, 10));
      setPaymentMethod(preSelectedFee.paymentMethod || 'Bank Transfer');
      setReceiptNo(preSelectedFee.receiptNo || '');
      setRemarks(preSelectedFee.remarks || '');
    } else {
      setReceiptNo(`SAP-REC-2608-${Math.floor(Math.random() * 89 + 10)}`);
    }
  }, [preSelectedStudent, preSelectedFee, isOpen, students]);

  if (!isOpen) return null;

  const currentStudent = students.find(s => s.id === selectedStudentId);

  const handleStudentChange = (id: string) => {
    setSelectedStudentId(id);
    const st = students.find(s => s.id === id);
    if (st) {
      setTotalFee(st.monthlyFee);
      setPaidAmount(st.monthlyFee);
    }
  };

  const netPayable = Math.max(0, totalFee - discount);
  const dueAmount = Math.max(0, netPayable - paidAmount);

  let calculatedStatus: PaymentStatus = 'pending';
  if (paidAmount >= netPayable && netPayable > 0) {
    calculatedStatus = 'paid';
  } else if (paidAmount > 0 && paidAmount < netPayable) {
    calculatedStatus = 'partial';
  } else {
    // If due date passed, overdue
    const isPastDue = new Date(dueDate).getTime() < new Date().getTime();
    calculatedStatus = isPastDue ? 'overdue' : 'pending';
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    const savedRecord: FeeRecord = {
      id: preSelectedFee ? preSelectedFee.id : `fee-${Date.now()}`,
      studentId: selectedStudentId,
      month,
      year: 2026,
      totalFee: Number(totalFee),
      discount: Number(discount),
      paidAmount: Number(paidAmount),
      dueAmount,
      status: calculatedStatus,
      dueDate,
      paidDate: paidAmount > 0 ? paidDate : undefined,
      paymentMethod: paidAmount > 0 ? paymentMethod : undefined,
      receiptNo: paidAmount > 0 ? (receiptNo || `SAP-REC-${Date.now()}`) : undefined,
      remarks: remarks.trim() || undefined,
    };

    onSaveFee(savedRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#1F231D]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#E0E4D9] overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-[#3A4035] p-6 text-white flex items-center justify-between border-b border-[#4E5745]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#5C6652] text-[#F7F8F3] flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-serif">Record Tuition Fee Payment</h3>
              <p className="text-xs text-[#CAD3C0]">Sir Ali Preparations Financial Ledger</p>
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
            <label className="block font-semibold text-[#2D3329] mb-1">Select Student</label>
            <select
              value={selectedStudentId}
              onChange={(e) => handleStudentChange(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652] font-semibold cursor-pointer"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.rollNo}) - {s.tuitionMode === 'home' ? 'Home' : 'Online'} - {s.grade}
                </option>
              ))}
            </select>
          </div>

          {/* Billing Month & Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#2D3329] mb-1">Billing Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652] font-semibold cursor-pointer"
              >
                <option value="August 2026">August 2026</option>
                <option value="July 2026">July 2026</option>
                <option value="September 2026">September 2026</option>
                <option value="October 2026">October 2026</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#2D3329] mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5C6652]"
              />
            </div>
          </div>

          {/* Fee Calculation Card */}
          <div className="bg-[#FAFBF9] p-4 rounded-2xl border border-[#E0E4D9] space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#707969] font-medium mb-1">Monthly Fee (PKR)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  required
                  value={totalFee}
                  onChange={(e) => setTotalFee(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-[#E0E4D9] rounded-lg font-bold text-[#2D3329]"
                />
              </div>

              <div>
                <label className="block text-[#707969] font-medium mb-1">Discount / Concession</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-[#E0E4D9] rounded-lg text-[#2D3329]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E0E4D9]">
              <div>
                <label className="block text-[#3D4736] font-bold mb-1">Amount Received (Paid)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#E9EDE0] border border-[#CAD3C0] rounded-lg font-bold text-[#2D3329] text-sm"
                />
              </div>

              <div className="flex flex-col justify-end">
                <span className="text-[11px] text-[#707969]">Remaining Balance:</span>
                <span className={`text-base font-bold font-serif ${dueAmount > 0 ? 'text-[#995353]' : 'text-[#3D4736]'}`}>
                  {formatCurrency(dueAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method & Date */}
          {paidAmount > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#2D3329] mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none cursor-pointer"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash at Residence/Class</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="Other">Other Online</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#2D3329] mb-1">Payment Date</label>
                <input
                  type="date"
                  value={paidDate}
                  onChange={(e) => setPaidDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Receipt Number */}
          {paidAmount > 0 && (
            <div>
              <label className="block font-semibold text-[#2D3329] mb-1">Receipt / Ref Number</label>
              <input
                type="text"
                placeholder="e.g. SAP-REC-2608-01"
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl font-mono"
              />
            </div>
          )}

          {/* Remarks */}
          <div>
            <label className="block font-semibold text-[#2D3329] mb-1">Payment Note / Remarks</label>
            <input
              type="text"
              placeholder="e.g. Received via Meezan Bank, full fee cleared"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7F8F3] border border-[#E0E4D9] text-[#2D3329] rounded-xl"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E0E4D9]">
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
              Save Payment
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
