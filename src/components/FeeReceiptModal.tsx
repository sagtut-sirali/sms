import React from 'react';
import { X, Printer, CheckCircle2, GraduationCap } from 'lucide-react';
import { Student, FeeRecord } from '../types';
import { formatCurrency } from '../utils/formatters';

interface FeeReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  fee: FeeRecord | null;
}

export const FeeReceiptModal: React.FC<FeeReceiptModalProps> = ({
  isOpen,
  onClose,
  student,
  fee,
}) => {
  if (!isOpen || !student || !fee) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-[#1F231D]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-[#E0E4D9] overflow-hidden my-8 flex flex-col">
        
        {/* Modal Action Bar (Hidden in print) */}
        <div className="bg-[#3A4035] p-4 text-white flex items-center justify-between border-b border-[#4E5745] print:hidden">
          <span className="text-xs font-semibold text-[#CAD3C0]">Fee Payment Receipt</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-[#5C6652] hover:bg-[#4E5745] text-white font-medium text-xs px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#CAD3C0] hover:text-white hover:bg-[#2D3329]/80 rounded-full transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-8 bg-white text-[#2D3329] space-y-6 print:p-0 print:m-0" id="printable-receipt">
          
          {/* Receipt Header */}
          <div className="flex items-start justify-between border-b-2 border-[#3A4035] pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#3A4035] text-[#CAD3C0] flex items-center justify-center font-bold">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#2D3329] tracking-tight font-serif">SIR ALI PREPARATIONS</h1>
                <p className="text-xs text-[#5C6652] font-medium">Home & Online Tuitions • STEM Academic Coaching</p>
                <p className="text-[11px] text-[#707969]">Phone: +92 300 1234567 • Email: sirali.preparations@gmail.com</p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block bg-[#E9EDE0] text-[#3D4736] font-bold text-xs px-2.5 py-1 rounded-md border border-[#CAD3C0]">
                OFFICIAL RECEIPT
              </span>
              <div className="text-xs font-mono font-bold text-[#2D3329] mt-1.5">
                {fee.receiptNo || 'SAP-REC-OFFICIAL'}
              </div>
              <div className="text-[11px] text-[#707969]">Date: {fee.paidDate || new Date().toISOString().slice(0, 10)}</div>
            </div>
          </div>

          {/* Student Info Box */}
          <div className="grid grid-cols-2 gap-4 bg-[#F7F8F3] p-4 rounded-xl border border-[#E0E4D9] text-xs">
            <div>
              <span className="text-[#707969] block text-[10px] uppercase font-semibold">Student Information</span>
              <div className="font-bold text-[#2D3329] text-sm mt-0.5">{student.name}</div>
              <div className="text-[#5C6652] mt-0.5">Roll No: <span className="font-mono font-medium">{student.rollNo}</span></div>
              <div className="text-[#5C6652]">Grade: {student.grade}</div>
              <div className="text-[#5C6652]">Subjects: {student.subjects.join(', ')}</div>
            </div>

            <div>
              <span className="text-[#707969] block text-[10px] uppercase font-semibold">Tuition & Parent Details</span>
              <div className="font-semibold text-[#2D3329] mt-0.5">Parent: {student.parentName}</div>
              <div className="text-[#5C6652]">Contact: {student.parentPhone}</div>
              <div className="text-[#5C6652] capitalize">
                Mode: <span className="font-medium">{student.tuitionMode === 'home' ? 'Home Tuition' : 'Online Session'}</span>
              </div>
              <div className="text-[#5C6652]">Billing Cycle: <span className="font-bold text-[#2D3329]">{fee.month}</span></div>
            </div>
          </div>

          {/* Payment Breakdown Table */}
          <div className="border border-[#E0E4D9] rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#F0F2EA] text-[#2D3329] font-bold border-b border-[#E0E4D9]">
                <tr>
                  <th className="p-3">Fee Description</th>
                  <th className="p-3 text-right">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E4D9]">
                <tr>
                  <td className="p-3">
                    <span className="font-semibold text-[#2D3329]">Monthly Tuition Fee ({fee.month})</span>
                    <span className="text-[#707969] block text-[11px]">{student.subjects.join(', ')} - {student.grade}</span>
                  </td>
                  <td className="p-3 text-right font-medium text-[#2D3329]">{formatCurrency(fee.totalFee)}</td>
                </tr>

                {fee.discount > 0 && (
                  <tr className="text-[#3D4736]">
                    <td className="p-3">Concession / Sibling Discount</td>
                    <td className="p-3 text-right font-medium">- {formatCurrency(fee.discount)}</td>
                  </tr>
                )}

                <tr className="bg-[#FAFBF9] font-bold text-[#2D3329] border-t border-[#E0E4D9]">
                  <td className="p-3">Total Payable</td>
                  <td className="p-3 text-right">{formatCurrency(fee.totalFee - fee.discount)}</td>
                </tr>

                <tr className="bg-[#E9EDE0] text-[#2D3329] font-bold border-t border-[#CAD3C0]">
                  <td className="p-3">Amount Received ({fee.paymentMethod || 'Cash/Online'})</td>
                  <td className="p-3 text-right text-[#3D4736] text-sm font-serif">{formatCurrency(fee.paidAmount)}</td>
                </tr>

                {fee.dueAmount > 0 && (
                  <tr className="bg-[#FDF2F2] text-[#995353] font-bold border-t border-[#E0E4D9]">
                    <td className="p-3">Balance Due</td>
                    <td className="p-3 text-right text-[#995353]">{formatCurrency(fee.dueAmount)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Verification & Stamp */}
          <div className="pt-6 flex items-end justify-between text-xs">
            <div>
              <div className="flex items-center gap-1.5 text-[#3D4736] font-bold mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Payment Status: {fee.status.toUpperCase()}</span>
              </div>
              <p className="text-[11px] text-[#707969]">
                Thank you for your trust in Sir Ali Preparations!
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 border-b-2 border-[#3A4035] pb-1 font-serif italic text-[#2D3329] font-bold">
                Sir Ali
              </div>
              <span className="text-[10px] text-[#707969] uppercase tracking-wider block mt-0.5">
                Authorized Signature
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
