import { categories } from './conversions.js';
const tabPhysics = document.getElementById('tab-physics');
const tabPoly = document.getElementById('tab-poly');
const panelPhysics = document.getElementById('panel-physics');
const panelPoly = document.getElementById('panel-poly');
function renderMath(element, latexString) {
    if (window.MathJax && typeof MathJax.typesetClear === "function") {
        try {
            MathJax.typesetClear([element]);
        } catch (e) {
            console.error("MathJax typesetClear error:", e);
        }
    }
    
 
    element.innerHTML = latexString;
    
    if (window.MathJax && typeof MathJax.typesetPromise === "function") {
        try {
            MathJax.typesetPromise([element]).catch(err => console.error("MathJax promise error:", err));
        } catch (e) {
            console.error("MathJax typesetPromise exception:", e);
        }
    }
}

function formatScientificLaTeX(value) {
    if (value === 0) return "0 \\times 10^{0}";
    const exp = Math.floor(Math.log10(Math.abs(value)));
    const base = value / Math.pow(10, exp);
    const formattedBase = parseFloat(base.toFixed(4)).toString();
    return `${formattedBase} \\times 10^{${exp}}`;
}

tabPhysics.addEventListener('click', () => {
    panelPhysics.classList.remove('hidden');
    panelPoly.classList.add('hidden');
    tabPhysics.className = 'px-5 py-2 rounded-xl text-xs font-medium transition-all bg-white/5 text-slate-100';
    tabPoly.className = 'px-5 py-2 rounded-xl text-xs font-medium transition-all text-slate-400 hover:text-slate-100';
    solvePhysics();
});

tabPoly.addEventListener('click', () => {
    panelPoly.classList.remove('hidden');
    panelPhysics.classList.add('hidden');
    tabPoly.className = 'px-5 py-2 rounded-xl text-xs font-medium transition-all bg-white/5 text-slate-100';
    tabPhysics.className = 'px-5 py-2 rounded-xl text-xs font-medium transition-all text-slate-400 hover:text-slate-100';
    solvePolynomial(); // Forzar recalculado de muestra
});

// --- LÓGICA DE FÓRMULAS DE FÍSICA ---
const selectEquation = document.getElementById('physics-equation');
const variablesContainer = document.getElementById('equation-variables');
const btnSolvePhysics = document.getElementById('btn-solve-physics');
const physicsOutput = document.getElementById('physics-output-latex');

const equations = {
    force_dist_time: {
        latex: "F = \\frac{m \\cdot d}{t^2}",
        vars: [
            { label: 'Masa (m)', symbol: 'm', category: 'mass', defaultVal: 59.43, defaultUnit: 'g' },
            { label: 'Distancia (d)', symbol: 'd', category: 'length', defaultVal: 0.008794, defaultUnit: 'm' },
            { label: 'Tiempo (t)', symbol: 't', category: 'time', defaultVal: 7060, defaultUnit: 's' }
        ],
        solve: (vars) => {
            const m = vars.m.siVal; // kg
            const d = vars.d.siVal; // m
            const t = vars.t.siVal; // s
            const result = (m * d) / Math.pow(t, 2);
            return {
                result,
                unit: 'N',
                steps: [
                    `m_{\\text{SI}} = ${vars.m.inputVal}\\text{ ${vars.m.inputUnit}} = ${formatScientificLaTeX(m)}\\text{ kg}`,
                    `d_{\\text{SI}} = ${vars.d.inputVal}\\text{ ${vars.d.inputUnit}} = ${formatScientificLaTeX(d)}\\text{ m}`,
                    `t_{\\text{SI}} = ${vars.t.inputVal}\\text{ ${vars.t.inputUnit}} = ${formatScientificLaTeX(t)}\\text{ s}`,
                    `F = \\frac{(${formatScientificLaTeX(m)}\\text{ kg}) \\cdot (${formatScientificLaTeX(d)}\\text{ m})}{(${formatScientificLaTeX(t)}\\text{ s})^2}`,
                    `F = ${formatScientificLaTeX(result)}\\text{ N}`
                ]
            };
        }
    },
    f_ma: {
        latex: "F = m \\cdot a",
        vars: [
            { label: 'Masa (m)', symbol: 'm', category: 'mass', defaultVal: 10, defaultUnit: 'kg' },
            { label: 'Aceleración (a)', symbol: 'a', category: 'length', defaultVal: 9.81, defaultUnit: 'm' }
        ],
        solve: (vars) => {
            const m = vars.m.siVal;
            const a = vars.a.siVal;
            const result = m * a;
            return {
                result,
                unit: 'N',
                steps: [
                    `m_{\\text{SI}} = ${formatScientificLaTeX(m)}\\text{ kg}`,
                    `a_{\\text{SI}} = ${formatScientificLaTeX(a)}\\text{ m/s}^2`,
                    `F = (${formatScientificLaTeX(m)}) \\cdot (${formatScientificLaTeX(a)})`,
                    `F = ${formatScientificLaTeX(result)}\\text{ N}`
                ]
            };
        }
    },
    energy_mc2: {
        latex: "E = m \\cdot c^2",
        vars: [
            { label: 'Masa (m)', symbol: 'm', category: 'mass', defaultVal: 1, defaultUnit: 'g' }
        ],
        solve: (vars) => {
            const m = vars.m.siVal;
            const c = 299792458;
            const result = m * Math.pow(c, 2);
            return {
                result,
                unit: 'J',
                steps: [
                    `m_{\\text{SI}} = ${formatScientificLaTeX(m)}\\text{ kg}`,
                    `c = 3.00 \\times 10^8\\text{ m/s}`,
                    `E = (${formatScientificLaTeX(m)}\\text{ kg}) \\cdot (3.00 \\times 10^8)^2`,
                    `E = ${formatScientificLaTeX(result)}\\text{ J}`
                ]
            };
        }
    }
};

function renderVariables() {
    const eqKey = selectEquation.value;
    const eq = equations[eqKey];
    variablesContainer.innerHTML = '';

    eq.vars.forEach(v => {
        const div = document.createElement('div');
        div.className = 'space-y-1.5';
        
        let unitOptions = '';
        Object.keys(categories[v.category].units).forEach(uKey => {
            const u = categories[v.category].units[uKey];
            const selected = uKey === v.defaultUnit ? 'selected' : '';
            unitOptions += `<option value="${uKey}" ${selected}>${u.symbol || uKey}</option>`;
        });

        div.innerHTML = `
            <label class="block text-[11px] font-mono text-slate-500 uppercase">${v.label}</label>
            <div class="flex gap-2">
                <input type="number" id="input-val-${v.symbol}" value="${v.defaultVal}" class="w-2/3 bg-[#121217] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none">
                <select id="input-unit-${v.symbol}" class="w-1/3 bg-[#121217] border border-white/10 rounded-lg px-2 py-1.5 text-xs focus:outline-none">
                    ${unitOptions}
                </select>
            </div>
        `;
        variablesContainer.appendChild(div);
    });
}

function solvePhysics() {
    const eqKey = selectEquation.value;
    const eq = equations[eqKey];
    const varsData = {};

    eq.vars.forEach(v => {
        const val = parseFloat(document.getElementById(`input-val-${v.symbol}`).value) || 0;
        const unit = document.getElementById(`input-unit-${v.symbol}`).value;
        const unitMultiplier = categories[v.category].units[unit].multiplier;
        
        let siVal = val * unitMultiplier;
        if (v.category === 'mass') {
            siVal = siVal / 1000; // Gramos a Kilogramos en masa
        }

        varsData[v.symbol] = {
            inputVal: val,
            inputUnit: unit,
            siVal: siVal
        };
    });

    const solution = eq.solve(varsData);
    
    // Inyectar el formato matemático LaTeX
    const latexString = `
        $$\\begin{aligned}
        \\text{Fórmula Seleccionada: } & ${eq.latex} \\\\
        \\\\
        ${solution.steps.map(step => `\\text{Cálculo: } & ${step}`).join(' \\\\ ')}
        \\end{aligned}$$
    `;

    renderMath(physicsOutput, latexString);
}

selectEquation.addEventListener('change', () => {
    renderVariables();
    solvePhysics();
});
btnSolvePhysics.addEventListener('click', solvePhysics);

// --- LÓGICA DE POLINOMIOS ---
const btnSolvePoly = document.getElementById('btn-solve-poly');
const polyOutput = document.getElementById('poly-output-latex');

function solvePolynomial() {
    const aVal = parseFloat(document.getElementById('poly-a-val').value) || 0;
    const aUnit = document.getElementById('poly-a-unit').value;
    const bVal = parseFloat(document.getElementById('poly-b-val').value) || 0;
    const bUnit = document.getElementById('poly-b-unit').value;
    const cVal = parseFloat(document.getElementById('poly-c-val').value) || 0;
    const cUnit = document.getElementById('poly-c-unit').value;
    const dVal = parseFloat(document.getElementById('poly-d-val').value) || 0;
    const dUnit = document.getElementById('poly-d-unit').value;
    const targetUnit = document.getElementById('poly-target').value;

    const aSi = aVal * categories.length.units[aUnit].multiplier;
    const bSi = bVal * categories.length.units[bUnit].multiplier;
    const cSi = cVal * categories.length.units[cUnit].multiplier;
    const dSi = dVal * categories.length.units[dUnit].multiplier;

    const sumSi = aSi + bSi - cSi;
    const areaSi = sumSi * dSi;

    const targetMultiplier = categories.area.units[targetUnit].multiplier;
    const finalArea = areaSi / targetMultiplier;

    const latexString = `
        $$\\begin{aligned}
        \\text{Expresión Analizada: } & (A + B - C) \\cdot D \\\\
        \\\\
        \\text{1. Conversión al S.I. (m):} \\\\
        A &= ${aVal}\\text{ ${aUnit}} = ${aSi}\\text{ m} \\\\
        B &= ${bVal}\\text{ ${bUnit}} = ${bSi}\\text{ m} \\\\
        C &= ${cVal}\\text{ ${cUnit}} = ${cSi}\\text{ m} \\\\
        D &= ${dVal}\\text{ ${dUnit}} = ${dSi}\\text{ m} \\\\
        \\\\
        \\text{2. Sumatoria de Longitudes:} \\\\
        (A + B - C) &= (${aSi} + ${bSi} - ${cSi})\\text{ m} = ${sumSi}\\text{ m} \\\\
        \\\\
        \\text{3. Multiplicación de Superficie:} \\\\
        \\text{Área (S.I.)} &= ${sumSi}\\text{ m} \\cdot ${dSi}\\text{ m} = ${areaSi.toFixed(4)}\\text{ m}^2 \\\\
        \\\\
        \\text{4. Análisis de Galera Final a [${targetUnit}]:} \\\\
        \\text{Resultado} &= ${areaSi.toFixed(4)}\\text{ m}^2 \\cdot \\frac{1\\text{ ${targetUnit}}}{${targetMultiplier}\\text{ m}^2} \\\\
        &= ${formatScientificLaTeX(finalArea)}\\text{ ${targetUnit}}
        \\end{aligned}$$
    `;

    renderMath(polyOutput, latexString);
}

btnSolvePoly.addEventListener('click', solvePolynomial);

// Carga de inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    renderVariables();
    // Ejecutar ambos solvers de inmediato para mostrar los ejemplos resueltos por defecto
    setTimeout(() => {
        solvePhysics();
        solvePolynomial();
    }, 200);
    
    if (window.lucide) window.lucide.createIcons();
});