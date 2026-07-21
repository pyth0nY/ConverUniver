/**
 * Conversor Universal - Controlador de Visualización Científica Avanzada (Plotly.js)
 * Renderiza cilindros, esferas, rejillas de radar y cajas de proyección en tiempo real.
 */

document.addEventListener('DOMContentLoaded', () => {
    const selectSystem = document.getElementById('coord-system');
    const inputsContainer = document.getElementById('inputs-container');
    const outputRep = document.getElementById('output-cartesian-repr');
    const plotCanvas = document.getElementById('plot-canvas');

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
                    <input type="number" id="in-x" value="3" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-[9px] font-mono text-zinc-500 mb-1">Coord. Y</label>
                    <input type="number" id="in-y" value="4" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-[9px] font-mono text-zinc-500 mb-1">Coord. Z</label>
                    <input type="number" id="in-z" value="5" step="any" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500">
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
            <div class="space-y-2 animate-fade-in">
                <div>
                    <label class="block text-[9px] font-mono text-zinc-500 mb-1">Fórmula de Superficie 3D (z = f(x, y))</label>
                    <input type="text" id="in-formula" value="sin(x) * cos(y)" class="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500 font-mono" placeholder="Ej: sin(x) o x^2 - y^2">
                </div>
            </div>
        `
    };

    // --- CONFIGURACIÓN BASE ESTILO DARK SHADCN ---
    const darkThemeLayout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#a1a1aa', family: 'JetBrains Mono' },
        showlegend: false,
        margin: { t: 10, b: 10, l: 10, r: 10 },
        scene: {
            xaxis: { gridcolor: '#27272a', zerolinecolor: '#52525b', backgroundcolor: 'rgba(0,0,0,0)', title: 'Eje X' },
            yaxis: { gridcolor: '#27272a', zerolinecolor: '#52525b', backgroundcolor: 'rgba(0,0,0,0)', title: 'Eje Y' },
            zaxis: { gridcolor: '#27272a', zerolinecolor: '#52525b', backgroundcolor: 'rgba(0,0,0,0)', title: 'Eje Z' },
            aspectmode: 'cube' // Mantiene proporciones físicas perfectas (esferas redondas)
        },
        xaxis: { gridcolor: '#27272a', zerolinecolor: '#52525b', title: 'Eje X' },
        yaxis: { gridcolor: '#27272a', zerolinecolor: '#52525b', title: 'Eje Y' }
    };

    // --- GENERADORES GEOMÉTRICOS AUXILIARES ---

    // Generador de circunferencias en cualquier altura Z
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

    // Generador de esfera de alambre tridimensional
    function getSphereWireframe(rho) {
        const traces = [];
        
        // Anillo XY (Ecuador)
        const xy = getCircleCoords(rho, 0);
        traces.push({
            type: 'scatter3d', x: xy.x, y: xy.y, z: xy.z, mode: 'lines',
            line: { color: 'rgba(99, 102, 241, 0.15)', width: 1.5 }
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
            line: { color: 'rgba(99, 102, 241, 0.15)', width: 1.5 }
        });

        // Anillo YZ (Meridiano 90)
        const yzX = [], yzY = [], yzZ = [];
        for (let i = 0; i <= 360; i += 5) {
            const rad = i * (Math.PI / 180);
            yzX.push(0);
            yzY.push(rho * Math.cos(rad));
            yzZ.push(rho * Math.sin(rad));
        }
        traces.push({
            type: 'scatter3d', x: yzX, y: yzY, z: yzZ, mode: 'lines',
            line: { color: 'rgba(99, 102, 241, 0.15)', width: 1.5 }
        });

        return traces;
    }

    // --- PROCESADOR Y REDIBUJADO DE GRÁFICA EN TIEMPO REAL ---
    function updatePlot() {
        const sys = selectSystem.value;
        let x = 0, y = 0, z = 0;
        let traces = [];
        let infoText = "";

        // Limpieza de memoria WebGL previa para evitar congelamiento de transiciones 2D/3D
        Plotly.purge(plotCanvas);

        if (sys === 'rect-2d') {
            x = parseFloat(document.getElementById('in-x').value) || 0;
            y = parseFloat(document.getElementById('in-y').value) || 0;
            infoText = `P = (${x.toFixed(4)}, ${y.toFixed(4)})`;

            const maxVal = Math.max(Math.abs(x), Math.abs(y), 5) * 1.2;

            traces = [
                // Caja segmentada de guía en 2D
                { x: [0, x, x], y: [0, 0, y], mode: 'lines', line: { color: 'rgba(255, 255, 255, 0.15)', width: 1.5, dash: 'dash' } },
                { x: [0, 0, x], y: [0, y, y], mode: 'lines', line: { color: 'rgba(255, 255, 255, 0.15)', width: 1.5, dash: 'dash' } },
                // Vector del origen
                { x: [0, x], y: [0, y], mode: 'lines', line: { color: '#6366f1', width: 3.5 } },
                // Punto P
                { x: [x], y: [y], mode: 'markers', marker: { size: 11, color: '#ec4899', line: { color: '#ffffff', width: 1 } } }
            ];

            const layout2D = {
                ...darkThemeLayout,
                xaxis: { ...darkThemeLayout.xaxis, range: [-maxVal, maxVal] },
                yaxis: { ...darkThemeLayout.yaxis, range: [-maxVal, maxVal] }
            };

            Plotly.newPlot(plotCanvas, traces, layout2D);

        } else if (sys === 'rect-3d') {
            x = parseFloat(document.getElementById('in-x').value) || 0;
            y = parseFloat(document.getElementById('in-y').value) || 0;
            z = parseFloat(document.getElementById('in-z').value) || 0;
            infoText = `P = (${x.toFixed(4)}, ${y.toFixed(4)}, ${z.toFixed(4)})`;

            // Construir las aristas de la caja de proyección 3D
            traces.push({
                type: 'scatter3d', x: [0, x, x, 0, 0], y: [0, 0, y, y, 0], z: [0, 0, 0, 0, 0],
                mode: 'lines', line: { color: 'rgba(255, 255, 255, 0.12)', width: 1.5, dash: 'dash' }
            });
            traces.push({
                type: 'scatter3d', x: [0, x, x, 0, 0], y: [0, 0, y, y, 0], z: [z, z, z, z, z],
                mode: 'lines', line: { color: 'rgba(255, 255, 255, 0.12)', width: 1.5, dash: 'dash' }
            });
            [[0, 0], [x, 0], [x, y], [0, y]].forEach(([px, py]) => {
                traces.push({
                    type: 'scatter3d', x: [px, px], y: [py, py], z: [0, z],
                    mode: 'lines', line: { color: 'rgba(255, 255, 255, 0.12)', width: 1.5, dash: 'dash' }
                });
            });

            // Vector y Punto de destino
            traces.push({
                type: 'scatter3d', x: [0, x], y: [0, y], z: [0, z], mode: 'lines',
                line: { color: '#6366f1', width: 4.5 }
            });
            traces.push({
                type: 'scatter3d', x: [x], y: [y], z: [z], mode: 'markers',
                marker: { size: 6.5, color: '#ec4899', line: { color: '#ffffff', width: 1 } }
            });

            Plotly.newPlot(plotCanvas, traces, darkThemeLayout);

        } else if (sys === 'polar-2d') {
            const r = parseFloat(document.getElementById('in-r').value) || 0;
            const theta = parseFloat(document.getElementById('in-theta').value) || 0;
            const thetaRad = theta * (Math.PI / 180);

            x = r * Math.cos(thetaRad);
            y = r * Math.sin(thetaRad);
            infoText = `P = (${x.toFixed(4)}, ${y.toFixed(4)})`;

            const limit = Math.max(r, 5) * 1.25;

            // Dibujar círculos concéntricos de referencia (Rejilla de Radar)
            const circles = [r * 0.33, r * 0.66, r];
            circles.forEach(radius => {
                const c = getCircleCoords(radius, 0);
                traces.push({
                    x: c.x, y: c.y, mode: 'lines',
                    line: { color: 'rgba(255, 255, 255, 0.08)', width: 1.2 }
                });
            });

            // Ejes polares auxiliares (Radios en varios ángulos)
            [0, 45, 90, 135].forEach(deg => {
                const rad = deg * (Math.PI / 180);
                const rx = r * Math.cos(rad);
                const ry = r * Math.sin(rad);
                traces.push({
                    x: [-rx, rx], y: [-ry, ry], mode: 'lines',
                    line: { color: 'rgba(255, 255, 255, 0.05)', width: 1 }
                });
            });

            // Vector principal y punto
            traces.push({
                x: [0, x], y: [0, y], mode: 'lines',
                line: { color: '#6366f1', width: 4 }
            });
            traces.push({
                x: [x], y: [y], mode: 'markers',
                marker: { size: 10, color: '#ec4899', line: { color: '#ffffff', width: 1 } }
            });

            const layout2D = {
                ...darkThemeLayout,
                xaxis: { ...darkThemeLayout.xaxis, range: [-limit, limit] },
                yaxis: { ...darkThemeLayout.yaxis, range: [-limit, limit] }
            };

            Plotly.newPlot(plotCanvas, traces, layout2D);

        } else if (sys === 'cylindrical-3d') {
            const r = parseFloat(document.getElementById('in-r').value) || 0;
            const theta = parseFloat(document.getElementById('in-theta').value) || 0;
            const thetaRad = theta * (Math.PI / 180);
            z = parseFloat(document.getElementById('in-z').value) || 0;

            x = r * Math.cos(thetaRad);
            y = r * Math.sin(thetaRad);
            infoText = `P = (${x.toFixed(4)}, ${y.toFixed(4)}, ${z.toFixed(4)})`;

            // 1. Dibuja un cilindro geométrico completo de alambre de fondo
            const baseCircle = getCircleCoords(r, 0);
            const topCircle = getCircleCoords(r, z);
            traces.push({
                type: 'scatter3d', x: baseCircle.x, y: baseCircle.y, z: baseCircle.z,
                mode: 'lines', line: { color: 'rgba(168, 85, 247, 0.12)', width: 1.5 }
            });
            traces.push({
                type: 'scatter3d', x: topCircle.x, y: topCircle.y, z: topCircle.z,
                mode: 'lines', line: { color: 'rgba(168, 85, 247, 0.12)', width: 1.5 }
            });
            // Conectar cilindro arriba y abajo con aristas verticales cruzadas
            [0, 90, 180, 270].forEach(deg => {
                const rad = deg * (Math.PI / 180);
                const px = r * Math.cos(rad);
                const py = r * Math.sin(rad);
                traces.push({
                    type: 'scatter3d', x: [px, px], y: [py, py], z: [0, z],
                    mode: 'lines', line: { color: 'rgba(168, 85, 247, 0.08)', width: 1 }
                });
            });

            // 2. Líneas de trayectoria física
            traces.push({
                type: 'scatter3d', x: [0, x], y: [0, y], z: [0, 0],
                mode: 'lines', line: { color: 'rgba(255, 255, 255, 0.25)', width: 2, dash: 'dash' }
            });
            traces.push({
                type: 'scatter3d', x: [x, x], y: [y, y], z: [0, z],
                mode: 'lines', line: { color: '#ec4899', width: 2, dash: 'dash' }
            });
            traces.push({
                type: 'scatter3d', x: [0, x], y: [0, y], z: [0, z],
                mode: 'lines', line: { color: '#6366f1', width: 4 }
            });
            traces.push({
                type: 'scatter3d', x: [x], y: [y], z: [z],
                mode: 'markers', marker: { size: 6.5, color: '#ec4899', line: { color: '#ffffff', width: 1 } }
            });

            Plotly.newPlot(plotCanvas, traces, darkThemeLayout);

        } else if (sys === 'spherical-3d') {
            const rho = parseFloat(document.getElementById('in-rho').value) || 0;
            const theta = parseFloat(document.getElementById('in-theta').value) || 0;
            const phi = parseFloat(document.getElementById('in-phi').value) || 0;
            const thetaRad = theta * (Math.PI / 180);
            const phiRad = phi * (Math.PI / 180);

            x = rho * Math.sin(phiRad) * Math.cos(thetaRad);
            y = rho * Math.sin(phiRad) * Math.sin(thetaRad);
            z = rho * Math.cos(phiRad);
            infoText = `P = (${x.toFixed(4)}, ${y.toFixed(4)}, ${z.toFixed(4)})`;

            // 1. Dibuja el cascarón de alambre tridimensional (Esfera holográfica)
            const sphereTraces = getSphereWireframe(rho);
            traces.push(...sphereTraces);

            // 2. Proyecciones y trazados angulares
            const projectionRadius = rho * Math.sin(phiRad);
            const projX = projectionRadius * Math.cos(thetaRad);
            const projY = projectionRadius * Math.sin(thetaRad);

            traces.push({
                type: 'scatter3d', x: [0, projX], y: [0, projY], z: [0, 0],
                mode: 'lines', line: { color: 'rgba(255, 255, 255, 0.25)', width: 2, dash: 'dash' }
            });
            traces.push({
                type: 'scatter3d', x: [projX, projX], y: [projY, projY], z: [0, z],
                mode: 'lines', line: { color: 'rgba(255, 255, 255, 0.25)', width: 2, dash: 'dash' }
            });

            // Vector de posición principal
            traces.push({
                type: 'scatter3d', x: [0, x], y: [0, y], z: [0, z],
                mode: 'lines', line: { color: '#6366f1', width: 4.5 }
            });
            // Punto de destino
            traces.push({
                type: 'scatter3d', x: [x], y: [y], z: [z],
                mode: 'markers', marker: { size: 6.5, color: '#ec4899', line: { color: '#ffffff', width: 1 } }
            });

            Plotly.newPlot(plotCanvas, traces, darkThemeLayout);

        } else if (sys === 'formula-free') {
            const formula = document.getElementById('in-formula').value.trim();
            infoText = `z = ${formula}`;

            const xVals = [], yVals = [];
            for (let i = -6; i <= 6; i += 0.45) {
                xVals.push(i);
                yVals.push(i);
            }

            const parsedFormula = formula
                .replace(/sin/g, 'Math.sin')
                .replace(/cos/g, 'Math.cos')
                .replace(/tan/g, 'Math.tan')
                .replace(/pi/g, 'Math.PI')
                .replace(/\^/g, '**');

            const zMatrix = [];
            for (let j = 0; j < yVals.length; j++) {
                const row = [];
                for (let i = 0; i < xVals.length; i++) {
                    try {
                        const evaluated = Function('x', 'y', `return ${parsedFormula}`)(xVals[i], yVals[j]);
                        row.push(evaluated);
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

            Plotly.newPlot(plotCanvas, traces, darkThemeLayout);
        }

        outputRep.textContent = infoText;
    }

    // Inyección dinámica de formularios de parámetros
    function updateForm() {
        const sys = selectSystem.value;
        inputsContainer.innerHTML = formsHTML[sys] || '';

        // Escucha y recalcula al instante en que el usuario cambia cualquier número
        const inputs = inputsContainer.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', updatePlot);
        });

        updatePlot();
    }

    selectSystem.addEventListener('change', updateForm);
    updateForm();

    // --- CARÁCTERES RÁPIDOS ---
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

    if (window.lucide) {
        window.lucide.createIcons();
    }
});