document.addEventListener('DOMContentLoaded', () => {
    const selectTopic = document.getElementById('geo-topic');
    const inputsContainer = document.getElementById('geo-inputs-container');
    const stepOutput = document.getElementById('geo-step-by-step');
    const plotCanvas = document.getElementById('geo-plot-canvas');

    // --- MANEJO DE MATHJAX ---
    function renderMath(element, latexString) {
        element.innerHTML = latexString;
        if (window.MathJax && typeof MathJax.typesetPromise === 'function') {
            try {
                MathJax.typesetClear([element]);
                MathJax.typesetPromise([element]).catch(err => console.error("Error MathJax:", err));
            } catch (e) {
                console.error("Error typeset:", e);
            }
        }
    }

    const getVal = (id, fallback) => {
        const el = document.getElementById(id);
        if (!el) return fallback;
        const val = parseFloat(el.value);
        return isNaN(val) ? fallback : val;
    };

    const getSelectVal = (id, fallback) => {
        const el = document.getElementById(id);
        return el ? el.value : fallback;
    };

    // Formas de entrada dinámica
    const formsHTML = {
        'dist-mid': `
            <div class="space-y-3 animate-fade-in">
                <span class="block text-[9px] font-mono text-zinc-500 uppercase tracking-wide">Punto 1 (P1)</span>
                <div class="grid grid-cols-2 gap-2">
                    <input type="number" id="in-x1" value="-3" step="any" placeholder="x1" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                    <input type="number" id="in-y1" value="1" step="any" placeholder="y1" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                </div>
                <span class="block text-[9px] font-mono text-zinc-500 uppercase tracking-wide">Punto 2 (P2)</span>
                <div class="grid grid-cols-2 gap-2">
                    <input type="number" id="in-x2" value="5" step="any" placeholder="x2" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                    <input type="number" id="in-y2" value="7" step="any" placeholder="y2" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                </div>
            </div>
        `,
        'segment-ratio': `
            <div class="space-y-3 animate-fade-in">
                <span class="block text-[9px] font-mono text-zinc-500 uppercase tracking-wide">Punto 1 (P1)</span>
                <div class="grid grid-cols-2 gap-2">
                    <input type="number" id="in-x1" value="2" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none">
                    <input type="number" id="in-y1" value="1" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none">
                </div>
                <span class="block text-[9px] font-mono text-zinc-500 uppercase tracking-wide">Punto 2 (P2)</span>
                <div class="grid grid-cols-2 gap-2">
                    <input type="number" id="in-x2" value="8" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none">
                    <input type="number" id="in-y2" value="5" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none">
                </div>
                <div>
                    <label class="block text-[9px] font-mono text-zinc-500 mb-1">Razón (r)</label>
                    <input type="number" id="in-r" value="2" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                </div>
            </div>
        `,
        'ellipse': `
            <div class="space-y-3 animate-fade-in">
                <span class="block text-[9px] font-mono text-zinc-500 uppercase tracking-wide">Centro (h, k)</span>
                <div class="grid grid-cols-2 gap-2">
                    <input type="number" id="in-h" value="1" step="any" placeholder="h" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none">
                    <input type="number" id="in-k" value="2" step="any" placeholder="k" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none">
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-[9px] font-mono text-zinc-500 mb-1">Semieje a</label>
                        <input type="number" id="in-a" value="5" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none">
                    </div>
                    <div>
                        <label class="block text-[9px] font-mono text-zinc-500 mb-1">Semieje b</label>
                        <input type="number" id="in-b" value="3" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none">
                    </div>
                </div>
                <div>
                    <label class="block text-[9px] font-mono text-zinc-500 mb-1">Orientación</label>
                    <select id="in-orient" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:outline-none">
                        <option value="horizontal" selected>Horizontal (Eje mayor paralelo a X)</option>
                        <option value="vertical">Vertical (Eje mayor paralelo a Y)</option>
                    </select>
                </div>
                <div class="border-t border-white/5 pt-2">
                    <span class="block text-[9px] font-mono text-zinc-500 uppercase tracking-wide">Punto de Tangencia (x0, y0)</span>
                    <div class="grid grid-cols-2 gap-2 mt-1">
                        <input type="number" id="in-x0" value="4" step="any" placeholder="x0" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none">
                        <input type="number" id="in-y0" value="3.8" step="any" placeholder="y0" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none">
                    </div>
                </div>
            </div>
        `,
        'hyperbola': `
            <div class="space-y-3 animate-fade-in">
                <span class="block text-[9px] font-mono text-zinc-500 uppercase tracking-wide">Centro (h, k)</span>
                <div class="grid grid-cols-2 gap-2">
                    <input type="number" id="in-h" value="0" step="any" placeholder="h" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none">
                    <input type="number" id="in-k" value="0" step="any" placeholder="k" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none">
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-[9px] font-mono text-zinc-500 mb-1">Semieje a (Transverso)</label>
                        <input type="number" id="in-a" value="3" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none">
                    </div>
                    <div>
                        <label class="block text-[9px] font-mono text-zinc-500 mb-1">Semieje b (Conjugado)</label>
                        <input type="number" id="in-b" value="2" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none">
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

    const darkThemeLayout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#a1a1aa', family: 'JetBrains Mono' },
        showlegend: true, 
        legend: { x: 0, y: 1, font: { size: 9 }, bgcolor: 'rgba(0,0,0,0)' },
        margin: { t: 20, b: 20, l: 20, r: 20 },
        xaxis: { gridcolor: '#27272a', zerolinecolor: '#52525b', title: 'Eje X', scaleanchor: 'y', scaleratio: 1 },
        yaxis: { gridcolor: '#27272a', zerolinecolor: '#52525b', title: 'Eje Y' }
    };

    // --- PROCESADOR MATEMÁTICO Y DE GRÁFICAS ---
    function updateCalculator() {
        const topic = selectTopic.value;
        let traces = [];
        let infoText = "";

        try {
            Plotly.purge(plotCanvas);
        } catch (e) {}

        if (topic === 'dist-mid') {
            const x1 = getVal('in-x1', -3);
            const y1 = getVal('in-y1', 1);
            const x2 = getVal('in-x2', 5);
            const y2 = getVal('in-y2', 7);

            // Cálculos
            const dx = x2 - x1;
            const dy = y2 - y1;
            const distance = Math.sqrt(dx*dx + dy*dy);
            const mx = (x1 + x2) / 2;
            const my = (y1 + y2) / 2;
            const m = dx !== 0 ? (dy / dx) : Infinity;
            const angleRad = Math.atan(m);
            const angleDeg = angleRad * (180 / Math.PI);

            // Ecuaciones de la recta
            let eqGeneral = "";
            let eqOrdinaria = "";
            if (dx !== 0) {
                // y - y1 = m(x - x1) -> y = mx - mx1 + y1
                const intercept = y1 - m * x1;
                eqOrdinaria = `y = ${m.toFixed(2)}x ${intercept >= 0 ? '+' : ''}${intercept.toFixed(2)}`;
                // mx - y + intercept = 0 -> multiplicando para enteros si es viable, o usando float
                const A = m;
                const B = -1;
                const C = intercept;
                eqGeneral = `${A.toFixed(2)}x - y ${C >= 0 ? '+' : ''}${C.toFixed(2)} = 0`;
            } else {
                eqOrdinaria = `x = ${x1}`;
                eqGeneral = `x ${x1 >= 0 ? '-' : '+'}${Math.abs(x1)} = 0`;
            }

            infoText = `
                $$\\begin{aligned}
                \\text{1. Distancia entre los dos puntos (P1 y P2):} \\\\
                d &= \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2} \\\\
                d &= \\sqrt{(${x2} - (${x1}))^2 + (${y2} - (${y1}))^2} \\\\
                d &= \\sqrt{(${dx})^2 + (${dy})^2} = \\sqrt{${dx*dx + dy*dy}} \\approx ${distance.toFixed(4)} \\\\
                \\\\
                \\text{2. Punto medio del segmento (Pm):} \\\\
                P_m &= \\left(\\frac{x_1 + x_2}{2}, \\frac{y_1 + y_2}{2}\\right) \\\\
                P_m &= \\left(\\frac{${x1} + ${x2}}{2}, \\frac{y_1 + ${y2}}{2}\\right) = (${mx.toFixed(2)}, ${my.toFixed(2)}) \\\\
                \\\\
                \\text{3. Pendiente de la recta (m) y ángulo de inclinación (}\\theta\\text{):} \\\\
                m &= \\frac{y_2 - y_1}{x_2 - x_1} = \\frac{${y2} - (${y1})}{${x2} - (${x1})} = ${dx !== 0 ? m.toFixed(4) : '\\infty'} \\\\
                \\theta &= \\arctan(m) \\approx ${angleDeg.toFixed(2)}^{\\circ} \\\\
                \\\\
                \\text{4. Ecuaciones de la recta resultante:} \\\\
                \\text{Pendiente-Ordenada al Origen:} \\quad & ${eqOrdinaria} \\\\
                \\text{Ecuación General (Ax + By + C = 0):} \\quad & ${eqGeneral}
                \\end{aligned}$$
            `;

            // Gráfica
            traces.push({
                x: [x1, x2], y: [y1, y2], mode: 'lines+markers',
                line: { color: '#6366f1', width: 3 },
                marker: { size: 10, color: ['#22d3ee', '#ec4899'] },
                name: 'Segmento P1-P2'
            });
            traces.push({
                x: [mx], y: [my], mode: 'markers',
                marker: { size: 11, color: '#fbbf24', symbol: 'diamond' },
                name: 'Punto Medio'
            });

            // Ejes adaptables
            const limit = Math.max(Math.abs(x1), Math.abs(x2), Math.abs(y1), Math.abs(y2), 5) * 1.3;
            darkThemeLayout.xaxis.range = [-limit, limit];
            darkThemeLayout.yaxis.range = [-limit, limit];

            Plotly.newPlot(plotCanvas, traces, darkThemeLayout);

        } else if (topic === 'segment-ratio') {
            const x1 = getVal('in-x1', 2);
            const y1 = getVal('in-y1', 1);
            const x2 = getVal('in-x2', 8);
            const y2 = getVal('in-y2', 5);
            const r = getVal('in-r', 2);

            let rx = 0, ry = 0;
            let explanation = "";

            if (r === -1) {
                explanation = "\\text{La razón r = -1 no es válida porque provocaría división entre cero (el punto está en el infinito).}";
                infoText = `$$ ${explanation} $$`;
            } else {
                rx = (x1 + r * x2) / (1 + r);
                ry = (y1 + r * y2) / (1 + r);

                infoText = `
                    $$\\begin{aligned}
                    \\text{División de un segmento dados los extremos y una razón (r = ${r}):} \\\\
                    x &= \\frac{x_1 + r \\cdot x_2}{1 + r} = \\frac{${x1} + (${r}) \\cdot (${x2})}{1 + (${r})} = \\frac{${x1 + r*x2}}{${1+r}} \\approx ${rx.toFixed(4)} \\\\
                    y &= \\frac{y_1 + r \\cdot y_2}{1 + r} = \\frac{${y1} + (${r}) \\cdot (${y2})}{1 + (${r})} = \\frac{${y1 + r*y2}}{${1+r}} \\approx ${ry.toFixed(4)} \\\\
                    \\\\
                    \\text{Punto de división resultante:} \\\\
                    P_r &= (${rx.toFixed(4)}, ${ry.toFixed(4)})
                    \\end{aligned}$$
                `;

                traces.push({
                    x: [x1, x2], y: [y1, y2], mode: 'lines+markers',
                    line: { color: 'rgba(255, 255, 255, 0.2)', width: 2, dash: 'dash' },
                    marker: { size: 8, color: '#a1a1aa' },
                    name: 'Segmento Original'
                });
                traces.push({
                    x: [x1, rx], y: [y1, ry], mode: 'lines+markers',
                    line: { color: '#22d3ee', width: 3.5 },
                    marker: { size: 9, color: '#22d3ee' },
                    name: 'Tramo P1 a Pr'
                });
                traces.push({
                    x: [rx, x2], y: [ry, y2], mode: 'lines+markers',
                    line: { color: '#ec4899', width: 3.5 },
                    marker: { size: 9, color: '#ec4899' },
                    name: 'Tramo Pr a P2'
                });
                traces.push({
                    x: [rx], y: [ry], mode: 'markers',
                    marker: { size: 12, color: '#fbbf24', symbol: 'star' },
                    name: `Punto Dividido (r = ${r})`
                });

                const limit = Math.max(Math.abs(x1), Math.abs(x2), Math.abs(rx), Math.abs(y1), Math.abs(y2), Math.abs(ry), 5) * 1.35;
                darkThemeLayout.xaxis.range = [-limit, limit];
                darkThemeLayout.yaxis.range = [-limit, limit];

                Plotly.newPlot(plotCanvas, traces, darkThemeLayout);
            }

        } else if (topic === 'ellipse') {
            const h = getVal('in-h', 1);
            const k = getVal('in-k', 2);
            const a = Math.abs(getVal('in-a', 5));
            const b = Math.abs(getVal('in-b', 3));
            const orient = getSelectVal('in-orient', 'horizontal');
            const x0 = getVal('in-x0', 4);
            const y0 = getVal('in-y0', 3.8);

            if (a <= b) {
                infoText = `$$ \\text{Error: En una elipse, la longitud del semieje mayor 'a' (${a}) debe ser estrictamente mayor que 'b' (${b}).} $$`;
            } else {
                // Focal c = sqrt(a^2 - b^2)
                const cVal = Math.sqrt(a*a - b*b);
                const eccentricity = cVal / a;
                const rectumLatus = (2 * b * b) / a;

                let eqCanonical = "";
                let vertices = "";
                let foci = "";
                let coVertices = "";

                // Tangente en x0, y0
                let eqTangent = "";
                let tangentTrace = null;

                // Paramétrico para curva de la elipse
                const ellipseX = [], ellipseY = [];
                for (let t = 0; t <= 360; t += 2) {
                    const rad = t * (Math.PI / 180);
                    if (orient === 'horizontal') {
                        ellipseX.push(h + a * Math.cos(rad));
                        ellipseY.push(k + b * Math.sin(rad));
                    } else {
                        ellipseX.push(h + b * Math.cos(rad));
                        ellipseY.push(k + a * Math.cos(rad)); // invertido para orientacion vertical
                    }
                }
                // Ajustar curva vertical real
                if (orient === 'vertical') {
                    for (let t = 0; t <= 360; t += 2) {
                        const rad = t * (Math.PI / 180);
                        ellipseX[t/2] = h + b * Math.cos(rad);
                        ellipseY[t/2] = k + a * Math.sin(rad);
                    }
                }

                // Elementos analíticos según orientación
                if (orient === 'horizontal') {
                    eqCanonical = `\\frac{(x - ${h})^2}{${a}^2} + \\frac{(y - ${k})^2}{${b}^2} = 1`;
                    vertices = `V_1(${h + a}, ${k}), \\quad V_2(${h - a}, ${k})`;
                    foci = `F_1(${(h + cVal).toFixed(2)}, ${k}), \\quad F_2(${(h - cVal).toFixed(2)}, ${k})`;
                    coVertices = `B_1(${h}, ${k + b}), \\quad B_2(${h}, ${k - b})`;

                    // Ecuación de recta tangente en (x0, y0)
                    // ((x0-h)*(x-h))/a^2 + ((y0-k)*(y-k))/b^2 = 1
                    const termX = (x0 - h) / (a * a);
                    const termY = (y0 - k) / (b * b);
                    // y = mx + C -> termY * (y - k) = 1 - termX * (x - h)
                    // y = k + (1/termY) - (termX/termY)*(x - h)
                    if (termY !== 0) {
                        const m_tangent = -termX / termY;
                        const c_tangent = k + (1 / termY) - m_tangent * h;
                        eqTangent = `y = ${m_tangent.toFixed(3)}(x - ${h}) + ${(k + 1/termY).toFixed(3)}`;

                        // Generar puntos de línea tangente
                        const tX = [h - a * 1.5, h + a * 1.5];
                        const tY = tX.map(val => m_tangent * (val - h) + (k + 1 / termY));
                        tangentTrace = {
                            x: tX, y: tY, mode: 'lines',
                            line: { color: '#fb7185', width: 2, dash: 'dash' },
                            name: 'Recta Tangente'
                        };
                    } else {
                        eqTangent = `x = ${x0}`;
                    }

                } else {
                    eqCanonical = `\\frac{(x - ${h})^2}{${b}^2} + \\frac{(y - ${k})^2}{${a}^2} = 1`;
                    vertices = `V_1(${h}, ${k + a}), \\quad V_2(${h}, ${k - a})`;
                    foci = `F_1(${h}, ${(k + cVal).toFixed(2)}), \\quad F_2(${h}, ${(k - cVal).toFixed(2)})`;
                    coVertices = `B_1(${h + b}, ${k}), \\quad B_2(${h - b}, ${k})`;

                    // Ecuación de recta tangente en vertical
                    // ((x0-h)*(x-h))/b^2 + ((y0-k)*(y-k))/a^2 = 1
                    const termX = (x0 - h) / (b * b);
                    const termY = (y0 - k) / (a * a);
                    if (termY !== 0) {
                        const m_tangent = -termX / termY;
                        const c_tangent = k + (1 / termY) - m_tangent * h;
                        eqTangent = `y = ${m_tangent.toFixed(3)}(x - ${h}) + ${(k + 1/termY).toFixed(3)}`;

                        const tX = [h - b * 1.5, h + b * 1.5];
                        const tY = tX.map(val => m_tangent * (val - h) + (k + 1 / termY));
                        tangentTrace = {
                            x: tX, y: tY, mode: 'lines',
                            line: { color: '#fb7185', width: 2, dash: 'dash' },
                            name: 'Recta Tangente'
                        };
                    } else {
                        eqTangent = `x = ${x0}`;
                    }
                }

                infoText = `
                    $$\\begin{aligned}
                    \\text{1. Ecuación Ordinaria:} \\\\
                    & ${eqCanonical} \\\\
                    & \\frac{(x - ${h})^2}{${a*a}} + \\frac{(y - ${k})^2}{${b*b}} = 1 \\\\
                    \\\\
                    \\text{2. Elementos de la Elipse (Eje focal: ${orient}):} \\\\
                    \\text{Foco (c):} \\quad c &= \\sqrt{a^2 - b^2} = \\sqrt{${a}^2 - ${b}^2} = \\sqrt{${a*a - b*b}} \\approx ${cVal.toFixed(4)} \\\\
                    \\text{Vértices (V):} \\quad & ${vertices} \\\\
                    \\text{Focos (F):} \\quad & ${foci} \\\\
                    \\text{Eje Menor (B):} \\quad & ${coVertices} \\\\
                    \\text{Excentricidad (e):} \\quad e &= \\frac{c}{a} = \\frac{{${cVal.toFixed(2)}}}{${a}} \\approx ${eccentricity.toFixed(4)} \\\\
                    \\text{Lado Recto (LR):} \\quad LR &= \\frac{2b^2}{a} = \\frac{2(${b*b})}{${a}} \\approx ${rectumLatus.toFixed(4)} \\\\
                    \\\\
                    \\text{3. Recta Tangente en el Punto P(}${x0}, ${y0}\\text{):} \\\\
                    \\text{Ecuación:} \\quad & ${eqTangent}
                    \\end{aligned}$$
                `;

                // Gráfica de Elipse
                traces.push({
                    x: ellipseX, y: ellipseY, mode: 'lines',
                    line: { color: '#6366f1', width: 3.5 },
                    name: 'Elipse'
                });
                traces.push({
                    x: [h], y: [k], mode: 'markers',
                    marker: { size: 9, color: '#22d3ee', symbol: 'cross' },
                    name: 'Centro (h, k)'
                });
                traces.push({
                    x: [x0], y: [y0], mode: 'markers',
                    marker: { size: 10, color: '#f43f5e', symbol: 'circle' },
                    name: 'Punto Tangencia'
                });
                if (tangentTrace) {
                    traces.push(tangentTrace);
                }

                // Ajustar limites
                const limit = Math.max(Math.abs(h) + a, Math.abs(k) + a, 5) * 1.35;
                darkThemeLayout.xaxis.range = [-limit, limit];
                darkThemeLayout.yaxis.range = [-limit, limit];

                Plotly.newPlot(plotCanvas, traces, darkThemeLayout);
            }

        } else if (topic === 'hyperbola') {
            const h = getVal('in-h', 0);
            const k = getVal('in-k', 0);
            const a = Math.abs(getVal('in-a', 3));
            const b = Math.abs(getVal('in-b', 2));
            const orient = getSelectVal('in-orient', 'horizontal');

            // Focal parameter c = sqrt(a^2 + b^2)
            const cVal = Math.sqrt(a*a + b*b);
            const eccentricity = cVal / a;
            const rectumLatus = (2 * b * b) / a;

            let eqCanonical = "";
            let vertices = "";
            let foci = "";
            let coVertices = "";
            let asymptotes = "";

            const hx1 = [], hy1 = [];
            const hx2 = [], hy2 = [];

            const maxExtent = 12; // rango de trazado de ramas
            const limit = Math.max(a + Math.abs(h), b + Math.abs(k), 8) * 1.35;

            // Paramétrico para hipérbola ordinaria
            if (orient === 'horizontal') {
                eqCanonical = `\\frac{(x - ${h})^2}{${a}^2} - \\frac{(y - ${k})^2}{${b}^2} = 1`;
                vertices = `V_1(${h + a}, ${k}), \\quad V_2(${h - a}, ${k})`;
                foci = `F_1(${(h + cVal).toFixed(2)}, ${k}), \\quad F_2(${(h - cVal).toFixed(2)}, ${k})`;
                coVertices = `B_1(${h}, ${k + b}), \\quad B_2(${h}, ${k - b})`;
                asymptotes = `y - ${k} = \\pm \\frac{${b}}{${a}}(x - ${h})`;

                for (let t = -2.5; t <= 2.5; t += 0.08) {
                    const cosh = Math.cosh(t);
                    const sinh = Math.sinh(t);
                    hx1.push(h + a * cosh);
                    hy1.push(k + b * sinh);
                    hx2.push(h - a * cosh);
                    hy2.push(k + b * sinh);
                }

                // Agregar líneas de asíntotas a las traces
                traces.push({
                    x: [h - limit, h + limit], y: [k - (b / a) * limit, k + (b / a) * limit], mode: 'lines',
                    line: { color: 'rgba(255, 255, 255, 0.1)', width: 1.5, dash: 'dash' }, name: 'Asíntota 1'
                });
                traces.push({
                    x: [h - limit, h + limit], y: [k + (b / a) * limit, k - (b / a) * limit], mode: 'lines',
                    line: { color: 'rgba(255, 255, 255, 0.1)', width: 1.5, dash: 'dash' }, name: 'Asíntota 2'
                });

            } else {
                eqCanonical = `\\frac{(y - ${k})^2}{${a}^2} - \\frac{(x - ${h})^2}{${b}^2} = 1`;
                vertices = `V_1(${h}, ${k + a}), \\quad V_2(${h}, ${k - a})`;
                foci = `F_1(${h}, ${(k + cVal).toFixed(2)}), \\quad F_2(${h}, ${(k - cVal).toFixed(2)})`;
                coVertices = `B_1(${h + b}, ${k}), \\quad B_2(${h - b}, ${k})`;
                asymptotes = `y - ${k} = \\pm \\frac{${a}}{${b}}(x - ${h})`;

                for (let t = -2.5; t <= 2.5; t += 0.08) {
                    const cosh = Math.cosh(t);
                    const sinh = Math.sinh(t);
                    hy1.push(k + a * cosh);
                    hx1.push(h + b * sinh);
                    hy2.push(k - a * cosh);
                    hx2.push(h - b * sinh);
                }

                // Asíntotas verticales
                traces.push({
                    x: [h - limit, h + limit], y: [k - (a / b) * limit, k + (a / b) * limit], mode: 'lines',
                    line: { color: 'rgba(255, 255, 255, 0.1)', width: 1.5, dash: 'dash' }, name: 'Asíntota 1'
                });
                traces.push({
                    x: [h - limit, h + limit], y: [k + (a / b) * limit, k - (a / b) * limit], mode: 'lines',
                    line: { color: 'rgba(255, 255, 255, 0.1)', width: 1.5, dash: 'dash' }, name: 'Asíntota 2'
                });
            }

            infoText = `
                $$\\begin{aligned}
                \\text{1. Ecuación Ordinaria:} \\\\
                & ${eqCanonical} \\\\
                & \\frac{\\text{T_Efe}_1^2}{${a*a}} - \\frac{\\text{T_Efe}_2^2}{${b*b}} = 1 \\\\
                \\\\
                \\text{2. Elementos de la Hipérbola (Eje focal: ${orient}):} \\\\
                \\text{Parámetro Focal (c):} \\quad c &= \\sqrt{a^2 + b^2} = \\sqrt{${a}^2 + ${b}^2} = \\sqrt{${a*a + b*b}} \\approx ${cVal.toFixed(4)} \\\\
                \\text{Vértices (V):} \\quad & ${vertices} \\\\
                \\text{Focos (F):} \\quad & ${foci} \\\\
                \\text{Eje Conjugado (B):} \\quad & ${coVertices} \\\\
                \\text{Excentricidad (e):} \\quad e &= \\frac{c}{a} = \\frac{{${cVal.toFixed(2)}}}{${a}} \\approx ${eccentricity.toFixed(4)} \\quad (e > 1) \\\\
                \\text{Lado Recto (LR):} \\quad LR &= \\frac{2b^2}{a} = \\frac{2(${b*b})}{${a}} \\approx ${rectumLatus.toFixed(4)} \\\\
                \\\\
                \\text{3. Ecuaciones de las Asíntotas (l1 y l2):} \\\\
                & ${asymptotes}
                \\end{aligned}$$
            `;

            // Gráfica de Hipérbola
            traces.push({
                x: hx1, y: hy1, mode: 'lines',
                line: { color: '#6366f1', width: 3.5 },
                name: 'Hipérbola (Rama 1)'
            });
            traces.push({
                x: hx2, y: hy2, mode: 'lines',
                line: { color: '#6366f1', width: 3.5 },
                name: 'Hipérbola (Rama 2)'
            });
            traces.push({
                x: [h], y: [k], mode: 'markers',
                marker: { size: 9, color: '#22d3ee', symbol: 'cross' },
                name: 'Centro C(h, k)'
            });

            darkThemeLayout.xaxis.range = [-limit, limit];
            darkThemeLayout.yaxis.range = [-limit, limit];

            Plotly.newPlot(plotCanvas, traces, darkThemeLayout);
        }

        renderMath(stepOutput, infoText);
    }

    function updateForm() {
        const topic = selectTopic.value;
        inputsContainer.innerHTML = formsHTML[topic] || '';

        const inputs = inputsContainer.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', updateCalculator);
        });

        updateCalculator();
    }

    selectTopic.addEventListener('change', updateForm);
    updateForm();
});