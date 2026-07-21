import { categories as originalCategories } from './conversions.js';

// Extensión de categorías y unidades locales para el Normalizador Físico
const extendedCategories = {
    ...originalCategories,
    velocity: {
        unitName: 'Metros por Segundo',
        baseSymbol: 'm/s',
        units: {
            'm/s': { name: 'Metros/segundo', multiplier: 1, symbol: 'm/s' },
            'km/h': { name: 'Kilómetros/hora', multiplier: 1 / 3.6, symbol: 'km/h' }
        }
    },
    acceleration: {
        unitName: 'Metros por Segundo al Cuadrado',
        baseSymbol: 'm/s²',
        units: {
            'm/s^2': { name: 'Metros/segundo²', multiplier: 1, symbol: 'm/s²' }
        }
    },
    electric_current: {
        unitName: 'Amperios',
        baseSymbol: 'A',
        units: {
            'A': { name: 'Amperios', multiplier: 1, symbol: 'A' },
            'mA': { name: 'Miliamperios', multiplier: 1e-3, symbol: 'mA' }
        }
    },
    resistance: {
        unitName: 'Ohmios',
        baseSymbol: 'Ω',
        units: {
            'ohm': { name: 'Ohmios', multiplier: 1, symbol: 'Ω' },
            'kohm': { name: 'Kilohmios', multiplier: 1e3, symbol: 'kΩ' }
        }
    },
    voltage: {
        unitName: 'Voltios',
        baseSymbol: 'V',
        units: {
            'V': { name: 'Voltios', multiplier: 1, symbol: 'V' },
            'kV': { name: 'Kilovoltios', multiplier: 1e3, symbol: 'kV' }
        }
    },
    frequency: {
        unitName: 'Hercios',
        baseSymbol: 'Hz',
        units: {
            'Hz': { name: 'Hercios', multiplier: 1, symbol: 'Hz' },
            'kHz': { name: 'Kilohercios', multiplier: 1e3, symbol: 'kHz' },
            'MHz': { name: 'Megajuegos', multiplier: 1e6, symbol: 'MHz' }
        }
    },
    charge: {
        unitName: 'Culombios',
        baseSymbol: 'C',
        units: {
            'C': { name: 'Culombios', multiplier: 1, symbol: 'C' },
            'uC': { name: 'Microculombios', multiplier: 1e-6, symbol: 'µC' }
        }
    },
    force_unit: {
        unitName: 'Newtons',
        baseSymbol: 'N',
        units: {
            'N': { name: 'Newtons', multiplier: 1, symbol: 'N' },
            'kN': { name: 'Kilonewtons', multiplier: 1e3, symbol: 'kN' }
        }
    },
    generic_val: {
        unitName: 'Valores Estándar (S.I.)',
        baseSymbol: '',
        units: {
            'SI': { name: 'Unidad S.I.', multiplier: 1, symbol: '' }
        }
    }
};

// Navegación de pestañas
const tabPhysics = document.getElementById('tab-physics');
const tabPoly = document.getElementById('tab-poly');
const panelPhysics = document.getElementById('panel-physics');
const panelPoly = document.getElementById('panel-poly');

function renderMath(element, latexString) {
    element.innerHTML = latexString;
    if (window.MathJax) {
        try {
            MathJax.typesetClear([element]);
            MathJax.typesetPromise([element]).catch(err => console.error("Error MathJax:", err));
        } catch (e) {
            console.error("Error typeset:", e);
        }
    }
}

function formatScientificLaTeX(value) {
    if (value === 0) return "0 \\times 10^{0}";
    const exp = Math.floor(Math.log10(Math.abs(value)));
    if (Math.abs(exp) < 3) return parseFloat(value.toFixed(4)).toString();
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
    solvePolynomial();
});

// --- LÓGICA DE FÓRMULAS DE FÍSICA ---
const selectEquation = document.getElementById('physics-equation');
const variablesContainer = document.getElementById('equation-variables');
const btnSolvePhysics = document.getElementById('btn-solve-physics');
const physicsOutput = document.getElementById('physics-output-latex');

const equations = {
    f_ma: {
        latex: "F = m \\cdot a",
        vars: [
            { label: 'Masa (m)', symbol: 'm', category: 'mass', defaultVal: 10, defaultUnit: 'kg' },
            { label: 'Aceleración (a)', symbol: 'a', category: 'acceleration', defaultVal: 9.81, defaultUnit: 'm/s^2' }
        ],
        solve: (vars) => {
            const m = vars.m.siVal;
            const a = vars.a.siVal;
            const result = m * a;
            return {
                result, steps: [
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
                result, steps: [
                    `m_{\\text{SI}} = ${formatScientificLaTeX(m)}\\text{ kg}`,
                    `c = 3.00 \\times 10^8\\text{ m/s}`,
                    `E = (${formatScientificLaTeX(m)}\\text{ kg}) \\cdot (3.00 \\times 10^8\\text{ m/s})^2`,
                    `E = ${formatScientificLaTeX(result)}\\text{ J}`
                ]
            };
        }
    },
    force_dist_time: {
        latex: "F = \\frac{m \\cdot d}{t^2}",
        vars: [
            { label: 'Masa (m)', symbol: 'm', category: 'mass', defaultVal: 50, defaultUnit: 'g' },
            { label: 'Distancia (d)', symbol: 'd', category: 'length', defaultVal: 10, defaultUnit: 'm' },
            { label: 'Tiempo (t)', symbol: 't', category: 'time', defaultVal: 5, defaultUnit: 's' }
        ],
        solve: (vars) => {
            const m = vars.m.siVal;
            const d = vars.d.siVal;
            const t = vars.t.siVal;
            const result = (m * d) / Math.pow(t, 2);
            return {
                result, steps: [
                    `m_{\\text{SI}} = ${formatScientificLaTeX(m)}\\text{ kg}`,
                    `d_{\\text{SI}} = ${formatScientificLaTeX(d)}\\text{ m}`,
                    `t_{\\text{SI}} = ${formatScientificLaTeX(t)}\\text{ s}`,
                    `F = \\frac{(${formatScientificLaTeX(m)}) \\cdot (${formatScientificLaTeX(d)})}{(${formatScientificLaTeX(t)})^2}`,
                    `F = ${formatScientificLaTeX(result)}\\text{ N}`
                ]
            };
        }
    },
    vel_avg: {
        latex: "v = \\frac{d}{t}",
        vars: [
            { label: 'Distancia (d)', symbol: 'd', category: 'length', defaultVal: 100, defaultUnit: 'km' },
            { label: 'Tiempo (t)', symbol: 't', category: 'time', defaultVal: 1, defaultUnit: 'h' }
        ],
        solve: (vars) => {
            const d = vars.d.siVal;
            const t = vars.t.siVal;
            const result = d / t;
            return {
                result, steps: [
                    `d_{\\text{SI}} = ${formatScientificLaTeX(d)}\\text{ m}`,
                    `t_{\\text{SI}} = ${formatScientificLaTeX(t)}\\text{ s}`,
                    `v = \\frac{${formatScientificLaTeX(d)}}{${formatScientificLaTeX(t)}}`,
                    `v = ${formatScientificLaTeX(result)}\\text{ m/s}`
                ]
            };
        }
    },
    acc_linear: {
        latex: "a = \\frac{v_f - v_i}{t}",
        vars: [
            { label: 'Velocidad Final (vf)', symbol: 'vf', category: 'velocity', defaultVal: 30, defaultUnit: 'm/s' },
            { label: 'Velocidad Inicial (vi)', symbol: 'vi', category: 'velocity', defaultVal: 0, defaultUnit: 'm/s' },
            { label: 'Tiempo (t)', symbol: 't', category: 'time', defaultVal: 10, defaultUnit: 's' }
        ],
        solve: (vars) => {
            const vf = vars.vf.siVal;
            const vi = vars.vi.siVal;
            const t = vars.t.siVal;
            const result = (vf - vi) / t;
            return {
                result, steps: [
                    `v_{f\\text{,SI}} = ${formatScientificLaTeX(vf)}\\text{ m/s}`,
                    `v_{i\\text{,SI}} = ${formatScientificLaTeX(vi)}\\text{ m/s}`,
                    `t_{\\text{SI}} = ${formatScientificLaTeX(t)}\\text{ s}`,
                    `a = \\frac{${formatScientificLaTeX(vf)} - ${formatScientificLaTeX(vi)}}{${formatScientificLaTeX(t)}}`,
                    `a = ${formatScientificLaTeX(result)}\\text{ m/s}^2`
                ]
            };
        }
    },
    energy_kinetic: {
        latex: "E_c = \\frac{1}{2} m v^2",
        vars: [
            { label: 'Masa (m)', symbol: 'm', category: 'mass', defaultVal: 80, defaultUnit: 'kg' },
            { label: 'Velocidad (v)', symbol: 'v', category: 'velocity', defaultVal: 15, defaultUnit: 'm/s' }
        ],
        solve: (vars) => {
            const m = vars.m.siVal;
            const v = vars.v.siVal;
            const result = 0.5 * m * Math.pow(v, 2);
            return {
                result, steps: [
                    `m_{\\text{SI}} = ${formatScientificLaTeX(m)}\\text{ kg}`,
                    `v_{\\text{SI}} = ${formatScientificLaTeX(v)}\\text{ m/s}`,
                    `E_c = 0.5 \\cdot (${formatScientificLaTeX(m)}) \\cdot (${formatScientificLaTeX(v)})^2`,
                    `E_c = ${formatScientificLaTeX(result)}\\text{ J}`
                ]
            };
        }
    },
    energy_potential: {
        latex: "E_p = m \\cdot g \\cdot h",
        vars: [
            { label: 'Masa (m)', symbol: 'm', category: 'mass', defaultVal: 5, defaultUnit: 'kg' },
            { label: 'Altura (h)', symbol: 'h', category: 'length', defaultVal: 10, defaultUnit: 'm' }
        ],
        solve: (vars) => {
            const m = vars.m.siVal;
            const h = vars.h.siVal;
            const g = 9.80665;
            const result = m * g * h;
            return {
                result, steps: [
                    `m_{\\text{SI}} = ${formatScientificLaTeX(m)}\\text{ kg}`,
                    `h_{\\text{SI}} = ${formatScientificLaTeX(h)}\\text{ m}`,
                    `g = 9.81\\text{ m/s}^2`,
                    `E_p = (${formatScientificLaTeX(m)}) \\cdot (9.81) \\cdot (${formatScientificLaTeX(h)})`,
                    `E_p = ${formatScientificLaTeX(result)}\\text{ J}`
                ]
            };
        }
    },
    work_mechanical: {
        latex: "W = F \\cdot d",
        vars: [
            { label: 'Fuerza (F)', symbol: 'f', category: 'force_unit', defaultVal: 150, defaultUnit: 'N' },
            { label: 'Distancia (d)', symbol: 'd', category: 'length', defaultVal: 5, defaultUnit: 'm' }
        ],
        solve: (vars) => {
            const f = vars.f.siVal;
            const d = vars.d.siVal;
            const result = f * d;
            return {
                result, steps: [
                    `F_{\\text{SI}} = ${formatScientificLaTeX(f)}\\text{ N}`,
                    `d_{\\text{SI}} = ${formatScientificLaTeX(d)}\\text{ m}`,
                    `W = (${formatScientificLaTeX(f)}) \\cdot (${formatScientificLaTeX(d)})`,
                    `W = ${formatScientificLaTeX(result)}\\text{ J}`
                ]
            };
        }
    },
    power_mechanical: {
        latex: "P = \\frac{W}{t}",
        vars: [
            { label: 'Trabajo (W)', symbol: 'w', category: 'energy', defaultVal: 1000, defaultUnit: 'J' },
            { label: 'Tiempo (t)', symbol: 't', category: 'time', defaultVal: 4, defaultUnit: 's' }
        ],
        solve: (vars) => {
            const w = vars.w.siVal;
            const t = vars.t.siVal;
            const result = w / t;
            return {
                result, steps: [
                    `W_{\\text{SI}} = ${formatScientificLaTeX(w)}\\text{ J}`,
                    `t_{\\text{SI}} = ${formatScientificLaTeX(t)}\\text{ s}`,
                    `P = \\frac{${formatScientificLaTeX(w)}}{${formatScientificLaTeX(t)}}`,
                    `P = ${formatScientificLaTeX(result)}\\text{ W}`
                ]
            };
        }
    },
    pressure_hydrostatic: {
        latex: "P = \\rho \\cdot g \\cdot h",
        vars: [
            { label: 'Densidad (ρ)', symbol: 'rho', category: 'generic_val', defaultVal: 1000, defaultUnit: 'SI' },
            { label: 'Profundidad (h)', symbol: 'h', category: 'length', defaultVal: 10, defaultUnit: 'm' }
        ],
        solve: (vars) => {
            const rho = vars.rho.siVal;
            const h = vars.h.siVal;
            const g = 9.80665;
            const result = rho * g * h;
            return {
                result, steps: [
                    `\\rho_{\\text{SI}} = ${formatScientificLaTeX(rho)}\\text{ kg/m}^3`,
                    `h_{\\text{SI}} = ${formatScientificLaTeX(h)}\\text{ m}`,
                    `P = (${formatScientificLaTeX(rho)}) \\cdot (9.81) \\cdot (${formatScientificLaTeX(h)})`,
                    `P = ${formatScientificLaTeX(result)}\\text{ Pa}`
                ]
            };
        }
    },
    density_basic: {
        latex: "\\rho = \\frac{m}{V}",
        vars: [
            { label: 'Masa (m)', symbol: 'm', category: 'mass', defaultVal: 200, defaultUnit: 'g' },
            { label: 'Volumen (V)', symbol: 'v', category: 'volume', defaultVal: 1, defaultUnit: 'L' }
        ],
        solve: (vars) => {
            const m = vars.m.siVal;
            const v = vars.v.siVal;
            const result = m / v;
            return {
                result, steps: [
                    `m_{\\text{SI}} = ${formatScientificLaTeX(m)}\\text{ kg}`,
                    `V_{\\text{SI}} = ${formatScientificLaTeX(v)}\\text{ m}^3`,
                    `\\rho = \\frac{${formatScientificLaTeX(m)}}{${formatScientificLaTeX(v)}}`,
                    `\\rho = ${formatScientificLaTeX(result)}\\text{ kg/m}^3`
                ]
            };
        }
    },
    hooke_law: {
        latex: "F = k \\cdot x",
        vars: [
            { label: 'Constante elástica (k)', symbol: 'k', category: 'generic_val', defaultVal: 250, defaultUnit: 'SI' },
            { label: 'Elongación (x)', symbol: 'x', category: 'length', defaultVal: 10, defaultUnit: 'cm' }
        ],
        solve: (vars) => {
            const k = vars.k.siVal;
            const x = vars.x.siVal;
            const result = k * x;
            return {
                result, steps: [
                    `k_{\\text{SI}} = ${formatScientificLaTeX(k)}\\text{ N/m}`,
                    `x_{\\text{SI}} = ${formatScientificLaTeX(x)}\\text{ m}`,
                    `F = (${formatScientificLaTeX(k)}) \\cdot (${formatScientificLaTeX(x)})`,
                    `F = ${formatScientificLaTeX(result)}\\text{ N}`
                ]
            };
        }
    },
    momentum_linear: {
        latex: "p = m \\cdot v",
        vars: [
            { label: 'Masa (m)', symbol: 'm', category: 'mass', defaultVal: 70, defaultUnit: 'kg' },
            { label: 'Velocidad (v)', symbol: 'v', category: 'velocity', defaultVal: 8, defaultUnit: 'm/s' }
        ],
        solve: (vars) => {
            const m = vars.m.siVal;
            const v = vars.v.siVal;
            const result = m * v;
            return {
                result, steps: [
                    `m_{\\text{SI}} = ${formatScientificLaTeX(m)}\\text{ kg}`,
                    `v_{\\text{SI}} = ${formatScientificLaTeX(v)}\\text{ m/s}`,
                    `p = (${formatScientificLaTeX(m)}) \\cdot (${formatScientificLaTeX(v)})`,
                    `p = ${formatScientificLaTeX(result)}\\text{ kg·m/s}`
                ]
            };
        }
    },
    gravitation_universal: {
        latex: "F = G \\frac{m_1 \\cdot m_2}{r^2}",
        vars: [
            { label: 'Masa 1 (m1)', symbol: 'm1', category: 'mass', defaultVal: 100, defaultUnit: 'kg' },
            { label: 'Masa 2 (m2)', symbol: 'm2', category: 'mass', defaultVal: 200, defaultUnit: 'kg' },
            { label: 'Distancia (r)', symbol: 'r', category: 'length', defaultVal: 2, defaultUnit: 'm' }
        ],
        solve: (vars) => {
            const m1 = vars.m1.siVal;
            const m2 = vars.m2.siVal;
            const r = vars.r.siVal;
            const G = 6.6743e-11;
            const result = (G * m1 * m2) / Math.pow(r, 2);
            return {
                result, steps: [
                    `m_{1\\text{,SI}} = ${formatScientificLaTeX(m1)}\\text{ kg}`,
                    `m_{2\\text{,SI}} = ${formatScientificLaTeX(m2)}\\text{ kg}`,
                    `r_{\\text{SI}} = ${formatScientificLaTeX(r)}\\text{ m}`,
                    `G = 6.67 \\times 10^{-11}\\text{ m}^3/\\text{kg·s}^2`,
                    `F = 6.67 \\times 10^{-11} \\cdot \\frac{(${formatScientificLaTeX(m1)}) \\cdot (${formatScientificLaTeX(m2)})}{(${formatScientificLaTeX(r)})^2}`,
                    `F = ${formatScientificLaTeX(result)}\\text{ N}`
                ]
            };
        }
    },
    ohm_law: {
        latex: "V = I \\cdot R",
        vars: [
            { label: 'Corriente (I)', symbol: 'i', category: 'electric_current', defaultVal: 5, defaultUnit: 'A' },
            { label: 'Resistencia (R)', symbol: 'r', category: 'resistance', defaultVal: 10, defaultUnit: 'ohm' }
        ],
        solve: (vars) => {
            const i = vars.i.siVal;
            const r = vars.r.siVal;
            const result = i * r;
            return {
                result, steps: [
                    `I_{\\text{SI}} = ${formatScientificLaTeX(i)}\\text{ A}`,
                    `R_{\\text{SI}} = ${formatScientificLaTeX(r)}\\text{ \\Omega}`,
                    `V = (${formatScientificLaTeX(i)}) \\cdot (${formatScientificLaTeX(r)})`,
                    `V = ${formatScientificLaTeX(result)}\\text{ V}`
                ]
            };
        }
    },
    power_electrical: {
        latex: "P = V \\cdot I",
        vars: [
            { label: 'Voltaje (V)', symbol: 'v', category: 'voltage', defaultVal: 120, defaultUnit: 'V' },
            { label: 'Corriente (I)', symbol: 'i', category: 'electric_current', defaultVal: 2, defaultUnit: 'A' }
        ],
        solve: (vars) => {
            const v = vars.v.siVal;
            const i = vars.i.siVal;
            const result = v * i;
            return {
                result, steps: [
                    `V_{\\text{SI}} = ${formatScientificLaTeX(v)}\\text{ V}`,
                    `I_{\\text{SI}} = ${formatScientificLaTeX(i)}\\text{ A}`,
                    `P = (${formatScientificLaTeX(v)}) \\cdot (${formatScientificLaTeX(i)})`,
                    `P = ${formatScientificLaTeX(result)}\\text{ W}`
                ]
            };
        }
    },
    coulomb_law: {
        latex: "F = K_e \\frac{q_1 \\cdot q_2}{r^2}",
        vars: [
            { label: 'Carga 1 (q1)', symbol: 'q1', category: 'charge', defaultVal: 1, defaultUnit: 'uC' },
            { label: 'Carga 2 (q2)', symbol: 'q2', category: 'charge', defaultVal: 2, defaultUnit: 'uC' },
            { label: 'Distancia (r)', symbol: 'r', category: 'length', defaultVal: 50, defaultUnit: 'cm' }
        ],
        solve: (vars) => {
            const q1 = vars.q1.siVal;
            const q2 = vars.q2.siVal;
            const r = vars.r.siVal;
            const K = 8.98755e9;
            const result = (K * q1 * q2) / Math.pow(r, 2);
            return {
                result, steps: [
                    `q_{1\\text{,SI}} = ${formatScientificLaTeX(q1)}\\text{ C}`,
                    `q_{2\\text{,SI}} = ${formatScientificLaTeX(q2)}\\text{ C}`,
                    `r_{\\text{SI}} = ${formatScientificLaTeX(r)}\\text{ m}`,
                    `K_e = 8.99 \\times 10^9\\text{ N·m}^2/\\text{C}^2`,
                    `F = 8.99 \\times 10^9 \\cdot \\frac{(${formatScientificLaTeX(q1)}) \\cdot (${formatScientificLaTeX(q2)})}{(${formatScientificLaTeX(r)})^2}`,
                    `F = ${formatScientificLaTeX(result)}\\text{ N}`
                ]
            };
        }
    },
    wave_frequency: {
        latex: "f = \\frac{v}{\\lambda}",
        vars: [
            { label: 'Velocidad (v)', symbol: 'v', category: 'velocity', defaultVal: 340, defaultUnit: 'm/s' },
            { label: 'Longitud de onda (λ)', symbol: 'lam', category: 'length', defaultVal: 17, defaultUnit: 'cm' }
        ],
        solve: (vars) => {
            const v = vars.v.siVal;
            const lam = vars.lam.siVal;
            const result = v / lam;
            return {
                result, steps: [
                    `v_{\\text{SI}} = ${formatScientificLaTeX(v)}\\text{ m/s}`,
                    `\\lambda_{\\text{SI}} = ${formatScientificLaTeX(lam)}\\text{ m}`,
                    `f = \\frac{${formatScientificLaTeX(v)}}{${formatScientificLaTeX(lam)}}`,
                    `f = ${formatScientificLaTeX(result)}\\text{ Hz}`
                ]
            };
        }
    },
    pressure_basic: {
        latex: "P = \\frac{F}{A}",
        vars: [
            { label: 'Fuerza (F)', symbol: 'f', category: 'force_unit', defaultVal: 500, defaultUnit: 'N' },
            { label: 'Área (A)', symbol: 'a', category: 'area', defaultVal: 2, defaultUnit: 'm^2' }
        ],
        solve: (vars) => {
            const f = vars.f.siVal;
            const a = vars.a.siVal;
            const result = f / a;
            return {
                result, steps: [
                    `F_{\\text{SI}} = ${formatScientificLaTeX(f)}\\text{ N}`,
                    `A_{\\text{SI}} = ${formatScientificLaTeX(a)}\\text{ m}^2`,
                    `P = \\frac{${formatScientificLaTeX(f)}}{${formatScientificLaTeX(a)}}`,
                    `P = ${formatScientificLaTeX(result)}\\text{ Pa}`
                ]
            };
        }
    },
    angular_frequency: {
        latex: "\\omega = 2 \\pi f",
        vars: [
            { label: 'Frecuencia (f)', symbol: 'f', category: 'frequency', defaultVal: 60, defaultUnit: 'Hz' }
        ],
        solve: (vars) => {
            const f = vars.f.siVal;
            const result = 2 * Math.PI * f;
            return {
                result, steps: [
                    `f_{\\text{SI}} = ${formatScientificLaTeX(f)}\\text{ Hz}`,
                    `\\omega = 2 \\cdot \\pi \\cdot (${formatScientificLaTeX(f)})`,
                    `\\omega = ${formatScientificLaTeX(result)}\\text{ rad/s}`
                ]
            };
        }
    },
    sensible_heat: {
        latex: "Q = m \\cdot C_e \\cdot \\Delta T",
        vars: [
            { label: 'Masa (m)', symbol: 'm', category: 'mass', defaultVal: 500, defaultUnit: 'g' },
            { label: 'Calor Específico (Ce)', symbol: 'ce', category: 'generic_val', defaultVal: 4184, defaultUnit: 'SI' },
            { label: 'Variación Temp (ΔT)', symbol: 'dt', category: 'generic_val', defaultVal: 10, defaultUnit: 'SI' }
        ],
        solve: (vars) => {
            const m = vars.m.siVal;
            const ce = vars.ce.siVal;
            const dt = vars.dt.siVal;
            const result = m * ce * dt;
            return {
                result, steps: [
                    `m_{\\text{SI}} = ${formatScientificLaTeX(m)}\\text{ kg}`,
                    `C_{e\\text{,SI}} = ${formatScientificLaTeX(ce)}\\text{ J/kg·°C}`,
                    `\\Delta T_{\\text{SI}} = ${formatScientificLaTeX(dt)}\\text{ °C}`,
                    `Q = (${formatScientificLaTeX(m)}) \\cdot (${formatScientificLaTeX(ce)}) \\cdot (${formatScientificLaTeX(dt)})`,
                    `Q = ${formatScientificLaTeX(result)}\\text{ J}`
                ]
            };
        }
    },
    torque_mechanical: {
        latex: "\\tau = F \\cdot r",
        vars: [
            { label: 'Fuerza (F)', symbol: 'f', category: 'force_unit', defaultVal: 80, defaultUnit: 'N' },
            { label: 'Brazo de palanca (r)', symbol: 'r', category: 'length', defaultVal: 25, defaultUnit: 'cm' }
        ],
        solve: (vars) => {
            const f = vars.f.siVal;
            const r = vars.r.siVal;
            const result = f * r;
            return {
                result, steps: [
                    `F_{\\text{SI}} = ${formatScientificLaTeX(f)}\\text{ N}`,
                    `r_{\\text{SI}} = ${formatScientificLaTeX(r)}\\text{ m}`,
                    `\\tau = (${formatScientificLaTeX(f)}) \\cdot (${formatScientificLaTeX(r)})`,
                    `\\tau = ${formatScientificLaTeX(result)}\\text{ N·m}`
                ]
            };
        }
    },
    angular_velocity: {
        latex: "\\omega = \\frac{\\theta}{t}",
        vars: [
            { label: 'Desplazamiento (θ en rad)', symbol: 'theta', category: 'generic_val', defaultVal: 6.28, defaultUnit: 'SI' },
            { label: 'Tiempo (t)', symbol: 't', category: 'time', defaultVal: 2, defaultUnit: 's' }
        ],
        solve: (vars) => {
            const theta = vars.theta.siVal;
            const t = vars.t.siVal;
            const result = theta / t;
            return {
                result, steps: [
                    `\\theta_{\\text{SI}} = ${formatScientificLaTeX(theta)}\\text{ rad}`,
                    `t_{\\text{SI}} = ${formatScientificLaTeX(t)}\\text{ s}`,
                    `\\omega = \\frac{${formatScientificLaTeX(theta)}}{${formatScientificLaTeX(t)}}`,
                    `\\omega = ${formatScientificLaTeX(result)}\\text{ rad/s}`
                ]
            };
        }
    },
    centripetal_acceleration: {
        latex: "a_c = \\frac{v^2}{r}",
        vars: [
            { label: 'Velocidad (v)', symbol: 'v', category: 'velocity', defaultVal: 20, defaultUnit: 'm/s' },
            { label: 'Radio de giro (r)', symbol: 'r', category: 'length', defaultVal: 10, defaultUnit: 'm' }
        ],
        solve: (vars) => {
            const v = vars.v.siVal;
            const r = vars.r.siVal;
            const result = Math.pow(v, 2) / r;
            return {
                result, steps: [
                    `v_{\\text{SI}} = ${formatScientificLaTeX(v)}\\text{ m/s}`,
                    `r_{\\text{SI}} = ${formatScientificLaTeX(r)}\\text{ m}`,
                    `a_c = \\frac{(${formatScientificLaTeX(v)})^2}{${formatScientificLaTeX(r)}}`,
                    `a_c = ${formatScientificLaTeX(result)}\\text{ m/s}^2`
                ]
            };
        }
    },
    centripetal_force: {
        latex: "F_c = \\frac{m \\cdot v^2}{r}",
        vars: [
            { label: 'Masa (m)', symbol: 'm', category: 'mass', defaultVal: 1200, defaultUnit: 'kg' },
            { label: 'Velocidad (v)', symbol: 'v', category: 'velocity', defaultVal: 15, defaultUnit: 'm/s' },
            { label: 'Radio (r)', symbol: 'r', category: 'length', defaultVal: 50, defaultUnit: 'm' }
        ],
        solve: (vars) => {
            const m = vars.m.siVal;
            const v = vars.v.siVal;
            const r = vars.r.siVal;
            const result = (m * Math.pow(v, 2)) / r;
            return {
                result, steps: [
                    `m_{\\text{SI}} = ${formatScientificLaTeX(m)}\\text{ kg}`,
                    `v_{\\text{SI}} = ${formatScientificLaTeX(v)}\\text{ m/s}`,
                    `r_{\\text{SI}} = ${formatScientificLaTeX(r)}\\text{ m}`,
                    `F_c = \\frac{(${formatScientificLaTeX(m)}) \\cdot (${formatScientificLaTeX(v)})^2}{${formatScientificLaTeX(r)}}`,
                    `F_c = ${formatScientificLaTeX(result)}\\text{ N}`
                ]
            };
        }
    },
    pendulum_period: {
        latex: "T = 2 \\pi \\sqrt{\\frac{L}{g}}",
        vars: [
            { label: 'Longitud (L)', symbol: 'l', category: 'length', defaultVal: 1, defaultUnit: 'm' }
        ],
        solve: (vars) => {
            const l = vars.l.siVal;
            const g = 9.80665;
            const result = 2 * Math.PI * Math.sqrt(l / g);
            return {
                result, steps: [
                    `L_{\\text{SI}} = ${formatScientificLaTeX(l)}\\text{ m}`,
                    `g = 9.81\\text{ m/s}^2`,
                    `T = 2 \\cdot \\pi \\cdot \\sqrt{\\frac{${formatScientificLaTeX(l)}}{9.81}}`,
                    `T = ${formatScientificLaTeX(result)}\\text{ s}`
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
        Object.keys(extendedCategories[v.category].units).forEach(uKey => {
            const u = extendedCategories[v.category].units[uKey];
            const selected = uKey === v.defaultUnit ? 'selected' : '';
            unitOptions += `<option value="${uKey}" ${selected}>${u.symbol || uKey}</option>`;
        });

        div.innerHTML = `
            <label class="block text-[11px] font-mono text-zinc-500 uppercase">${v.label}</label>
            <div class="flex gap-2">
                <input type="number" id="input-val-${v.symbol}" value="${v.defaultVal}" class="w-2/3 bg-[#121217] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-zinc-700 text-zinc-200">
                <select id="input-unit-${v.symbol}" class="w-1/3 bg-[#121217] border border-white/10 rounded-lg px-2 py-1.5 text-xs focus:outline-none text-zinc-200">
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
        const unitMultiplier = extendedCategories[v.category].units[unit].multiplier;
        
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

    const aSi = aVal * extendedCategories.length.units[aUnit].multiplier;
    const bSi = bVal * extendedCategories.length.units[bUnit].multiplier;
    const cSi = cVal * extendedCategories.length.units[cUnit].multiplier;
    const dSi = dVal * extendedCategories.length.units[dUnit].multiplier;

    const sumSi = aSi + bSi - cSi;
    const areaSi = sumSi * dSi;

    const targetMultiplier = extendedCategories.area.units[targetUnit].multiplier;
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

document.addEventListener('DOMContentLoaded', () => {
    renderVariables();
    setTimeout(() => {
        solvePhysics();
        solvePolynomial();
    }, 200);
    
    if (window.lucide) window.lucide.createIcons();
});
