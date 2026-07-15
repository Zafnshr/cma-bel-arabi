export type CourseSection = {
  gleimSourceFile: string;
  pdfPageStart: number;
  pdfPageEnd: number;
};

export type CourseModule = {
  moduleId: string;
  title: string;
  sections: CourseSection[];
};

export type CourseUnit = {
  beckerUnit: string;
  modules: CourseModule[];
};

export const COURSE_MAP: CourseUnit[] = [
  {
    beckerUnit: "Unit 1: External Financial Reporting Decisions",
    modules: [
      { moduleId: "M1", title: "Background: Accounting Cycle", sections: [{ gleimSourceFile: "SU1", pdfPageStart: 2, pdfPageEnd: 5 }] },
      { moduleId: "M2", title: "A.1. Financial Statements: Part 1", sections: [{ gleimSourceFile: "SU1", pdfPageStart: 6, pdfPageEnd: 17 }] },
      { moduleId: "M3", title: "A.1. Financial Statements: Part 2", sections: [{ gleimSourceFile: "SU1", pdfPageStart: 18, pdfPageEnd: 34 }, { gleimSourceFile: "SU6", pdfPageStart: 2, pdfPageEnd: 18 }] },
      { moduleId: "M4", title: "A.2. Asset Valuation: Receivables", sections: [{ gleimSourceFile: "SU2", pdfPageStart: 2, pdfPageEnd: 7 }] },
      { moduleId: "M5", title: "A.2. Asset Valuation: Inventory", sections: [{ gleimSourceFile: "SU2", pdfPageStart: 8, pdfPageEnd: 28 }] },
      { moduleId: "M6", title: "A.2. Investments and Long-Term Assets", sections: [{ gleimSourceFile: "SU3", pdfPageStart: 2, pdfPageEnd: 30 }, { gleimSourceFile: "SU5", pdfPageStart: 11, pdfPageEnd: 16 }] },
      { moduleId: "M7", title: "A.2. Liabilities and Equity", sections: [{ gleimSourceFile: "SU4", pdfPageStart: 2, pdfPageEnd: 5 }, { gleimSourceFile: "SU4", pdfPageStart: 19, pdfPageEnd: 30 }] },
      { moduleId: "M8", title: "A.2. Special Valuation Considerations: Taxes and Leases", sections: [{ gleimSourceFile: "SU4", pdfPageStart: 6, pdfPageEnd: 18 }] },
      { moduleId: "M9", title: "A.2. Revenue Recognition and Income Measurement", sections: [{ gleimSourceFile: "SU5", pdfPageStart: 2, pdfPageEnd: 10 }] },
      { moduleId: "M10", title: "A.1. Consolidated Financial Statements", sections: [{ gleimSourceFile: "SU1", pdfPageStart: 35, pdfPageEnd: 45 }] }
    ]
  },
  {
    beckerUnit: "Unit 2: Cost Management",
    modules: [
      { moduleId: "M1", title: "D.1. Measurement Concepts: Part 1, and D.3. Overhead Costs: Part 1", sections: [{ gleimSourceFile: "SU7", pdfPageStart: 2, pdfPageEnd: 7 }, { gleimSourceFile: "SU9", pdfPageStart: 8, pdfPageEnd: 11 }] },
      { moduleId: "M2", title: "D.1. Measurement Concepts: Part 2", sections: [{ gleimSourceFile: "SU7", pdfPageStart: 8, pdfPageEnd: 10 }] },
      { moduleId: "M3", title: "D.1. Measurement Concepts: Part 3, D.2. Costing Systems: Part 1, and D.3. Overhead Costs: Part 2", sections: [{ gleimSourceFile: "SU7", pdfPageStart: 11, pdfPageEnd: 18 }, { gleimSourceFile: "SU8", pdfPageStart: 2, pdfPageEnd: 8 }, { gleimSourceFile: "SU9", pdfPageStart: 12, pdfPageEnd: 15 }] },
      { moduleId: "M4", title: "D.2. Costing Systems: Part 2, and D.3. Overhead Costs: Part 3", sections: [{ gleimSourceFile: "SU8", pdfPageStart: 9, pdfPageEnd: 22 }, { gleimSourceFile: "SU9", pdfPageStart: 2, pdfPageEnd: 7 }, { gleimSourceFile: "SU9", pdfPageStart: 16, pdfPageEnd: 24 }] },
      { moduleId: "M5", title: "D.4. Supply Chain Management", sections: [{ gleimSourceFile: "SU10", pdfPageStart: 2, pdfPageEnd: 18 }] },
      { moduleId: "M6", title: "D.5. Business Process Improvement", sections: [{ gleimSourceFile: "SU11", pdfPageStart: 2, pdfPageEnd: 16 }] }
    ]
  },
  {
    beckerUnit: "Unit 3: Planning, Budgeting, and Forecasting",
    modules: [
      { moduleId: "M1", title: "B.1. Strategic Planning", sections: [{ gleimSourceFile: "SU12", pdfPageStart: 13, pdfPageEnd: 26 }] },
      { moduleId: "M2", title: "B.2. Budgeting Concepts", sections: [{ gleimSourceFile: "SU13", pdfPageStart: 2, pdfPageEnd: 11 }] },
      { moduleId: "M3", title: "B.3. Forecasting Techniques", sections: [{ gleimSourceFile: "SU12", pdfPageStart: 2, pdfPageEnd: 12 }] },
      { moduleId: "M4", title: "B.4. Budgeting Methodologies", sections: [{ gleimSourceFile: "SU13", pdfPageStart: 12, pdfPageEnd: 22 }] },
      { moduleId: "M5", title: "B.5. Annual Profit Plan and Supporting Schedules: Part 1", sections: [{ gleimSourceFile: "SU14", pdfPageStart: 2, pdfPageEnd: 11 }] },
      { moduleId: "M6", title: "B.5. Annual Profit Plan and Supporting Schedules: Part 2", sections: [{ gleimSourceFile: "SU14", pdfPageStart: 12, pdfPageEnd: 16 }] },
      { moduleId: "M7", title: "B.6. Top-Level Planning and Analysis", sections: [{ gleimSourceFile: "SU14", pdfPageStart: 17, pdfPageEnd: 25 }] }
    ]
  },
  {
    beckerUnit: "Unit 4: Performance Management",
    modules: [
      { moduleId: "M1", title: "C.1. Cost and Variance Measures: Part 1", sections: [{ gleimSourceFile: "SU15", pdfPageStart: 2, pdfPageEnd: 16 }] },
      { moduleId: "M2", title: "C.1. Cost and Variance Measures: Part 2", sections: [{ gleimSourceFile: "SU15", pdfPageStart: 17, pdfPageEnd: 32 }] },
      { moduleId: "M3", title: "C.2. Responsibility Centers", sections: [{ gleimSourceFile: "SU16", pdfPageStart: 2, pdfPageEnd: 4 }] },
      { moduleId: "M4", title: "C.2. Transfer Pricing", sections: [{ gleimSourceFile: "SU16", pdfPageStart: 19, pdfPageEnd: 23 }] },
      { moduleId: "M5", title: "C.3. Performance Measures: Part 1", sections: [{ gleimSourceFile: "SU16", pdfPageStart: 5, pdfPageEnd: 11 }] },
      { moduleId: "M6", title: "C.3. Performance Measures: Part 2", sections: [{ gleimSourceFile: "SU16", pdfPageStart: 12, pdfPageEnd: 18 }] }
    ]
  },
  {
    beckerUnit: "Unit 5: Internal Controls",
    modules: [
      { moduleId: "M1", title: "E.1. Governance, Risk, and Compliance: Part 1", sections: [{ gleimSourceFile: "SU17", pdfPageStart: 2, pdfPageEnd: 10 }] },
      { moduleId: "M2", title: "E.1. Governance, Risk, and Compliance: Part 2, and E.2. System Controls and Security Measures", sections: [{ gleimSourceFile: "SU17", pdfPageStart: 11, pdfPageEnd: 16 }, { gleimSourceFile: "SU18", pdfPageStart: 2, pdfPageEnd: 28 }] }
    ]
  },
  {
    beckerUnit: "Unit 6: Technology and Analytics",
    modules: [
      { moduleId: "M1", title: "F.1. Information Systems", sections: [{ gleimSourceFile: "SU19", pdfPageStart: 2, pdfPageEnd: 6 }] },
      { moduleId: "M2", title: "F.2. Data Governance", sections: [{ gleimSourceFile: "SU19", pdfPageStart: 7, pdfPageEnd: 16 }] },
      { moduleId: "M3", title: "F.3. Technology-Enabled Finance Transformation", sections: [{ gleimSourceFile: "SU20", pdfPageStart: 2, pdfPageEnd: 10 }] },
      { moduleId: "M4", title: "F.4. Data Analytics: Part 1", sections: [{ gleimSourceFile: "SU20", pdfPageStart: 11, pdfPageEnd: 19 }] },
      { moduleId: "M5", title: "F.4. Data Analytics: Part 2", sections: [{ gleimSourceFile: "SU20", pdfPageStart: 20, pdfPageEnd: 28 }] }
    ]
  }
];
