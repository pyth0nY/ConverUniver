import { prefixes, categories, getGaleaSteps } from './conversions.js';

// Elementos del DOM - Modos
const tabAuto = document.getElementById('tab-auto');
const tabFree = document.getElementById('tab-free');
const panelAuto = document.getElementById('panel-auto');
const panelFree = document.getElementById('panel-free');

// Elementos del DOM - Modo Automático
const galeaCat = document.getElementById('galea-cat');
const galeaFrom = document.getElementById('galea-from');
const galeaTo = document.getElementById('galea-to');
const galeaVal = document.getElementById('galea-val');
const btnGenerate = document.getElementById('btn-generate-galea');

// Elementos del DOM - Modo Creador Libre
const freeInitVal = document.getElementById('free-init-val');
const freeInitUnit = document.getElementById('free-init-unit');
const factorsContainer = document.getElementById('factors-container');
const btnAddFactor = document.getElementById('btn-add-factor');
const btnCalculateFree = document.getElementById('btn-calculate-free');

// Elementos del DOM - Resultados y LaTeX
const playground = document.getElementById('galea-playground');
const gridContainer = document.getElementById('galea-grid-container');
const mathSteps = document.getElementById('math-steps');
const finalResultDiv = document.getElementById('galea-final-result');
const latexInput = document.getElementById('latex-input');
const latexOutput = document.getElementById('latex-output');
const btnCopyLatex = document.getElementById('btn-copy-latex');

let activeTab = 'auto';

// --- UTILIDADES DE FORMATEO CIENTÍFICO ---

function formatScientificHTML(value) {
    if (value === 0) return "0";
    const exp = Math.floor(Math.log10(Math.abs(value)));
    if (exp === 0) return parseFloat(value.toFixed(4)).toString();
    const base = value / Math.pow(10, exp);
    const formattedBase = parseFloat(base.toFixed(4)).toString();
    return `${formattedBase} &times; 10<sup>${exp}</sup>`;
}

function formatScientificLaTeX(value) {
    if (value === 0) return "0 \\times 10^{0}";
    const exp = Math.floor(Math.log10(Math.abs(value)));
    const base = value / Math.pow(10, exp);
    const formattedBase = parseFloat(base.toFixed(4)).toString();
    return `${formattedBase} \\times 10^{${exp}}`;
}

// --- GENERADOR UNIVERSAL DE UNIDADES AGRUPADAS (OPTGROUP) ---
function generateUniversalUnitOptions() {
    let html = '';
    const groupNames = {
        length: 'Longitud / Distancia',
        area: 'Área / Superficie',
        volume: 'Volumen',
        energy: 'Energía / Potencia',
        time: 'Tiempo',
        mass: 'Masa',
        pressure: 'Presión / Fuerza',
        data: 'Datos / Información'
    };

    Object.keys(categories).forEach(catKey => {
        const cat = categories[catKey];
        const groupLabel = groupNames[catKey] || catKey;

        html += `<optgroup label="${groupLabel}">`;
        Object.keys(cat.units).forEach(unitKey => {
            const u = cat.units[unitKey];
            html += `<option value="${unitKey}">${u.name} (${u.symbol || unitKey})</option>`;
        });
        html += `</optgroup>`;
    });
    return html;
}

// --- CONTROL DE PESTAÑAS (TABS) ---
tabAuto.addEventListener('click', () => {
    activeTab = 'auto';
    tabAuto.className = 'px-6 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 bg-white/5 text-slate-100';
    tabFree.className = 'px-6 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 text-slate-400 hover:text-slate-100';
    panelAuto.classList.remove('hidden');
    panelFree.classList.add('hidden');
});

tabFree.addEventListener('click', () => {
    activeTab = 'free';
    tabFree.className = 'px-6 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 bg-white/5 text-slate-100';
    tabAuto.className = 'px-6 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 text-slate-400 hover:text-slate-100';
    panelFree.classList.remove('hidden');
    panelAuto.classList.add('hidden');
    if (factorsContainer.children.length === 0) {
        addFactorRow();
    }
});

// --- EVITAR CONDICIÓN DE CARRERA (Race Conditions) ---
function executeWithMathJax(callback) {
    if (window.MathJax && typeof MathJax.typesetPromise === "function") {
        callback();
    } else {
        setTimeout(() => executeWithMathJax(callback), 100);
    }
}

// --- FUNCIÓN DE CONTROL DE RENDERIZADO MATHJAX ---
function renderMath(element, latexString) {
    if (window.MathJax && typeof MathJax.typesetClear === "function") {
        try {
            MathJax.typesetClear([element]);
        } catch (e) {
            console.warn("typesetClear error:", e);
        }
    }

    element.innerHTML = latexString;

    if (window.MathJax && typeof MathJax.typesetPromise === "function") {
        try {
            MathJax.typesetPromise([element]).catch(err => console.error("MathJax error:", err));
        } catch (e) {
            console.error("MathJax exception:", e);
        }
    }
}

// --- MODO AUTOMÁTICO ---
function populateDropdowns() {
    galeaFrom.innerHTML = '';
    galeaTo.innerHTML = '';
    const cat = galeaCat.value;
    const catData = categories[cat];

    Object.keys(catData.units).forEach(key => {
        const u = catData.units[key];

        const optFrom = document.createElement('option');
        optFrom.value = key;
        optFrom.textContent = `${u.name} (${u.symbol})`;
        galeaFrom.appendChild(optFrom);

        const optTo = document.createElement('option');
        optTo.value = key;
        optTo.textContent = `${u.name} (${u.symbol})`;
        galeaTo.appendChild(optTo);
    });

    galeaFrom.value = Object.keys(catData.units)[0];
    galeaTo.value = Object.keys(catData.units)[1] || Object.keys(catData.units)[0];
}

galeaCat.addEventListener('change', populateDropdowns);

btnGenerate.addEventListener('click', () => {
    const val = parseFloat(galeaVal.value) || 0;
    const cat = galeaCat.value;
    const from = galeaFrom.value;
    const to = galeaTo.value;

    const data = getGaleaSteps(val, cat, from, to);
    if (!data) return;

    renderGaleraGrid([
        { value: data.initialValue, unit: data.fromSymbol, isStart: true },
        { topValue: data.step1.top, topUnit: data.step1.topUnit, bottomValue: data.step1.bottom, bottomUnit: data.step1.bottomUnit },
        { topValue: data.step2.top, topUnit: data.step2.topUnit, bottomValue: data.step2.bottom, bottomUnit: data.step2.bottomUnit }
    ]);
});

// --- MODO CREADOR LIBRE CON SELECTS DINÁMICOS ---
function addFactorRow() {
    const div = document.createElement('div');
    div.className = 'flex flex-wrap items-center gap-2 bg-white/[0.01] p-3 rounded-xl border border-white/[0.03] animate-fade-in relative';

    // Obtenemos las opciones agrupadas desde nuestra base de datos conversions.js
    const universalOptions = generateUniversalUnitOptions();

    div.innerHTML = `
        <div class="flex flex-col items-center justify-center font-bold px-2 text-slate-500">×</div>
        <div class="flex flex-col gap-1.5 flex-grow">
            <!-- Fila Superior (Numerador) -->
            <div class="flex gap-2 items-center">
                <span class="text-[10px] font-mono text-slate-500 w-12 text-right">Arriba:</span>
                <input type="number" placeholder="1" class="factor-top-val bg-[#121217] border border-white/10 rounded-lg px-2.5 py-1 w-24 text-xs focus:outline-none">
                <select class="factor-top-unit bg-[#121217] border border-white/10 rounded-lg px-2 py-1 w-44 text-xs focus:outline-none cursor-pointer">
                    ${universalOptions}
                </select>
            </div>
            <!-- Divisor -->
            <div class="h-px bg-white/10 w-full my-0.5"></div>
            <!-- Fila Inferior (Denominador) -->
            <div class="flex gap-2 items-center">
                <span class="text-[10px] font-mono text-slate-500 w-12 text-right">Abajo:</span>
                <input type="number" placeholder="1" class="factor-bottom-val bg-[#121217] border border-white/10 rounded-lg px-2.5 py-1 w-24 text-xs focus:outline-none">
                <select class="factor-bottom-unit bg-[#121217] border border-white/10 rounded-lg px-2 py-1 w-44 text-xs focus:outline-none cursor-pointer">
                    ${universalOptions}
                </select>
            </div>
        </div>
        <button class="btn-remove-factor p-1.5 hover:bg-rose-500/10 hover:text-rose-400 rounded-lg text-slate-500 transition-all">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
    `;

    div.querySelector('.btn-remove-factor').addEventListener('click', () => {
        div.remove();
    });

    factorsContainer.appendChild(div);
    if (window.lucide) window.lucide.createIcons();
}

btnAddFactor.addEventListener('click', addFactorRow);

btnCalculateFree.addEventListener('click', () => {
    const initVal = parseFloat(freeInitVal.value) || 0;
    const initUnit = freeInitUnit.value; // Ya no requiere .trim() porque viene de select

    const steps = [
        { value: initVal, unit: initUnit, isStart: true }
    ];

    const factorRows = factorsContainer.children;
    for (let row of factorRows) {
        const topVal = parseFloat(row.querySelector('.factor-top-val').value) || 1;
        const topUnit = row.querySelector('.factor-top-unit').value;
        const bottomVal = parseFloat(row.querySelector('.factor-bottom-val').value) || 1;
        const bottomUnit = row.querySelector('.factor-bottom-unit').value;

        steps.push({
            topValue: topVal,
            topUnit: topUnit,
            bottomValue: bottomVal,
            bottomUnit: bottomUnit
        });
    }

    renderGaleraGrid(steps);
});

// --- RENDERIZADOR GENERAL DE GALERA CON CANCELACIONES ---
function renderGaleraGrid(steps) {
    const numeratorUnits = [];
    const denominatorUnits = [];

    steps.forEach((step, index) => {
        if (step.isStart) {
            if (step.unit) numeratorUnits.push({ unit: step.unit, index, position: 'start' });
        } else {
            if (step.topUnit) numeratorUnits.push({ unit: step.topUnit, index, position: 'top' });
            if (step.bottomUnit) denominatorUnits.push({ unit: step.bottomUnit, index, position: 'bottom' });
        }
    });

    numeratorUnits.forEach(num => {
        const match = denominatorUnits.find(den => den.unit === num.unit && !den.canceled && !num.canceled);
        if (match) {
            num.canceled = true;
            match.canceled = true;
        }
    });

    let html = `<div class="flex items-center text-center">`;
    let latexNumerator = [];
    let latexDenominator = [];

    steps.forEach((step, index) => {
        if (index > 0) {
            html += `<div class="w-px bg-white/20 h-24"></div>`;
        }

        if (step.isStart) {
            const isCanceled = numeratorUnits.find(u => u.index === index && u.position === 'start')?.canceled;
            const unitClass = isCanceled ? 'cancel-line text-rose-400 font-semibold' : 'text-indigo-400 font-semibold';
            html += `
                <div class="flex flex-col min-w-[100px]">
                    <div class="px-6 py-4 font-semibold text-lg text-slate-200">
                        ${step.value} <span class="${unitClass}">${step.unit}</span>
                    </div>
                    <div class="h-px bg-white/20 w-full"></div>
                    <div class="px-6 py-4 text-slate-500 text-xs">(Inicio)</div>
                </div>
            `;
            latexNumerator.push(`${step.value}\\text{ ${step.unit} }`);
        } else {
            const isTopCanceled = numeratorUnits.find(u => u.index === index && u.position === 'top')?.canceled;
            const isBottomCanceled = denominatorUnits.find(u => u.index === index && u.position === 'bottom')?.canceled;

            const topUnitClass = isTopCanceled ? 'cancel-line text-rose-400 font-semibold' : 'text-indigo-400 font-semibold';
            const bottomUnitClass = isBottomCanceled ? 'cancel-line text-rose-400 font-semibold' : 'text-indigo-400 font-semibold';

            html += `
                <div class="flex flex-col min-w-[100px]">
                    <div class="px-6 py-4 text-slate-200">
                        ${step.topValue} <span class="${topUnitClass}">${step.topUnit}</span>
                    </div>
                    <div class="h-px bg-white/20 w-full"></div>
                    <div class="px-6 py-4 text-slate-300">
                        ${step.bottomValue} <span class="${bottomUnitClass}">${step.bottomUnit}</span>
                    </div>
                </div>
            `;

            latexNumerator.push(`${step.topValue}\\text{ ${step.topUnit} }`);
            latexDenominator.push(`${step.bottomValue}\\text{ ${step.bottomUnit} }`);
        }
    });

    html += `</div>`;
    gridContainer.innerHTML = html;

    let totalNumerator = steps[0].value;
    let totalDenominator = 1;

    steps.forEach((step, idx) => {
        if (idx > 0) {
            totalNumerator *= step.topValue;
            totalDenominator *= step.bottomValue;
        }
    });

    const finalVal = totalNumerator / totalDenominator;

    const survivingNumerator = numeratorUnits.filter(u => !u.canceled).map(u => u.unit).join('·');
    const survivingDenominator = denominatorUnits.filter(u => !u.canceled).map(u => u.unit).join('·');
    const finalUnit = survivingNumerator + (survivingDenominator ? '/' + survivingDenominator : '');

    mathSteps.innerHTML = `
        <div class="flex flex-col gap-1.5 text-center text-xs text-slate-400">
            <div>Numeradores: <span class="text-slate-200 font-mono">${steps.map(s => s.isStart ? s.value : s.topValue).join(' × ')} = ${totalNumerator}</span></div>
            <div>Denominadores: <span class="text-slate-200 font-mono">${steps.map(s => s.isStart ? '1' : s.bottomValue).join(' × ')} = ${totalDenominator}</span></div>
        </div>
    `;

    finalResultDiv.innerHTML = `${formatScientificHTML(finalVal)} <span class="text-emerald-400 text-lg ml-1 font-semibold">${finalUnit}</span>`;

    const latexFormula = `\\frac{ ${latexNumerator.join(' \\cdot ')} }{ ${latexDenominator.join(' \\cdot ') || '1'} } = ${formatScientificLaTeX(finalVal)}\\text{ ${finalUnit} }`;
    latexInput.value = latexFormula;
    renderMath(latexOutput, `$$${latexFormula}$$`);

    playground.classList.remove('hidden');
}

latexInput.addEventListener('input', () => {
    renderMath(latexOutput, `$$${latexInput.value}$$`);
});

btnCopyLatex.addEventListener('click', () => {
    navigator.clipboard.writeText(latexInput.value);
    btnCopyLatex.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400"></i> ¡Copiado!`;
    if (window.lucide) window.lucide.createIcons();
    setTimeout(() => {
        btnCopyLatex.innerHTML = `<i data-lucide="clipboard" class="w-3.5 h-3.5"></i> Copiar LaTeX al Portapapeles`;
        if (window.lucide) window.lucide.createIcons();
    }, 2000);
});

document.addEventListener('DOMContentLoaded', () => {
    populateDropdowns();

    // Poblamos el selector de la magnitud inicial libre con todas las opciones agrupadas de conversions.js
    if (freeInitUnit) {
        freeInitUnit.innerHTML = generateUniversalUnitOptions();
        freeInitUnit.value = 'm'; // Valor inicial por defecto para el ejemplo
    }

    if (latexInput) {
        latexInput.value = "E = 15.5 \\text{ m} \\cdot (1 \\times 10^{3} \\text{ mm}) = 1.55 \\times 10^{4} \\text{ mm}";
    }

    executeWithMathJax(() => {
        if (latexOutput && latexInput) {
            renderMath(latexOutput, `$$${latexInput.value}$$`);
        }
    });

    if (window.lucide) window.lucide.createIcons();
});