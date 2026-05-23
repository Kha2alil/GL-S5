# Student Performance Dashboard — GL S5 / S6

A web-based grade tracking and performance analytics dashboard for 3rd Year **Génie Logiciel** (Software Engineering) students. Built with vanilla HTML, CSS, and JavaScript — no dependencies required.

## Features

- **Semester Switching** — Toggle between S5 and S6 with live data switching
- **Grade Input** — Enter TD and Exam marks per module with configurable weight splits
- **Live Calculation** — Module averages, unit averages, and semester final grade computed in real time
- **Weighted Formula** — Each module uses its defined TD/Exam weight (e.g. 40%/60% or 33%/67%)
- **Performance Analytics** — Progress bars for each teaching unit (UF, UM, UT, UC, AT)
- **Academic Status** — Instant pass/fail recommendation (Admitted / Adjourned)
- **Dark / Light Theme** — Persistent toggle saved to `localStorage`
- **Data Persistence** — All grades saved per-semester in `localStorage` across sessions
- **Reset with Confirmation** — Custom modal dialog before clearing grades
- **Responsive Layout** — Adapts from desktop grid to single-column mobile view

## Architecture

```
index.html         →  Single-page dashboard layout
css/style.css      →  Design tokens, grid, cards, inputs, modal, responsive
js/units.js        →  Semester & module data definitions (S5, S6)
js/home.js         →  Controller: rendering, calculation, persistence, theme, init
```

### Data Flow

1. **`units.js`** defines the `semesterData` object — an immutable schema of semesters, units, and modules with coefficients and weight splits.
2. **`home.js`** reads `semesterData` to dynamically render the grade input table and analytics bars.
3. User input triggers `calculate()`, which computes:
   - **Module average** = `TD × tdWeight + Exam × examWeight`
   - **Unit average** = `Σ(modAvg × coeff) / Σ(coeff)`
   - **Semester final** = `Σ(all modAvg × coeff) / Σ(all coeff)`
4. Grades are auto-saved to `localStorage` under keys `gl_grades_s5` / `gl_grades_s6`.

### Adding a New Semester

Add a new key to `semesterData` in `js/units.js` following the existing schema:

```js
s7: {
    label: 'Semester 7',
    subtitle: '4th Year GL · S7',
    accentVar: '--accent-s7',
    units: [
        {
            id: 'u1',
            name: 'Unit Name',
            tag: 'XX',
            modules: [
                { id: 'mod1', name: 'Module Name', coeff: 4, tdWeight: 0.40, examWeight: 0.60 }
            ]
        }
    ]
}
```

A corresponding CSS accent variable (e.g. `--accent-s7`) must be added in `style.css`.

## Usage

Clone or download the project and open `index.html` in any modern browser:

```bash
git clone <repo-url>
cd s5
start index.html
```

No build tools, bundlers, or package managers are required.

## localStorage Keys

| Key                 | Purpose                        |
| ------------------- | ------------------------------ |
| `gl_theme`          | `'dark'` or `'light'`          |
| `gl_active_semester`| Last active semester key       |
| `gl_grades_s5`      | S5 grade data (JSON)           |
| `gl_grades_s6`      | S6 grade data (JSON)           |

## Modules (S5)

| Unit             | Modules              | Coeff |
| ---------------- | -------------------- | ----- |
| Fundamental (UF) | Génie Logiciel 2     | 4     |
|                  | Gestion de Projet    | 2     |
| Methodological (UM) | DAAW               | 1     |
|                  | Test et Qualité      | 2     |
| Transversal (UT) | DAC                  | 2     |
|                  | TABD                 | 2     |

## Modules (S6)

| Unit               | Modules   | Coeff |
| ------------------ | --------- | ----- |
| Core & Applied (UC)| MEL       | 1     |
|                    | AR        | 2     |
|                    | DLI       | 1     |
| Atelier (AT)       | Atelier   | 4     |

## License

MIT
