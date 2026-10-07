// --- STATE MANAGEMENT ---
let currentDisplay = '0';
let expressionPreview = '';
let history = JSON.parse(localStorage.getItem('omnicalc_history')) || [];
let memory = 0;
let angleMode = 'DEG'; // DEG or RAD
let soundEnabled = true;
let currentMode = 'standard';
let converterCategory = 'length';

// DOM Elements
const calcDisplay = document.getElementById('calcDisplay');
const calcHistorySub = document.getElementById('calcHistorySub');
const expressionPreviewEl = document.getElementById('expressionPreview');
const historyList = document.getElementById('historyList');
const emptyHistory = document.getElementById('emptyHistory');
const angleModeDisplay = document.getElementById('angleModeDisplay');
const memoryIndicator = document.getElementById('memoryIndicator');
const memoryValueEl = document.getElementById('memoryValue');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const soundToggle = document.getElementById('soundToggle');
const soundIcon = document.getElementById('soundIcon');
const scientificKeypad = document.getElementById('scientificKeypad');

// Audio setup using Web Audio API for crisp audio feedback without external files
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playClickSound(freq = 600, type = 'sine', duration = 0.04) {
    if (!soundEnabled) return;
    try {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch(e) {
        // Audio context error handling
    }
}

// --- THEME MANAGEMENT ---
const savedTheme = localStorage.getItem('omnicalc_theme') || 'dark';
if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
    themeIcon.className = 'fa-solid fa-sun';
} else {
    document.documentElement.classList.remove('dark');
    themeIcon.className = 'fa-solid fa-moon';
}

themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('omnicalc_theme', isDark ? 'dark' : 'light');
    themeIcon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    playClickSound(800);
});

soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundIcon.className = soundEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
    playClickSound(1000);
});

// --- MODE SWITCHING ---
const modeButtons = document.querySelectorAll('.calc-mode-btn');
const calculatorView = document.getElementById('calculatorView');
const financeView = document.getElementById('financeView');
const converterView = document.getElementById('converterView');

modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        modeButtons.forEach(b => {
            b.className = 'calc-mode-btn flex-1 py-2 rounded-xl transition text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200';
        });
        btn.className = 'calc-mode-btn flex-1 py-2 rounded-xl transition bg-white dark:bg-dark-700 shadow-sm text-indigo-600 dark:text-indigo-400 font-semibold';
        
        const mode = btn.getAttribute('data-mode');
        currentMode = mode;
        playClickSound(700);

        calculatorView.classList.add('hidden');
        financeView.classList.add('hidden');
        converterView.classList.add('hidden');
        scientificKeypad.classList.add('hidden');

        if (mode === 'standard') {
            calculatorView.classList.remove('hidden');
        } else if (mode === 'scientific') {
            calculatorView.classList.remove('hidden');
            scientificKeypad.classList.remove('hidden');
        } else if (mode === 'finance') {
            financeView.classList.remove('hidden');
        } else if (mode === 'converter') {
            converterView.classList.remove('hidden');
            updateConverter();
        }
    });
});

// --- CALCULATOR CORE LOGIC ---
function updateDisplay() {
    calcDisplay.textContent = currentDisplay;
    expressionPreviewEl.textContent = expressionPreview;
    
    // Auto scale font size based on length
    if (currentDisplay.length > 12) {
        calcDisplay.className = 'calc-font text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white truncate';
    } else if (currentDisplay.length > 8) {
        calcDisplay.className = 'calc-font text-25px sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white truncate';
    } else {
        calcDisplay.className = 'calc-font text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white truncate';
    }
}

function handleNumber(num) {
    playClickSound(500);
    if (currentDisplay === '0' || currentDisplay === 'Error') {
        currentDisplay = num;
    } else {
        currentDisplay += num;
    }
    updateDisplay();
}

function handleDecimal(dot) {
    playClickSound(520);
    const lastNumber = currentDisplay.split(/[\+\-\*\/\(\)]/).pop();
    if (!lastNumber.includes('.')) {
        currentDisplay += dot;
        updateDisplay();
    }
}

function handleOperator(op) {
    playClickSound(580);
    const lastChar = currentDisplay.slice(-1);
    if ('+-*/'.includes(lastChar)) {
        currentDisplay = currentDisplay.slice(0, -1) + op;
    } else {
        currentDisplay += op;
    }
    updateDisplay();
}

function handleClear() {
    playClickSound(400, 'triangle', 0.08);
    currentDisplay = '0';
    expressionPreview = '';
    calcHistorySub.textContent = '';
    updateDisplay();
}

function handleParen(val) {
    playClickSound(550);
    if (currentDisplay === '0') {
        currentDisplay = val;
    } else {
        currentDisplay += val;
    }
    updateDisplay();
}

function handleSign() {
    playClickSound(600);
    try {
        if (currentDisplay.startsWith('-')) {
            currentDisplay = currentDisplay.substring(1);
        } else {
            currentDisplay = '-' + currentDisplay;
        }
        updateDisplay();
    } catch(e) {}
}

function handlePercent() {
    playClickSound(620);
    try {
        let val = eval(currentDisplay.replace(/×/g, '*').replace(/÷/g, '/'));
        val = val / 100;
        currentDisplay = val.toString();
        updateDisplay();
    } catch(e) {
        currentDisplay = 'Error';
        updateDisplay();
    }
}

function handleScientific(func) {
    playClickSound(650);
    try {
        let val = parseFloat(eval(currentDisplay.replace(/×/g, '*').replace(/÷/g, '/'))) || 0;
        let res = 0;
        let angleVal = angleMode === 'DEG' ? val * (Math.PI / 180) : val;

        switch(func) {
            case 'sin': res = Math.sin(angleVal); break;
            case 'cos': res = Math.cos(angleVal); break;
            case 'tan': res = Math.tan(angleVal); break;
            case 'log': res = Math.log10(val); break;
            case 'ln': res = Math.log(val); break;
            case 'sqrt': res = Math.sqrt(val); break;
            case 'pow': currentDisplay += '**'; updateDisplay(); return;
            case 'pi': res = Math.PI; break;
            case 'e': res = Math.E; break;
            case 'fact': 
                res = 1; 
                for(let i=2; i<=val; i++) res *= i; 
                break;
        }
        
        expressionPreview = `${func}(${val})`;
        currentDisplay = parseFloat(res.toFixed(10)).toString();
        updateDisplay();
    } catch(e) {
        currentDisplay = 'Error';
        updateDisplay();
    }
}

// Memory operations
function handleMemory(action) {
    playClickSound(680);
    let val = parseFloat(eval(currentDisplay.replace(/×/g, '*').replace(/÷/g, '/'))) || 0;
    switch(action) {
        case 'mc':
            memory = 0;
            memoryIndicator.classList.add('hidden');
            break;
        case 'mr':
            currentDisplay = memory.toString();
            break;
        case 'mplus':
            memory += val;
            memoryIndicator.classList.remove('hidden');
            memoryValueEl.textContent = memory;
            break;
    }
    updateDisplay();
}

// Angle mode toggle
angleModeDisplay.addEventListener('click', () => {
    angleMode = angleMode === 'DEG' ? 'RAD' : 'DEG';
    angleModeDisplay.textContent = angleMode;
    playClickSound(750);
});

// Calculate result
function calculateResult() {
    playClickSound(700, 'sine', 0.08);
    try {
        let sanitized = currentDisplay
            .replace(/×/g, '*')
            .replace(/÷/g, '/');

        // Basic safety check for eval
        if (/[^0-9\+\-\*\/\.\(\)\*\*]/.test(sanitized)) {
            // If complex characters exist, use safe evaluation or function
        }

        let result = eval(sanitized);
        if (!isFinite(result)) {
            throw new Error('Math Error');
        }

        let formattedResult = parseFloat(result.toFixed(10)).toString();
        
        // Add to history
        addHistory(currentDisplay + ' = ' + formattedResult);

        calcHistorySub.textContent = currentDisplay + ' =';
        expressionPreview = currentDisplay;
        currentDisplay = formattedResult;
        updateDisplay();
    } catch(e) {
        currentDisplay = 'Error';
        updateDisplay();
    }
}

function addHistory(item) {
    history.unshift(item);
    if (history.length > 20) history.pop();
    localStorage.setItem('omnicalc_history', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    if (history.length === 0) {
        emptyHistory.classList.remove('hidden');
        historyList.innerHTML = `<div id="emptyHistory" class="text-center text-slate-400 dark:text-slate-600 py-12 text-xs">
            <i class="fa-solid fa-receipt text-2xl mb-2 block opacity-40"></i>
            No calculation history yet
        </div>`;
        return;
    }
    
    emptyHistory.classList.add('hidden');
    let html = '';
    history.forEach((entry, idx) => {
        let parts = entry.split('=');
        html += `
            <div class="bg-white dark:bg-dark-800 p-3 rounded-xl border border-slate-200/60 dark:border-dark-700/60 shadow-sm flex justify-between items-center group hover:border-indigo-500 transition">
                <div class="calc-font text-xs text-slate-500 dark:text-slate-400">${parts[0]}</div>
                <div class="calc-font text-sm font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer" onclick="recallHistory('${parts[1].trim()}')">= ${parts[1]}</div>
            </div>
        `;
    });
    historyList.innerHTML = html;
}

window.recallHistory = function(val) {
    currentDisplay = val;
    updateDisplay();
    playClickSound(600);
}

document.getElementById('clearHistory').addEventListener('click', () => {
    history = [];
    localStorage.removeItem('omnicalc_history');
    renderHistory();
    playClickSound(450);
});

// Render initial history
renderHistory();

// --- EVENT LISTENERS FOR KEYPAD ---
document.querySelectorAll('[data-action]').forEach(button => {
    button.addEventListener('click', () => {
        const action = button.getAttribute('data-action');
        const val = button.getAttribute('data-val');

        if (action === 'num') handleNumber(val);
        if (action === 'decimal') handleDecimal(val);
        if (action === 'operator') handleOperator(val);
        if (action === 'clear') handleClear();
        if (action === 'paren') handleParen(val);
        if (action === 'sign') handleSign();
        if (action === 'percent') handlePercent();
        if (action === 'sci') handleScientific(val);
        if (action === 'memory') handleMemory(val);
        if (action === 'calculate') calculateResult();
    });
});

// --- KEYBOARD SUPPORT ---
window.addEventListener('keydown', (e) => {
    if (currentMode !== 'standard' && currentMode !== 'scientific') return;

    if ((e.key >= '0' && e.key <= '9')) {
        handleNumber(e.key);
    } else if (e.key === '.' || e.key === ',') {
        handleDecimal('.');
    } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        handleOperator(e.key);
    } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculateResult();
    } else if (e.key === 'Backspace') {
        e.preventDefault();
        if (currentDisplay.length > 1) {
            currentDisplay = currentDisplay.slice(0, -1);
        } else {
            currentDisplay = '0';
        }
        updateDisplay();
        playClickSound(480);
    } else if (e.key === 'Escape') {
        handleClear();
    } else if (e.key === '(' || e.key === ')') {
        handleParen(e.key);
    }
});

// --- FINANCE CALCULATOR ---
document.getElementById('calculateLoan').addEventListener('click', () => {
    playClickSound(700);
    const P = parseFloat(document.getElementById('loanAmount').value) || 0;
    const annualRate = parseFloat(document.getElementById('loanRate').value) || 0;
    const years = parseFloat(document.getElementById('loanTerm').value) || 0;

    const r = annualRate / 100 / 12;
    const n = years * 12;

    let monthlyPayment = 0;
    if (r === 0) {
        monthlyPayment = P / n;
    } else {
        monthlyPayment = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - P;

    document.getElementById('monthlyPayment').textContent = '$' + monthlyPayment.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    document.getElementById('totalInterest').textContent = '$' + totalInterest.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    document.getElementById('totalPayment').textContent = '$' + totalPayment.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    document.getElementById('loanResult').classList.remove('hidden');
});

// --- UNIT CONVERTER ---
const cunitTabs = document.querySelectorAll('.cunit-tab');
const fromValueInput = document.getElementById('fromValue');
const toValueInput = document.getElementById('toValue');
const fromUnitSelect = document.getElementById('fromUnitSelect');
const toUnitSelect = document.getElementById('toUnitSelect');
const fromUnitLabel = document.getElementById('fromUnitLabel');
const toUnitLabel = document.getElementById('toUnitLabel');

cunitTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        cunitTabs.forEach(t => t.className = 'cunit-tab flex-1 py-2 rounded-lg text-slate-500 dark:text-slate-400');
        tab.className = 'cunit-tab flex-1 py-2 rounded-lg bg-white dark:bg-dark-700 shadow-sm text-indigo-600 dark:text-indigo-400';
        converterCategory = tab.getAttribute('data-cunit');
        playClickSound(650);
        setupConverterOptions();
    });
});

function setupConverterOptions() {
    let options = '';
    if (converterCategory === 'length') {
        options = `
            <option value="m">Meter (m)</option>
            <option value="km">Kilometer (km)</option>
            <option value="cm">Centimeter (cm)</option>
            <option value="mm">Millimeter (mm)</option>
            <option value="mi">Mile (mi)</option>
            <option value="ft">Foot (ft)</option>
            <option value="in">Inch (in)</option>
        `;
    } else if (converterCategory === 'weight') {
        options = `
            <option value="kg">Kilogram (kg)</option>
            <option value="g">Gram (g)</option>
            <option value="mg">Milligram (mg)</option>
            <option value="lb">Pound (lb)</option>
            <option value="oz">Ounce (oz)</option>
        `;
    } else if (converterCategory === 'temp') {
        options = `
            <option value="c">Celsius (°C)</option>
            <option value="f">Fahrenheit (°F)</option>
            <option value="k">Kelvin (K)</option>
        `;
    }
    fromUnitSelect.innerHTML = options;
    toUnitSelect.innerHTML = options;
    toUnitSelect.selectedIndex = 1;
    updateConverter();
}

function updateConverter() {
    const val = parseFloat(fromValueInput.value) || 0;
    const from = fromUnitSelect.value;
    const to = toUnitSelect.value;
    let res = 0;

    if (converterCategory === 'length') {
        // convert all to meters first
        let inMeters = val;
        if (from === 'km') inMeters = val * 1000;
        else if (from === 'cm') inMeters = val / 100;
        else if (from === 'mm') inMeters = val / 1000;
        else if (from === 'mi') inMeters = val * 1609.34;
        else if (from === 'ft') inMeters = val / 3.28084;
        else if (from === 'in') inMeters = val / 39.3701;

        // convert from meters to target
        if (to === 'm') res = inMeters;
        else if (to === 'km') res = inMeters / 1000;
        else if (to === 'cm') res = inMeters * 100;
        else if (to === 'mm') res = inMeters * 1000;
        else if (to === 'mi') res = inMeters / 1609.34;
        else if (to === 'ft') res = inMeters * 3.28084;
        else if (to === 'in') res = inMeters * 39.3701;
    } else if (converterCategory === 'weight') {
        // convert to grams
        let inGrams = val;
        if (from === 'kg') inGrams = val * 1000;
        else if (from === 'mg') inGrams = val / 1000;
        else if (from === 'lb') inGrams = val * 453.592;
        else if (from === 'oz') inGrams = val * 28.3495;

        if (to === 'g') res = inGrams;
        else if (to === 'kg') res = inGrams / 1000;
        else if (to === 'mg') res = inGrams * 1000;
        else if (to === 'lb') res = inGrams / 453.592;
        else if (to === 'oz') res = inGrams / 28.3495;
    } else if (converterCategory === 'temp') {
        // convert to celsius
        let inCelsius = val;
        if (from === 'f') inCelsius = (val - 32) * 5/9;
        else if (from === 'k') inCelsius = val - 273.15;

        if (to === 'c') res = inCelsius;
        else if (to === 'f') res = (inCelsius * 9/5) + 32;
        else if (to === 'k') res = inCelsius + 273.15;
    }

    toValueInput.value = parseFloat(res.toFixed(4));
}

fromValueInput.addEventListener('input', updateConverter);
fromUnitSelect.addEventListener('change', updateConverter);
toUnitSelect.addEventListener('change', updateConverter);
