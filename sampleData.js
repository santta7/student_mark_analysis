// Pre-configured mock data for the Student Mark Analysis dashboard
window.DEFAULT_STUDENT_DATA = {
  settings: {
    gradingSystem: "10-point", // "10-point" or "4-point"
    studentName: "Alex Mercer",
    courseName: "B.Tech Computer Science & Engineering",
    rollNumber: "CSE-2024-042",
    targetCGPA: 8.5
  },
  semesters: [
    {
      id: "sem-1",
      name: "Semester 1",
      subjects: [
        { id: "subj-1-1", name: "Engineering Mathematics I", credits: 4, internal: 24, external: 62, maxInternal: 30, maxExternal: 70 },
        { id: "subj-1-2", name: "Engineering Physics", credits: 4, internal: 25, external: 58, maxInternal: 30, maxExternal: 70 },
        { id: "subj-1-3", name: "Problem Solving & Programming in C", credits: 4, internal: 28, external: 66, maxInternal: 30, maxExternal: 70 },
        { id: "subj-1-4", name: "Basic Electrical & Electronics", credits: 3, internal: 20, external: 52, maxInternal: 30, maxExternal: 70 },
        { id: "subj-1-5", name: "Environmental Sciences", credits: 2, internal: 26, external: 60, maxInternal: 30, maxExternal: 70 },
        { id: "subj-1-6", name: "C Programming Laboratory", credits: 2, internal: 29, external: 68, maxInternal: 30, maxExternal: 70 }
      ]
    },
    {
      id: "sem-2",
      name: "Semester 2",
      subjects: [
        { id: "subj-2-1", name: "Engineering Mathematics II", credits: 4, internal: 21, external: 55, maxInternal: 30, maxExternal: 70 },
        { id: "subj-2-2", name: "Engineering Chemistry", credits: 3, internal: 24, external: 50, maxInternal: 30, maxExternal: 70 },
        { id: "subj-2-3", name: "Data Structures & Algorithms", credits: 4, internal: 26, external: 60, maxInternal: 30, maxExternal: 70 },
        { id: "subj-2-4", name: "Digital Electronics", credits: 3, internal: 22, external: 48, maxInternal: 30, maxExternal: 70 },
        { id: "subj-2-5", name: "Data Structures Lab", credits: 2, internal: 28, external: 65, maxInternal: 30, maxExternal: 70 },
        { id: "subj-2-6", name: "Technical Communication", credits: 2, internal: 27, external: 63, maxInternal: 30, maxExternal: 70 }
      ]
    },
    {
      id: "sem-3",
      name: "Semester 3",
      subjects: [
        { id: "subj-3-1", name: "Discrete Mathematics", credits: 4, internal: 23, external: 54, maxInternal: 30, maxExternal: 70 },
        { id: "subj-3-2", name: "Object Oriented Programming in C++", credits: 4, internal: 27, external: 62, maxInternal: 30, maxExternal: 70 },
        { id: "subj-3-3", name: "Computer Organization & Architecture", credits: 4, internal: 22, external: 51, maxInternal: 30, maxExternal: 70 },
        { id: "subj-3-4", name: "Database Management Systems", credits: 3, internal: 25, external: 59, maxInternal: 30, maxExternal: 70 },
        { id: "subj-3-5", name: "Object Oriented Programming Lab", credits: 2, internal: 29, external: 67, maxInternal: 30, maxExternal: 70 },
        { id: "subj-3-6", name: "DBMS Laboratory", credits: 2, internal: 28, external: 64, maxInternal: 30, maxExternal: 70 }
      ]
    },
    {
      id: "sem-4",
      name: "Semester 4",
      subjects: [
        { id: "subj-4-1", name: "Probability & Statistics", credits: 4, internal: 25, external: 57, maxInternal: 30, maxExternal: 70 },
        { id: "subj-4-2", name: "Design & Analysis of Algorithms", credits: 4, internal: 28, external: 61, maxInternal: 30, maxExternal: 70 },
        { id: "subj-4-3", name: "Operating Systems", credits: 4, internal: 24, external: 56, maxInternal: 30, maxExternal: 70 },
        { id: "subj-4-4", name: "Software Engineering", credits: 3, internal: 26, external: 53, maxInternal: 30, maxExternal: 70 },
        { id: "subj-4-5", name: "Algorithms Lab", credits: 2, internal: 29, external: 68, maxInternal: 30, maxExternal: 70 },
        { id: "subj-4-6", name: "Operating Systems Lab", credits: 2, internal: 28, external: 66, maxInternal: 30, maxExternal: 70 }
      ]
    }
  ]
};
