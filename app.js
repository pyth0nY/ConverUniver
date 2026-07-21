import { prefixes, categories, convertScale, getMagnitudeDescription } from './conversions.js';
const selectFrom = document.getElementById('prefix-from');
const selectTo = document.getElementById('prefix-to');
const valInput = document.getElementById('val-input');
const valOutput = document.getElementById('val-output');
const scientificOutput = document.getElementById('scientific-output'); 
const unitFrom = document.getElementById('unit-symbol-from');
const unitTo = document.getElementById('unit-symbol-to');
const btnSwap = document.getElementById('btn-swap');
const categoryButtons = document.querySelectorAll('.category-btn');
const comparisonText = document.getElementById('comparison-text');

let currentCategory = 'length';
export function formatScientific(value) {
    if (value === 0) return "0 × 10⁰";
    const exp = Math.floor(Math.log10(Math.abs(value)));
    const base = value / Math.pow(10, exp);
    const formattedBase = parseFloat(base.toFixed(4)).toString();
    return `${formattedBase} × 10<sup>${exp}</sup>`;
}

function populateSelects() {
    selectFrom.innerHTML = '';
    selectTo.innerHTML = '';
    const baseSymbol = categories[currentCategory].baseSymbol;

    Object.keys(prefixes).forEach(key => {
        const pref = prefixes[key];
        const displaySymbol = pref.symbol + baseSymbol;

        const optFrom = document.createElement('option');
        optFrom.value = key;
        optFrom.textContent = `${pref.name} (${displaySymbol})`;
        selectFrom.appendChild(optFrom);

        const optTo = document.createElement('option');
        optTo.value = key;
        optTo.textContent = `${pref.name} (${displaySymbol})`;
        selectTo.appendChild(optTo);
    });

    selectFrom.value = 'nano';
    selectTo.value = 'giga';
    updateSymbols();
}

function updateSymbols() {
    const baseSym = categories[currentCategory].baseSymbol;
    unitFrom.textContent = prefixes[selectFrom.value].symbol + baseSym;
    unitTo.textContent = prefixes[selectTo.value].symbol + baseSym;
}

function processConversion() {
    const inputVal = parseFloat(valInput.value) || 0;
    const fromPref = selectFrom.value;
    const toPref = selectTo.value;

    const result = convertScale(inputVal, fromPref, toPref);

    // Salida estándar
    if (result === 0) {
        valOutput.textContent = '0';
    } else if (Math.abs(result) < 0.001 || Math.abs(result) >= 1e6) {
        valOutput.textContent = result.toExponential(4);
    } else {
        valOutput.textContent = parseFloat(result.toFixed(6)).toString();
    }

    // Salida Notación Científica
    scientificOutput.innerHTML = formatScientific(result);

    comparisonText.textContent = getMagnitudeDescription(inputVal, fromPref, currentCategory);

    valOutput.classList.remove('value-updated');
    void valOutput.offsetWidth;
    valOutput.classList.add('value-updated');
}

function changeCategory(e) {
    const button = e.currentTarget;
    const targetCategory = button.getAttribute('data-category');
    if (targetCategory === currentCategory) return;

    categoryButtons.forEach(btn => {
        btn.classList.remove('active-tab');
        const icon = btn.querySelector('i');
        const text = btn.querySelector('span');
        if (icon) icon.className = icon.className.replace('text-indigo-400', 'text-slate-400');
        if (text) {
            text.classList.remove('text-slate-100');
            text.classList.add('text-slate-400');
        }
    });

    button.classList.add('active-tab');
    const activeIcon = button.querySelector('i');
    const activeText = button.querySelector('span');
    if (activeIcon) activeIcon.className = activeIcon.className.replace('text-slate-400', 'text-indigo-400');
    if (activeText) {
        activeText.classList.remove('text-slate-400');
        activeText.classList.add('text-slate-100');
    }

    currentCategory = targetCategory;
    populateSelects();
    processConversion();
}

function handleSwap() {
    const tempValue = selectFrom.value;
    selectFrom.value = selectTo.value;
    selectTo.value = tempValue;
    updateSymbols();
    processConversion();
    const icon = btnSwap.querySelector('i');
    icon.style.transform = icon.style.transform === 'rotate(180deg)' ? 'rotate(0deg)' : 'rotate(180deg)';
    icon.style.transition = 'transform 0.4s ease';
}

function init() {
    populateSelects();
    processConversion();

    valInput.addEventListener('input', processConversion);
    selectFrom.addEventListener('change', () => { updateSymbols(); processConversion(); });
    selectTo.addEventListener('change', () => { updateSymbols(); processConversion(); });
    btnSwap.addEventListener('click', handleSwap);

    categoryButtons.forEach(btn => {
        btn.addEventListener('click', changeCategory);
    });

    if (window.lucide) {
        window.lucide.createIcons();
    }
}

document.addEventListener('DOMContentLoaded', init);