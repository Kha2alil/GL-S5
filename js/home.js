const tableBody = document.getElementById('tableBody');

function init() {
    renderTable();
    loadData();
    
    if(localStorage.getItem('theme') === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

function renderTable() {
    tableBody.innerHTML = '';
    units.forEach(unit => {
        const unitRow = document.createElement('tr');
        unitRow.className = 'unit-row';
        unitRow.innerHTML = `<td colspan="5">${unit.name}</td>`;
        tableBody.appendChild(unitRow);

        unit.modules.forEach(mod => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight:500;">${mod.name}</td>
                <td style="color:var(--text-muted);">${mod.coeff}</td>
                <td><input type="number" data-id="${mod.id}" data-type="td" class="grade-input" placeholder="-"></td>
                <td><input type="number" data-id="${mod.id}" data-type="exam" class="grade-input" placeholder="-"></td>
                <td id="avg-${mod.id}" style="font-weight:bold; color:var(--text-muted);">0.00</td>
            `;
            tableBody.appendChild(tr);
        });
    });

    document.querySelectorAll('.grade-input').forEach(i => {
        i.addEventListener('input', () => { calculate(); save(); });
    });
}

function calculate() {
    let totalScore = 0;
    let totalCoeff = 0;

    units.forEach(unit => {
        let unitScore = 0;
        let unitCoeff = 0;

        unit.modules.forEach(mod => {
            const td = getVal(mod.id, 'td');
            const exam = getVal(mod.id, 'exam');
            const modAvg = (td * 0.4) + (exam * 0.6);
            
            document.getElementById(`avg-${mod.id}`).textContent = modAvg.toFixed(2);
            document.getElementById(`avg-${mod.id}`).style.color = modAvg >= 10 ? 'var(--success)' : 'var(--danger)';

            unitScore += (modAvg * mod.coeff);
            unitCoeff += mod.coeff;
        });

        const unitAvg = unitCoeff ? (unitScore / unitCoeff) : 0;
        document.getElementById(`${unit.id}-score`).textContent = unitAvg.toFixed(2);
        document.getElementById(`${unit.id}-bar`).style.width = `${Math.min(unitAvg * 5, 100)}%`; // *5 because 20*5=100%
        document.getElementById(`${unit.id}-bar`).style.backgroundColor = unitAvg >= 10 ? 'var(--success)' : 'var(--danger)';

        totalScore += unitScore;
        totalCoeff += unitCoeff;
    });

    const finalAvg = totalCoeff ? (totalScore / totalCoeff) : 0;
    const finalEl = document.getElementById('finalScore');
    finalEl.textContent = finalAvg.toFixed(2);
    finalEl.style.color = finalAvg >= 10 ? 'var(--success)' : 'var(--danger)';

    const badge = document.getElementById('statusBadge');
    const msg = document.getElementById('statusMsg');
    
    if (finalAvg >= 10) {
        badge.textContent = "ADMITTED";
        badge.style.backgroundColor = "#dcfce7"; // light green
        badge.style.color = "#166534";
        msg.textContent = "Great job! You passed the semester.";
    } else {
        badge.textContent = "ADJOURNED";
        badge.style.backgroundColor = "#fee2e2"; // light red
        badge.style.color = "#991b1b";
        msg.textContent = "Keep pushing. Review your weak modules.";
    }
}

function getVal(id, type) {
    const el = document.querySelector(`input[data-id="${id}"][data-type="${type}"]`);
    return el ? (parseFloat(el.value) || 0) : 0;
}

function save() {
    const data = {};
    document.querySelectorAll('.grade-input').forEach(i => {
        data[`${i.dataset.id}-${i.dataset.type}`] = i.value;
    });
    localStorage.setItem('gl_dashboard_data', JSON.stringify(data));
}

function loadData() {
    const data = JSON.parse(localStorage.getItem('gl_dashboard_data') || '{}');
    for (let key in data) {
        const [id, type] = key.split('-');
        const el = document.querySelector(`input[data-id="${id}"][data-type="${type}"]`);
        if(el) el.value = data[key];
    }
    calculate();
}

function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    html.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
}

init();