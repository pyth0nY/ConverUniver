/**
 * Conversor Universal - Controlador de Visualización Científica Avanzada (Plotly.js)
 * Renderiza cilindros, esferas, rejillas de radar, secciones cónicas y superficies en tiempo real.
 */

document.addEventListener('DOMContentLoaded', () => {
    const selectSystem = document.getElementById('coord-system');
    const inputsContainer = document.getElementById('inputs-container');
    const outputRep = document.getElementById('output-cartesian-repr');
    const plotCanvas = document.getElementById('plot-canvas');

    // --- FUNCIÓN DE CONTROL DE RENDERIZADO MATHJAX (CON SENSADO DE CARGA ASÍNCRONA) ---
    function renderMath(element, latexString) {
        element.innerHTML = latexString;
        if (window.MathJax && typeof MathJax.typesetPromise === 'function') {
            try {
                // Compila y dibuja el código LaTeX directamente en el elemento
                MathJax.typesetPromise([element]).catch(err => console.error("Error MathJax:", err));
            } catch (e) {
                console.error("Error typeset:", e);
            }
        }
    }

    // --- LEER INPUTS CON RESPALDO PREVENTIVO (EVITA CONGELAMIENTO POR NULOS) ---
    const getVal = (id, fallback) => {
        const el = document.getElementById(id);
        return el ? (parseFloat(el.value) ?? fallback) : fallback;
    };

    const getSelectVal = (id, fallback) => {
        const el = document.getElementById(id);
        return el ? el.value : fallback;
    };

    // Mapeo de formularios dinámicos
    const formsHTML = {
        'rect-2d': `
            <div class="grid grid-cols-2 gap-2 animate-fade-in">
                <div>
                    <label class="block text-[9px] font-mono text-zinc-500 mb-1">Coordenada X</label>
                    <input type="number" id="in-x" value="4" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-[9px] font-mono text-zinc-500 mb-1">Coordenada Y</label>
                    <input type="number" id="in-y" value="3" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                </div>
            </div>
        `,
        'rect-3d': `
            <div class="grid grid-cols-3 gap-2 animate-fade-in">
                <div>
                    <label class="block text-[9px] font-mono text-zinc-500 mb-1">Coord. X</label>
                    <input type="number" id="in-x" value="3" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-[9px] font-mono text-zinc-500 mb-1">Coord. Y</label>
                    <input type="number" id="in-y" value="4" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-[9px] font-mono text-zinc-500 mb-1">Coord. Z</label>
                    <input type="number" id="in-z" value="5" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                </div>
            </div>
        `,
        'polar-2d': `
            <div class="grid grid-cols-2 gap-2 animate-fade-in">
                <div>
                    <label class="block text-[9px] font-mono text-zinc-500 mb-1">Radio (r)</label>
                    <input type="number" id="in-r" value="6" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-[9px] font-mono text-zinc-500 mb-1">Ángulo (θ en grados)</label>
                    <input type="number" id="in-theta" value="60" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                </div>
            </div>
        `,
        'cylindrical-3d': `
            <div class="grid grid-cols-3 gap-2 animate-fade-in">
                <div>
                    <label class="block text-[9px] font-mono text-zinc-500 mb-1">Radio (r)</label>
                    <input type="number" id="in-r" value="5" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-[9px] font-mono text-zinc-500 mb-1">Ángulo (θ°)</label>
                    <input type="number" id="in-theta" value="45" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-[9px] font-mono text-zinc-500 mb-1">Altura (z)</label>
                    <input type="number" id="in-z" value="4" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                </div>
            </div>
        `,
        'spherical-3d': `
            <div class="grid grid-cols-3 gap-2 animate-fade-in">
                <div>
                    <label class="block text-[9px] font-mono text-zinc-500 mb-1">Radio (ρ)</label>
                    <input type="number" id="in-rho" value="5" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-[9px] font-mono text-zinc-500 mb-1">Azimut (θ°)</label>
                    <input type="number" id="in-theta" value="120" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-[9px] font-mono text-zinc-500 mb-1">Elevación (φ°)</label>
                    <input type="number" id="in-phi" value="60" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                </div>
            </div>
        `,
        'formula-free': `
            <div class="space-y-3 animate-fade-in">
                <div>
                    <label class="block text-[9px] font-mono text-zinc-500 mb-1">Ecuación de Superficie z = f(x, y)</label>
                    <input type="text" id="in-formula" value="sin(x) * cos(y)" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500 font-mono">
                </div>
                <!-- Parámetros del Dominio (Rango) -->
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-[9px] font-mono text-zinc-500 mb-1">Eje X (min / max)</label>
                        <div class="flex items-center gap-1">
                            <input type="number" id="in-xmin" value="-5" class="w-1/2 bg-zinc-900 border border-white/10 rounded-lg px-1.5 py-1 text-center text-xs text-zinc-100">
                            <input type="number" id="in-xmax" value="5" class="w-1/2 bg-zinc-900 border border-white/10 rounded-lg px-1.5 py-1 text-center text-xs text-zinc-100">
                        </div>
                    </div>
                    <div>
                        <label class="block text-[9px] font-mono text-zinc-500 mb-1">Eje Y (min / max)</label>
                        <div class="flex items-center gap-1">
                            <input type="number" id="in-ymin" value="-5" class="w-1/2 bg-zinc-900 border border-white/10 rounded-lg px-1.5 py-1 text-center text-xs text-zinc-100">
                            <input type="number" id="in-ymax" value="5" class="w-1/2 bg-zinc-900 border border-white/10 rounded-lg px-1.5 py-1 text-center text-xs text-zinc-100">
                        </div>
                    </div>
                </div>
                <!-- Galería de Presets -->
                <div>
                    <span class="block text-[9px] font-mono text-zinc-600 uppercase mb-1.5">Estructuras Famosas</span>
                    <div class="grid grid-cols-2 gap-1.5">
                        <button class="btn-preset text-left px-2 py-1.5 bg-zinc-950 border border-white/5 rounded text-[10px] text-zinc-400 hover:text-zinc-100 hover:border-indigo-500/40 transition-all font-mono" data-formula="x^2 - y^2" data-min="-3" data-max="3">Silla de Montar</button>
                        <button class="btn-preset text-left px-2 py-1.5 bg-zinc-950 border border-white/5 rounded text-[10px] text-zinc-400 hover:text-zinc-100 hover:border-indigo-500/40 transition-all font-mono" data-formula="sin(sqrt(x^2+y^2)) / (sqrt(x^2+y^2) + 0.1)" data-min="-8" data-max="8">Sombrero Chino</button>
                        <button class="btn-preset text-left px-2 py-1.5 bg-zinc-950 border border-white/5 rounded text-[10px] text-zinc-400 hover:text-zinc-100 hover:border-indigo-500/40 transition-all font-mono" data-formula="sin(x) * cos(y)" data-min="-5" data-max="5">Ondas Cruzadas</button>
                        <button class="btn-preset text-left px-2 py-1.5 bg-zinc-950 border border-white/5 rounded text-[10px] text-zinc-400 hover:text-zinc-100 hover:border-indigo-500/40 transition-all font-mono" data-formula="0.1 * (x^2 + y^2)" data-min="-6" data-max="6">Paraboloide</button>
                    </div>
                </div>
                <!-- Guía rápida de uso de operadores -->
                <div class="p-3 bg-zinc-950/45 border border-white/5 rounded-lg text-[9px] text-zinc-500 leading-relaxed font-sans space-y-0.5">
                    <span class="font-semibold text-zinc-400 block mb-1">Guía matemática:</span>
                    <p>• Escribe variables en minúsculas: <code class="text-zinc-300 font-mono">x</code>, <code class="text-zinc-300 font-mono">y</code></p>
                    <p>• Soporta: <code class="text-zinc-300 font-mono">sin()</code>, <code class="text-zinc-300 font-mono">cos()</code>, <code class="text-zinc-300 font-mono">sqrt()</code>, <code class="text-zinc-300 font-mono">pi</code></p>
                    <p>• Potencias: <code class="text-zinc-300 font-mono">x^2</code> (x al cuadrado)</p>
                </div>
            </div>
        `,
        'conic-circle': `
            <div class="grid grid-cols-3 gap-2 animate-fade-in">
                <div>
                    <label class="block text-[9px] font-mono text-zinc-500 mb-1">Centro h</label>
                    <input type="number" id="in-h" value="0" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-[9px] font-mono text-zinc-500 mb-1">Centro k</label>
                    <input type="number" id="in-k" value="0" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-[9px] font-mono text-zinc-500 mb-1">Radio (r)</label>
                    <input type="number" id="in-r" value="4" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                </div>
            </div>
        `,
        'conic-ellipse': `
            <div class="grid grid-cols-4 gap-1.5 animate-fade-in">
                <div>
                    <label class="block text-[9px] font-mono text-zinc-500 mb-1">Centro h</label>
                    <input type="number" id="in-h" value="0" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-1.5 py-1 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-[9px] font-mono text-zinc-500 mb-1">Centro k</label>
                    <input type="number" id="in-k" value="0" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-1.5 py-1 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-[9px] font-mono text-zinc-500 mb-1">Semieje a</label>
                    <input type="number" id="in-a" value="5" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-1.5 py-1 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-[9px] font-mono text-zinc-500 mb-1">Semieje b</label>
                    <input type="number" id="in-b" value="3" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-1.5 py-1 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                </div>
            </div>
        `,
        'conic-parabola': `
            <div class="space-y-2 animate-fade-in">
                <div class="grid grid-cols-3 gap-2">
                    <div>
                        <label class="block text-[9px] font-mono text-zinc-500 mb-1">Vértice h</label>
                        <input type="number" id="in-h" value="0" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                    </div>
                    <div>
                        <label class="block text-[9px] font-mono text-zinc-500 mb-1">Vértice k</label>
                        <input type="number" id="in-k" value="0" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                    </div>
                    <div>
                        <label class="block text-[9px] font-mono text-zinc-500 mb-1">Parámetro p</label>
                        <input type="number" id="in-p" value="1.5" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                    </div>
                </div>
                <div>
                    <label class="block text-[9px] font-mono text-zinc-500 mb-1">Orientación</label>
                    <select id="in-orient" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:outline-none">
                        <option value="vertical" selected>Vertical (Abre hacia arriba / abajo)</option>
                        <option value="horizontal">Horizontal (Abre hacia lados)</option>
                    </select>
                </div>
            </div>
        `,
        'conic-hyperbola': `
            <div class="space-y-2 animate-fade-in">
                <div class="grid grid-cols-4 gap-1.5">
                    <div>
                        <label class="block text-[9px] font-mono text-zinc-500 mb-1">Centro h</label>
                        <input type="number" id="in-h" value="0" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-1.5 py-1 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                    </div>
                    <div>
                        <label class="block text-[9px] font-mono text-zinc-500 mb-1">Centro k</label>
                        <input type="number" id="in-k" value="0" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-1.5 py-1 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                    </div>
                    <div>
                        <label class="block text-[9px] font-mono text-zinc-500 mb-1">Semieje a</label>
                        <input type="number" id="in-a" value="3" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-1.5 py-1 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                    </div>
                    <div>
                        <label class="block text-[9px] font-mono text-zinc-500 mb-1">Semieje b</label>
                        <input type="number" id="in-b" value="2" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-1.5 py-1 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                    </div>
                </div>
                <div>
                    <label class="block text-[9px] font-mono text-zinc-500 mb-1">Orientación</label>
                    <select id="in-orient" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:outline-none">
                        <option value="horizontal" selected>Horizontal (Se abre a los lados)</option>
                        <option value="vertical">Vertical (Se abre arriba y abajo)</option>
                    </select>
                </div>
            </div>
        `
    };

    // --- CONFIGURACIÓN BASE ESTILO DARK SHADCN ---
    const darkThemeLayout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#a1a1aa', family: 'JetBrains Mono' },
        showlegend: true, 
        legend: { x: 0, y: 1, font: { size: 9 }, bgcolor: 'rgba(0,0,0,0)' },
        margin: { t: 10, b: 10, l: 10, r: 10 },
        scene: {
            xaxis: { gridcolor: '#27272a', zerolinecolor: '#52525b', backgroundcolor: 'rgba(0,0,0,0)', title: 'Eje X' },
            yaxis: { gridcolor: '#27272a', zerolinecolor: '#52525b', backgroundcolor: 'rgba(0,0,0,0)', title: 'Eje Y' },
            zaxis: { gridcolor: '#27272a', zerolinecolor: '#52525b', backgroundcolor: 'rgba(0,0,0,0)', title: 'Eje Z' },
            aspectmode: 'cube' 
        },
        xaxis: { gridcolor: '#27272a', zerolinecolor: '#52525b', title: 'Eje X' },
        yaxis: { gridcolor: '#27272a', zerolinecolor: '#52525b', title: 'Eje Y' }
    };

    // --- GENERADORES GEOMÉTRICOS AUXILIARES ---

    function getCircleCoords(r, z = 0) {
        const x = [], y = [], zArr = [];
        for (let i = 0; i <= 360; i += 4) {
            const rad = i * (Math.PI / 180);
            x.push(r * Math.cos(rad));
            y.push(r * Math.sin(rad));
            zArr.push(z);
        }
        return { x, y, z: zArr };
    }

    function getSphereWireframe(rho) {
        const traces = [];
        
        // Anillo XY (Ecuador)
        const xy = getCircleCoords(rho, 0);
        traces.push({
            type: 'scatter3d', x: xy.x, y: xy.y, z: xy.z, mode: 'lines',
            line: { color: 'rgba(99, 102, 241, 0.15)', width: 1.5 },
            name: 'Guía Ecuador'
        });

        // Anillo XZ (Meridiano 0)
        const xzX = [], xzY = [], xzZ = [];
        for (let i = 0; i <= 360; i += 5) {
            const rad = i * (Math.PI / 180);
            xzX.push(rho * Math.cos(rad));
            xzY.push(0);
            xzZ.push(rho * Math.sin(rad));
        }
        traces.push({
            type: 'scatter3d', x: xzX, y: xzY, z: xzZ, mode: 'lines',
            line: { color: 'rgba(99, 102, 241, 0.15)', width: 1.5 },
            name: 'Guía Meridiano'
        });

        return traces;
    }

    // --- PROCESADOR Y REDIBUJADO DE GRÁFICA EN TIEMPO REAL ---
    function updatePlot() {
        const sys = selectSystem.value;
        let traces = [];
        let infoText = "";

        // Limpieza de memoria WebGL en un bloque catch para evitar colapsos
        try {
            Plotly.purge(plotCanvas);
        } catch (e) {}

        // CONFIGURACIÓN DE ASPECTO 1:1 EN 2D PARA EVITAR DEFORMACIÓN DE CÍRCULOS
        const layout2D = {
            ...darkThemeLayout,
            xaxis: { ...darkThemeLayout.xaxis, scaleanchor: 'y', scaleratio: 1 },
            yaxis: { ...darkThemeLayout.yaxis },
            scene: undefined 
        };

        if (sys === 'rect-2d') {
            const x = getVal('in-x', 4);
            const y = getVal('in-y', 3);
            infoText = `$$ P = (${x.toFixed(4)}, ${y.toFixed(4)}) $$`;

            const maxVal = Math.max(Math.abs(x), Math.abs(y), 5) * 1.25;

            traces = [
                { x: [0, x, x], y: [0, 0, y], mode: 'lines', line: { color: 'rgba(255, 255, 255, 0.15)', width: 1.5, dash: 'dash' }, name: 'Guía X' },
                { x: [0, 0, x], y: [0, y, y], mode: 'lines', line: { color: 'rgba(255, 255, 255, 0.15)', width: 1.5, dash: 'dash' }, name: 'Guía Y' },
                { x: [0, x], y: [0, y], mode: 'lines', line: { color: '#6366f1', width: 3.5 }, name: 'Radio Vector' },
                { x: [x], y: [y], mode: 'markers', marker: { size: 11, color: '#ec4899', line: { color: '#ffffff', width: 1 } }, name: 'Punto P' }
            ];

            layout2D.xaxis.range = [-maxVal, maxVal];
            layout2D.yaxis.range = [-maxVal, maxVal];
            layout2D.showlegend = false;

            Plotly.newPlot(plotCanvas, traces, layout2D);

        } else if (sys === 'rect-3d') {
            const x = getVal('in-x', 3);
            const y = getVal('in-y', 4);
            const z = getVal('in-z', 5);
            infoText = `$$ P = (${x.toFixed(4)}, ${y.toFixed(4)}, ${z.toFixed(4)}) $$`;

            traces.push({
                type: 'scatter3d', x: [0, x, x, 0, 0], y: [0, 0, y, y, 0], z: [0, 0, 0, 0, 0],
                mode: 'lines', line: { color: 'rgba(255, 255, 255, 0.12)', width: 1.5, dash: 'dash' }, name: 'Guías Base'
            });
            traces.push({
                type: 'scatter3d', x: [0, x, x, 0, 0], y: [0, 0, y, y, 0], z: [z, z, z, z, z],
                mode: 'lines', line: { color: 'rgba(255, 255, 255, 0.12)', width: 1.5, dash: 'dash' }, name: 'Guías Altura'
            });
            [[0, 0], [x, 0], [x, y], [0, y]].forEach(([px, py]) => {
                traces.push({
                    type: 'scatter3d', x: [px, px], y: [py, py], z: [0, z],
                    mode: 'lines', line: { color: 'rgba(255, 255, 255, 0.12)', width: 1.5, dash: 'dash' }, showlegend: false
                });
            });

            traces.push({
                type: 'scatter3d', x: [0, x], y: [0, y], z: [0, z], mode: 'lines',
                line: { color: '#6366f1', width: 4.5 }, name: 'Vector P'
            });
            traces.push({
                type: 'scatter3d', x: [x], y: [y], z: [z], mode: 'markers',
                marker: { size: 6.5, color: '#ec4899', line: { color: '#ffffff', width: 1 } }, name: 'Punto P'
            });

            Plotly.newPlot(plotCanvas, traces, { ...darkThemeLayout, showlegend: false });

        } else if (sys === 'polar-2d') {
            const r = Math.abs(getVal('in-r', 6));
            const theta = getVal('in-theta', 0);
            const thetaRad = theta * (Math.PI / 180);

            const px = r * Math.cos(thetaRad);
            const py = r * Math.sin(thetaRad);
            infoText = `$$ r = ${r}, \\theta = ${theta}^{\\circ} \\Rightarrow P = (${px.toFixed(4)}, ${py.toFixed(4)}) $$`;

            const limit = Math.max(r, 5) * 1.25;

            const circles = [r * 0.33, r * 0.66, r];
            circles.forEach(radius => {
                const c = getCircleCoords(radius, 0);
                traces.push({
                    x: c.x, y: c.y, mode: 'lines',
                    line: { color: 'rgba(255, 255, 255, 0.08)', width: 1.2 }
                });
            });

            [0, 45, 90, 135].forEach(deg => {
                const rad = deg * (Math.PI / 180);
                const rx = r * Math.cos(rad);
                const ry = r * Math.sin(rad);
                traces.push({
                    x: [-rx, rx], y: [-ry, ry], mode: 'lines',
                    line: { color: 'rgba(255, 255, 255, 0.05)', width: 1 }
                });
            });

            traces.push({
                x: [0, px], y: [0, py], mode: 'lines',
                line: { color: '#6366f1', width: 4 }
            });
            traces.push({
                x: [px], y: [py], mode: 'markers',
                marker: { size: 10, color: '#ec4899', line: { color: '#ffffff', width: 1 } }
            });

            layout2D.xaxis.range = [-limit, limit];
            layout2D.yaxis.range = [-limit, limit];
            layout2D.showlegend = false;

            Plotly.newPlot(plotCanvas, traces, layout2D);

        } else if (sys === 'cylindrical-3d') {
            const r = Math.abs(getVal('in-r', 5));
            const theta = getVal('in-theta', 45);
            const thetaRad = theta * (Math.PI / 180);
            const zVal = getVal('in-z', 4);

            const cx = r * Math.cos(thetaRad);
            const cy = r * Math.sin(thetaRad);
            infoText = `$$ r = ${r}, \\theta = ${theta}^{\\circ}, z = ${zVal} \\Rightarrow P = (${cx.toFixed(4)}, ${cy.toFixed(4)}, ${zVal}) $$`;

            const baseCircle = getCircleCoords(r, 0);
            const topCircle = getCircleCoords(r, zVal);
            traces.push({
                type: 'scatter3d', x: baseCircle.x, y: baseCircle.y, z: baseCircle.z,
                mode: 'lines', line: { color: 'rgba(168, 85, 247, 0.12)', width: 1.5 }, name: 'Base Radial'
            });
            traces.push({
                type: 'scatter3d', x: topCircle.x, y: topCircle.y, z: topCircle.z,
                mode: 'lines', line: { color: 'rgba(168, 85, 247, 0.12)', width: 1.5 }, name: 'Superficie Z'
            });

            traces.push({
                type: 'scatter3d', x: [0, cx], y: [0, cy], z: [0, 0],
                mode: 'lines', line: { color: 'rgba(255, 255, 255, 0.25)', width: 2, dash: 'dash' }, name: 'Rastro XY'
            });
            traces.push({
                type: 'scatter3d', x: [cx, cx], y: [cy, cy], z: [0, zVal],
                mode: 'lines', line: { color: '#ec4899', width: 2, dash: 'dash' }, name: 'Altura Z'
            });
            traces.push({
                type: 'scatter3d', x: [0, cx], y: [0, cy], z: [0, zVal],
                mode: 'lines', line: { color: '#6366f1', width: 4 }, name: 'Vector P'
            });
            traces.push({
                type: 'scatter3d', x: [cx], y: [cy], z: [zVal],
                mode: 'markers', marker: { size: 6.5, color: '#ec4899', line: { color: '#ffffff', width: 1 } }, name: 'Punto P'
            });

            Plotly.newPlot(plotCanvas, traces, darkThemeLayout);

        } else if (sys === 'spherical-3d') {
            const rho = Math.abs(getVal('in-rho', 5));
            const theta = getVal('in-theta', 120);
            const phi = getVal('in-phi', 60);
            const thetaRad = theta * (Math.PI / 180);
            const phiRad = phi * (Math.PI / 180);

            const sx = rho * Math.sin(phiRad) * Math.cos(thetaRad);
            const sy = rho * Math.sin(phiRad) * Math.sin(thetaRad);
            const sz = rho * Math.cos(phiRad);
            infoText = `$$ \\rho = ${rho}, \\theta = ${theta}^{\\circ}, \\phi = ${phi}^{\\circ} \\Rightarrow P = (${sx.toFixed(4)}, ${sy.toFixed(4)}, ${sz.toFixed(4)}) $$`;

            const sphereTraces = getSphereWireframe(rho);
            traces.push(...sphereTraces);

            const projectionRadius = rho * Math.sin(phiRad);
            const projX = projectionRadius * Math.cos(thetaRad);
            const projY = projectionRadius * Math.sin(thetaRad);

            traces.push({
                type: 'scatter3d', x: [0, projX], y: [0, projY], z: [0, 0],
                mode: 'lines', line: { color: 'rgba(255, 255, 255, 0.25)', width: 2, dash: 'dash' }, name: 'Rastro XY'
            });
            traces.push({
                type: 'scatter3d', x: [projX, projX], y: [projY, projY], z: [0, sz],
                mode: 'lines', line: { color: 'rgba(255, 255, 255, 0.25)', width: 2, dash: 'dash' }, showlegend: false
            });

            const arcThetaX = [], arcThetaY = [], arcThetaZ = [];
            const thetaArcRadius = rho * 0.45;
            for (let a = 0; a <= Math.abs(theta); a += 2.5) {
                const currentRad = (theta >= 0 ? a : -a) * (Math.PI / 180);
                arcThetaX.push(thetaArcRadius * Math.cos(currentRad));
                arcThetaY.push(thetaArcRadius * Math.sin(currentRad));
                arcThetaZ.push(0);
            }
            traces.push({
                type: 'scatter3d', x: arcThetaX, y: arcThetaY, z: arcThetaZ,
                mode: 'lines', line: { color: '#22d3ee', width: 3.5 }, name: 'θ (Azimut)'
            });

            const arcPhiX = [], arcPhiY = [], arcPhiZ = [];
            const phiArcRadius = rho * 0.55;
            for (let a = 0; a <= phi; a += 2.5) {
                const currentRad = a * (Math.PI / 180);
                arcPhiX.push(phiArcRadius * Math.sin(currentRad) * Math.cos(thetaRad));
                arcPhiY.push(phiArcRadius * Math.sin(currentRad) * Math.sin(thetaRad));
                arcPhiZ.push(phiArcRadius * Math.cos(currentRad));
            }
            traces.push({
                type: 'scatter3d', x: arcPhiX, y: arcPhiY, z: arcPhiZ,
                mode: 'lines', line: { color: '#fb7185', width: 3.5 }, name: 'φ (Elevación)'
            });

            traces.push({
                type: 'scatter3d', x: [0, sx], y: [0, sy], z: [0, sz],
                mode: 'lines', line: { color: '#6366f1', width: 4.5 }, name: 'Radio ρ'
            });
            traces.push({
                type: 'scatter3d', x: [sx], y: [sy], z: [sz],
                mode: 'markers', marker: { size: 6.5, color: '#ec4899', line: { color: '#ffffff', width: 1 } }, name: 'Punto P'
            });

            Plotly.newPlot(plotCanvas, traces, darkThemeLayout);

        } else if (sys === 'formula-free') {
            const formulaInput = document.getElementById('in-formula');
            const formula = formulaInput ? formulaInput.value.trim() : "sin(x) * cos(y)";
            
            const xMin = getVal('in-xmin', -5);
            const xMax = getVal('in-xmax', 5);
            const yMin = getVal('in-ymin', -5);
            const yMax = getVal('in-ymax', 5);

            infoText = `$$ z = ${formula.replace(/\*/g, ' \\cdot ')} $$`;

            const xVals = [], yVals = [];
            const stepX = (xMax - xMin) / 30;
            const stepY = (yMax - yMin) / 30;

            for (let i = xMin; i <= xMax; i += stepX) {
                xVals.push(i);
            }
            for (let j = yMin; j <= yMax; j += stepY) {
                yVals.push(j);
            }

            const parsedFormula = formula
                .replace(/sin/g, 'Math.sin')
                .replace(/cos/g, 'Math.cos')
                .replace(/tan/g, 'Math.tan')
                .replace(/pi/g, 'Math.PI')
                .replace(/sqrt/g, 'Math.sqrt')
                .replace(/abs/g, 'Math.abs')
                .replace(/\^/g, '**');

            const zMatrix = [];
            for (let j = 0; j < yVals.length; j++) {
                const row = [];
                for (let i = 0; i < xVals.length; i++) {
                    try {
                        const evaluated = Function('x', 'y', `return ${parsedFormula}`)(xVals[i], yVals[j]);
                        row.push(isNaN(evaluated) ? 0 : evaluated);
                    } catch (e) {
                        row.push(0);
                    }
                }
                zMatrix.push(row);
            }

            traces = [{
                z: zMatrix,
                x: xVals,
                y: yVals,
                type: 'surface',
                colorscale: 'Viridis',
                showscale: false
            }];

            Plotly.newPlot(plotCanvas, traces, { ...darkThemeLayout, showlegend: false });

        } else if (sys === 'conic-circle') {
            const h = getVal('in-h', 0);
            const k = getVal('in-k', 0);
            const r = Math.abs(getVal('in-r', 4));
            infoText = `$$ (x - ${h})^2 + (y - ${k})^2 = ${r}^2 $$`;

            const circle = getCircleCoords(r, 0);
            const cx = circle.x.map(val => val + h);
            const cy = circle.y.map(val => val + k);

            const limit = Math.max(r + Math.abs(h), r + Math.abs(k), 5) * 1.25;

            traces = [
                { x: [h], y: [k], mode: 'markers', marker: { size: 9, color: '#22d3ee', line: { color: '#ffffff', width: 1 } }, name: 'Centro C(h, k)' },
                { x: [h, h + r * Math.cos(Math.PI / 4)], y: [k, k + r * Math.sin(Math.PI / 4)], mode: 'lines', line: { color: 'rgba(255, 255, 255, 0.35)', width: 2, dash: 'dash' }, name: `Radio r = ${r}` },
                { x: cx, y: cy, mode: 'lines', line: { color: '#6366f1', width: 3.5 }, name: 'Circunferencia' }
            ];

            const layout2D = {
                ...darkThemeLayout,
                xaxis: { ...darkThemeLayout.xaxis, range: [-limit, limit], scaleanchor: 'y', scaleratio: 1 },
                yaxis: { ...darkThemeLayout.yaxis, range: [-limit, limit] },
                showlegend: true
            };

            Plotly.newPlot(plotCanvas, traces, layout2D);

        } else if (sys === 'conic-ellipse') {
            const h = getVal('in-h', 0);
            const k = getVal('in-k', 0);
            const a = Math.abs(getVal('in-a', 5));
            const b = Math.abs(getVal('in-b', 3));
            infoText = `$$ \\frac{(x - ${h})^2}{${a}^2} + \\frac{(y - ${k})^2}{${b}^2} = 1 $$`;

            const ex = [], ey = [];
            for (let i = 0; i <= 360; i += 4) {
                const rad = i * (Math.PI / 180);
                ex.push(h + a * Math.cos(rad));
                ey.push(k + b * Math.sin(rad));
            }

            const limit = Math.max(a + Math.abs(h), b + Math.abs(k), 5) * 1.25;

            traces = [
                { x: [h], y: [k], mode: 'markers', marker: { size: 9, color: '#22d3ee', line: { color: '#ffffff', width: 1 } }, name: 'Centro C(h, k)' },
                { x: [h - a, h + a], y: [k, k], mode: 'lines', line: { color: 'rgba(255, 255, 255, 0.15)', width: 1.5, dash: 'dash' }, name: `Eje real a = ${a}` },
                { x: [h, h], y: [k - b, k + b], mode: 'lines', line: { color: 'rgba(255, 255, 255, 0.15)', width: 1.5, dash: 'dash' }, name: `Eje imaginario b = ${b}` },
                { x: ex, y: ey, mode: 'lines', line: { color: '#6366f1', width: 3.5 }, name: 'Elipse' }
            ];

            const layout2D = {
                ...darkThemeLayout,
                xaxis: { ...darkThemeLayout.xaxis, range: [-limit, limit], scaleanchor: 'y', scaleratio: 1 },
                yaxis: { ...darkThemeLayout.yaxis, range: [-limit, limit] },
                showlegend: true
            };

            Plotly.newPlot(plotCanvas, traces, layout2D);

        } else if (sys === 'conic-parabola') {
            const h = getVal('in-h', 0);
            const k = getVal('in-k', 0);
            const p = getVal('in-p', 1.5);
            const orient = getSelectVal('in-orient', 'vertical');

            const px = [], py = [];
            let focusX = h, focusY = k;
            let directrixTrace = {};

            const maxExtent = 12;

            if (orient === 'vertical') {
                infoText = `$$ (x - ${h})^2 = 4(${p})(y - ${k}) $$`;
                focusY = k + p;

                for (let val = h - maxExtent; val <= h + maxExtent; val += 0.25) {
                    px.push(val);
                    py.push(Math.pow(val - h, 2) / (4 * p) + k);
                }

                directrixTrace = {
                    x: [h - maxExtent, h + maxExtent], y: [k - p, k - p], mode: 'lines',
                    line: { color: '#fb7185', width: 2.2, dash: 'dash' }, name: 'Directriz y = k - p'
                };
            } else {
                infoText = `$$ (y - ${k})^2 = 4(${p})(x - ${h}) $$`;
                focusX = h + p;

                for (let val = k - maxExtent; val <= k + maxExtent; val += 0.25) {
                    py.push(val);
                    px.push(Math.pow(val - k, 2) / (4 * p) + h);
                }

                directrixTrace = {
                    x: [h - p, h - p], y: [k - maxExtent, k + maxExtent], mode: 'lines',
                    line: { color: '#fb7185', width: 2.2, dash: 'dash' }, name: 'Directriz x = h - p'
                };
            }

            const limit = Math.max(Math.abs(h), Math.abs(k), maxExtent) * 1.35;

            traces = [
                { x: [h], y: [k], mode: 'markers', marker: { size: 9, color: '#22d3ee', line: { color: '#ffffff', width: 1 } }, name: 'Vértice V(h, k)' },
                { x: [focusX], y: [focusY], mode: 'markers', marker: { size: 8, color: '#fbbf24', line: { color: '#ffffff', width: 1 } }, name: 'Foco F' },
                directrixTrace,
                { x: px, y: py, mode: 'lines', line: { color: '#6366f1', width: 3.5 }, name: 'Parábola' }
            ];

            const layout2D = {
                ...darkThemeLayout,
                xaxis: { ...darkThemeLayout.xaxis, range: [-limit, limit], scaleanchor: 'y', scaleratio: 1 },
                yaxis: { ...darkThemeLayout.yaxis, range: [-limit, limit] },
                showlegend: true
            };

            Plotly.newPlot(plotCanvas, traces, layout2D);

        } else if (sys === 'conic-hyperbola') {
            const h = getVal('in-h', 0);
            const k = getVal('in-k', 0);
            const a = Math.abs(getVal('in-a', 3));
            const b = Math.abs(getVal('in-b', 2));
            const orient = getSelectVal('in-orient', 'horizontal');

            const hx1 = [], hy1 = [];
            const hx2 = [], hy2 = [];
            let asymptote1 = {}, asymptote2 = {};

            const limit = Math.max(a + Math.abs(h), b + Math.abs(k), 8) * 1.35;

            if (orient === 'horizontal') {
                infoText = `$$ \\frac{(x - ${h})^2}{${a}^2} - \\frac{(y - ${k})^2}{${b}^2} = 1 $$`;

                for (let t = -2.5; t <= 2.5; t += 0.08) {
                    const cosh = Math.cosh(t);
                    const sinh = Math.sinh(t);
                    
                    hx1.push(h + a * cosh);
                    hy1.push(k + b * sinh);
                    hx2.push(h - a * cosh);
                    hy2.push(k + b * sinh);
                }

                asymptote1 = {
                    x: [h - limit, h + limit], y: [k - (b / a) * limit, k + (b / a) * limit], mode: 'lines',
                    line: { color: 'rgba(255, 255, 255, 0.12)', width: 1.5, dash: 'dash' }, name: 'Asíntota 1'
                };
                asymptote2 = {
                    x: [h - limit, h + limit], y: [k + (b / a) * limit, k - (b / a) * limit], mode: 'lines',
                    line: { color: 'rgba(255, 255, 255, 0.12)', width: 1.5, dash: 'dash' }, name: 'Asíntota 2'
                };
            } else {
                infoText = `$$ \\frac{(y - ${k})^2}{${a}^2} - \\frac{(x - ${h})^2}{${b}^2} = 1 $$`;

                for (let t = -2.5; t <= 2.5; t += 0.08) {
                    const cosh = Math.cosh(t);
                    const sinh = Math.sinh(t);

                    hy1.push(k + a * cosh);
                    hx1.push(h + b * sinh);
                    hy2.push(k - a * cosh);
                    hx2.push(h - b * sinh);
                }

                asymptote1 = {
                    x: [h - limit, h + limit], y: [k - (a / b) * limit, k + (a / b) * limit], mode: 'lines',
                    line: { color: 'rgba(255, 255, 255, 0.12)', width: 1.5, dash: 'dash' }, name: 'Asíntota 1'
                };
                asymptote2 = {
                    x: [h - limit, h + limit], y: [k + (a / b) * limit, k - (a / b) * limit], mode: 'lines',
                    line: { color: 'rgba(255, 255, 255, 0.12)', width: 1.5, dash: 'dash' }, name: 'Asíntota 2'
                };
            }

            traces = [
                { x: [h], y: [k], mode: 'markers', marker: { size: 8, color: '#22d3ee', line: { color: '#ffffff', width: 1 } }, name: 'Centro C(h, k)' },
                asymptote1,
                asymptote2,
                { x: hx1, y: hy1, mode: 'lines', line: { color: '#6366f1', width: 3.5 }, name: 'Hipérbola (Rama 1)' },
                { x: hx2, y: hy2, mode: 'lines', line: { color: '#6366f1', width: 3.5 }, name: 'Hipérbola (Rama 2)' }
            ];

            const layout2D = {
                ...darkThemeLayout,
                xaxis: { ...darkThemeLayout.xaxis, range: [-limit, limit], scaleanchor: 'y', scaleratio: 1 },
                yaxis: { ...darkThemeLayout.yaxis, range: [-limit, limit] },
                showlegend: true
            };

            Plotly.newPlot(plotCanvas, traces, layout2D);
        }

        renderMath(outputRep, infoText);
    }

    // Inyección de formularios
    function updateForm() {
        const sys = selectSystem.value;
        inputsContainer.innerHTML = formsHTML[sys] || '';

        const inputs = inputsContainer.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', updatePlot);
        });

        if (sys === 'formula-free') {
            const presets = inputsContainer.querySelectorAll('.btn-preset');
            presets.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.getElementById('in-formula').value = btn.getAttribute('data-formula');
                    document.getElementById('in-xmin').value = btn.getAttribute('data-min');
                    document.getElementById('in-xmax').value = btn.getAttribute('data-max');
                    document.getElementById('in-ymin').value = btn.getAttribute('data-min');
                    document.getElementById('in-ymax').value = btn.getAttribute('data-max');
                    updatePlot();
                });
            });
        }

        updatePlot();
    }

    // --- ESCUCHADOR GLOBAL DE CARGA DE MATHJAX ---
    // En cuanto MathJax termina de cargar asíncronamente de internet, fuerza un repintado de la fórmula
    window.addEventListener('MathJaxReady', () => {
        updatePlot();
    });

    selectSystem.addEventListener('change', updateForm);
    updateForm();

   
    document.querySelectorAll('.btn-symbol').forEach(btn => {
        btn.addEventListener('click', () => {
            const focusedInput = document.activeElement;
            if (focusedInput && focusedInput.tagName === 'INPUT') {
                const start = focusedInput.selectionStart;
                const end = focusedInput.selectionEnd;
                const text = focusedInput.value;
                focusedInput.value = text.substring(0, start) + btn.textContent + text.substring(end);
                focusedInput.focus();
                focusedInput.selectionStart = focusedInput.selectionEnd = start + btn.textContent.length;
                updatePlot();
            }
        });
    });
});

 
