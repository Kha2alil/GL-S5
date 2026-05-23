/**
 * units.js — Semester Module Definitions
 * ----------------------------------------
 * Central data store for all semester configurations.
 * To add a new semester: add a new key under `semesterData`
 * following the same schema (label, subtitle, units[]).
 *
 * Module schema:
 *   id         {string}  — unique DOM-safe identifier
 *   name       {string}  — display name
 *   coeff      {number}  — weighting coefficient
 *   tdWeight   {number}  — TD/TP contribution  (0–1)
 *   examWeight {number}  — Exam contribution   (0–1)
 *                          tdWeight + examWeight must equal 1
 *
 * Grade formula per module:
 *   avg = (TD × tdWeight) + (Exam × examWeight)
 *
 * Unit average = Σ(modAvg × coeff) / Σ(coeff)
 * Semester final = Σ(all modAvg × coeff) / Σ(all coeff)
 */

const semesterData = {

    // ─── Semester 5 ───────────────────────────────────────────────
    s5: {
        label: 'Semester 5',
        subtitle: '3rd Year GL · S5',
        accentVar: '--accent-s5',
        units: [
            {
                id: 'u1',
                name: 'Fundamental',
                tag: 'UF',
                modules: [
                    { id: 'gl2',  name: 'Génie Logiciel 2', coeff: 4, tdWeight: 0.40, examWeight: 0.60 },
                    { id: 'gpl',  name: 'Gestion de Projet', coeff: 2, tdWeight: 0.40, examWeight: 0.60 }
                ]
            },
            {
                id: 'u2',
                name: 'Methodological',
                tag: 'UM',
                modules: [
                    { id: 'daaw', name: 'DAAW',            coeff: 1, tdWeight: 0.40, examWeight: 0.60 },
                    { id: 'tql',  name: 'Test et Qualité', coeff: 2, tdWeight: 0.40, examWeight: 0.60 }
                ]
            },
            {
                id: 'u3',
                name: 'Transversal',
                tag: 'UT',
                modules: [
                    { id: 'dac',  name: 'DAC',  coeff: 2, tdWeight: 0.40, examWeight: 0.60 },
                    { id: 'tabd', name: 'TABD', coeff: 2, tdWeight: 0.40, examWeight: 0.60 }
                ]
            }
        ]
    },

    // ─── Semester 6 ───────────────────────────────────────────────
    s6: {
        label: 'Semester 6',
        subtitle: '3rd Year GL · S6',
        accentVar: '--accent-s6',
        units: [
            {
                id: 'u1',
                name: 'Core & Applied',
                tag: 'UC',
                modules: [
                    { id: 'mel', name: 'MEL', coeff: 1, tdWeight: 0.33, examWeight: 0.67 },
                    { id: 'ar',  name: 'AR',  coeff: 2, tdWeight: 0.40, examWeight: 0.60 },
                    { id: 'dli', name: 'DLI', coeff: 1, tdWeight: 0.40, examWeight: 0.60 }
                ]
            },
            {
                id: 'u2',
                name: 'Atelier',
                tag: 'AT',
                modules: [
                    { id: 'atelier', name: 'Atelier', coeff: 4, tdWeight: 0.40, examWeight: 0.60 }
                ]
            }
        ]
    }

    /*
     * ─── Adding a future semester (example template) ──────────────
     * s7: {
     *     label: 'Semester 7',
     *     subtitle: '4th Year GL · S7',
     *     accentVar: '--accent-s7',
     *     units: [
     *         {
     *             id: 'u1', name: 'Unit Name', tag: 'XX',
     *             modules: [
     *                 { id: 'mod1', name: 'Module Name', coeff: N },
     *             ]
     *         }
     *     ]
     * }
     */
};
