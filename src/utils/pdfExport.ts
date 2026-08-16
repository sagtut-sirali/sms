import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Student, TestScore, AttendanceRecord, SubjectSyllabus } from '../types';
import { calculateGrade } from './formatters';

/**
 * Downloads a DOM element (such as the Report Card Modal content) as a high-resolution PDF.
 */
export const downloadElementAsPdf = async (
  elementId: string,
  filename: string,
  onProgress?: (loading: boolean) => void
): Promise<boolean> => {
  try {
    if (onProgress) onProgress(true);
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with id "${elementId}" not found for PDF export.`);
      if (onProgress) onProgress(false);
      return false;
    }

    // Capture the element at high resolution
    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate aspect ratio
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = imgWidth / imgHeight;

    const printWidth = pdfWidth - 20; // 10mm margins on each side
    const printHeight = printWidth / ratio;

    const yPosition = 10; // 10mm top margin

    if (printHeight > pdfHeight - 20) {
      // If content is very long, scale to fit within page with margin
      const fitScale = (pdfHeight - 20) / printHeight;
      pdf.addImage(imgData, 'PNG', 10, yPosition, printWidth * fitScale, (pdfHeight - 20));
    } else {
      pdf.addImage(imgData, 'PNG', 10, yPosition, printWidth, printHeight);
    }

    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    if (onProgress) onProgress(false);
    return true;
  } catch (error) {
    console.error('Error generating PDF from element:', error);
    if (onProgress) onProgress(false);
    // Fallback: trigger browser print
    window.print();
    return false;
  }
};

/**
 * Generates and downloads a dedicated, individual "Student Progress & Assessment Tracker" PDF
 * for a specific student.
 */
export const downloadStudentProgressTrackerPdf = (
  student: Student,
  testScores: TestScore[],
  attendance: AttendanceRecord[],
  syllabus?: SubjectSyllabus[]
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 14;

  // Filter student-specific data
  const sTests = testScores
    .filter(t => t.studentId === student.id)
    .sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime());

  const sAttendance = attendance.filter(a => a.studentId === student.id);
  const presentCount = sAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const absentCount = sAttendance.filter(a => a.status === 'absent').length;
  const lateCount = sAttendance.filter(a => a.status === 'late').length;
  const attendanceRate = sAttendance.length > 0 
    ? Math.round((presentCount / sAttendance.length) * 100) 
    : 100;

  const totalScore = sTests.reduce((acc, t) => acc + t.percentage, 0);
  const avgScore = sTests.length > 0 ? Math.round(totalScore / sTests.length) : 0;
  const highestScore = sTests.length > 0 ? Math.max(...sTests.map(t => t.percentage)) : 0;
  const studentOverallGrade = calculateGrade(avgScore);

  // Group tests by subject
  const subjectGroups: { [sub: string]: TestScore[] } = {};
  sTests.forEach(t => {
    if (!subjectGroups[t.subject]) subjectGroups[t.subject] = [];
    subjectGroups[t.subject].push(t);
  });

  // --- 1. Header Banner ---
  doc.setFillColor(45, 51, 41); // #2D3329
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('SIR ALI PREPARATIONS', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(202, 211, 192); // #CAD3C0
  doc.text('Student Progress & Assessment Tracker • Academic Dossier', 14, 17);
  doc.text('Home & Online Tuitions • STEM Coaching • Cell: +92 300 1234567', 14, 22);

  // Top Right Badge
  doc.setFillColor(92, 102, 82); // #5C6652
  doc.roundedRect(pageWidth - 62, 7, 48, 14, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('INDIVIDUAL DOSSIER', pageWidth - 58, 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`Date: ${new Date().toLocaleDateString('en-PK')}`, pageWidth - 58, 18);

  y = 35;

  // --- 2. Student Profile Card ---
  doc.setFillColor(247, 248, 243); // #F7F8F3
  doc.setDrawColor(224, 228, 217); // #E0E4D9
  doc.roundedRect(14, y, pageWidth - 28, 26, 3, 3, 'FD');

  doc.setTextColor(45, 51, 41);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(student.name, 18, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(112, 121, 105);
  doc.text(`Roll Number: `, 18, y + 13);
  doc.setTextColor(45, 51, 41);
  doc.setFont('helvetica', 'bold');
  doc.text(student.rollNo, 38, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(112, 121, 105);
  doc.text(`Grade / Board: `, 18, y + 19);
  doc.setTextColor(45, 51, 41);
  doc.text(`${student.grade} (${student.board})`, 39, y + 19);

  // Column 2
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(112, 121, 105);
  doc.text(`Tuition Mode: `, 85, y + 7);
  doc.setTextColor(45, 51, 41);
  doc.setFont('helvetica', 'bold');
  doc.text(student.tuitionMode === 'home' ? 'Home Tuition' : 'Online Session', 105, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(112, 121, 105);
  doc.text(`Enrolled Subjects: `, 85, y + 13);
  doc.setTextColor(45, 51, 41);
  doc.text(student.subjects.join(', ').slice(0, 32), 112, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(112, 121, 105);
  doc.text(`Schedule / Slot: `, 85, y + 19);
  doc.setTextColor(45, 51, 41);
  doc.text(student.timeSlot || 'Evening Batch', 110, y + 19);

  // Column 3
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(112, 121, 105);
  doc.text(`Parent / Guardian: `, 145, y + 7);
  doc.setTextColor(45, 51, 41);
  doc.text(student.parentName, 172, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(112, 121, 105);
  doc.text(`Emergency Phone: `, 145, y + 13);
  doc.setTextColor(45, 51, 41);
  doc.text(student.parentPhone, 172, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(112, 121, 105);
  doc.text(`Status: `, 145, y + 19);
  doc.setTextColor(61, 71, 54);
  doc.setFont('helvetica', 'bold');
  doc.text('Active Regular Student', 158, y + 19);

  y += 31;

  // --- 3. Key Metrics Dashboard (4 Boxes) ---
  const boxWidth = (pageWidth - 28 - 9) / 4;
  const metrics = [
    { label: 'Overall Average', value: `${avgScore}%`, sub: `Grade: ${studentOverallGrade}`, color: [92, 102, 82] },
    { label: 'Assessments Taken', value: `${sTests.length}`, sub: `Logged tests`, color: [45, 51, 41] },
    { label: 'Attendance Rate', value: `${attendanceRate}%`, sub: `${presentCount}/${sAttendance.length || 0} sessions`, color: [61, 71, 54] },
    { label: 'Highest Score', value: `${highestScore}%`, sub: 'Personal best', color: [158, 101, 71] },
  ];

  metrics.forEach((m, idx) => {
    const xPos = 14 + idx * (boxWidth + 3);
    doc.setFillColor(250, 251, 249);
    doc.setDrawColor(224, 228, 217);
    doc.roundedRect(xPos, y, boxWidth, 18, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(112, 121, 105);
    doc.text(m.label.toUpperCase(), xPos + 4, y + 5);

    doc.setFontSize(12);
    doc.setTextColor(m.color[0], m.color[1], m.color[2]);
    doc.text(m.value, xPos + 4, y + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(112, 121, 105);
    doc.text(m.sub, xPos + 4, y + 16);
  });

  y += 24;

  // --- 4. Subject-Wise Mastery Summary Table ---
  const subjectsList = Object.keys(subjectGroups);
  if (subjectsList.length > 0) {
    doc.setFillColor(240, 242, 234);
    doc.rect(14, y, pageWidth - 28, 6.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(45, 51, 41);
    doc.text('Subject', 16, y + 4.5);
    doc.text('Tests Logged', 85, y + 4.5);
    doc.text('Average Marks', 115, y + 4.5);
    doc.text('Highest Score', 145, y + 4.5);
    doc.text('Subject Grade', 175, y + 4.5);

    y += 6.5;

    subjectsList.forEach((sub, sIdx) => {
      const tests = subjectGroups[sub];
      const subAvg = Math.round(tests.reduce((a, b) => a + b.percentage, 0) / tests.length);
      const subMax = Math.max(...tests.map(t => t.percentage));
      const subGrade = calculateGrade(subAvg);

      if (sIdx % 2 === 1) {
        doc.setFillColor(250, 251, 249);
        doc.rect(14, y, pageWidth - 28, 6, 'F');
      }

      doc.setDrawColor(224, 228, 217);
      doc.line(14, y + 6, pageWidth - 14, y + 6);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(45, 51, 41);
      doc.text(sub, 16, y + 4.2);

      doc.setFont('helvetica', 'normal');
      doc.text(tests.length.toString(), 92, y + 4.2);
      doc.text(`${subAvg}%`, 122, y + 4.2);
      doc.text(`${subMax}%`, 152, y + 4.2);

      doc.setFont('helvetica', 'bold');
      doc.text(subGrade, 180, y + 4.2);

      y += 6;
    });

    y += 4;
  }

  // --- 5. Chronological Assessment Log Table ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(45, 51, 41);
  doc.text('Detailed Examination & Assessment Record Log', 14, y + 4);
  y += 6;

  doc.setFillColor(240, 242, 234);
  doc.rect(14, y, pageWidth - 28, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(45, 51, 41);
  doc.text('Date', 16, y + 4.8);
  doc.text('Subject', 38, y + 4.8);
  doc.text('Test Title / Topic', 75, y + 4.8);
  doc.text('Marks', 125, y + 4.8);
  doc.text('Score %', 145, y + 4.8);
  doc.text('Grade', 162, y + 4.8);
  doc.text('Remarks', 175, y + 4.8);

  y += 7;

  if (sTests.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(112, 121, 105);
    doc.text('No examination scores recorded for this student yet.', 16, y + 6);
    y += 10;
  } else {
    sTests.forEach((t, index) => {
      if (y > pageHeight - 45) {
        doc.addPage();
        y = 20;

        // Re-print table header on new page
        doc.setFillColor(240, 242, 234);
        doc.rect(14, y, pageWidth - 28, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(45, 51, 41);
        doc.text('Date', 16, y + 4.8);
        doc.text('Subject', 38, y + 4.8);
        doc.text('Test Title / Topic', 75, y + 4.8);
        doc.text('Marks', 125, y + 4.8);
        doc.text('Score %', 145, y + 4.8);
        doc.text('Grade', 162, y + 4.8);
        doc.text('Remarks', 175, y + 4.8);
        y += 7;
      }

      if (index % 2 === 1) {
        doc.setFillColor(250, 251, 249);
        doc.rect(14, y, pageWidth - 28, 6.5, 'F');
      }

      doc.setDrawColor(224, 228, 217);
      doc.line(14, y + 6.5, pageWidth - 14, y + 6.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(112, 121, 105);
      doc.text(t.testDate, 16, y + 4.5);

      doc.setTextColor(45, 51, 41);
      doc.setFont('helvetica', 'bold');
      doc.text(t.subject.slice(0, 18), 38, y + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.text(t.testTitle.slice(0, 26), 75, y + 4.5);

      doc.setFont('helvetica', 'bold');
      doc.text(`${t.obtainedMarks}/${t.maxMarks}`, 125, y + 4.5);

      doc.setTextColor(92, 102, 82);
      doc.text(`${t.percentage}%`, 146, y + 4.5);

      doc.setTextColor(45, 51, 41);
      doc.text(t.grade, 164, y + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(112, 121, 105);
      doc.text((t.remarks || 'Evaluated').slice(0, 15), 175, y + 4.5);

      y += 6.5;
    });
  }

  y += 4;

  // --- 6. Teacher Evaluation & Recommendations ---
  if (y > pageHeight - 45) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(247, 248, 243);
  doc.setDrawColor(224, 228, 217);
  doc.roundedRect(14, y, pageWidth - 28, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(45, 51, 41);
  doc.text("INSTRUCTOR'S ACADEMIC EVALUATION & ADVICE:", 18, y + 5);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(66, 71, 62);
  const notesText = student.notes 
    ? `"${student.notes}"`
    : `"${student.name} is demonstrating commendable dedication. Consistent homework review and weekly past-paper simulations will ensure top marks in final board examinations."`;
  
  const splitNotes = doc.splitTextToSize(notesText, pageWidth - 36);
  doc.text(splitNotes, 18, y + 10);

  y += 24;

  // --- 7. Official Signatures Footer ---
  if (y > pageHeight - 30) {
    doc.addPage();
    y = pageHeight - 35;
  }

  doc.setDrawColor(58, 64, 53);
  doc.line(18, y + 10, 68, y + 10);
  doc.line(pageWidth - 68, y + 10, pageWidth - 18, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(112, 121, 105);
  doc.text(`Parent / Guardian (${student.parentName})`, 18, y + 14);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(45, 51, 41);
  doc.text('Sir Ali (Academic Head & Lead Tutor)', pageWidth - 68, y + 14);

  const cleanName = student.name.replace(/[^a-zA-Z0-9]/g, '_');
  const cleanRoll = student.rollNo.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Student_Progress_Tracker_${cleanName}_${cleanRoll}_${new Date().toISOString().slice(0, 10)}.pdf`);
};

/**
 * Generates and downloads a comprehensive Class / Batch Progress Summary PDF.
 */
export const downloadClassProgressSummaryPdf = (
  students: Student[],
  testScores: TestScore[],
  attendance: AttendanceRecord[]
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 16;

  // Header Banner
  doc.setFillColor(58, 64, 53); // #3A4035
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('SIR ALI PREPARATIONS', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(202, 211, 192); // #CAD3C0
  doc.text('Student Academic Progress & Performance Master Summary', 14, 18);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}`, 14, 23);

  y = 38;

  // Overview Stats Box
  doc.setFillColor(247, 248, 243);
  doc.setDrawColor(224, 228, 217);
  doc.roundedRect(14, y, pageWidth - 28, 22, 3, 3, 'FD');

  const totalTests = testScores.length;
  const avgScore = totalTests > 0 ? Math.round(testScores.reduce((a, b) => a + b.percentage, 0) / totalTests) : 0;
  const aStarDistinctions = testScores.filter(t => t.grade === 'A*' || t.grade === 'A').length;

  doc.setTextColor(45, 51, 41);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Class Performance KPI Summary', 18, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(112, 121, 105);
  doc.text(`Total Students: ${students.length}`, 18, y + 15);
  doc.text(`Total Tests Logged: ${totalTests}`, 70, y + 15);
  doc.text(`Average Batch Score: ${avgScore}%`, 125, y + 15);
  doc.text(`A* & A Grades: ${aStarDistinctions}`, 170, y + 15);

  y += 30;

  // Student Performance Table Header
  doc.setFillColor(240, 242, 234);
  doc.rect(14, y, pageWidth - 28, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(45, 51, 41);

  doc.text('Roll #', 16, y + 5.5);
  doc.text('Student Name', 35, y + 5.5);
  doc.text('Grade / Board', 85, y + 5.5);
  doc.text('Mode', 125, y + 5.5);
  doc.text('Tests', 145, y + 5.5);
  doc.text('Avg %', 160, y + 5.5);
  doc.text('Attendance', 178, y + 5.5);

  y += 8;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  students.forEach((student, index) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    const sTests = testScores.filter(t => t.studentId === student.id);
    const sAvg = sTests.length > 0 ? Math.round(sTests.reduce((a, b) => a + b.percentage, 0) / sTests.length) : '-';
    
    const sAtt = attendance.filter(a => a.studentId === student.id);
    const sPresent = sAtt.filter(a => a.status === 'present' || a.status === 'late').length;
    const sAttRate = sAtt.length > 0 ? `${Math.round((sPresent / sAtt.length) * 100)}%` : '100%';

    if (index % 2 === 1) {
      doc.setFillColor(250, 251, 249);
      doc.rect(14, y, pageWidth - 28, 7.5, 'F');
    }

    doc.setDrawColor(224, 228, 217);
    doc.line(14, y + 7.5, pageWidth - 14, y + 7.5);

    doc.setTextColor(45, 51, 41);
    doc.text(student.rollNo, 16, y + 5);
    doc.text(student.name.slice(0, 24), 35, y + 5);
    doc.text(`${student.grade} (${student.board})`.slice(0, 20), 85, y + 5);
    doc.text(student.tuitionMode === 'home' ? 'Home' : 'Online', 125, y + 5);
    doc.text(sTests.length.toString(), 147, y + 5);
    doc.text(typeof sAvg === 'number' ? `${sAvg}%` : sAvg, 162, y + 5);
    doc.text(sAttRate, 180, y + 5);

    y += 7.5;
  });

  // Footer Signatures
  y = Math.max(y + 12, 260);
  if (y > 275) {
    doc.addPage();
    y = 250;
  }

  doc.setDrawColor(58, 64, 53);
  doc.line(14, y, 70, y);
  doc.line(pageWidth - 70, y, pageWidth - 14, y);

  doc.setFontSize(8);
  doc.setTextColor(112, 121, 105);
  doc.text('Academic Coordinator', 20, y + 5);
  doc.text('Sir Ali (Academic Head)', pageWidth - 60, y + 5);

  doc.save(`Sir_Ali_Preparations_Progress_Summary_${new Date().toISOString().slice(0, 10)}.pdf`);
};
