// Student Mark Analysis Dashboard Logic

// Main Application State
let state = {
  settings: {
    gradingSystem: "10-point",
    studentName: "Alex Mercer",
    courseName: "B.Tech Computer Science & Engineering",
    rollNumber: "CSE-2024-042",
    targetCGPA: 8.5
  },
  semesters: [],
  activeTab: "dashboard",
  selectedSemesterId: null, // null means grid view, active ID means detail view
  theme: "dark"
};

// Global Chart References
let sgpaChartInstance = null;
let gradeChartInstance = null;

// Initialize Application on DOM Load
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  initTheme();
  setupEventListeners();
  renderApp();
});

// Load State from LocalStorage or Sample Data
function loadState() {
  const savedState = localStorage.getItem("student_mark_analyzer_state");
  if (savedState) {
    try {
      state = JSON.parse(savedState);
    } catch (e) {
      console.error("Error parsing saved state, resetting...", e);
      loadFallbackData();
    }
  } else {
    loadFallbackData();
  }
}

function loadFallbackData() {
  if (window.DEFAULT_STUDENT_DATA) {
    state.settings = { ...window.DEFAULT_STUDENT_DATA.settings };
    state.semesters = JSON.parse(JSON.stringify(window.DEFAULT_STUDENT_DATA.semesters));
  } else {
    state.settings = {
      gradingSystem: "10-point",
      studentName: "Guest Student",
      courseName: "General Sciences",
      rollNumber: "GEN-001",
      targetCGPA: 8.0
    };
    state.semesters = [];
  }
  saveState();
}

// Save State to LocalStorage
function saveState() {
  localStorage.setItem("student_mark_analyzer_state", JSON.stringify(state));
}

// Theme Handling
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  setTheme(savedTheme);
}

function setTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  
  const themeBtnIcon = document.querySelector(".theme-toggle-btn i");
  if (themeBtnIcon) {
    if (theme === "dark") {
      themeBtnIcon.className = "fas fa-sun";
    } else {
      themeBtnIcon.className = "fas fa-moon";
    }
  }
  
  // Re-render charts to update grid and label colors for dark/light mode
  if (state.activeTab === "dashboard") {
    setTimeout(renderDashboardCharts, 50);
  }
}

// Setup Event Listeners
function setupEventListeners() {
  // Navigation Tabs
  document.querySelectorAll(".nav-item a").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const tab = link.parentElement.getAttribute("data-tab");
      switchTab(tab);
    });
  });

  // Theme Toggle Button
  const themeBtn = document.querySelector(".theme-toggle-btn");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      setTheme(state.theme === "dark" ? "light" : "dark");
    });
  }

  // Modals Overlay click to close
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeAllModals();
      }
    });
  });

  // Close buttons in modals
  document.querySelectorAll(".modal-close, .btn-close-modal").forEach(btn => {
    btn.addEventListener("click", closeAllModals);
  });

  // Settings Forms submit
  const profileForm = document.getElementById("profile-form");
  if (profileForm) {
    profileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      state.settings.studentName = document.getElementById("edit-student-name").value;
      state.settings.courseName = document.getElementById("edit-course-name").value;
      state.settings.rollNumber = document.getElementById("edit-roll-number").value;
      state.settings.targetCGPA = parseFloat(document.getElementById("edit-target-cgpa").value) || 0;
      state.settings.gradingSystem = document.getElementById("edit-grading-system").value;
      
      saveState();
      showToast("Profile settings updated successfully!", "success");
      renderApp();
    });
  }

  // Reset Data Button
  const btnReset = document.getElementById("btn-reset-data");
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      if (confirm("Are you sure you want to reset all academic data? This action cannot be undone.")) {
        localStorage.removeItem("student_mark_analyzer_state");
        loadFallbackData();
        showToast("All data reset to sample data.", "info");
        renderApp();
      }
    });
  }

  // Load Samples Button
  const btnLoadSample = document.getElementById("btn-load-sample");
  if (btnLoadSample) {
    btnLoadSample.addEventListener("click", () => {
      loadFallbackData();
      showToast("Sample semester records loaded.", "success");
      renderApp();
    });
  }

  // Import JSON configuration
  const importFile = document.getElementById("import-file");
  if (importFile) {
    importFile.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (imported && Array.isArray(imported.semesters) && imported.settings) {
            state.settings = imported.settings;
            state.semesters = imported.semesters;
            saveState();
            showToast("Academic records imported successfully!", "success");
            renderApp();
          } else {
            showToast("Invalid data structure in backup file.", "error");
          }
        } catch (err) {
          showToast("Failed to parse JSON backup file.", "error");
        }
      };
      reader.readAsText(file);
      importFile.value = ""; // Reset input
    });
  }

  // Target CGPA calculator input keyup
  const targetCgpaInput = document.getElementById("whatif-target-cgpa");
  if (targetCgpaInput) {
    targetCgpaInput.addEventListener("input", calculateWhatIf);
  }
  const remainingCreditsInput = document.getElementById("whatif-remaining-credits");
  if (remainingCreditsInput) {
    remainingCreditsInput.addEventListener("input", calculateWhatIf);
  }
}

// Switch Active Navigation Tabs
function switchTab(tabName) {
  state.activeTab = tabName;
  
  // Update sidebar highlighting
  document.querySelectorAll(".nav-item").forEach(item => {
    if (item.getAttribute("data-tab") === tabName) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // Update visible panel
  document.querySelectorAll(".tab-content").forEach(content => {
    if (content.id === `${tabName}-tab`) {
      content.classList.add("active");
    } else {
      content.classList.remove("active");
    }
  });

  // If entering dashboard, redraw charts to ensure correct sizing and context
  if (tabName === "dashboard") {
    setTimeout(renderDashboardCharts, 50);
  } else if (tabName === "what-if") {
    initWhatIfPlanner();
  }

  // Reset semester detail sub-views to grid list on tab switch
  if (tabName === "semesters") {
    state.selectedSemesterId = null;
    renderSemestersTab();
  }
}

// Close all active modals
function closeAllModals() {
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.classList.remove("active");
  });
}

// Open Specific Modal
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("active");
  }
}

// Main Render Hub
function renderApp() {
  renderProfileHeaders();
  renderDashboardKPIs();
  renderSemestersTab();
  initWhatIfPlanner();
  
  // Fill profile editing values
  const nameInput = document.getElementById("edit-student-name");
  if (nameInput) nameInput.value = state.settings.studentName || "";
  
  const courseInput = document.getElementById("edit-course-name");
  if (courseInput) courseInput.value = state.settings.courseName || "";
  
  const rollInput = document.getElementById("edit-roll-number");
  if (rollInput) rollInput.value = state.settings.rollNumber || "";
  
  const targetCgpaInput = document.getElementById("edit-target-cgpa");
  if (targetCgpaInput) targetCgpaInput.value = state.settings.targetCGPA || 0.0;
  
  const scaleInput = document.getElementById("edit-grading-system");
  if (scaleInput) scaleInput.value = state.settings.gradingSystem || "10-point";

  if (state.activeTab === "dashboard") {
    renderDashboardCharts();
  }
}

// Render Profile details in header and footer profile cards
function renderProfileHeaders() {
  const profileNames = document.querySelectorAll(".profile-name");
  profileNames.forEach(el => el.textContent = state.settings.studentName || "Guest Student");

  const profileRoles = document.querySelectorAll(".profile-role");
  profileRoles.forEach(el => el.textContent = state.settings.courseName || "General Course");

  const rollNumberText = document.getElementById("student-roll-header");
  if (rollNumberText) rollNumberText.textContent = state.settings.rollNumber ? `ID: ${state.settings.rollNumber}` : "";

  // Set avatar letter
  const avatarText = state.settings.studentName ? state.settings.studentName.charAt(0).toUpperCase() : "G";
  document.querySelectorAll(".profile-avatar").forEach(el => el.textContent = avatarText);
}

// Compute Subject Grades and Grade Points
function getSubjectSummary(subj, system) {
  const total = parseFloat(subj.internal || 0) + parseFloat(subj.external || 0);
  const max = parseFloat(subj.maxInternal || 30) + parseFloat(subj.maxExternal || 70);
  const percentage = max > 0 ? (total / max) * 100 : 0;
  
  let grade = "F";
  let points = 0.0;
  let status = "Fail";

  if (system === "10-point") {
    if (percentage >= 90) { grade = "O"; points = 10.0; }
    else if (percentage >= 80) { grade = "A+"; points = 9.0; }
    else if (percentage >= 70) { grade = "A"; points = 8.0; }
    else if (percentage >= 60) { grade = "B+"; points = 7.0; }
    else if (percentage >= 50) { grade = "B"; points = 6.0; }
    else if (percentage >= 40) { grade = "C"; points = 5.0; }
    else { grade = "F"; points = 0.0; }
    status = points >= 5.0 ? "Pass" : "Fail";
  } else {
    // 4-point GPA standard
    if (percentage >= 93) { grade = "A"; points = 4.0; }
    else if (percentage >= 90) { grade = "A-"; points = 3.7; }
    else if (percentage >= 87) { grade = "B+"; points = 3.3; }
    else if (percentage >= 83) { grade = "B"; points = 3.0; }
    else if (percentage >= 80) { grade = "B-"; points = 2.7; }
    else if (percentage >= 77) { grade = "C+"; points = 2.3; }
    else if (percentage >= 73) { grade = "C"; points = 2.0; }
    else if (percentage >= 70) { grade = "C-"; points = 1.7; }
    else if (percentage >= 60) { grade = "D"; points = 1.0; }
    else { grade = "F"; points = 0.0; }
    status = points >= 1.0 ? "Pass" : "Fail";
  }

  return { total, max, percentage, grade, points, status };
}

// Calculate Academic Statistics
function calculateStats() {
  const system = state.settings.gradingSystem;
  let totalCredits = 0;
  let totalWeightedPoints = 0;
  let totalSubjects = 0;
  let passedSubjects = 0;
  
  const semesterStats = state.semesters.map(sem => {
    let semCredits = 0;
    let semWeightedPoints = 0;
    let semTotal = 0;
    let semPassed = 0;

    sem.subjects.forEach(subj => {
      const summary = getSubjectSummary(subj, system);
      const cred = parseFloat(subj.credits || 0);
      
      semCredits += cred;
      semWeightedPoints += (summary.points * cred);
      semTotal++;
      
      if (summary.status === "Pass") {
        semPassed++;
      }
    });

    const sgpa = semCredits > 0 ? (semWeightedPoints / semCredits) : 0.0;
    
    totalCredits += semCredits;
    totalWeightedPoints += semWeightedPoints;
    totalSubjects += semTotal;
    passedSubjects += semPassed;

    return {
      id: sem.id,
      name: sem.name,
      sgpa: sgpa,
      credits: semCredits,
      totalSubjects: semTotal,
      passedSubjects: semPassed
    };
  });

  const cgpa = totalCredits > 0 ? (totalWeightedPoints / totalCredits) : 0.0;
  const passRate = totalSubjects > 0 ? (passedSubjects / totalSubjects) * 100 : 0.0;

  return {
    cgpa,
    totalCredits,
    totalSubjects,
    passedSubjects,
    passRate,
    semesters: semesterStats
  };
}

// Render Core KPI Indicators
function renderDashboardKPIs() {
  const stats = calculateStats();
  const scaleMax = state.settings.gradingSystem === "10-point" ? "10.00" : "4.00";
  
  // Cumulative GPA Card
  const cgpaVal = document.getElementById("kpi-cgpa-value");
  if (cgpaVal) cgpaVal.textContent = stats.cgpa.toFixed(2);
  const cgpaSub = document.getElementById("kpi-cgpa-subtext");
  if (cgpaSub) {
    cgpaSub.innerHTML = `<span>Scale: Max ${scaleMax}</span>`;
  }

  // Total Credits Card
  const creditsVal = document.getElementById("kpi-credits-value");
  if (creditsVal) creditsVal.textContent = stats.totalCredits;
  const creditsSub = document.getElementById("kpi-credits-subtext");
  if (creditsSub) {
    const semCount = state.semesters.length;
    creditsSub.textContent = `${semCount} semester${semCount === 1 ? '' : 's'} enrolled`;
  }

  // Pass Rate Card
  const passVal = document.getElementById("kpi-pass-value");
  if (passVal) passVal.textContent = `${stats.passRate.toFixed(1)}%`;
  const passSub = document.getElementById("kpi-pass-subtext");
  if (passSub) {
    passSub.textContent = `${stats.passedSubjects} of ${stats.totalSubjects} subjects passed`;
  }
}

// Get Theme Specific Text & Border Colors for Charts
function getChartColors() {
  const isDark = state.theme === "dark";
  return {
    text: isDark ? "#94a3b8" : "#64748b",
    grid: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(99, 102, 241, 0.06)",
    primary: isDark ? "#818cf8" : "#6366f1",
    primaryGlow: isDark ? "rgba(129, 140, 248, 0.15)" : "rgba(99, 102, 241, 0.1)",
    accent: isDark ? "#a78bfa" : "#8b5cf6"
  };
}

// Render Dashboard Visualizations
function renderDashboardCharts() {
  const stats = calculateStats();
  const colors = getChartColors();
  
  // 1. SGPA Progression Line Chart
  const sgpaCtx = document.getElementById("sgpaProgressChart");
  if (sgpaCtx) {
    if (sgpaChartInstance) {
      sgpaChartInstance.destroy();
    }

    const labels = stats.semesters.map(s => s.name);
    const data = stats.semesters.map(s => parseFloat(s.sgpa.toFixed(2)));

    sgpaChartInstance = new Chart(sgpaCtx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'SGPA',
          data: data,
          borderColor: colors.primary,
          backgroundColor: colors.primaryGlow,
          fill: true,
          tension: 0.35,
          borderWidth: 3,
          pointBackgroundColor: colors.accent,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            padding: 12,
            titleFont: { size: 13, family: 'Outfit' },
            bodyFont: { size: 13, family: 'Inter' }
          }
        },
        scales: {
          x: {
            grid: { color: colors.grid },
            ticks: { color: colors.text, font: { family: 'Outfit' } }
          },
          y: {
            min: 0,
            max: state.settings.gradingSystem === "10-point" ? 10 : 4,
            grid: { color: colors.grid },
            ticks: { color: colors.text, font: { family: 'Outfit' } }
          }
        }
      }
    });
  }

  // 2. Grade Distribution Bar Chart
  const gradeCtx = document.getElementById("gradeDistChart");
  if (gradeCtx) {
    if (gradeChartInstance) {
      gradeChartInstance.destroy();
    }

    const system = state.settings.gradingSystem;
    const gradesList = system === "10-point" 
      ? ["O", "A+", "A", "B+", "B", "C", "F"]
      : ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];

    // Count occurrences of each grade
    const counts = {};
    gradesList.forEach(g => counts[g] = 0);
    
    state.semesters.forEach(sem => {
      sem.subjects.forEach(subj => {
        const summary = getSubjectSummary(subj, system);
        if (counts[summary.grade] !== undefined) {
          counts[summary.grade]++;
        }
      });
    });

    const datasetData = gradesList.map(g => counts[g]);

    gradeChartInstance = new Chart(gradeCtx, {
      type: 'bar',
      data: {
        labels: gradesList,
        datasets: [{
          data: datasetData,
          backgroundColor: colors.primary,
          borderRadius: 6,
          borderWidth: 0,
          hoverBackgroundColor: colors.accent
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            padding: 12,
            titleFont: { size: 13, family: 'Outfit' },
            bodyFont: { size: 13, family: 'Inter' }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: colors.text, font: { family: 'Outfit', weight: 'bold' } }
          },
          y: {
            grid: { color: colors.grid },
            ticks: { color: colors.text, precision: 0, font: { family: 'Outfit' } }
          }
        }
      }
    });
  }
}

// Render Semester Tab View
function renderSemestersTab() {
  const semestersTab = document.getElementById("semesters-tab");
  if (!semestersTab) return;

  if (state.selectedSemesterId === null) {
    // Render Semesters Grid List
    renderSemestersGrid();
  } else {
    // Render Single Semester detail drawer
    renderSemesterDetail(state.selectedSemesterId);
  }
}

// Render Grid Layout for All Semesters
function renderSemestersGrid() {
  const container = document.getElementById("semesters-container");
  if (!container) return;

  const stats = calculateStats();

  let html = `
    <div class="semester-controls">
      <h3>Academic Semesters (${state.semesters.length})</h3>
      <button class="btn btn-primary" onclick="openAddSemesterModal()">
        <i class="fas fa-plus"></i> Add Semester
      </button>
    </div>
  `;

  if (state.semesters.length === 0) {
    html += `
      <div class="card" style="text-align: center; padding: 3rem 1.5rem;">
        <i class="fas fa-folder-open" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 1.5rem;"></i>
        <h4 style="margin-bottom: 0.5rem;">No Semester Records Found</h4>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem; max-width: 380px; margin-left: auto; margin-right: auto;">
          Get started by adding your first semester, or import configuration from setting files.
        </p>
        <button class="btn btn-primary" onclick="openAddSemesterModal()">Add Semester</button>
      </div>
    `;
    container.innerHTML = html;
    return;
  }

  html += `<div class="semesters-grid">`;
  
  state.semesters.forEach(sem => {
    const semStat = stats.semesters.find(s => s.id === sem.id) || { sgpa: 0, credits: 0, totalSubjects: 0 };
    
    html += `
      <div class="card semester-card" onclick="viewSemesterDetail('${sem.id}')">
        <div class="semester-card-header">
          <div>
            <h4 class="semester-name">${sem.name}</h4>
            <span class="badge ${semStat.totalSubjects > 0 ? 'badge-primary' : 'badge-warning'}" style="margin-top: 0.5rem;">
              ${semStat.totalSubjects} Subject${semStat.totalSubjects === 1 ? '' : 's'}
            </span>
          </div>
          <div style="display: flex; gap: 0.25rem;">
            <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); openEditSemesterModal('${sem.id}', '${sem.name}')" title="Edit Semester Name">
              <i class="fas fa-pen"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); deleteSemester('${sem.id}')" title="Delete Semester">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="semester-stats">
          <div class="sem-stat-item">
            <span class="sem-stat-label">Semester SGPA</span>
            <span class="sem-stat-val" style="color: var(--primary-color)">${semStat.sgpa.toFixed(2)}</span>
          </div>
          <div class="sem-stat-item">
            <span class="sem-stat-label">Total Credits</span>
            <span class="sem-stat-val">${semStat.credits}</span>
          </div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

// View Details of a Selected Semester
function viewSemesterDetail(semId) {
  state.selectedSemesterId = semId;
  renderSemestersTab();
}

// Render detail drawer for single semester
function renderSemesterDetail(semId) {
  const container = document.getElementById("semesters-container");
  if (!container) return;

  const sem = state.semesters.find(s => s.id === semId);
  if (!sem) {
    state.selectedSemesterId = null;
    renderSemestersGrid();
    return;
  }

  const system = state.settings.gradingSystem;
  
  // Calculate semester metrics
  let totalCredits = 0;
  let totalPoints = 0;
  let totalMaxMarks = 0;
  let totalObtainedMarks = 0;
  
  sem.subjects.forEach(subj => {
    const summary = getSubjectSummary(subj, system);
    totalCredits += parseFloat(subj.credits || 0);
    totalPoints += (summary.points * parseFloat(subj.credits || 0));
    totalMaxMarks += summary.max;
    totalObtainedMarks += summary.total;
  });

  const sgpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0.0;
  const avgPercentage = totalMaxMarks > 0 ? (totalObtainedMarks / totalMaxMarks) * 100 : 0.0;

  let html = `
    <div class="semester-detail-panel">
      <div>
        <a class="back-link" onclick="backToSemesters()"><i class="fas fa-arrow-left"></i> Back to Semesters List</a>
      </div>
      
      <div class="semester-detail-header">
        <div>
          <h2>${sem.name} Performance Details</h2>
          <p style="color: var(--text-secondary); margin-top: 0.25rem;">Detailed breakdown of marks, credits, and grade point achievements</p>
        </div>
        <div style="display: flex; gap: 0.75rem;">
          <button class="btn btn-secondary" onclick="openAddSubjectModal('${semId}')">
            <i class="fas fa-plus"></i> Add Subject
          </button>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="card kpi-card">
          <div class="kpi-icon-container" style="background: rgba(99, 102, 241, 0.1); color: var(--primary-color)">
            <i class="fas fa-graduation-cap"></i>
          </div>
          <div class="kpi-details">
            <span class="kpi-title">Semester SGPA</span>
            <span class="kpi-value" style="color: var(--primary-color)">${sgpa.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="card kpi-card">
          <div class="kpi-icon-container" style="background: rgba(14, 165, 233, 0.1); color: #0ea5e9">
            <i class="fas fa-book-open"></i>
          </div>
          <div class="kpi-details">
            <span class="kpi-title">Credits Registered</span>
            <span class="kpi-value">${totalCredits}</span>
          </div>
        </div>

        <div class="card kpi-card">
          <div class="kpi-icon-container" style="background: rgba(16, 185, 129, 0.1); color: var(--success)">
            <i class="fas fa-percent"></i>
          </div>
          <div class="kpi-details">
            <span class="kpi-title">Overall Marks</span>
            <span class="kpi-value">${avgPercentage.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 style="margin-bottom: 1rem;">Subject Marks Ledger</h3>
  `;

  if (sem.subjects.length === 0) {
    html += `
        <div style="text-align: center; padding: 2rem 0;">
          <i class="fas fa-clipboard" style="font-size: 2.5rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
          <p style="color: var(--text-secondary); margin-bottom: 1rem;">No subjects added to this semester yet.</p>
          <button class="btn btn-secondary btn-sm" onclick="openAddSubjectModal('${semId}')">Add First Subject</button>
        </div>
      </div>
    </div>
    `;
    container.innerHTML = html;
    return;
  }

  html += `
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Credits</th>
                <th>Internal Marks</th>
                <th>External Marks</th>
                <th>Total Marks</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th>Grade Points</th>
                <th>Status</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
  `;

  sem.subjects.forEach(subj => {
    const summary = getSubjectSummary(subj, system);
    
    html += `
      <tr>
        <td style="font-weight: 500;">${subj.name}</td>
        <td>${subj.credits}</td>
        <td>${subj.internal} <span style="font-size: 0.75rem; color: var(--text-secondary)">/ ${subj.maxInternal}</span></td>
        <td>${subj.external} <span style="font-size: 0.75rem; color: var(--text-secondary)">/ ${subj.maxExternal}</span></td>
        <td><strong>${summary.total}</strong> <span style="font-size: 0.75rem; color: var(--text-secondary)">/ ${summary.max}</span></td>
        <td>${summary.percentage.toFixed(1)}%</td>
        <td><span class="badge ${summary.grade === 'F' ? 'badge-danger' : 'badge-primary'}">${summary.grade}</span></td>
        <td><strong>${summary.points.toFixed(1)}</strong></td>
        <td>
          <span class="badge ${summary.status === 'Pass' ? 'badge-success' : 'badge-danger'}">
            ${summary.status}
          </span>
        </td>
        <td style="text-align: right;">
          <div style="display: inline-flex; gap: 0.25rem;">
            <button class="btn btn-secondary btn-sm" onclick="openEditSubjectModal('${semId}', '${subj.id}')" title="Edit Subject Details">
              <i class="fas fa-pen"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteSubject('${semId}', '${subj.id}')" title="Delete Subject">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  html += `
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function backToSemesters() {
  state.selectedSemesterId = null;
  renderSemestersTab();
}

// ----------------------------------------------------
// Semester CRUD
// ----------------------------------------------------
function openAddSemesterModal() {
  const form = document.getElementById("add-semester-form");
  if (form) form.reset();
  openModal("modal-add-semester");
}

const addSemForm = document.getElementById("add-semester-form");
if (addSemForm) {
  addSemForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("semester-name-input").value.trim();
    if (!name) return;

    const id = `sem-${Date.now()}`;
    state.semesters.push({
      id: id,
      name: name,
      subjects: []
    });

    saveState();
    closeAllModals();
    showToast(`Semester "${name}" created.`, "success");
    renderApp();
  });
}

function openEditSemesterModal(semId, currentName) {
  document.getElementById("edit-semester-id").value = semId;
  document.getElementById("edit-semester-name-input").value = currentName;
  openModal("modal-edit-semester");
}

const editSemForm = document.getElementById("edit-semester-form");
if (editSemForm) {
  editSemForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("edit-semester-id").value;
    const name = document.getElementById("edit-semester-name-input").value.trim();
    if (!name) return;

    const sem = state.semesters.find(s => s.id === id);
    if (sem) {
      sem.name = name;
      saveState();
      closeAllModals();
      showToast("Semester renamed successfully.", "success");
      renderApp();
    }
  });
}

function deleteSemester(semId) {
  const sem = state.semesters.find(s => s.id === semId);
  if (!sem) return;

  if (confirm(`Are you sure you want to delete ${sem.name} and all its subjects?`)) {
    state.semesters = state.semesters.filter(s => s.id !== semId);
    if (state.selectedSemesterId === semId) {
      state.selectedSemesterId = null;
    }
    saveState();
    showToast("Semester record deleted.", "info");
    renderApp();
  }
}

// ----------------------------------------------------
// Subject CRUD
// ----------------------------------------------------
function openAddSubjectModal(semId) {
  document.getElementById("add-subject-semester-id").value = semId;
  const form = document.getElementById("add-subject-form");
  if (form) form.reset();
  
  // Set defaults for maximum marks
  document.getElementById("subject-max-internal").value = 30;
  document.getElementById("subject-max-external").value = 70;
  
  openModal("modal-add-subject");
}

const addSubjForm = document.getElementById("add-subject-form");
if (addSubjForm) {
  addSubjForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const semId = document.getElementById("add-subject-semester-id").value;
    const name = document.getElementById("subject-name").value.trim();
    const credits = parseInt(document.getElementById("subject-credits").value) || 0;
    const internal = parseFloat(document.getElementById("subject-internal").value) || 0;
    const external = parseFloat(document.getElementById("subject-external").value) || 0;
    const maxInternal = parseFloat(document.getElementById("subject-max-internal").value) || 30;
    const maxExternal = parseFloat(document.getElementById("subject-max-external").value) || 70;

    if (!name) return;

    // Validate marks vs max marks
    if (internal > maxInternal || external > maxExternal) {
      alert("Obtained marks cannot exceed maximum allowed marks!");
      return;
    }

    const sem = state.semesters.find(s => s.id === semId);
    if (sem) {
      sem.subjects.push({
        id: `subj-${Date.now()}`,
        name,
        credits,
        internal,
        external,
        maxInternal,
        maxExternal
      });

      saveState();
      closeAllModals();
      showToast(`Subject "${name}" added.`, "success");
      renderApp();
    }
  });
}

function openEditSubjectModal(semId, subjId) {
  const sem = state.semesters.find(s => s.id === semId);
  if (!sem) return;
  const subj = sem.subjects.find(s => s.id === subjId);
  if (!subj) return;

  document.getElementById("edit-subject-semester-id").value = semId;
  document.getElementById("edit-subject-id").value = subjId;
  document.getElementById("edit-subject-name").value = subj.name;
  document.getElementById("edit-subject-credits").value = subj.credits;
  document.getElementById("edit-subject-internal").value = subj.internal;
  document.getElementById("edit-subject-external").value = subj.external;
  document.getElementById("edit-subject-max-internal").value = subj.maxInternal || 30;
  document.getElementById("edit-subject-max-external").value = subj.maxExternal || 70;

  openModal("modal-edit-subject");
}

const editSubjForm = document.getElementById("edit-subject-form");
if (editSubjForm) {
  editSubjForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const semId = document.getElementById("edit-subject-semester-id").value;
    const subjId = document.getElementById("edit-subject-id").value;
    
    const name = document.getElementById("edit-subject-name").value.trim();
    const credits = parseInt(document.getElementById("edit-subject-credits").value) || 0;
    const internal = parseFloat(document.getElementById("edit-subject-internal").value) || 0;
    const external = parseFloat(document.getElementById("edit-subject-external").value) || 0;
    const maxInternal = parseFloat(document.getElementById("edit-subject-max-internal").value) || 30;
    const maxExternal = parseFloat(document.getElementById("edit-subject-max-external").value) || 70;

    if (!name) return;
    
    if (internal > maxInternal || external > maxExternal) {
      alert("Obtained marks cannot exceed maximum allowed marks!");
      return;
    }

    const sem = state.semesters.find(s => s.id === semId);
    if (sem) {
      const subj = sem.subjects.find(s => s.id === subjId);
      if (subj) {
        subj.name = name;
        subj.credits = credits;
        subj.internal = internal;
        subj.external = external;
        subj.maxInternal = maxInternal;
        subj.maxExternal = maxExternal;

        saveState();
        closeAllModals();
        showToast(`Subject "${name}" updated.`, "success");
        renderApp();
      }
    }
  });
}

function deleteSubject(semId, subjId) {
  const sem = state.semesters.find(s => s.id === semId);
  if (!sem) return;
  const subj = sem.subjects.find(s => s.id === subjId);
  if (!subj) return;

  if (confirm(`Are you sure you want to delete the subject "${subj.name}"?`)) {
    sem.subjects = sem.subjects.filter(s => s.id !== subjId);
    saveState();
    showToast("Subject removed.", "info");
    renderApp();
  }
}

// ----------------------------------------------------
// What-If Target CGPA Planner
// ----------------------------------------------------
function initWhatIfPlanner() {
  const stats = calculateStats();
  
  const currentCgpaEl = document.getElementById("whatif-current-cgpa");
  if (currentCgpaEl) currentCgpaEl.textContent = stats.cgpa.toFixed(2);
  
  const completedCreditsEl = document.getElementById("whatif-completed-credits");
  if (completedCreditsEl) completedCreditsEl.textContent = stats.totalCredits;

  const targetInput = document.getElementById("whatif-target-cgpa");
  if (targetInput && !targetInput.value) {
    targetInput.value = state.settings.targetCGPA || 8.0;
  }

  const remainingInput = document.getElementById("whatif-remaining-credits");
  if (remainingInput && !remainingInput.value) {
    // Predict average credits of completed semesters for remaining 4 semesters as default
    const averageSemCredits = state.semesters.length > 0 ? (stats.totalCredits / state.semesters.length) : 20;
    remainingInput.value = Math.round(averageSemCredits * 4); // assume 4 remaining semesters
  }

  calculateWhatIf();
}

function calculateWhatIf() {
  const stats = calculateStats();
  const targetCGPA = parseFloat(document.getElementById("whatif-target-cgpa").value) || 0;
  const remainingCredits = parseFloat(document.getElementById("whatif-remaining-credits").value) || 0;
  const system = state.settings.gradingSystem;
  const maxScore = system === "10-point" ? 10.0 : 4.0;

  if (targetCGPA <= 0 || remainingCredits <= 0) {
    updateWhatIfDisplay(0, "Invalid settings", "warning");
    return;
  }

  const completedCredits = stats.totalCredits;
  const completedPoints = stats.cgpa * completedCredits;
  
  const totalCredits = completedCredits + remainingCredits;
  const requiredPointsTotal = targetCGPA * totalCredits;
  const neededPoints = requiredPointsTotal - completedPoints;
  const requiredGPA = remainingCredits > 0 ? (neededPoints / remainingCredits) : 0;

  let feedbackMsg = "";
  let feedbackClass = "neutral";
  
  if (requiredGPA <= 0) {
    feedbackMsg = `You've already surpassed this goal! You need a GPA of 0.00 in remaining semesters to maintain a ${targetCGPA.toFixed(2)} CGPA.`;
    feedbackClass = "success";
  } else if (requiredGPA > maxScore) {
    feedbackMsg = `Mathematically impossible. You need a GPA of ${requiredGPA.toFixed(2)} which exceeds the grading limit of ${maxScore}. Set a lower target.`;
    feedbackClass = "danger";
  } else if (requiredGPA >= (maxScore * 0.9)) {
    feedbackMsg = `Extremely challenging! Requires an average GPA of ${requiredGPA.toFixed(2)}. Perfect or near-perfect grades are necessary.`;
    feedbackClass = "warning";
  } else if (requiredGPA >= (maxScore * 0.75)) {
    feedbackMsg = `Achievable with focus! Requires a solid average GPA of ${requiredGPA.toFixed(2)} across upcoming courses.`;
    feedbackClass = "primary";
  } else {
    feedbackMsg = `Highly realistic! You need an average GPA of ${requiredGPA.toFixed(2)} to secure your target CGPA of ${targetCGPA.toFixed(2)}.`;
    feedbackClass = "success";
  }

  updateWhatIfDisplay(requiredGPA, feedbackMsg, feedbackClass, targetCGPA);
}

function updateWhatIfDisplay(requiredGPA, message, statusClass, target) {
  const reqGpaValEl = document.getElementById("whatif-required-gpa-val");
  if (reqGpaValEl) {
    reqGpaValEl.textContent = requiredGPA <= 0 ? "0.00" : requiredGPA.toFixed(2);
    // Apply text coloring based on status
    reqGpaValEl.style.backgroundImage = `var(--primary-gradient)`;
    if (statusClass === "danger") {
      reqGpaValEl.style.backgroundImage = `none`;
      reqGpaValEl.style.color = `var(--danger)`;
    } else if (statusClass === "warning") {
      reqGpaValEl.style.backgroundImage = `none`;
      reqGpaValEl.style.color = `var(--warning)`;
    } else if (statusClass === "success") {
      reqGpaValEl.style.backgroundImage = `none`;
      reqGpaValEl.style.color = `var(--success)`;
    } else {
      reqGpaValEl.style.color = ``;
      reqGpaValEl.style.backgroundImage = ``;
    }
  }

  const feedbackTextEl = document.getElementById("whatif-feedback-text");
  if (feedbackTextEl) {
    feedbackTextEl.textContent = message;
  }

  // Update SVG Gauge
  const gaugeFill = document.querySelector(".gauge-fill");
  const gaugeValEl = document.querySelector(".gauge-val");
  if (gaugeFill && gaugeValEl) {
    const stats = calculateStats();
    const system = state.settings.gradingSystem;
    const maxVal = system === "10-point" ? 10.0 : 4.0;
    
    // Set text display
    gaugeValEl.textContent = stats.cgpa.toFixed(2);
    
    // Circle circumference is 2 * Math.PI * r = 2 * 3.1415 * 80 = 502
    const totalCircumference = 502;
    const percentage = Math.min(Math.max(stats.cgpa / maxVal, 0), 1);
    const strokeOffset = totalCircumference - (percentage * totalCircumference);
    gaugeFill.style.strokeDashoffset = strokeOffset;
  }
}

// ----------------------------------------------------
// Toast Notification Engine
// ----------------------------------------------------
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let iconClass = "fa-info-circle";
  if (type === "success") iconClass = "fa-check-circle";
  if (type === "error") iconClass = "fa-exclamation-circle";
  if (type === "warning") iconClass = "fa-exclamation-triangle";

  toast.innerHTML = `
    <i class="fas ${iconClass}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Auto remove toast after 4s
  setTimeout(() => {
    toast.classList.add("hide");
    toast.addEventListener("animationend", () => {
      toast.remove();
    });
  }, 4000);
}

// ----------------------------------------------------
// Export Data Utilities
// ----------------------------------------------------
function exportJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `student_marks_${state.settings.studentName.replace(/\s+/g, '_').toLowerCase()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast("Academic records exported as JSON file.", "success");
}

function exportCSV() {
  const system = state.settings.gradingSystem;
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Semester,Subject Name,Credits,Internal Marks,Max Internal,External Marks,Max External,Total Marks,Percentage,Grade,Grade Points,Status\n";

  state.semesters.forEach(sem => {
    sem.subjects.forEach(subj => {
      const summary = getSubjectSummary(subj, system);
      const row = [
        sem.name,
        `"${subj.name}"`,
        subj.credits,
        subj.internal,
        subj.maxInternal || 30,
        subj.external,
        subj.maxExternal || 70,
        summary.total,
        `${summary.percentage.toFixed(2)}%`,
        summary.grade,
        summary.points.toFixed(1),
        summary.status
      ].join(",");
      csvContent += row + "\n";
    });
  });

  const encodedUri = encodeURI(csvContent);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", encodedUri);
  downloadAnchor.setAttribute("download", `student_transcript_${state.settings.studentName.replace(/\s+/g, '_').toLowerCase()}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast("Academic transcript exported as CSV.", "success");
}

function printTranscript() {
  window.print();
}
