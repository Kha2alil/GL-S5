/**
 * home.js — Dashboard Controller
 * --------------------------------
 * Manages semester switching, dynamic UI rendering,
 * grade calculation, input validation, and persistence.
 *
 * Architecture:
 *  · currentSemester  — tracks active semester key ('s5' | 's6' | ...)
 *  · renderAnalytics  — builds unit progress bars from active semester data
 *  · renderTable      — builds the grade input table from active semester data
 *  · calculate        — computes module/unit/final averages and updates UI
 *  · save / loadData  — persists grades per-semester in localStorage
 *
 * localStorage keys:
 *  · 'gl_theme'               — 'light' | 'dark'
 *  · 'gl_active_semester'     — last active semester key
 *  · 'gl_grades_s5'           — JSON grade data for S5
 *  · 'gl_grades_s6'           — JSON grade data for S6
 */

// ─── State ────────────────────────────────────────────────────────────────────
let currentSemester = 's5';

// ─── DOM References ───────────────────────────────────────────────────────────
const tableBody         = document.getElementById('tableBody');
const analyticsContainer = document.getElementById('analyticsContainer');
const semesterLabel     = document.getElementById('semesterLabel');
const semesterSubtitle  = document.getElementById('semesterSubtitle');

// ─── Semester Switching ───────────────────────────────────────────────────────

/**
 * Switches the active semester, re-renders the UI, and loads saved grades.
 * @param {string} sem — semester key matching a key in semesterData (e.g. 's5')
 */
function switchSemester(sem) {
    if (!semesterData[sem] || sem === currentSemester) return;

    currentSemester = sem;
    localStorage.setItem('gl_active_semester', sem);

    // Update switcher button states
    document.querySelectorAll('.sem-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.sem === sem);
    });

    // Update header text
    const semConfig = semesterData[sem];
    semesterLabel.textContent    = semConfig.label;
    semesterSubtitle.textContent = semConfig.subtitle;

    // Update accent color on root
    updateAccent(sem);

    // Rebuild dynamic sections
    renderAnalytics();
    renderTable();
    loadData();
}

/**
 * Sets the semester accent CSS variable on <html> so progress bars
 * and active elements reflect which semester is open.
 * @param {string} sem
 */
function updateAccent(sem) {
    const html = document.documentElement;
    if (sem === 's6') {
        html.setAttribute('data-semester', 's6');
    } else {
        html.setAttribute('data-semester', 's5');
    }
}

// ─── Dynamic Rendering ────────────────────────────────────────────────────────

/**
 * Renders unit progress bars for the active semester.
 * Called on init and every semester switch.
 */
function renderAnalytics() {
    const units = semesterData[currentSemester].units;
    analyticsContainer.innerHTML = '';

    units.forEach(unit => {
        const div = document.createElement('div');
        div.className = 'unit-bar-container';
        div.innerHTML = `
            <div class="unit-label">
                <span>${unit.name} <span class="unit-tag">${unit.tag}</span></span>
                <span id="${unit.id}-score" class="unit-score-val">0.00</span>
            </div>
            <div class="progress-bg">
                <div id="${unit.id}-bar" class="progress-fill"></div>
            </div>
        `;
        analyticsContainer.appendChild(div);
    });
}

/**
 * Renders the grade input table for the active semester.
 * Attaches input listeners for live calculation + autosave.
 */
function renderTable() {
    const units = semesterData[currentSemester].units;
    tableBody.innerHTML = '';

    units.forEach(unit => {
        // Unit header row
        const unitRow = document.createElement('tr');
        unitRow.className = 'unit-row';
        unitRow.innerHTML = `
            <td colspan="5">
                <span class="unit-row-label">${unit.name}</span>
                <span class="unit-row-tag">${unit.tag}</span>
            </td>
        `;
        tableBody.appendChild(unitRow);

        unit.modules.forEach(mod => {
            const tdPct   = Math.round(mod.tdWeight   * 100);
            const examPct = Math.round(mod.examWeight * 100);
            const tr = document.createElement('tr');
            tr.className = 'module-row';
            tr.innerHTML = `
                <td class="mod-name">${mod.name}</td>
                <td class="mod-coeff">${mod.coeff}</td>
                <td>
                    <input
                        type="number"
                        data-id="${mod.id}"
                        data-type="td"
                        class="grade-input"
                        placeholder="—"
                        min="0" max="20" step="0.25"
                        aria-label="${mod.name} TD grade"
                    >
                    <span class="weight-hint">×${tdPct}%</span>
                </td>
                <td>
                    <input
                        type="number"
                        data-id="${mod.id}"
                        data-type="exam"
                        class="grade-input"
                        placeholder="—"
                        min="0" max="20" step="0.25"
                        aria-label="${mod.name} Exam grade"
                    >
                    <span class="weight-hint">×${examPct}%</span>
                </td>
                <td id="avg-${mod.id}" class="mod-avg" aria-live="polite">—</td>
            `;
            tableBody.appendChild(tr);
        });
    });

    // Attach event listeners
    document.querySelectorAll('.grade-input').forEach(input => {
        input.addEventListener('input', () => {
            validateInput(input);
            calculate();
            save();
        });

        // Clear red border on focus
        input.addEventListener('focus', () => {
            input.style.borderColor = '';
            input.style.boxShadow = '';
        });
    });
}

// ─── Input Validation ─────────────────────────────────────────────────────────

/**
 * Validates a grade input (must be 0–20). Marks invalid inputs visually.
 * @param {HTMLInputElement} input
 * @returns {boolean} — true if valid or empty
 */
function validateInput(input) {
    const raw = input.value.trim();
    if (raw === '') {
        clearInputError(input);
        return true;
    }
    const val = parseFloat(raw);
    const isValid = !isNaN(val) && val >= 0 && val <= 20;
    if (!isValid) {
        input.style.borderColor = 'var(--danger)';
        input.style.boxShadow   = '0 0 0 2px rgba(239,68,68,0.2)';
    } else {
        clearInputError(input);
    }
    return isValid;
}

function clearInputError(input) {
    input.style.borderColor = '';
    input.style.boxShadow   = '';
}

/**
 * Validates all inputs in the current table.
 * @returns {boolean} — true if all inputs are valid
 */
function validateAll() {
    let allValid = true;
    document.querySelectorAll('.grade-input').forEach(input => {
        if (!validateInput(input)) allValid = false;
    });
    return allValid;
}

// ─── Grade Calculation ────────────────────────────────────────────────────────

/**
 * Reads all inputs for the active semester, computes:
 *  · Per-module weighted average  (TD×0.4 + Exam×0.6)
 *  · Per-unit weighted average    (Σ modAvg×coeff / Σ coeff)
 *  · Semester final average       (Σ all modAvg×coeff / Σ all coeff)
 * Updates all display elements accordingly.
 */
function calculate() {
    const units = semesterData[currentSemester].units;
    let totalScore = 0;
    let totalCoeff = 0;
    let hasAnyInput = false;

    units.forEach(unit => {
        let unitScore = 0;
        let unitCoeff = 0;

        unit.modules.forEach(mod => {
            const tdVal   = getClampedVal(mod.id, 'td');
            const examVal = getClampedVal(mod.id, 'exam');
            const hasTD   = hasValue(mod.id, 'td');
            const hasExam = hasValue(mod.id, 'exam');
            const hasThis = hasTD || hasExam;

            if (hasThis) hasAnyInput = true;

            // Formula: weights defined per-module in units.js
            const modAvg = (tdVal * mod.tdWeight) + (examVal * mod.examWeight);

            // Update module average cell
            const avgEl = document.getElementById(`avg-${mod.id}`);
            if (avgEl) {
                if (hasThis) {
                    avgEl.textContent  = modAvg.toFixed(2);
                    avgEl.className    = 'mod-avg ' + (modAvg >= 10 ? 'pass' : 'fail');
                } else {
                    avgEl.textContent = '—';
                    avgEl.className   = 'mod-avg';
                }
            }

            unitScore += modAvg * mod.coeff;
            unitCoeff += mod.coeff;
        });

        // Unit average
        const unitAvg = unitCoeff ? unitScore / unitCoeff : 0;
        const scoreEl = document.getElementById(`${unit.id}-score`);
        const barEl   = document.getElementById(`${unit.id}-bar`);

        if (scoreEl) scoreEl.textContent = unitAvg.toFixed(2);
        if (barEl) {
            barEl.style.width           = `${Math.min(unitAvg * 5, 100)}%`;
            barEl.style.backgroundColor = unitAvg >= 10 ? 'var(--success)' : 'var(--danger)';
        }

        totalScore += unitScore;
        totalCoeff += unitCoeff;
    });

    // Semester final average
    const finalAvg = totalCoeff ? totalScore / totalCoeff : 0;
    updateFinalScore(finalAvg, hasAnyInput);
    updateStatusBadge(finalAvg, hasAnyInput);
}

/**
 * Updates the big final score display.
 */
function updateFinalScore(avg, hasData) {
    const el = document.getElementById('finalScore');
    if (!el) return;

    if (!hasData) {
        el.textContent = '—';
        el.className   = 'big-number';
    } else {
        el.textContent = avg.toFixed(2);
        el.className   = 'big-number ' + (avg >= 10 ? 'pass' : 'fail');
    }
}

/**
 * Updates the status badge and recommendation message.
 */
function updateStatusBadge(avg, hasData) {
    const badge = document.getElementById('statusBadge');
    const msg   = document.getElementById('statusMsg');
    if (!badge || !msg) return;

    if (!hasData) {
        badge.textContent = 'PENDING';
        badge.className   = 'status-badge pending';
        msg.textContent   = 'Enter your grades to see your academic standing.';
        return;
    }

    if (avg >= 10) {
        badge.textContent = 'ADMITTED';
        badge.className   = 'status-badge admitted';
        msg.textContent   = `Great work! You passed ${semesterData[currentSemester].label} with ${avg.toFixed(2)}/20.`;
    } else {
        badge.textContent = 'ADJOURNED';
        badge.className   = 'status-badge adjourned';
        msg.textContent   = `You need ${(10 - avg).toFixed(2)} more points to pass. Review your weak modules.`;
    }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns a clamped grade value [0, 20] for a given module input.
 */
function getClampedVal(id, type) {
    const el = document.querySelector(`input[data-id="${id}"][data-type="${type}"]`);
    if (!el || el.value.trim() === '') return 0;
    return Math.min(20, Math.max(0, parseFloat(el.value) || 0));
}

/**
 * Returns true if a module input has a non-empty value.
 */
function hasValue(id, type) {
    const el = document.querySelector(`input[data-id="${id}"][data-type="${type}"]`);
    return el && el.value.trim() !== '';
}

// ─── Persistence ──────────────────────────────────────────────────────────────

/**
 * Saves all non-empty grade inputs to localStorage under the active semester key.
 * Key format: 'gl_grades_s5' | 'gl_grades_s6'
 */
function save() {
    const data = {};
    document.querySelectorAll('.grade-input').forEach(input => {
        if (input.value.trim() !== '') {
            data[`${input.dataset.id}-${input.dataset.type}`] = input.value;
        }
    });
    localStorage.setItem(`gl_grades_${currentSemester}`, JSON.stringify(data));
}

/**
 * Loads saved grades for the active semester from localStorage,
 * populates inputs, then recalculates.
 *
 * Also migrates legacy key 'gl_dashboard_data' to 'gl_grades_s5'
 * so returning users don't lose their S5 data.
 */
function loadData() {
    // One-time migration from old key format (S5 only)
    const legacyKey = 'gl_dashboard_data';
    const newS5Key  = 'gl_grades_s5';
    if (!localStorage.getItem(newS5Key) && localStorage.getItem(legacyKey)) {
        localStorage.setItem(newS5Key, localStorage.getItem(legacyKey));
        localStorage.removeItem(legacyKey);
    }

    const saved = JSON.parse(localStorage.getItem(`gl_grades_${currentSemester}`) || '{}');

    document.querySelectorAll('.grade-input').forEach(input => {
        const key = `${input.dataset.id}-${input.dataset.type}`;
        if (saved[key] !== undefined) {
            input.value = saved[key];
        } else {
            input.value = '';
        }
    });

    calculate();
}

/**
 * Shows a custom confirm modal and resolves with the user's choice.
 * @param {string} message
 * @returns {Promise<boolean>}
 */
function showConfirmModal(message) {
    return new Promise(resolve => {
        const overlay = document.getElementById('confirmOverlay');
        const msgEl   = document.getElementById('modalMessage');
        const confirmBtn = document.getElementById('modalConfirm');
        const cancelBtn  = document.getElementById('modalCancel');

        msgEl.textContent = message;
        overlay.classList.remove('hidden');

        const cleanup = () => {
            overlay.classList.add('hidden');
            confirmBtn.removeEventListener('click', onConfirm);
            cancelBtn.removeEventListener('click', onCancel);
        };

        const onConfirm = () => { cleanup(); resolve(true); };
        const onCancel  = () => { cleanup(); resolve(false); };

        confirmBtn.addEventListener('click', onConfirm);
        cancelBtn.addEventListener('click', onCancel);
    });
}

/**
 * Clears all grades for the currently active semester.
 * Called from the Reset button.
 */
async function resetCurrentSemester() {
    const ok = await showConfirmModal(`Reset all grades for ${semesterData[currentSemester].label}?`);
    if (!ok) return;
    localStorage.removeItem(`gl_grades_${currentSemester}`);
    document.querySelectorAll('.grade-input').forEach(input => {
        input.value = '';
        clearInputError(input);
    });
    calculate();
}

// ─── Theme ────────────────────────────────────────────────────────────────────

function toggleTheme() {
    const html    = document.documentElement;
    const isDark  = html.getAttribute('data-theme') === 'dark';
    const newMode = isDark ? 'light' : 'dark';
    html.setAttribute('data-theme', newMode);
    localStorage.setItem('gl_theme', newMode);
}

// ─── Initialisation ───────────────────────────────────────────────────────────

function init() {
    // Restore theme (default: dark)
    const savedTheme = localStorage.getItem('gl_theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Restore last active semester (default: 's5')
    const savedSem = localStorage.getItem('gl_active_semester');
    if (savedSem && semesterData[savedSem]) {
        currentSemester = savedSem;
    }

    // Sync switcher button states
    document.querySelectorAll('.sem-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.sem === currentSemester);
    });

    // Set accent and header
    updateAccent(currentSemester);
    const semConfig = semesterData[currentSemester];
    semesterLabel.textContent    = semConfig.label;
    semesterSubtitle.textContent = semConfig.subtitle;

    // Render dynamic sections and load saved data
    renderAnalytics();
    renderTable();
    loadData();
}

init();
