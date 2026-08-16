import { Student, FeeRecord, TestScore, AttendanceRecord } from '../types';

export const getTodayDateString = (dateObj: Date = new Date()): string => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getCurrentMonthYearString = (dateObj: Date = new Date()): string => {
  return dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    return new Date(dateStr).toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  } catch (e) {
    return dateStr;
  }
};

export const formatCurrency = (amount: number): string => {
  return 'Rs. ' + amount.toLocaleString('en-PK');
};

export const calculateGrade = (percentage: number): string => {
  if (percentage >= 90) return 'A*';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
};

export const getGradeBadgeColor = (grade: string): string => {
  switch (grade) {
    case 'A*':
      return 'bg-[#E9EDE0] text-[#3D4736] border-[#CAD3C0] font-bold';
    case 'A':
      return 'bg-[#F0F4EC] text-[#55634B] border-[#D8E0D2] font-semibold';
    case 'B':
      return 'bg-[#EAF0F1] text-[#42595B] border-[#D1DFE0] font-semibold';
    case 'C':
      return 'bg-[#F9F6ED] text-[#8C6D37] border-[#E8DFCC] font-semibold';
    case 'D':
      return 'bg-[#FAF1EC] text-[#9E6547] border-[#ECCDC1] font-semibold';
    default:
      return 'bg-[#FCECEC] text-[#995353] border-[#ECCECE] font-semibold';
  }
};

export const generateWhatsAppFeeReminder = (student: Student, fee: FeeRecord): string => {
  const cleanPhone = student.parentPhone.replace(/[^0-9]/g, '');
  const text = encodeURIComponent(
`*SIR ALI PREPARATIONS* 📚
_Home & Online Academic Excellence_

*Fee Payment Reminder Notice*
------------------------------------
*Student Name:* ${student.name} (${student.rollNo})
*Grade / Class:* ${student.grade}
*Tuition Mode:* ${student.tuitionMode === 'home' ? '🏠 Home Tuition' : '💻 Online Live Class'}
*Month / Billing:* ${fee.month}
*Total Fee:* ${formatCurrency(fee.totalFee)}
*Paid Amount:* ${formatCurrency(fee.paidAmount)}
*Due Balance:* *${formatCurrency(fee.dueAmount)}*
*Due Date:* ${fee.dueDate}

Dear Respected Parent (${student.parentName}),
This is a gentle reminder regarding the tuition fee for ${fee.month}. Kindly clear the outstanding amount via Bank Transfer / JazzCash / EasyPaisa or cash at your earliest convenience.

If already paid, kindly share the payment screenshot to confirm.

JazakAllah Khair!
*Sir Ali Preparations*
📞 Contact: +92 300 1234567`
  );
  return `https://wa.me/${cleanPhone}?text=${text}`;
};

export const generateWhatsAppProgressReport = (
  student: Student,
  recentTests: TestScore[],
  attendanceRate: number,
  syllabusCoverage: number
): string => {
  const cleanPhone = student.parentPhone.replace(/[^0-9]/g, '');
  
  let testsList = '';
  if (recentTests.length > 0) {
    testsList = recentTests.slice(0, 4).map(t => 
      `• *${t.subject}* (${t.testTitle}): ${t.obtainedMarks}/${t.maxMarks} (${t.percentage}%) - Grade ${t.grade}`
    ).join('\n');
  } else {
    testsList = '• No test records logged yet.';
  }

  const text = encodeURIComponent(
`*SIR ALI PREPARATIONS* 🎓
_Student Academic Progress & Attendance Summary_

*Student Profile:*
• *Name:* ${student.name} (${student.rollNo})
• *Class/Grade:* ${student.grade} - ${student.board}
• *Tuition Mode:* ${student.tuitionMode === 'home' ? 'Home Tuition' : 'Online Session'}
• *Attendance Rate:* *${attendanceRate.toFixed(1)}%*
• *Syllabus Covered:* *${syllabusCoverage.toFixed(0)}%*

*Recent Test & Assessment Scores:*
${testsList}

*Teacher Remarks:*
"${student.notes || 'Maintaining steady consistency. Continued focus on numerical problem solving and past papers recommended.'}"

*Sir Ali Preparations*
Home & Online Tuitions`
  );

  return `https://wa.me/${cleanPhone}?text=${text}`;
};

export const generateWhatsAppAbsenceAlert = (student: Student, date: string, topicMissed?: string): string => {
  const cleanPhone = student.parentPhone.replace(/[^0-9]/g, '');
  const text = encodeURIComponent(
`*SIR ALI PREPARATIONS* ⚠️
_Attendance Alert_

Dear Parent (${student.parentName}),
This is to notify you that *${student.name}* (${student.rollNo}) was marked *ABSENT* today (${date}) during our scheduled ${student.tuitionMode === 'home' ? 'home tuition' : 'online tuition'} session.${topicMissed ? `\n\n*Topic Covered Today:* ${topicMissed}` : ''}

Kindly confirm if this absence was anticipated so we can arrange any required makeup material or past notes.

Warm regards,
*Sir Ali Preparations*`
  );
  return `https://wa.me/${cleanPhone}?text=${text}`;
};
