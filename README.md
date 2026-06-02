# Semester Grade Analyzer & Mark Analytics Dashboard

A modern, responsive, and premium client-side Single Page Application (SPA) designed for students to track, analyze, and visualize their academic performance per semester. Built with vanilla HTML5, CSS3 (featuring glassmorphism layouts and dark/light themes), and JavaScript, leveraging Chart.js for data visualization.

---

## 🌟 Core Features

1. **Analytical Dashboard (Overview)**
   - **Key Metrics**: Dynamic display of overall CGPA, total earned credits, and overall subject pass rate.
   - **SGPA Trend Chart**: A smooth Chart.js line graph displaying semester-wise GPA progression.
   - **Grade Distribution Chart**: A bar graph outlining subject counts across different letter grades.

2. **Detailed Semester & Subject Tracker**
   - Interactive grid showing all enrolled semesters.
   - Expandable ledger detail tables for subject management: Add, Edit, or Delete courses.
   - Tracks Course Name, Credits, Internal Marks, and External Marks.

3. **Target CGPA Planner ("What-If" Forecasting)**
   - Inputs for your desired overall CGPA target and remaining future credits.
   - Dynamic math engine computes the precise average SGPA required in upcoming semesters.
   - Features a visual status feedback dial and color-coded feasibility analysis (e.g., "Highly Realistic", "Challenging", or "Impossible").

4. **Settings & Customization**
   - **Grading Reference Model**: Toggle between a **10-Point CGPA scale** (standard for engineering colleges) and a **4-Point GPA scale** (standard for US institutions).
   - **Student Profile**: Customize name, course major, registration number, and global target CGPA.
   - **Data Portability**:
     - Export/Import full student records as JSON files.
     - Export course transcripts as standard Excel-compatible CSV sheets.
     - Print formatted transcripts/reports to physical paper or save to PDF (navigation bars automatically hidden).
   - **Mock Data Injector**: One-click mock data restoration for easy testing.

---

## 📁 Directory Structure

```plaintext
student_mark_analysis/
│
├── index.html       # Application DOM structure, modal wrappers, and icon CDNs
├── styles.css       # CSS properties, Dark/Light palettes, glassmorphism, responsive grids
├── app.js           # Calculations engine, LocalStorage operations, Chart renders, and UI event listeners
├── sampleData.js    # Pre-loaded mock computer science curriculum spanning 4 semesters
├── package.json     # NPM script definitions (simple startup web server configuration)
└── README.md        # Technical explanation and deployment guidelines (This file)
```

---

## 📐 Math & Grade Conversion Engine

The core logic of the application resides in `app.js`.

### 1. Subject Totals & Percentages
For any given subject:
$$\text{Total Obtained Marks} = \text{Internal Marks} + \text{External Marks}$$
$$\text{Max Allowed Marks} = \text{Max Internal} + \text{Max External}$$
$$\text{Subject Percentage} = \left( \frac{\text{Total Obtained Marks}}{\text{Max Allowed Marks}} \right) \times 100$$

### 2. Grade Scales
Depending on the active setting, the obtained percentage maps to a grade and grade points:

| **Percentage Range** | **10-Point Grade** | **Points** | **4-Point Grade** | **Points** | **Status** |
|:---:|:---:|:---:|:---:|:---:|:---:|
| $\ge 93\%$ | O | 10.0 | A | 4.0 | Pass |
| $90\% \text{ to } 92.9\%$ | O | 10.0 | A- | 3.7 | Pass |
| $87\% \text{ to } 89.9\%$ | A+ | 9.0 | B+ | 3.3 | Pass |
| $83\% \text{ to } 86.9\%$ | A+ | 9.0 | B | 3.0 | Pass |
| $80\% \text{ to } 82.9\%$ | A+ | 9.0 | B- | 2.7 | Pass |
| $77\% \text{ to } 79.9\%$ | A | 8.0 | C+ | 2.3 | Pass |
| $73\% \text{ to } 76.9\%$ | A | 8.0 | C | 2.0 | Pass |
| $70\% \text{ to } 72.9\%$ | A | 8.0 | C- | 1.7 | Pass |
| $60\% \text{ to } 69.9\%$ | B+ | 7.0 | D | 1.0 | Pass |
| $50\% \text{ to } 59.9\%$ | B | 6.0 | F | 0.0 | Pass (10-pt) / Fail (4-pt) |
| $40\% \text{ to } 49.9\%$ | C | 5.0 | F | 0.0 | Pass (10-pt) / Fail (4-pt) |
| $< 40\%$ | F | 0.0 | F | 0.0 | Fail |

### 3. SGPA & CGPA Equations
* **Semester Grade Point Average (SGPA)**:
  $$\text{SGPA} = \frac{\sum (\text{Subject Grade Points} \times \text{Subject Credits})}{\sum \text{Semester Credits}}$$

* **Cumulative Grade Point Average (CGPA)**:
  $$\text{CGPA} = \frac{\sum (\text{SGPA} \times \text{Semester Total Credits})}{\sum \text{All Enrolled Credits}}$$

* **Overall Pass Rate**:
  $$\text{Pass Rate} = \left( \frac{\text{Passed Subjects}}{\text{Total Registered Subjects}} \right) \times 100$$
  *(Note: A subject is considered passed if its mapped Grade Point is greater than 0).*

---

## 🔮 "What-If" Planning Formulas

The planner operates by assessing the difference between your current overall points and your target points.

1. **Calculate Completed Total Points**:
   $$\text{Completed Points} = \text{Current CGPA} \times \text{Completed Credits}$$

2. **Calculate Target Total Credits**:
   $$\text{Target Credits} = \text{Completed Credits} + \text{Remaining Credits}$$

3. **Calculate Required Total Points**:
   $$\text{Required Points} = \text{Target CGPA} \times \text{Target Credits}$$

4. **Calculate Needed Points in Future Semesters**:
   $$\text{Needed Points} = \text{Required Points} - \text{Completed Points}$$

5. **Calculate Required Future SGPA Average**:
   $$\text{Required SGPA} = \frac{\text{Needed Points}}{\text{Remaining Credits}}$$

If the resulting $\text{Required SGPA}$ is greater than $10.0$ (or $4.0$ depending on scale), the status warning fires to alert the student that the target is mathematically unreachable with the credits remaining.

---

## 💾 Local Storage & Backups
All student profile information, settings, and semester databases are stored locally inside the browser's sandbox using the **Web Storage API (LocalStorage)** under the key `student_mark_analyzer_state`.

- **Auto-Save**: Any subject addition, grade editing, or profile alteration triggers a write back to local storage.
- **Portability**: The JSON export structure packages this state directly into a downloadable text payload, enabling seamless synchronization between multiple devices or browsers.

---

## 🚀 Getting Started

### Method 1: Local File Execution
Since the application runs entirely client-side, you do not need any compilation.
1. Open the [student_mark_analysis/](file:///C:/Users/WELCOME/.gemini/antigravity/scratch/student_mark_analysis/) directory on your machine.
2. Double-click `index.html` to load the application directly in your browser.

### Method 2: NPM Development Server
If you prefer running a local development server:
1. Open a command prompt or terminal in the project directory.
2. Run the start command:
   ```bash
   npm start
   ```
3. This uses `npx` to download and spin up a lightweight, zero-configuration HTTP server serving `http://localhost:8080`.

---

## ☁️ Deployment
Since the application has no backend dependencies (databases or API microservices), you can deploy it for free:
- **GitHub Pages**: Initialize a git repo, push to a GitHub repository, and activate Pages in settings.
- **Vercel / Netlify / Surge**: Run a zero-config deploy using their command-line interfaces:
  ```bash
  npx vercel
  # OR
  npx netlify deploy
  # OR
  npx surge .
  ```
