import React, { useState, useEffect } from 'react';
import { X, Printer, CheckCircle2, GraduationCap, Download, Loader2, FileCheck } from 'lucide-react';
import { Student, FeeRecord } from '../types';
import { formatCurrency } from '../utils/formatters';
import { downloadElementAsPdf } from '../utils/pdfExport';

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
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !student || !fee) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    const fileName = `Fee_Receipt_${student.name.replace(/\s+/g, '_')}_${fee.month}_${fee.year}.pdf`;
    setIsDownloadingPdf(true);
    const success = await downloadElementAsPdf('printable-receipt', fileName, (loading) => {
      setIsDownloadingPdf(loading);
    });
    if (success) {
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-[#1F231D]/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-[#E0E4D9] overflow-hidden my-6 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Action Bar (Hidden in print) */}
        <div className="bg-[#2D3329] p-4 text-white flex items-center justify-between border-b border-[#3E4639] print:hidden">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#CAD3C0]" />
            <span className="text-xs font-bold text-white">Fee Payment Receipt</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className={`font-semibold text-xs px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer ${
                downloadSuccess 
                  ? 'bg-emerald-700 text-white' 
                  : 'bg-[#5C6652] hover:bg-[#4D5644] text-white'
              }`}
              title="Download Receipt as PDF"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="bg-[#3E4639] hover:bg-[#4E5745] text-white font-medium text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#CAD3C0] hover:text-white hover:bg-[#3E4639] rounded-xl transition cursor-pointer"
              title="Close Modal (Esc)"
              aria-label="Close Fee Receipt Modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-8 bg-white text-[#2D3329] space-y-6 overflow-y-auto flex-1 print:p-0 print:m-0" id="printable-receipt">
          
          {/* Receipt Header */}
          <div className="flex items-start justify-between border-b-2 border-[#3A4035] pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#3A4035] text-[#CAD3C0] flex items-center justify-center font-bold">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#2D3329] tracking-tight font-serif">SIR ALI PREPARATIONS</h1>
                <p className="text-xs text-[#5C6652] font-medium">Home & Online Tuitions • STEM Academic Coaching</p>
                <p className="text-[10px] text-[#707969]">Contact: +92 300 1234567 • info@siralipreparations.edu</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#707969] block">Receipt #</span>
              <span className="font-mono font-bold text-xs text-[#2D3329]">
                REC-{fee.id.slice(-6).toUpperCase()}
              </span>
              <span className="text-[10px] text-[#707969] block mt-1">
                Date: {fee.paymentDate || new Date().toLocaleDateString('en-PK')}
              </span>
            </div>
          </div>

          {/* Student Billing Info */}
          <div className="grid grid-cols-2 gap-4 bg-[#F7F8F3] p-4 rounded-xl text-xs border border-[#E0E4D9]">
            <div>
              <span className="text-[10px] text-[#707969] uppercase font-semibold block">Student Details</span>
              <span className="font-bold text-[#2D3329] text-sm block mt-0.5">{student.name}</span>
              <span className="text-[#42473E] block">Roll No: {student.rollNo}</span>
              <span className="text-[#42473E] block">{student.grade} • {student.board}</span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-[#707969] uppercase font-semibold block">Billing Period</span>
              <span className="font-bold text-[#2D3329] text-sm block mt-0.5">{fee.month} {fee.year}</span>
              <span className="text-[#5C6652] font-medium block capitalize mt-1">
                Mode: {student.tuitionMode === 'home' ? 'Home Tuition' : 'Online Session'}
              </span>
            </div>
          </div>

          {/* Fee Itemization Table */}
          <div className="border border-[#E0E4D9] rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#F0F2EA] text-[#2D3329] font-bold border-b border-[#E0E4D9]">
                <tr>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E4D9]">
                <tr>
                  <td className="p-3 font-medium">Monthly Tuition Fee ({fee.month} {fee.year})</td>
                  <td className="p-3 text-right font-medium">{formatCurrency(fee.totalFee)}</td>
                </tr>

                {fee.discount > 0 && (
                  <tr className="text-[#5C6652]">
                    <td className="p-3">Scholarship / Fee Concession Discount</td>
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

        {/* Modal Footer (Hidden in print) */}
        <div className="bg-[#F7F8F3] px-6 py-3 border-t border-[#E0E4D9] flex items-center justify-between text-xs print:hidden">
          <span className="text-[#707969]">Press Esc to close</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-[#E0E4D9] border border-[#CAD3C0] text-[#2D3329] font-semibold rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
