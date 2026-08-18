import { SyllabusChapter, SyllabusTopic, Student, StudentSyllabusRecord } from '../types';

export interface CurriculumTopicMatch {
  topicTitle: string;
  chapterNumber: string | number;
  chapterTitle: string;
  subject: string;
  grade?: string;
  keywords: string[];
}

/**
 * Standard curriculum database for O/A Levels (CAIE/Edexcel), Matric, F.Sc, and Federal Boards.
 * Used for automatic chapter/unit detection and live topic autocompletion.
 */
export const CURRICULUM_DATABASE: CurriculumTopicMatch[] = [
  // ==========================================
  // PHYSICS (O-Levels / A-Levels / F.Sc / Matric)
  // ==========================================
  {
    topicTitle: 'Physical Quantities, Base & Derived Units, SI Units',
    chapterNumber: '1',
    chapterTitle: 'Physical Quantities & Measurement',
    subject: 'Physics',
    keywords: ['si unit', 'base unit', 'derived unit', 'measurement', 'vernier', 'micrometer', 'scalar', 'vector', 'dimension']
  },
  {
    topicTitle: 'Errors & Uncertainties (Random, Systematic, Percentage Uncertainty)',
    chapterNumber: '1',
    chapterTitle: 'Physical Quantities & Measurement',
    subject: 'Physics',
    keywords: ['uncertainty', 'systematic error', 'random error', 'precision', 'accuracy', 'percentage error']
  },
  {
    topicTitle: 'Rectangular Components of Vectors & Resolution',
    chapterNumber: '2',
    chapterTitle: 'Vectors and Equilibrium',
    subject: 'Physics',
    keywords: ['vector', 'resolution', 'components', 'cosine', 'sine', 'head to tail rule', 'magnitude', 'direction']
  },
  {
    topicTitle: 'Vector Products: Dot (Scalar) Product & Cross (Vector) Product',
    chapterNumber: '2',
    chapterTitle: 'Vectors and Equilibrium',
    subject: 'Physics',
    keywords: ['dot product', 'cross product', 'scalar product', 'vector product', 'right hand rule', 'determinant vector']
  },
  {
    topicTitle: 'Torque, Couple & First & Second Conditions of Equilibrium',
    chapterNumber: '2',
    chapterTitle: 'Vectors and Equilibrium',
    subject: 'Physics',
    keywords: ['torque', 'couple', 'equilibrium', 'center of gravity', 'moment of force', 'ladder balance', 'pivot']
  },
  {
    topicTitle: 'Kinematics: Displacement, Velocity, Acceleration & Graphs',
    chapterNumber: '3',
    chapterTitle: 'Motion and Force',
    subject: 'Physics',
    keywords: ['velocity', 'acceleration', 'displacement', 'speed-time graph', 'distance-time graph', 'gradient', 'equations of motion']
  },
  {
    topicTitle: 'Newton’s Laws of Motion, Linear Momentum & Impulse',
    chapterNumber: '3',
    chapterTitle: 'Motion and Force',
    subject: 'Physics',
    keywords: ['newton', 'momentum', 'impulse', 'force', 'conservation of momentum', 'f=ma', 'friction']
  },
  {
    topicTitle: 'Elastic and Inelastic Collisions in 1D & 2D',
    chapterNumber: '3',
    chapterTitle: 'Motion and Force',
    subject: 'Physics',
    keywords: ['collision', 'elastic', 'inelastic', 'kinetic energy conservation', 'relative velocity']
  },
  {
    topicTitle: 'Projectile Motion (Trajectory, Max Height, Time of Flight, Range)',
    chapterNumber: '3',
    chapterTitle: 'Motion and Force',
    subject: 'Physics',
    keywords: ['projectile', 'trajectory', 'time of flight', 'range', 'maximum height', 'ballistics', 'horizontal velocity']
  },
  {
    topicTitle: 'Fluid Friction, Stokes’ Law & Terminal Velocity',
    chapterNumber: '3',
    chapterTitle: 'Motion and Force',
    subject: 'Physics',
    keywords: ['terminal velocity', 'stokes law', 'viscosity', 'drag force', 'rocket propulsion', 'fluid']
  },
  {
    topicTitle: 'Work done by Constant & Variable Force',
    chapterNumber: '4',
    chapterTitle: 'Work and Energy',
    subject: 'Physics',
    keywords: ['work', 'variable force', 'f-d graph', 'joule', 'work done', 'spring work']
  },
  {
    topicTitle: 'Work-Energy Theorem & Conservation of Energy',
    chapterNumber: '4',
    chapterTitle: 'Work and Energy',
    subject: 'Physics',
    keywords: ['work-energy theorem', 'kinetic energy', 'potential energy', 'conservation of energy', 'power', 'efficiency']
  },
  {
    topicTitle: 'Gravitational Potential Energy & Escape Velocity',
    chapterNumber: '4',
    chapterTitle: 'Work and Energy',
    subject: 'Physics',
    keywords: ['escape velocity', 'absolute potential energy', 'gravitational potential', 'gravity field']
  },
  {
    topicTitle: 'Angular Displacement, Angular Velocity & Angular Acceleration',
    chapterNumber: '5',
    chapterTitle: 'Rotational and Circular Motion',
    subject: 'Physics',
    keywords: ['angular velocity', 'angular displacement', 'angular acceleration', 'radian', 'circular motion', 'rpm']
  },
  {
    topicTitle: 'Centripetal Force & Centripetal Acceleration',
    chapterNumber: '5',
    chapterTitle: 'Rotational and Circular Motion',
    subject: 'Physics',
    keywords: ['centripetal force', 'centripetal acceleration', 'banking of roads', 'circular track', 'v^2/r']
  },
  {
    topicTitle: 'Moment of Inertia & Law of Conservation of Angular Momentum',
    chapterNumber: '5',
    chapterTitle: 'Rotational and Circular Motion',
    subject: 'Physics',
    keywords: ['moment of inertia', 'angular momentum', 'torque', 'rotational kinetic energy', 'flywheel', 'gyroscope']
  },
  {
    topicTitle: 'Geostationary Satellites, Orbital Speed & Artificial Gravity',
    chapterNumber: '5',
    chapterTitle: 'Rotational and Circular Motion',
    subject: 'Physics',
    keywords: ['geostationary', 'satellite', 'orbital speed', 'orbital radius', 'artificial gravity', 'weightlessness']
  },
  {
    topicTitle: 'Simple Harmonic Motion (SHM), Simple Pendulum & Mass-Spring System',
    chapterNumber: '6',
    chapterTitle: 'Oscillations and Simple Harmonic Motion',
    subject: 'Physics',
    keywords: ['shm', 'simple harmonic motion', 'pendulum', 'mass-spring', 'time period', 'frequency', 'amplitude', 'phase']
  },
  {
    topicTitle: 'Damped Oscillations, Resonance & Forced Vibrations',
    chapterNumber: '6',
    chapterTitle: 'Oscillations and Simple Harmonic Motion',
    subject: 'Physics',
    keywords: ['damping', 'resonance', 'forced oscillation', 'natural frequency', 'barton pendulum']
  },
  {
    topicTitle: 'Progressive Waves, Transverse & Longitudinal Waves, Wave Equation (v = fλ)',
    chapterNumber: '7',
    chapterTitle: 'Waves and Superposition',
    subject: 'Physics',
    keywords: ['wave equation', 'longitudinal', 'transverse', 'wavelength', 'frequency', 'crest', 'trough', 'sound wave']
  },
  {
    topicTitle: 'Superposition Principle, Stationary Waves in Stretched Strings & Air Columns',
    chapterNumber: '7',
    chapterTitle: 'Waves and Superposition',
    subject: 'Physics',
    keywords: ['stationary waves', 'nodes', 'antinodes', 'organ pipe', 'sonometer', 'harmonics', 'standing wave']
  },
  {
    topicTitle: 'Doppler Effect in Sound and Light Waves',
    chapterNumber: '7',
    chapterTitle: 'Waves and Superposition',
    subject: 'Physics',
    keywords: ['doppler effect', 'red shift', 'blue shift', 'apparent frequency', 'moving source', 'observer']
  },
  {
    topicTitle: 'Interference of Light: Young’s Double Slit Experiment (YDSE)',
    chapterNumber: '8',
    chapterTitle: 'Physical Optics & Light Waves',
    subject: 'Physics',
    keywords: ['youngs double slit', 'ydse', 'fringe width', 'interference', 'coherent sources', 'path difference']
  },
  {
    topicTitle: 'Diffraction of Light, Diffraction Grating & Polarisation',
    chapterNumber: '8',
    chapterTitle: 'Physical Optics & Light Waves',
    subject: 'Physics',
    keywords: ['diffraction grating', 'polarisation', 'brewster law', 'slit diffraction', 'd sin theta']
  },
  {
    topicTitle: 'First Law of Thermodynamics, Isobaric, Isothermal & Adiabatic Processes',
    chapterNumber: '9',
    chapterTitle: 'Thermodynamics & Heat',
    subject: 'Physics',
    keywords: ['thermodynamics', 'isothermal', 'adiabatic', 'isobaric', 'isochoric', 'internal energy', 'specific heat']
  },
  {
    topicTitle: 'Carnot Heat Engine, Carnot Cycle & Second Law of Thermodynamics (Entropy)',
    chapterNumber: '9',
    chapterTitle: 'Thermodynamics & Heat',
    subject: 'Physics',
    keywords: ['carnot engine', 'entropy', 'carnot efficiency', 'heat reservoir', 'refrigerator', 'second law']
  },
  {
    topicTitle: 'Coulomb’s Law, Electric Field Strength & Electric Potential',
    chapterNumber: '10',
    chapterTitle: 'Electrostatics & Electric Fields',
    subject: 'Physics',
    keywords: ['coulomb', 'electric field', 'electric potential', 'point charge', 'potential gradient', 'equipotential']
  },
  {
    topicTitle: 'Gauss’s Law & Applications (Charged Sphere, Infinite Sheet)',
    chapterNumber: '10',
    chapterTitle: 'Electrostatics & Electric Fields',
    subject: 'Physics',
    keywords: ['gauss law', 'electric flux', 'flux density', 'charged sphere', 'sheet of charge']
  },
  {
    topicTitle: 'Capacitors, Capacitance, Dielectrics & Energy Stored (1/2 CV²)',
    chapterNumber: '10',
    chapterTitle: 'Electrostatics & Electric Fields',
    subject: 'Physics',
    keywords: ['capacitor', 'capacitance', 'dielectric', 'parallel plate', 'charging capacitor', 'time constant']
  },
  {
    topicTitle: 'Ohm’s Law, Resistivity, Temperature Coefficient of Resistance & EMF',
    chapterNumber: '11',
    chapterTitle: 'Current Electricity & DC Circuits',
    subject: 'Physics',
    keywords: ['ohms law', 'resistivity', 'resistance', 'emf', 'internal resistance', 'temperature coefficient', 'drift velocity']
  },
  {
    topicTitle: 'Kirchhoff’s Rules (KCL & KVL), Wheatstone Bridge & Potentiometer',
    chapterNumber: '11',
    chapterTitle: 'Current Electricity & DC Circuits',
    subject: 'Physics',
    keywords: ['kirchhoff', 'kcl', 'kvl', 'wheatstone bridge', 'potentiometer', 'potential divider']
  },
  {
    topicTitle: 'Magnetic Field of Current, Ampere’s Law & Solenoid / Toroid',
    chapterNumber: '12',
    chapterTitle: 'Electromagnetism',
    subject: 'Physics',
    keywords: ['magnetic field', 'amperes law', 'solenoid', 'toroid', 'biot savart', 'tesla', 'weber']
  },
  {
    topicTitle: 'Magnetic Force on Moving Charge (Lorentz Force) & e/m of Electron',
    chapterNumber: '12',
    chapterTitle: 'Electromagnetism',
    subject: 'Physics',
    keywords: ['lorentz force', 'e/m ratio', 'magnetic deflection', 'hall effect', 'velocity selector', 'cyclotron']
  },
  {
    topicTitle: 'Faraday’s Law of Electromagnetic Induction & Lenz’s Law',
    chapterNumber: '13',
    chapterTitle: 'Electromagnetic Induction & AC',
    subject: 'Physics',
    keywords: ['faradays law', 'lenzs law', 'induced emf', 'magnetic flux', 'motional emf', 'eddy currents']
  },
  {
    topicTitle: 'Mutual & Self Induction, Transformers & AC Circuits (RLC Series)',
    chapterNumber: '13',
    chapterTitle: 'Electromagnetic Induction & AC',
    subject: 'Physics',
    keywords: ['transformer', 'self induction', 'mutual induction', 'rlc circuit', 'impedance', 'power factor', 'resonance frequency']
  },
  {
    topicTitle: 'Band Theory of Solids, PN Junction Diode & Rectification (Half/Full Wave)',
    chapterNumber: '14',
    chapterTitle: 'Electronics & Semiconductors',
    subject: 'Physics',
    keywords: ['diode', 'rectifier', 'pn junction', 'bridge rectifier', 'forward bias', 'reverse bias', 'band gap']
  },
  {
    topicTitle: 'Operational Amplifiers (Inverting, Non-Inverting, Comparator, Inverting Summing)',
    chapterNumber: '14',
    chapterTitle: 'Electronics & Semiconductors',
    subject: 'Physics',
    keywords: ['op-amp', 'operational amplifier', 'inverting amplifier', 'comparator', 'virtual ground', 'gain']
  },
  {
    topicTitle: 'Black Body Radiation, Planck’s Quantum Theory & Photoelectric Effect',
    chapterNumber: '15',
    chapterTitle: 'Quantum Physics & Dawn of Modern Physics',
    subject: 'Physics',
    keywords: ['photoelectric effect', 'work function', 'stopping potential', 'photon', 'planck', 'black body', 'einstein equation']
  },
  {
    topicTitle: 'Compton Effect, De-Broglie Wavelength & Davisson-Germer Experiment',
    chapterNumber: '15',
    chapterTitle: 'Quantum Physics & Dawn of Modern Physics',
    subject: 'Physics',
    keywords: ['compton effect', 'de broglie', 'matter waves', 'davisson germer', 'wave particle duality']
  },
  {
    topicTitle: 'Radioactivity, Half-Life, Nuclear Fission & Fusion Reactions',
    chapterNumber: '16',
    chapterTitle: 'Nuclear and Particle Physics',
    subject: 'Physics',
    keywords: ['radioactivity', 'half-life', 'alpha decay', 'beta decay', 'gamma', 'nuclear fission', 'fusion', 'mass defect', 'binding energy']
  },

  // ==========================================
  // MATHEMATICS (O/A Levels, Matric, F.Sc)
  // ==========================================
  {
    topicTitle: 'Prime Factorisation, HCF, LCM, Standard Form & Estimation',
    chapterNumber: '1',
    chapterTitle: 'Numbers, Arithmetic & Indices',
    subject: 'Mathematics',
    keywords: ['hcf', 'lcm', 'prime', 'standard form', 'scientific notation', 'significant figures', 'fractions']
  },
  {
    topicTitle: 'Laws of Indices, Surds Simplification & Rationalisation',
    chapterNumber: '1',
    chapterTitle: 'Numbers, Arithmetic & Indices',
    subject: 'Mathematics',
    keywords: ['surds', 'indices', 'exponents', 'rationalisation', 'radical', 'power laws']
  },
  {
    topicTitle: 'Quadratic Equations: Factorisation, Completing the Square & Quadratic Formula',
    chapterNumber: '2',
    chapterTitle: 'Quadratic Equations & Functions',
    subject: 'Mathematics',
    keywords: ['quadratic', 'quadratic formula', 'completing square', 'discriminant', 'nature of roots', 'parabola', 'vertex']
  },
  {
    topicTitle: 'Simultaneous Equations (Linear & Non-Linear) and Algebraic Manipulation',
    chapterNumber: '3',
    chapterTitle: 'Algebra & Polynomials',
    subject: 'Mathematics',
    keywords: ['simultaneous equations', 'elimination', 'substitution', 'algebraic fraction', 'factor theorem', 'remainder theorem']
  },
  {
    topicTitle: 'Matrices: Determinants, Matrix Inverses, Adjoint & Cramer’s Rule',
    chapterNumber: '4',
    chapterTitle: 'Matrices and Determinants',
    subject: 'Mathematics',
    keywords: ['matrix', 'matrices', 'determinant', 'cramer rule', 'inverse matrix', 'adjoint', 'singular matrix']
  },
  {
    topicTitle: 'Coordinate Geometry: Gradient, Midpoint, Distance & Perpendicular Bisectors',
    chapterNumber: '5',
    chapterTitle: 'Coordinate Geometry & Straight Lines',
    subject: 'Mathematics',
    keywords: ['coordinate geometry', 'gradient', 'midpoint', 'distance formula', 'parallel lines', 'perpendicular lines', 'y=mx+c']
  },
  {
    topicTitle: 'Circle Equations, Tangents, Normals & Circle Theorems',
    chapterNumber: '5',
    chapterTitle: 'Coordinate Geometry & Straight Lines',
    subject: 'Mathematics',
    keywords: ['circle equation', 'tangent to circle', 'circle theorem', 'normal line', 'chord', 'cyclic quadrilateral']
  },
  {
    topicTitle: 'Trigonometric Ratios (SOH CAH TOA), Sine Rule & Cosine Rule',
    chapterNumber: '6',
    chapterTitle: 'Trigonometry & Circular Measure',
    subject: 'Mathematics',
    keywords: ['trigonometry', 'sine rule', 'cosine rule', 'soh cah toa', 'area of triangle 1/2 ab sinc', 'bearings', '3d trig']
  },
  {
    topicTitle: 'Trigonometric Identities, Graphs & Radians (Arc Length & Sector Area)',
    chapterNumber: '6',
    chapterTitle: 'Trigonometry & Circular Measure',
    subject: 'Mathematics',
    keywords: ['radian', 'arc length', 'sector area', 'trigonometric identity', 'sin^2+cos^2=1', 'tanx', 'periodicity']
  },
  {
    topicTitle: 'Differentiation: Power Rule, Product Rule, Quotient Rule & Chain Rule',
    chapterNumber: '7',
    chapterTitle: 'Calculus - Differentiation',
    subject: 'Mathematics',
    keywords: ['differentiation', 'derivative', 'chain rule', 'product rule', 'quotient rule', 'dy/dx', 'gradient function']
  },
  {
    topicTitle: 'Stationary Points, Maxima/Minima, Tangents/Normals & Connected Rates of Change',
    chapterNumber: '7',
    chapterTitle: 'Calculus - Differentiation',
    subject: 'Mathematics',
    keywords: ['stationary point', 'maxima', 'minima', 'second derivative', 'rates of change', 'tangent normal calculus']
  },
  {
    topicTitle: 'Integration: Indefinite & Definite Integrals, Reverse Chain Rule',
    chapterNumber: '8',
    chapterTitle: 'Calculus - Integration',
    subject: 'Mathematics',
    keywords: ['integration', 'integral', 'antiderivative', 'definite integral', 'constant of integration']
  },
  {
    topicTitle: 'Area Under Curves & Volume of Revolution',
    chapterNumber: '8',
    chapterTitle: 'Calculus - Integration',
    subject: 'Mathematics',
    keywords: ['area under curve', 'volume of revolution', 'integration area', 'bounded region']
  },
  {
    topicTitle: 'Vectors in 2D & 3D: Magnitude, Unit Vectors, Scalar Product & Vector Equations of Lines',
    chapterNumber: '9',
    chapterTitle: 'Vectors in Mathematics',
    subject: 'Mathematics',
    keywords: ['vector geometry', 'unit vector', 'dot product math', 'direction vector', 'position vector', 'vector line r=a+tb']
  },
  {
    topicTitle: 'Probability: Tree Diagrams, Venn Diagrams & Conditional Probability',
    chapterNumber: '10',
    chapterTitle: 'Probability and Statistics',
    subject: 'Mathematics',
    keywords: ['probability', 'tree diagram', 'venn diagram', 'conditional probability', 'independent events', 'mutually exclusive']
  },
  {
    topicTitle: 'Statistical Measures: Mean, Median, Mode, Standard Deviation & Normal Distribution',
    chapterNumber: '10',
    chapterTitle: 'Probability and Statistics',
    subject: 'Mathematics',
    keywords: ['standard deviation', 'variance', 'mean', 'normal distribution', 'z-score', 'box plot', 'cumulative frequency']
  },
  {
    topicTitle: 'Permutations and Combinations (nPr, nCr & Arrangement Problems)',
    chapterNumber: '11',
    chapterTitle: 'Permutations & Combinations',
    subject: 'Mathematics',
    keywords: ['permutation', 'combination', 'npr', 'ncr', 'factorial', 'arrangements', 'selections']
  },
  {
    topicTitle: 'Linear Programming & Shading Feasible Regions',
    chapterNumber: '12',
    chapterTitle: 'Linear Inequalities & Optimization',
    subject: 'Mathematics',
    keywords: ['linear programming', 'feasible region', 'objective function', 'inequality shading', 'optimization']
  },

  // ==========================================
  // CHEMISTRY (O/A Levels, Matric, F.Sc)
  // ==========================================
  {
    topicTitle: 'Mole Concept, Avogadro Constant, Molar Mass & Stoichiometric Calculations',
    chapterNumber: '1',
    chapterTitle: 'Stoichiometry and Mole Concept',
    subject: 'Chemistry',
    keywords: ['mole', 'avogadro', 'molar mass', 'stoichiometry', 'empirical formula', 'molecular formula', 'limiting reactant', 'percentage yield']
  },
  {
    topicTitle: 'Atomic Structure, Electronic Configuration (s, p, d, f) & Quantum Numbers',
    chapterNumber: '2',
    chapterTitle: 'Atomic Structure & Periodicity',
    subject: 'Chemistry',
    keywords: ['atomic structure', 'electronic configuration', 'orbitals', 'quantum numbers', 'bohr model', 'ionization energy', 'hunds rule']
  },
  {
    topicTitle: 'Ionic, Covalent, Metallic & Intermolecular Hydrogen Bonding (VSEPR Shapes)',
    chapterNumber: '3',
    chapterTitle: 'Chemical Bonding and Structure',
    subject: 'Chemistry',
    keywords: ['chemical bonding', 'covalent', 'ionic', 'hydrogen bond', 'vsepr', 'electronegativity', 'dipole', 'hybridization']
  },
  {
    topicTitle: 'Thermochemistry: Enthalpy Changes, Hess’s Law & Bond Energies',
    chapterNumber: '4',
    chapterTitle: 'Chemical Energetics & Thermochemistry',
    subject: 'Chemistry',
    keywords: ['enthalpy', 'hesss law', 'exothermic', 'endothermic', 'calorimetry', 'bond energy', 'born-haber cycle']
  },
  {
    topicTitle: 'Chemical Equilibrium, Kc, Kp & Le Chatelier’s Principle',
    chapterNumber: '5',
    chapterTitle: 'Chemical Equilibrium',
    subject: 'Chemistry',
    keywords: ['equilibrium', 'kc', 'kp', 'le chatelier', 'reversible reaction', 'haber process', 'contact process']
  },
  {
    topicTitle: 'Acids, Bases, pH, Buffer Solutions & Acid-Base Titrations',
    chapterNumber: '6',
    chapterTitle: 'Acids, Bases and Salts',
    subject: 'Chemistry',
    keywords: ['acid', 'base', 'ph', 'pka', 'buffer', 'titration', 'neutralisation', 'salt hydrolysis', 'indicators']
  },
  {
    topicTitle: 'Electrochemistry: Electrolysis, Standard Electrode Potentials (E°) & Galvanic Cells',
    chapterNumber: '7',
    chapterTitle: 'Electrochemistry & Redox',
    subject: 'Chemistry',
    keywords: ['electrochemistry', 'electrolysis', 'electrode potential', 'galvanic cell', 'redox', 'oxidation', 'reduction', 'faradays law chemistry']
  },
  {
    topicTitle: 'Reaction Kinetics: Rate of Reaction, Rate Law, Order of Reaction & Catalysis',
    chapterNumber: '8',
    chapterTitle: 'Reaction Kinetics',
    subject: 'Chemistry',
    keywords: ['reaction rate', 'order of reaction', 'rate constant', 'activation energy', 'arrhenius', 'catalyst', 'half life chemistry']
  },
  {
    topicTitle: 'Organic Chemistry: Alkanes, Alkenes, Alkynes & Free Radical Substitution',
    chapterNumber: '9',
    chapterTitle: 'Organic Chemistry - Hydrocarbons',
    subject: 'Chemistry',
    keywords: ['alkane', 'alkene', 'alkyne', 'free radical substitution', 'electrophilic addition', 'markovnikov', 'isomerism']
  },
  {
    topicTitle: 'Functional Groups: Halogenoalkanes, Alcohols, Carbonyls (Aldehydes/Ketones) & Carboxylic Acids',
    chapterNumber: '10',
    chapterTitle: 'Organic Chemistry - Functional Groups',
    subject: 'Chemistry',
    keywords: ['alcohol', 'aldehyde', 'ketone', 'carboxylic acid', 'ester', 'nucleophilic substitution', 'oxidation of alcohol', 'tollens reagent']
  }
];

/**
 * Intelligent topic analyzer and chapter/unit detector.
 * Matches topic title against curriculum database and existing chapters for the subject.
 */
export function autoDetectChapterForTopic(
  topicTitle: string,
  subjectName?: string,
  existingChapters?: SyllabusChapter[]
): {
  matched: boolean;
  chapterNumber: string | number;
  chapterTitle: string;
  matchedTopicSuggestion?: string;
  source: 'existing' | 'curriculum' | 'smart_fallback';
  confidence: number;
} {
  const cleanTitle = topicTitle.trim().toLowerCase();
  if (!cleanTitle) {
    return {
      matched: false,
      chapterNumber: existingChapters && existingChapters.length > 0 ? (existingChapters.length + 1).toString() : '1',
      chapterTitle: 'Unit 1: Fundamentals',
      source: 'smart_fallback',
      confidence: 0
    };
  }

  const words = cleanTitle.split(/[\s,()\/&+:;.-]+/).filter(w => w.length > 2);

  // 1. First priority: Match against existing syllabus chapters in this subject
  if (existingChapters && existingChapters.length > 0) {
    let bestExistingScore = 0;
    let bestExistingChapter: SyllabusChapter | null = null;

    for (const ch of existingChapters) {
      const chTitleLower = ch.title.toLowerCase();
      let score = 0;

      // Direct substring match with chapter title
      if (cleanTitle.includes(chTitleLower) || chTitleLower.includes(cleanTitle)) {
        score += 8;
      }

      // Check words in chapter title
      for (const word of words) {
        if (chTitleLower.includes(word)) {
          score += 3;
        }
      }

      // Check existing topics inside this chapter
      for (const top of ch.topics) {
        const topTitleLower = top.title.toLowerCase();
        if (topTitleLower.includes(cleanTitle) || cleanTitle.includes(topTitleLower)) {
          score += 6;
        }
        for (const word of words) {
          if (topTitleLower.includes(word)) {
            score += 2;
          }
        }
      }

      if (score > bestExistingScore) {
        bestExistingScore = score;
        bestExistingChapter = ch;
      }
    }

    if (bestExistingChapter && bestExistingScore >= 3) {
      return {
        matched: true,
        chapterNumber: bestExistingChapter.chapterNumber,
        chapterTitle: bestExistingChapter.title,
        source: 'existing',
        confidence: Math.min(100, bestExistingScore * 10)
      };
    }
  }

  // 2. Second priority: Search our comprehensive curriculum database
  let bestCurriculumMatch: CurriculumTopicMatch | null = null;
  let highestScore = 0;

  for (const item of CURRICULUM_DATABASE) {
    let score = 0;

    // Bonus if subject matches
    if (subjectName) {
      const sLower = subjectName.toLowerCase();
      const itemSubjLower = item.subject.toLowerCase();
      if (sLower.includes(itemSubjLower) || itemSubjLower.includes(sLower)) {
        score += 4;
      }
    }

    // Direct topic title match
    const itemTitleLower = item.topicTitle.toLowerCase();
    if (cleanTitle.includes(itemTitleLower) || itemTitleLower.includes(cleanTitle)) {
      score += 10;
    }

    // Chapter title match
    const itemChLower = item.chapterTitle.toLowerCase();
    if (cleanTitle.includes(itemChLower) || itemChLower.includes(cleanTitle)) {
      score += 6;
    }

    // Keywords match
    for (const kw of item.keywords) {
      if (cleanTitle.includes(kw)) {
        score += 5;
      }
      for (const word of words) {
        if (kw.includes(word) || word.includes(kw)) {
          score += 3;
        }
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestCurriculumMatch = item;
    }
  }

  if (bestCurriculumMatch && highestScore >= 4) {
    // If we have existing chapters, check if one matches this curriculum chapter title
    if (existingChapters && existingChapters.length > 0) {
      const matchInExisting = existingChapters.find(ch => 
        ch.title.toLowerCase().includes(bestCurriculumMatch!.chapterTitle.toLowerCase()) ||
        bestCurriculumMatch!.chapterTitle.toLowerCase().includes(ch.title.toLowerCase())
      );
      if (matchInExisting) {
        return {
          matched: true,
          chapterNumber: matchInExisting.chapterNumber,
          chapterTitle: matchInExisting.title,
          matchedTopicSuggestion: bestCurriculumMatch.topicTitle,
          source: 'existing',
          confidence: Math.min(100, highestScore * 10)
        };
      }
    }

    return {
      matched: true,
      chapterNumber: bestCurriculumMatch.chapterNumber,
      chapterTitle: bestCurriculumMatch.chapterTitle,
      matchedTopicSuggestion: bestCurriculumMatch.topicTitle,
      source: 'curriculum',
      confidence: Math.min(100, highestScore * 10)
    };
  }

  // 3. Fallback: Intelligent heuristic from words
  const defaultNum = existingChapters && existingChapters.length > 0 ? (existingChapters.length + 1).toString() : '1';
  return {
    matched: false,
    chapterNumber: defaultNum,
    chapterTitle: `Chapter ${defaultNum}: ${topicTitle.slice(0, 30)}...`,
    source: 'smart_fallback',
    confidence: 10
  };
}

/**
 * Live search through curriculum database for instant autocomplete suggestions
 */
export function searchCurriculumTopics(
  query: string,
  subjectName?: string,
  maxResults: number = 6
): CurriculumTopicMatch[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];

  const results = CURRICULUM_DATABASE.filter(item => {
    if (subjectName) {
      const sLower = subjectName.toLowerCase();
      const itemSubj = item.subject.toLowerCase();
      const subjectMatch = sLower.includes(itemSubj) || itemSubj.includes(sLower);
      if (!subjectMatch) return false;
    }

    const titleMatch = item.topicTitle.toLowerCase().includes(clean);
    const chapterMatch = item.chapterTitle.toLowerCase().includes(clean);
    const keywordMatch = item.keywords.some(k => k.includes(clean) || clean.includes(k));

    return titleMatch || chapterMatch || keywordMatch;
  });

  return results.slice(0, maxResults);
}

/**
 * Get a student's topic status or fallback to global topic status
 */
export function getTopicStatusForStudent(
  student: Student | null | undefined,
  topic: SyllabusTopic
): {
  status: 'pending' | 'in-progress' | 'completed' | 'revised';
  completedDate?: string;
  notes?: string;
  isStudentSpecific: boolean;
} {
  if (student?.syllabusProgress && student.syllabusProgress[topic.id]) {
    const rec = student.syllabusProgress[topic.id];
    return {
      status: rec.status,
      completedDate: rec.completedDate,
      notes: rec.notes,
      isStudentSpecific: true
    };
  }

  return {
    status: topic.status,
    completedDate: topic.completedDate,
    notes: topic.notes,
    isStudentSpecific: false
  };
}

/**
 * Save topic status update to a particular student's record
 */
export function updateStudentTopicProgress(
  student: Student,
  topicId: string,
  status: 'pending' | 'in-progress' | 'completed' | 'revised',
  completedDate?: string,
  notes?: string
): Student {
  const currentProgress = student.syllabusProgress || {};
  return {
    ...student,
    syllabusProgress: {
      ...currentProgress,
      [topicId]: {
        status,
        completedDate: (status === 'completed' || status === 'revised') ? (completedDate || new Date().toISOString().slice(0, 10)) : undefined,
        notes: notes !== undefined ? notes : currentProgress[topicId]?.notes
      }
    }
  };
}
