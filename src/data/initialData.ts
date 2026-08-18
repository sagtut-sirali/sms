import { Student, AttendanceRecord, TestScore, SubjectSyllabus, FeeRecord, StudentGroup } from '../types';

export const INITIAL_GROUPS: StudentGroup[] = [
  {
    id: 'grp-1',
    name: 'A-Levels Physics Alpha Batch',
    description: 'CAIE & Federal Board advanced physics batch covering vectors, mechanics, and nuclear physics.',
    grade: '12th / XII year / A2',
    subject: 'Physics (9702)',
    tuitionMode: 'online',
    timeSlot: '7:30 PM - 9:00 PM (Mon, Wed, Fri)',
    monthlyFeePerStudent: 25000,
    studentIds: ['std-1', 'std-4', 'std-5'],
    avatarBg: 'bg-indigo-600',
    meetingLinkOrLocation: 'https://meet.google.com/sap-phys-alpha',
    createdAt: '2026-01-15'
  },
  {
    id: 'grp-2',
    name: "O'Levels CAIE Stars Group",
    description: 'Targeted preparation for May/June CAIE series across Physics (5054) & Mathematics (4024).',
    grade: "O'levels Final",
    subject: 'Physics (5054) & Mathematics (4024)',
    tuitionMode: 'online',
    timeSlot: '6:00 PM - 7:15 PM (Tue, Thu, Sat)',
    monthlyFeePerStudent: 22000,
    studentIds: ['std-2', 'std-6'],
    avatarBg: 'bg-emerald-600',
    meetingLinkOrLocation: 'https://meet.google.com/sap-olevel-stars',
    createdAt: '2026-02-01'
  },
  {
    id: 'grp-3',
    name: 'Matric 10th Board Toppers Group',
    description: 'Comprehensive Punjab & Federal Board past papers and numerical derivations masterclass.',
    grade: '10th / X',
    subject: 'Mathematics & Physics',
    tuitionMode: 'home',
    timeSlot: '3:00 PM - 4:00 PM (Daily Mon-Fri)',
    monthlyFeePerStudent: 15000,
    studentIds: ['std-3'],
    avatarBg: 'bg-amber-600',
    meetingLinkOrLocation: 'DHA Phase 5 Study Room, Lahore',
    createdAt: '2026-03-01'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-1',
    rollNo: 'SAP-001',
    name: 'Hamza Tariq',
    phone: '+92 301 4589231',
    parentName: 'Tariq Mehmood',
    parentPhone: '+92 300 8765432',
    email: 'hamza.tariq@gmail.com',
    grade: '11th / XI year / AS / A1',
    board: 'Federal Board',
    tuitionMode: 'home',
    addressOrLocation: 'House 42, Street 8, Sector F-10/2, Islamabad',
    timeSlot: '4:00 PM - 5:30 PM (Mon, Wed, Fri)',
    subjects: ['Physics', 'Mathematics'],
    monthlyFee: 18000,
    feeDueDay: 5,
    joiningDate: '2026-03-01',
    avatarBg: 'bg-blue-600',
    notes: 'Preparing for NUST NET entry test. Needs extra practice on rotational mechanics and conic sections.',
    isActive: true
  },
  {
    id: 'std-2',
    rollNo: 'SAP-002',
    name: 'Ayesha Malik',
    phone: '+92 321 9876543',
    parentName: 'Dr. Asim Malik',
    parentPhone: '+92 322 1122334',
    email: 'ayesha.asim@gmail.com',
    grade: "O'levels Final",
    board: 'Cambridge - CAIE',
    tuitionMode: 'online',
    addressOrLocation: 'Google Meet (Batch Alpha-Online)',
    timeSlot: '6:00 PM - 7:15 PM (Tue, Thu, Sat)',
    subjects: ['Physics (5054)', 'Mathematics (4024)', 'Chemistry (5070)'],
    monthlyFee: 22000,
    feeDueDay: 10,
    joiningDate: '2026-02-15',
    avatarBg: 'bg-emerald-600',
    notes: 'Targeting straight A*s in May/June 2027 series. Very consistent in homework submissions.',
    isActive: true
  },
  {
    id: 'std-3',
    rollNo: 'SAP-003',
    name: 'Zainab Fatima',
    phone: '+92 333 5544332',
    parentName: 'Engr. Imran Qureshi',
    parentPhone: '+92 334 9988776',
    email: 'zainab.fatima@gmail.com',
    grade: '10th / X',
    board: 'Punjab Board',
    tuitionMode: 'home',
    addressOrLocation: 'Apartment 304, DHA Phase 5, Lahore',
    timeSlot: '3:00 PM - 4:00 PM (Daily Mon-Fri)',
    subjects: ['Mathematics', 'Physics'],
    monthlyFee: 15000,
    feeDueDay: 5,
    joiningDate: '2026-04-10',
    avatarBg: 'bg-purple-600',
    notes: 'Focus on Matric board past papers, theorem derivations, and numerical problem solving.',
    isActive: true
  },
  {
    id: 'std-4',
    rollNo: 'SAP-004',
    name: 'Muhammad Bilal',
    phone: '+92 345 6789012',
    parentName: 'Muhammad Arshad',
    parentPhone: '+92 346 1234567',
    email: 'bilal.arshad@outlook.com',
    grade: '12th / XII year / A2',
    board: 'Cambridge - CAIE',
    tuitionMode: 'online',
    addressOrLocation: 'Zoom Meeting ID: 882-901-443',
    timeSlot: '7:30 PM - 9:00 PM (Mon, Wed, Fri)',
    subjects: ['Physics (9702)', 'Mathematics (9709)'],
    monthlyFee: 25000,
    feeDueDay: 7,
    joiningDate: '2026-01-10',
    avatarBg: 'bg-amber-600',
    notes: 'Aiming for GIKI/FAST entrance exam alongside CAIE exams. Special focus on calculus and electromagnetism.',
    isActive: true
  },
  {
    id: 'std-5',
    rollNo: 'SAP-005',
    name: 'Syed Daniyal Ali',
    phone: '+92 312 3456789',
    parentName: 'Syed Shahid Ali',
    parentPhone: '+92 313 9876543',
    email: 'daniyal.ali@gmail.com',
    grade: '12th / XII year / A2',
    board: 'Federal Board',
    tuitionMode: 'home',
    addressOrLocation: 'Villa 12, Bahria Town Phase 7, Rawalpindi',
    timeSlot: '5:30 PM - 7:00 PM (Mon, Wed, Fri)',
    subjects: ['Physics', 'Chemistry'],
    monthlyFee: 19000,
    feeDueDay: 5,
    joiningDate: '2026-05-01',
    avatarBg: 'bg-rose-600',
    notes: 'MDCAT preparation focused. Organic chemistry reactions & Physics modern physics chapters.',
    isActive: true
  },
  {
    id: 'std-6',
    rollNo: 'SAP-006',
    name: 'Sarah Khan',
    phone: '+92 302 7766554',
    parentName: 'Kamran Khan',
    parentPhone: '+92 300 3344556',
    email: 'sarah.k@gmail.com',
    grade: '9th / IX',
    board: 'Federal Board',
    tuitionMode: 'online',
    addressOrLocation: 'Zoom Online Classroom (Matric 9th)',
    timeSlot: '4:30 PM - 5:30 PM (Tue, Thu, Sat)',
    subjects: ['Mathematics', 'Physics', 'Chemistry'],
    monthlyFee: 14000,
    feeDueDay: 10,
    joiningDate: '2026-06-15',
    avatarBg: 'bg-teal-600',
    notes: 'Building strong foundations in algebraic equations, matrices, and Newton laws.',
    isActive: true
  }
];

export const INITIAL_SYLLABUS: SubjectSyllabus[] = [
  {
    id: 'syl-phy-fsc1',
    subject: 'Physics',
    grade: 'F.Sc Part 1 (Pre-Engineering / Medical)',
    chapters: [
      {
        id: 'ch-1',
        chapterNumber: '1',
        title: 'Measurements & Physical Quantities',
        topics: [
          { id: 'top-1-1', title: 'SI Base & Derived Units, Unit Prefixes', status: 'completed', completedDate: '2026-03-08', notes: 'Mastered dimensions' },
          { id: 'top-1-2', title: 'Significant Figures & Precision vs Accuracy', status: 'completed', completedDate: '2026-03-12', notes: 'Done numericals' },
          { id: 'top-1-3', title: 'Dimensional Analysis & Homogeneity of Equations', status: 'completed', completedDate: '2026-03-16', notes: 'All derivations covered' }
        ]
      },
      {
        id: 'ch-2',
        chapterNumber: '2',
        title: 'Vectors and Equilibrium',
        topics: [
          { id: 'top-2-1', title: 'Vector Addition by Rectangular Components', status: 'completed', completedDate: '2026-03-24', notes: 'Solved 15 textbook problems' },
          { id: 'top-2-2', title: 'Scalar (Dot) and Vector (Cross) Products', status: 'completed', completedDate: '2026-04-02', notes: 'Geometric interpretations explained' },
          { id: 'top-2-3', title: 'Torque, Couple & First & Second Conditions of Equilibrium', status: 'completed', completedDate: '2026-04-10', notes: 'Ladder & rod balance problems solved' }
        ]
      },
      {
        id: 'ch-3',
        chapterNumber: '3',
        title: 'Motion and Force',
        topics: [
          { id: 'top-3-1', title: 'Newton’s Laws of Motion & Momentum', status: 'completed', completedDate: '2026-04-20', notes: 'Impulse graph analysis done' },
          { id: 'top-3-2', title: 'Elastic and Inelastic Collisions in 1D & 2D', status: 'completed', completedDate: '2026-05-04', notes: 'Derivation for relative velocities done' },
          { id: 'top-3-3', title: 'Projectile Motion (Trajectory, Max Height, Time of Flight, Range)', status: 'revised', completedDate: '2026-05-18', notes: 'Very important for board and NET exams' },
          { id: 'top-3-4', title: 'Rocket Propulsion & Terminal Velocity in Viscous Media', status: 'completed', completedDate: '2026-05-25', notes: 'Stokes law explained' }
        ]
      },
      {
        id: 'ch-4',
        chapterNumber: '4',
        title: 'Work and Energy',
        topics: [
          { id: 'top-4-1', title: 'Work done by Constant & Variable Force', status: 'completed', completedDate: '2026-06-08', notes: 'Area under F-d curve solved' },
          { id: 'top-4-2', title: 'Work-Energy Theorem & Gravitational Potential Energy', status: 'completed', completedDate: '2026-06-15', notes: 'Conservative field proof' },
          { id: 'top-4-3', title: 'Escape Velocity & Absolute Potential Energy', status: 'in-progress', notes: 'Derivation ongoing' },
          { id: 'top-4-4', title: 'Non-Conventional Energy Sources & Efficiency', status: 'pending', notes: 'Scheduled for next week' }
        ]
      },
      {
        id: 'ch-5',
        chapterNumber: '5',
        title: 'Rotational and Circular Motion',
        topics: [
          { id: 'top-5-1', title: 'Angular Displacement, Velocity & Acceleration', status: 'pending', notes: 'Upcoming' },
          { id: 'top-5-2', title: 'Centripetal Force & Centripetal Acceleration', status: 'pending', notes: 'Upcoming' },
          { id: 'top-5-3', title: 'Moment of Inertia & Angular Momentum Conservation', status: 'pending', notes: 'Upcoming' },
          { id: 'top-5-4', title: 'Geostationary Orbits & Artificial Gravity', status: 'pending', notes: 'Upcoming' }
        ]
      }
    ]
  },
  {
    id: 'syl-math-olevel',
    subject: 'Mathematics (4024 / IGCSE)',
    grade: 'O Level & Matric',
    chapters: [
      {
        id: 'ch-m1',
        chapterNumber: '1',
        title: 'Number & Arithmetic Operations',
        topics: [
          { id: 'top-m1-1', title: 'Primes, HCF, LCM & Standard Form', status: 'revised', completedDate: '2026-02-28', notes: 'Clean calculation accuracy' },
          { id: 'top-m1-2', title: 'Percentages, Profit/Loss, Simple & Compound Interest', status: 'completed', completedDate: '2026-03-15', notes: 'Paper 1 & Paper 2 questions done' },
          { id: 'top-m1-3', title: 'Ratio, Proportion & Speed/Distance/Time Graphs', status: 'completed', completedDate: '2026-03-25', notes: 'Area under travel graph mastery' }
        ]
      },
      {
        id: 'ch-m2',
        chapterNumber: '2',
        title: 'Algebra & Graphs',
        topics: [
          { id: 'top-m2-1', title: 'Simultaneous Equations (Linear & Quadratic)', status: 'completed', completedDate: '2026-04-10', notes: 'Substitution & elimination' },
          { id: 'top-m2-2', title: 'Quadratic Formula, Completing the Square & Factorization', status: 'completed', completedDate: '2026-04-28', notes: 'Graphs of quadratic curves' },
          { id: 'top-m2-3', title: 'Inequalities & Linear Programming (Shading Regions)', status: 'in-progress', notes: 'Boundary lines practice' },
          { id: 'top-m2-4', title: 'Coordinate Geometry (Gradients, Midpoints, Perpendicular Lines)', status: 'pending', notes: 'Next unit' }
        ]
      },
      {
        id: 'ch-m3',
        chapterNumber: '3',
        title: 'Geometry and Trigonometry',
        topics: [
          { id: 'top-m3-1', title: 'Angle Properties of Polygons & Circles (Circle Theorems)', status: 'pending', notes: 'Upcoming' },
          { id: 'top-m3-2', title: 'Pythagoras Theorem & SOH CAH TOA', status: 'pending', notes: 'Upcoming' },
          { id: 'top-m3-3', title: 'Sine Rule, Cosine Rule & Area of Triangle (1/2 ab sinC)', status: 'pending', notes: 'Upcoming' },
          { id: 'top-m3-4', title: 'Bearings & 3D Trigonometry', status: 'pending', notes: 'Upcoming' }
        ]
      }
    ]
  },
  {
    id: 'syl-chem-fsc',
    subject: 'Chemistry',
    grade: 'F.Sc / O-A Levels',
    chapters: [
      {
        id: 'ch-c1',
        chapterNumber: '1',
        title: 'Basic Concepts & Stoichiometry',
        topics: [
          { id: 'top-c1-1', title: 'Mole Concept, Avogadro Number & Molar Volume', status: 'revised', completedDate: '2026-03-20', notes: 'Numericals completed' },
          { id: 'top-c1-2', title: 'Limiting Reactant & Theoretical vs Actual Yield', status: 'completed', completedDate: '2026-04-05', notes: 'Mastered' }
        ]
      },
      {
        id: 'ch-c2',
        chapterNumber: '2',
        title: 'Atomic Structure',
        topics: [
          { id: 'top-c2-1', title: 'Bohr Atomic Model, Hydrogen Spectrum & Quantum Numbers', status: 'completed', completedDate: '2026-05-10', notes: 'Electronic configuration rules' },
          { id: 'top-c2-2', title: 'Heisenberg Uncertainty Principle & Shapes of Orbitals', status: 'in-progress', notes: 'Orbital hybridization underway' }
        ]
      }
    ]
  }
];

export const INITIAL_TEST_SCORES: TestScore[] = [
  {
    id: 'test-1',
    studentId: 'std-1',
    subject: 'Physics',
    testTitle: 'Chapter 1 & 2: Vectors, Dimensions & Equilibrium',
    testDate: '2026-04-15',
    maxMarks: 50,
    obtainedMarks: 46,
    percentage: 92,
    grade: 'A*',
    remarks: 'Exceptional grip on rectangular component resolution and torque conditions.'
  },
  {
    id: 'test-2',
    studentId: 'std-1',
    subject: 'Mathematics',
    testTitle: 'Matrices, Determinants & Quadratic Equations',
    testDate: '2026-05-02',
    maxMarks: 75,
    obtainedMarks: 68,
    percentage: 90.7,
    grade: 'A*',
    remarks: 'Cramer rule and matrix inversion solved accurately. Minor calculation slip in sign.'
  },
  {
    id: 'test-3',
    studentId: 'std-1',
    subject: 'Physics',
    testTitle: 'Chapter 3: Projectile Motion & Momentum',
    testDate: '2026-06-10',
    maxMarks: 50,
    obtainedMarks: 44,
    percentage: 88,
    grade: 'A',
    remarks: 'Good understanding of ballistic trajectories; practice 2D elastic collision equations.'
  },
  {
    id: 'test-4',
    studentId: 'std-2',
    subject: 'Physics (5054)',
    testTitle: 'Kinematics, Dynamics & Pressure Test',
    testDate: '2026-04-20',
    maxMarks: 40,
    obtainedMarks: 38,
    percentage: 95,
    grade: 'A*',
    remarks: 'Superb Paper 2 structured answers and unit notations.'
  },
  {
    id: 'test-5',
    studentId: 'std-2',
    subject: 'Mathematics (4024)',
    testTitle: 'Algebraic Manipulation & Indices / Surds',
    testDate: '2026-05-18',
    maxMarks: 60,
    obtainedMarks: 57,
    percentage: 95,
    grade: 'A*',
    remarks: 'Flawless working steps shown. Ready for past paper mocks.'
  },
  {
    id: 'test-6',
    studentId: 'std-3',
    subject: 'Mathematics',
    testTitle: 'Chapter 1 & 2: Quadratic Equations & Theory',
    testDate: '2026-05-25',
    maxMarks: 50,
    obtainedMarks: 42,
    percentage: 84,
    grade: 'A',
    remarks: 'Good performance. Need more practice on discriminant conditions (nature of roots).'
  },
  {
    id: 'test-7',
    studentId: 'std-4',
    subject: 'Physics (9702)',
    testTitle: 'A2 Physics: Circular Motion & Gravitation Fields',
    testDate: '2026-06-02',
    maxMarks: 60,
    obtainedMarks: 52,
    percentage: 86.7,
    grade: 'A',
    remarks: 'Gravitational potential gradient and geostationary orbit calculations well written.'
  },
  {
    id: 'test-8',
    studentId: 'std-5',
    subject: 'Chemistry',
    testTitle: 'Stoichiometry & Atomic Structure Quiz',
    testDate: '2026-06-20',
    maxMarks: 45,
    obtainedMarks: 39,
    percentage: 86.7,
    grade: 'A',
    remarks: 'MDCAT MCQ speed is improving significantly.'
  }
];

// Dynamic relative date helpers for initial sample data
const getSampleRelDate = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // Today's date and recent dates
  { id: 'att-1', date: getSampleRelDate(0), studentId: 'std-1', status: 'present', topicCovered: 'Work done by variable force & numericals' },
  { id: 'att-2', date: getSampleRelDate(0), studentId: 'std-2', status: 'present', topicCovered: 'Linear inequalities & region graphs' },
  { id: 'att-3', date: getSampleRelDate(0), studentId: 'std-3', status: 'present', topicCovered: 'Matrices word problems and theorem 1' },
  { id: 'att-4', date: getSampleRelDate(0), studentId: 'std-4', status: 'present', topicCovered: 'A2 Magnetic fields & Hall probe effect' },
  { id: 'att-5', date: getSampleRelDate(0), studentId: 'std-5', status: 'late', topicCovered: 'Organic reaction mechanisms overview', remarks: 'Joined 15 mins late due to traffic' },
  { id: 'att-6', date: getSampleRelDate(0), studentId: 'std-6', status: 'present', topicCovered: 'Class 9th Physics - Unit 2 Numericals' },
  
  // Previous sessions
  { id: 'att-7', date: getSampleRelDate(2), studentId: 'std-1', status: 'present', topicCovered: 'Work energy theorem derivation' },
  { id: 'att-8', date: getSampleRelDate(2), studentId: 'std-2', status: 'present', topicCovered: 'Coordinate geometry midpoint formulas' },
  { id: 'att-9', date: getSampleRelDate(2), studentId: 'std-3', status: 'present', topicCovered: 'Chapter 2 quadratic equations review' },
  { id: 'att-10', date: getSampleRelDate(2), studentId: 'std-4', status: 'present', topicCovered: 'Oscillations and Simple Harmonic Motion' },
  { id: 'att-11', date: getSampleRelDate(2), studentId: 'std-5', status: 'present', topicCovered: 'Chemical bonding and hybridization' },
  
  { id: 'att-12', date: getSampleRelDate(4), studentId: 'std-1', status: 'present', topicCovered: 'Conservation of energy in falling bodies' },
  { id: 'att-13', date: getSampleRelDate(4), studentId: 'std-2', status: 'absent', remarks: 'Informed family function', topicCovered: 'Recorded lecture sent' },
  { id: 'att-14', date: getSampleRelDate(4), studentId: 'std-3', status: 'present', topicCovered: 'Synthetic division problems' },
  { id: 'att-15', date: getSampleRelDate(4), studentId: 'std-4', status: 'present', topicCovered: 'Damped and forced oscillations' },
  { id: 'att-16', date: getSampleRelDate(4), studentId: 'std-5', status: 'present', topicCovered: 'Hybridization sp3, sp2, sp' }
];

export const INITIAL_FEES: FeeRecord[] = [
  {
    id: 'fee-1',
    studentId: 'std-1',
    month: 'August 2026',
    year: 2026,
    totalFee: 18000,
    discount: 0,
    paidAmount: 18000,
    dueAmount: 0,
    status: 'paid',
    dueDate: '2026-08-05',
    paidDate: '2026-08-04',
    paymentMethod: 'Bank Transfer',
    receiptNo: 'SAP-REC-2608-01',
    remarks: 'Received via Meezan Bank online transfer. Thank you!'
  },
  {
    id: 'fee-2',
    studentId: 'std-2',
    month: 'August 2026',
    year: 2026,
    totalFee: 22000,
    discount: 0,
    paidAmount: 22000,
    dueAmount: 0,
    status: 'paid',
    dueDate: '2026-08-10',
    paidDate: '2026-08-08',
    paymentMethod: 'JazzCash',
    receiptNo: 'SAP-REC-2608-02',
    remarks: 'Paid full for 3 subjects package.'
  },
  {
    id: 'fee-3',
    studentId: 'std-3',
    month: 'August 2026',
    year: 2026,
    totalFee: 15000,
    discount: 1000,
    paidAmount: 14000,
    dueAmount: 0,
    status: 'paid',
    dueDate: '2026-08-05',
    paidDate: '2026-08-06',
    paymentMethod: 'Cash',
    receiptNo: 'SAP-REC-2608-03',
    remarks: 'Cash handed by father during home visit.'
  },
  {
    id: 'fee-4',
    studentId: 'std-4',
    month: 'August 2026',
    year: 2026,
    totalFee: 25000,
    discount: 0,
    paidAmount: 0,
    dueAmount: 25000,
    status: 'overdue',
    dueDate: '2026-08-07',
    remarks: 'Due date passed (7th Aug). Gentle reminder needed.'
  },
  {
    id: 'fee-5',
    studentId: 'std-5',
    month: 'August 2026',
    year: 2026,
    totalFee: 19000,
    discount: 0,
    paidAmount: 10000,
    dueAmount: 9000,
    status: 'partial',
    dueDate: '2026-08-05',
    paidDate: '2026-08-05',
    paymentMethod: 'EasyPaisa',
    receiptNo: 'SAP-REC-2608-05',
    remarks: 'Half fee paid on 5th Aug, remaining 9,000 promised on 20th Aug.'
  },
  {
    id: 'fee-6',
    studentId: 'std-6',
    month: 'August 2026',
    year: 2026,
    totalFee: 14000,
    discount: 0,
    paidAmount: 0,
    dueAmount: 14000,
    status: 'overdue',
    dueDate: '2026-08-10',
    remarks: 'Due date was 10th August. Sent first reminder.'
  },
  // July records for historical charts
  {
    id: 'fee-7',
    studentId: 'std-1',
    month: 'July 2026',
    year: 2026,
    totalFee: 18000,
    discount: 0,
    paidAmount: 18000,
    dueAmount: 0,
    status: 'paid',
    dueDate: '2026-07-05',
    paidDate: '2026-07-03',
    paymentMethod: 'Bank Transfer',
    receiptNo: 'SAP-REC-2607-01'
  },
  {
    id: 'fee-8',
    studentId: 'std-2',
    month: 'July 2026',
    year: 2026,
    totalFee: 22000,
    discount: 0,
    paidAmount: 22000,
    dueAmount: 0,
    status: 'paid',
    dueDate: '2026-07-10',
    paidDate: '2026-07-09',
    paymentMethod: 'JazzCash',
    receiptNo: 'SAP-REC-2607-02'
  },
  {
    id: 'fee-9',
    studentId: 'std-3',
    month: 'July 2026',
    year: 2026,
    totalFee: 15000,
    discount: 1000,
    paidAmount: 14000,
    dueAmount: 0,
    status: 'paid',
    dueDate: '2026-07-05',
    paidDate: '2026-07-05',
    paymentMethod: 'Cash',
    receiptNo: 'SAP-REC-2607-03'
  },
  {
    id: 'fee-10',
    studentId: 'std-4',
    month: 'July 2026',
    year: 2026,
    totalFee: 25000,
    discount: 0,
    paidAmount: 25000,
    dueAmount: 0,
    status: 'paid',
    dueDate: '2026-07-07',
    paidDate: '2026-07-06',
    paymentMethod: 'Bank Transfer',
    receiptNo: 'SAP-REC-2607-04'
  }
];
