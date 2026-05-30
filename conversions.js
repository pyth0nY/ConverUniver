/**
 * QuantumScale - Motor de Conversiones Físicas Universales y Método de la Galera
 * Soporta prefijos SI estándar, factores compuestos, potencias de unidades y unidades imperiales.
 */

// 1. Prefijos métricos estándar del Sistema Internacional (para conversor simple)
export const prefixes = {
    pico:  { name: 'Pico',  multiplier: 1e-12, symbol: 'p' },
    nano:  { name: 'Nano',  multiplier: 1e-9,  symbol: 'n' },
    micro: { name: 'Micro', multiplier: 1e-6,  symbol: 'µ' },
    milli: { name: 'Mili',  multiplier: 1e-3,  symbol: 'm' },
    base:  { name: 'Base',  multiplier: 1,     symbol: ''  },
    kilo:  { name: 'Kilo',  multiplier: 1e3,   symbol: 'k' },
    mega:  { name: 'Mega',  multiplier: 1e6,   symbol: 'M' },
    giga:  { name: 'Giga',  multiplier: 1e9,   symbol: 'G' },
    tera:  { name: 'Tera',  multiplier: 1e12,  symbol: 'T' },
    peta:  { name: 'Peta',  multiplier: 1e15,  symbol: 'P' }
};

// 2. Base de datos de conversión física (Valores normalizados respecto a la unidad base del SI)
export const categories = {
    length: {
        unitName: 'Metros',
        baseSymbol: 'm',
        units: {
            m:   { name: 'Metros', multiplier: 1, symbol: 'm' },
            pm:  { name: 'Picómetros', multiplier: 1e-12, symbol: 'pm' },
            nm:  { name: 'Nanómetros', multiplier: 1e-9, symbol: 'nm' },
            um:  { name: 'Micrómetros', multiplier: 1e-6, symbol: 'µm' },
            mm:  { name: 'Milímetros', multiplier: 1e-3, symbol: 'mm' },
            cm:  { name: 'Centímetros', multiplier: 1e-2, symbol: 'cm' },
            dm:  { name: 'Decímetros', multiplier: 1e-1, symbol: 'dm' },
            dam: { name: 'Decámetros', multiplier: 10, symbol: 'dam' },
            km:  { name: 'Kilómetros', multiplier: 1e3, symbol: 'km' },
            Mm:  { name: 'Megámetros', multiplier: 1e6, symbol: 'Mm' },
            in:  { name: 'Pulgadas', multiplier: 0.0254, symbol: 'in' },         // 1 in = 2.54 cm
            ft:  { name: 'Pies', multiplier: 0.3048, symbol: 'ft' },              // 1 ft = 30.48 cm
            mi:  { name: 'Millas', multiplier: 1609.344, symbol: 'mi' }           // 1 mi = 1609.34 m
        },
        comparisons: [
            { max: 1e-11, text: "Aproximadamente el tamaño del radio de un átomo de hidrógeno." },
            { max: 1e-8,  text: "Aproximadamente el ancho de la doble hélice de un ADN humano." },
            { max: 1e-5,  text: "Similar al diámetro de un glóbulo rojo en la sangre humana." },
            { max: 1e-2,  text: "El espesor aproximado de una uña o un grano de arena fina." },
            { max: 1e2,   text: "Longitud comparable a una escala humana estándar o campos deportivos." },
            { max: 1e6,   text: "Distancia típica entre ciudades grandes o el tamaño de un país pequeño." },
            { max: 1e9,   text: "Aproximadamente tres veces la distancia de la Tierra a la Luna." },
            { max: 1e12,  text: "Similar a la distancia orbital de Saturno al Sol." },
            { max: Infinity, text: "¡Escala interestelar! Entrando en el rango de los años luz." }
        ]
    },
    area: {
        unitName: 'Metros Cuadrados',
        baseSymbol: 'm²',
        units: {
            'm^2':  { name: 'Metros²', multiplier: 1, symbol: 'm²' },
            'pm^2': { name: 'Picómetros²', multiplier: 1e-24, symbol: 'pm²' },
            'nm^2': { name: 'Nanómetros²', multiplier: 1e-18, symbol: 'nm²' },
            'um^2': { name: 'Micrómetros²', multiplier: 1e-12, symbol: 'µm²' },
            'mm^2': { name: 'Milímetros²', multiplier: 1e-6, symbol: 'mm²' },
            'cm^2': { name: 'Centímetros²', multiplier: 1e-4, symbol: 'cm²' },
            'in^2': { name: 'Pulgadas²', multiplier: 0.00064516, symbol: 'in²' },  // (0.0254)^2
            'ft^2': { name: 'Pies²', multiplier: 0.09290304, symbol: 'ft²' }      // (0.3048)^2
        },
        comparisons: [
            { max: 1e-20, text: "Área transversal típica de una proteína o molécula pequeña." },
            { max: 1e-10, text: "Área de sección transversal aproximada de un cabello humano." },
            { max: 1e-4,  text: "Área de un sello postal o un botón pequeño." },
            { max: 1,     text: "Superficie de una mesa de estudio individual." },
            { max: 1e4,   text: "Superficie de una manzana urbana o un estadio de fútbol." },
            { max: Infinity, text: "Área comparable a ciudades, continentes o superficies planetarias." }
        ]
    },
    volume: {
        unitName: 'Metros Cúbicos',
        baseSymbol: 'm³',
        units: {
            'm^3':   { name: 'Metros³', multiplier: 1, symbol: 'm³' },
            'dam^3': { name: 'Decámetros³', multiplier: 1000, symbol: 'dam³' },
            L:       { name: 'Litros', multiplier: 1e-3, symbol: 'L' },
            mL:      { name: 'Mililitros', multiplier: 1e-6, symbol: 'mL' },
            'cm^3':  { name: 'Centímetros³', multiplier: 1e-6, symbol: 'cm³' },
            gal:     { name: 'Galones (US)', multiplier: 0.00378541, symbol: 'gal' },
            'ft^3':  { name: 'Pies³', multiplier: 0.0283168, symbol: 'ft³' },
            'in^3':  { name: 'Pulgadas³', multiplier: 1.6387064e-5, symbol: 'in³' } // (0.0254)^3
        },
        comparisons: [
            { max: 1e-9,  text: "El volumen de una pequeña gota de agua suspendida en el aire." },
            { max: 1e-3,  text: "Aproximadamente un litro, equivalente a una caja de leche." },
            { max: 1,     text: "Volumen típico de almacenamiento de agua de uso doméstico básico." },
            { max: 1e3,   text: "El volumen aproximado de una piscina olímpica mediana." },
            { max: Infinity, text: "Volúmenes tectónicos, embalses, lagos u océanos enteros." }
        ]
    },
    energy: {
        unitName: 'Julios',
        baseSymbol: 'J',
        units: {
            J:   { name: 'Julios', multiplier: 1, symbol: 'J' },
            uJ:  { name: 'Microjulios', multiplier: 1e-6, symbol: 'µJ' },
            nJ:  { name: 'Nanojulios', multiplier: 1e-9, symbol: 'nJ' },
            kJ:  { name: 'Kilojulios', multiplier: 1e3, symbol: 'kJ' },
            MJ:  { name: 'Megajulios', multiplier: 1e6, symbol: 'MJ' },
            GJ:  { name: 'Gigajulios', multiplier: 1e9, symbol: 'GJ' },
            BTU: { name: 'BTU', multiplier: 1055.056, symbol: 'BTU' },
            eV:  { name: 'Electronvoltios', multiplier: 1.602176634e-19, symbol: 'eV' },
            TeV: { name: 'Teraelectronvoltios', multiplier: 1.602176634e-7, symbol: 'TeV' }
        },
        comparisons: [
            { max: 1e-15, text: "Energía cinética de un protón en aceleradores de partículas elementales." },
            { max: 1e-3,  text: "Energía del impacto de una aguja ligera cayendo desde pocos centímetros." },
            { max: 1e3,   text: "Energía necesaria para calentar un vaso de agua por un minuto." },
            { max: 1e6,   text: "Equivalente al valor nutricional de un refrigerio mediano." },
            { max: Infinity, text: "Energía liberada por rayos, plantas nucleares o fenómenos astrofísicos." }
        ]
    },
    time: {
        unitName: 'Segundos',
        baseSymbol: 's',
        units: {
            s:    { name: 'Segundos', multiplier: 1, symbol: 's' },
            fs:   { name: 'Femtosegundos', multiplier: 1e-15, symbol: 'fs' },
            ps:   { name: 'Picosegundos', multiplier: 1e-12, symbol: 'ps' },
            ns:   { name: 'Nanosegundos', multiplier: 1e-9, symbol: 'ns' },
            us:   { name: 'Microsegundos', multiplier: 1e-6, symbol: 'µs' },
            ms:   { name: 'Milisegundos', multiplier: 1e-3, symbol: 'ms' },
            min:  { name: 'Minutos', multiplier: 60, symbol: 'min' },
            h:    { name: 'Horas', multiplier: 3600, symbol: 'h' },
            dias: { name: 'Días', multiplier: 86400, symbol: 'días' }
        },
        comparisons: [
            { max: 1e-12, text: "Tiempo en el que la luz recorre una distancia equivalente al grosor de un papel." },
            { max: 1e-3,  text: "Tiempo que toma el aleteo de un insecto veloz o un ciclo de refresco de pantalla." },
            { max: 60,    text: "Un rango cómodo para actividades y tareas cotidianas breves." },
            { max: 86400, text: "Un ciclo completo de rotación terrestre diurna." },
            { max: Infinity, text: "Tiempos a escala de civilizaciones, geológica u cosmológica." }
        ]
    },
    mass: {
        unitName: 'Gramos',
        baseSymbol: 'g',
        units: {
            g:   { name: 'Gramos', multiplier: 1, symbol: 'g' },
            pg:  { name: 'Picogramos', multiplier: 1e-12, symbol: 'pg' },
            ng:  { name: 'Nanogramos', multiplier: 1e-9, symbol: 'ng' },
            ug:  { name: 'Microgramos', multiplier: 1e-6, symbol: 'µg' },
            mg:  { name: 'Miligramos', multiplier: 1e-3, symbol: 'mg' },
            kg:  { name: 'Kilogramos', multiplier: 1e3, symbol: 'kg' },
            lb:  { name: 'Libras', multiplier: 453.59237, symbol: 'lb' },
            Kt:  { name: 'Kilotoneladas', multiplier: 1e9, symbol: 'Kt' }
        },
        comparisons: [
            { max: 1e-11, text: "Aproximadamente la masa de una pequeña célula biológica aislada." },
            { max: 1e-4,  text: "Masa promedio de una partícula fina de polvo atmosférico suspendido." },
            { max: 10,    text: "Masa aproximada de una moneda estándar de uso corriente." },
            { max: 1e6,   text: "Equivalente al peso aproximado de un automóvil compacto estándar." },
            { max: Infinity, text: "Masa asociada a formaciones geológicas, lunas o planetas." }
        ]
    },
    pressure: {
        unitName: 'Pascales',
        baseSymbol: 'Pa',
        units: {
            Pa:   { name: 'Pascales', multiplier: 1, symbol: 'Pa' },
            kPa:  { name: 'Kilopascales', multiplier: 1e3, symbol: 'kPa' },
            nPa:  { name: 'Nanopascales', multiplier: 1e-9, symbol: 'nPa' },
            Torr: { name: 'Torr / mmHg', multiplier: 133.3224, symbol: 'Torr' }, // 760 Torr = 101325 Pa
            psi:  { name: 'psi (lb/in²)', multiplier: 6894.757, symbol: 'psi' } // Libra por pulgada²
        },
        comparisons: [
            { max: 1e-3,  text: "Presión ejercida por la luz solar en la superficie terrestre." },
            { max: 10,    text: "Presión de un papel plano descansando sobre una superficie plana." },
            { max: 1e5,   text: "Presión atmosférica estándar a nivel del mar." },
            { max: Infinity, text: "Presión en el fondo de las fosas oceánicas o en el núcleo de planetas." }
        ]
    },
    data: {
        unitName: 'Bits',
        baseSymbol: 'bit',
        units: {
            bit:  { name: 'Bits', multiplier: 1, symbol: 'bit' },
            byte: { name: 'Bytes', multiplier: 8, symbol: 'B' },
            kB:   { name: 'Kilobytes', multiplier: 8e3, symbol: 'kB' },
            MB:   { name: 'Megabytes', multiplier: 8e6, symbol: 'MB' },
            GB:   { name: 'Gigabytes', multiplier: 8e9, symbol: 'GB' },
            TB:   { name: 'Terabytes', multiplier: 8e12, symbol: 'TB' },
            PB:   { name: 'Petabytes', multiplier: 8e15, symbol: 'PB' },
            EB:   { name: 'Exabytes', multiplier: 8e18, symbol: 'EB' },
            Tib:  { name: 'Tebibits', multiplier: 1.099511627776e12, symbol: 'Tib' }, // 2^40 bits
            Ebit: { name: 'Exabits', multiplier: 1e18, symbol: 'Ebit' }
        },
        comparisons: [
            { max: 8,     text: "Espacio ocupado por un solo carácter ASCII plano." },
            { max: 8e5,   text: "Tamaño promedio de un libro de texto completo en formato plano." },
            { max: 8e9,   text: "Equivalente aproximado a una película comprimida en alta definición." },
            { max: 8e12,  text: "Suficiente para almacenar todo el archivo de una biblioteca mediana." },
            { max: Infinity, text: "Volumen de intercambio de datos global en la red mundial diaria." }
        ]
    }
};

/**
 * Realiza conversiones rápidas de prefijo estándar (para index.html)
 */
export function convertScale(value, fromPrefix, toPrefix) {
    if (isNaN(value)) return 0;
    const valueInBase = value * prefixes[fromPrefix].multiplier;
    return valueInBase / prefixes[toPrefix].multiplier;
}

/**
 * Devuelve la descripción de magnitud basada en el SI (para index.html)
 */
export function getMagnitudeDescription(value, prefixKey, categoryKey) {
    const valueInBase = value * prefixes[prefixKey].multiplier;
    const scaleGroup = categories[categoryKey].comparisons;
    const context = scaleGroup.find(item => valueInBase <= item.max);
    return context ? context.text : "Magnitud física extrema fuera del rango estándar de comparación.";
}

/**
 * Generador de Factores del Método de la Galera (para galea.html)
 * Calcula y estructura el paso intermedio a la unidad base de la categoría seleccionada.
 */
export function getGaleaSteps(value, categoryKey, fromUnitKey, toUnitKey) {
    const category = categories[categoryKey];
    if (!category) return null;

    const fromUnit = category.units[fromUnitKey];
    const toUnit = category.units[toUnitKey];

    if (!fromUnit || !toUnit) return null;

    const baseSym = category.baseSymbol;

    // Paso 1: Convertir de unidad de origen a unidad base del SI
    let step1_top, step1_top_unit, step1_bottom, step1_bottom_unit;
    if (fromUnit.multiplier >= 1) {
        step1_top = fromUnit.multiplier;
        step1_top_unit = baseSym;
        step1_bottom = 1;
        step1_bottom_unit = fromUnit.symbol;
    } else {
        step1_top = 1;
        step1_top_unit = baseSym;
        step1_bottom = 1 / fromUnit.multiplier;
        step1_bottom_unit = fromUnit.symbol;
    }

    // Paso 2: Convertir de unidad base del SI a unidad de destino
    let step2_top, step2_top_unit, step2_bottom, step2_bottom_unit;
    if (toUnit.multiplier >= 1) {
        step2_top = 1;
        step2_top_unit = toUnit.symbol;
        step2_bottom = toUnit.multiplier;
        step2_bottom_unit = baseSym;
    } else {
        step2_top = 1 / toUnit.multiplier;
        step2_top_unit = toUnit.symbol;
        step2_bottom = 1;
        step2_bottom_unit = baseSym;
    }

    const result = (value * fromUnit.multiplier) / toUnit.multiplier;

    return {
        initialValue: value,
        fromSymbol: fromUnit.symbol,
        toSymbol: toUnit.symbol,
        step1: {
            top: step1_top,
            topUnit: step1_top_unit,
            bottom: step1_bottom,
            bottomUnit: step1_bottom_unit
        },
        step2: {
            top: step2_top,
            topUnit: step2_top_unit,
            bottom: step2_bottom,
            bottomUnit: step2_bottom_unit
        },
        result: result
    };
}   