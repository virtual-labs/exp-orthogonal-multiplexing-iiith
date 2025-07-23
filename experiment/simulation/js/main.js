let currentStage = -1;
let simState = {};
const BLOCKS = [
    { name: "QAM Mod\n& S/P", x: 20, y: 10, w: 90, h: 35, stages: [0] },
    { name: "IFFT", x: 120, y: 10, w: 80, h: 35, stages: [1] },
    { name: "Add CP", x: 210, y: 10, w: 80, h: 35, stages: [2] },
    { name: "Channel", x: 320, y: 40, w: 160, h: 20, stages: [3, 4] },
    { name: "Remove CP", x: 510, y: 55, w: 90, h: 35, stages: [5] },
    { name: "FFT", x: 610, y: 55, w: 80, h: 35, stages: [6] },
    { name: "Equalize\n& Demod", x: 700, y: 55, w: 90, h: 35, stages: [7, 8] }
];
const STAGES = [
    { name: "1. Modulation & S/P", calculate: calculateTxSymbols, render: renderTxSymbols },
    { name: "2. IFFT (Time Domain)", calculate: calculateIFFT, render: renderTimeSignal },
    { name: "3. Add Cyclic Prefix", calculate: calculateCP, render: renderTimeSignalWithCP },
    { name: "4. Channel Convolution", calculate: calculateChannelConv, render: renderTimeSignalWithCP },
    { name: "5. Add AWGN Noise", calculate: calculateNoise, render: renderTimeSignalWithCP },
    { name: "6. Remove Cyclic Prefix", calculate: calculateCPRemoval, render: renderTimeSignal },
    { name: "7. FFT (Frequency Domain)", calculate: calculateFFT, render: renderRxSymbols },
    { name: "8. Channel Equalization", calculate: calculateEqualization, render: renderRxSymbols },
    { name: "9. Demodulation & BER", calculate: calculateBER, render: renderResults }
];

// --- MODULATION MAPS ---
const MODULATION_MAPS = { 
    2: { 
        bits: 1, 
        map: [{real: -1, imag: 0, bits: [0]}, {real: 1, imag: 0, bits: [1]}] 
    }, 
    4: { 
        bits: 2, 
        map: [ 
            {real: -1, imag: -1, bits: [0, 0]}, 
            {real: -1, imag: 1, bits: [0, 1]}, 
            {real: 1, imag: -1, bits: [1, 0]}, 
            {real: 1, imag: 1, bits: [1, 1]} 
        ], 
        norm: 1 / Math.sqrt(2) 
    }, 
    16: { 
        bits: 4, 
        map: [], 
        norm: 1 / Math.sqrt(10) 
    }, 
    64: { 
        bits: 6, 
        map: [], 
        norm: 1 / Math.sqrt(42) 
    } 
};

// Initialize QAM maps
function generateQamMap(order, bitsPerSymbol) { 
    const points = []; 
    const side = Math.sqrt(order); 
    const gray = (i) => i ^ (i >> 1); 
    for (let y = 0; y < side; y++) { 
        for (let x = 0; x < side; x++) { 
            const i_bits = gray(x).toString(2).padStart(bitsPerSymbol / 2, '0'); 
            const q_bits = gray(y).toString(2).padStart(bitsPerSymbol / 2, '0'); 
            points.push({ real: (2 * x - (side - 1)), imag: (2 * y - (side - 1)), bits: (i_bits + q_bits).split('').map(Number) }); 
        } 
    } 
    return points; 
}
MODULATION_MAPS[16].map = generateQamMap(16, 4); 
MODULATION_MAPS[64].map = generateQamMap(64, 6);

// --- UI CONTROL FUNCTIONS ---
const setStatus = (msg) => document.getElementById('statusBar').textContent = msg;
const stageDisplay = document.getElementById('stageDisplay');

// --- RENDER STAGES (responsive canvas sizes) ---
function renderTxSymbols() { 
    const isMobile = window.innerWidth <= 768;
    const size = isMobile ? Math.min(window.innerWidth - 40, 350) : 550;
    stageDisplay.innerHTML = `<h3>Transmitted Constellation (X[k])</h3><canvas id="stageCanvas" width="${size}" height="${size}"></canvas>`; 
    drawConstellation('stageCanvas', simState.txSymbols, simState.params.modOrder, false); 
}

function renderTimeSignal() { 
    const isMobile = window.innerWidth <= 768;
    const width = isMobile ? Math.min(window.innerWidth - 40, 350) : 750;
    const height = Math.floor(width * 0.56); // Maintain aspect ratio
    stageDisplay.innerHTML = `<h3>Time Domain Signal</h3><canvas id="stageCanvas" width="${width}" height="${height}"></canvas>`; 
    drawTimeSignal('stageCanvas', simState.receivedBlock || simState.timeSignal); 
}

function renderTimeSignalWithCP() { 
    const isMobile = window.innerWidth <= 768;
    const width = isMobile ? Math.min(window.innerWidth - 40, 350) : 750;
    const height = Math.floor(width * 0.56); // Maintain aspect ratio
    stageDisplay.innerHTML = `<h3>Time Signal with CP</h3><canvas id="stageCanvas" width="${width}" height="${height}"></canvas>`; 
    const signal = simState.noisyReceivedSignal || simState.receivedSignal || simState.signalWithCP; 
    drawTimeSignal('stageCanvas', signal, simState.params.cpLength); 
}

function renderRxSymbols() { 
    const isMobile = window.innerWidth <= 768;
    const size = isMobile ? Math.min(window.innerWidth - 40, 350) : 550;
    const isEq = !!simState.X_hat_freq; 
    const title = isEq ? 'Equalized Constellation (X̂[k])' : 'Received Constellation (Y[k])'; 
    const symbols = isEq ? simState.X_hat_freq : simState.Y_freq; 
    stageDisplay.innerHTML = `<h3>${title}</h3><canvas id="stageCanvas" width="${size}" height="${size}"></canvas>`; 
    drawConstellation('stageCanvas', symbols, simState.params.modOrder, true); 
}

function renderResults() { 
    renderRxSymbols(); 
    setStatus('9. Demodulation & BER Analysis - Simulation Complete!'); 
}

// --- VISUALIZATION HELPERS (RESPONSIVE) ---
function drawConstellation(canvasId, symbols, modOrder, showRx) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    
    const modInfo = MODULATION_MAPS[modOrder];
    const norm = modInfo.norm || 1;
    const max_coord = (Math.sqrt(modOrder) - 1) * norm;
    const plot_max = symbols.reduce((max, s) => Math.max(max, Math.abs(s.real), Math.abs(s.imag)), max_coord) * 1.2 || 1.2;
    const scale = Math.min(width, height) / (2 * plot_max);
    const centerX = width / 2, centerY = height / 2;
    
    // Draw axes
    ctx.strokeStyle = '#bdc3c7'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, centerY); ctx.lineTo(width, centerY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(centerX, 0); ctx.lineTo(centerX, height); ctx.stroke();

    // Draw ideal constellation points (gray squares)
    ctx.fillStyle = '#aaa';
    modInfo.map.forEach(p => {
        const x = centerX + p.real * norm * scale;
        const y = centerY - p.imag * norm * scale;
        ctx.fillRect(x - 2.5, y - 2.5, 5, 5);
    });

    // Draw actual symbols (blue for Tx, red for Rx)
    const pointSize = width < 400 ? 3 : 4;  // Smaller points on small screens
    ctx.fillStyle = showRx ? '#c0392b' : '#2980b9'; 
    ctx.strokeStyle = showRx ? '#932d22' : '#20638f';
    ctx.lineWidth = 0.5;
    
    symbols.forEach(sym => {
        const x = centerX + sym.real * scale;
        const y = centerY - sym.imag * scale;
        ctx.beginPath(); 
        ctx.arc(x, y, pointSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    });
}

function drawTimeSignal(canvasId, signal, cpLength = 0) {
    const canvas = document.getElementById(canvasId);
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    
    // Background grid
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    for(let i=1; i<10; i++) {
        const y = i * height/10;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    const max_abs = signal.reduce((max, s) => Math.max(max, Math.abs(s.real), Math.abs(s.imag)), 0) * 1.2 || 1;
    const scale = height / (2 * max_abs);
    const stepX = width / signal.length;
    const centerY = height / 2;
    
    // Highlight CP area
    if (cpLength > 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, cpLength * stepX, height);
    }
    
    // Draw real part (blue)
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = width < 400 ? 1.5 : 2;
    ctx.beginPath();
    ctx.moveTo(0, centerY - signal[0].real * scale);
    for (let i = 1; i < signal.length; i++) {
        ctx.lineTo(i * stepX, centerY - signal[i].real * scale);
    }
    ctx.stroke();
    
    // Draw imaginary part (red)
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = width < 400 ? 1.5 : 2;
    ctx.beginPath();
    ctx.moveTo(0, centerY - signal[0].imag * scale);
    for (let i = 1; i < signal.length; i++) {
        ctx.lineTo(i * stepX, centerY - signal[i].imag * scale);
    }
    ctx.stroke();
}

// --- RESPONSIVE BLOCK DIAGRAM ---
function drawBlockDiagram() {
    const canvas = document.getElementById('blockDiagram');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const originalWidth = 800;
    const originalHeight = 100;
    const scale = canvas.width / originalWidth;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(scale, scale);
    
    // Use original coordinates but they will be scaled automatically
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    BLOCKS.forEach(block => {
        const isActive = block.stages.includes(currentStage);
        ctx.fillStyle = isActive ? (block.y > 50 ? '#e74c3c' : '#3498db') : '#ecf0f1';
        ctx.strokeStyle = isActive ? (block.y > 50 ? '#c0392b' : '#2980b9') : '#bdc3c7';
        ctx.lineWidth = isActive ? 2 : 1;
        ctx.fillRect(block.x, block.y, block.w, block.h);
        ctx.strokeRect(block.x, block.y, block.w, block.h);
        ctx.fillStyle = isActive ? 'white' : '#2c3e50';
        const lines = block.name.split('\n');
        lines.forEach((line, i) => ctx.fillText(line, block.x + block.w / 2, block.y + block.h / 2 + (i - (lines.length - 1) / 2) * 11));
    });

    // Draw arrows
    ctx.strokeStyle = '#7f8c8d';
    ctx.lineWidth = 1.5;
    const drawArrow = (fromX, fromY, toX, toY) => {
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();
        const angle = Math.atan2(toY - fromY, toX - fromX);
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - 6 * Math.cos(angle - Math.PI / 6), toY - 6 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(toX - 6 * Math.cos(angle + Math.PI / 6), toY - 6 * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fillStyle = '#7f8c8d';
        ctx.fill();
    };

    drawArrow(BLOCKS[0].x - 20, 27.5, BLOCKS[0].x, 27.5);
    drawArrow(BLOCKS[0].x + BLOCKS[0].w, 27.5, BLOCKS[1].x, 27.5);
    drawArrow(BLOCKS[1].x + BLOCKS[1].w, 27.5, BLOCKS[2].x, 27.5);
    ctx.beginPath();
    ctx.moveTo(BLOCKS[2].x + BLOCKS[2].w, 27.5);
    ctx.lineTo(300, 27.5);
    ctx.lineTo(300, 50);
    ctx.lineTo(320, 50);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(BLOCKS[3].x + BLOCKS[3].w, 50);
    ctx.lineTo(500, 50);
    ctx.lineTo(500, 72.5);
    ctx.lineTo(BLOCKS[4].x, 72.5);
    ctx.stroke();
    drawArrow(500, 72.5, BLOCKS[4].x, 72.5);
    drawArrow(BLOCKS[4].x + BLOCKS[4].w, 72.5, BLOCKS[5].x, 72.5);
    drawArrow(BLOCKS[5].x + BLOCKS[5].w, 72.5, BLOCKS[6].x, 72.5);
    drawArrow(BLOCKS[6].x + BLOCKS[6].w, 72.5, BLOCKS[6].x + BLOCKS[6].w + 20, 72.5);
    
    ctx.restore();
}

// --- CALCULATION FUNCTIONS ---
function calculateTxSymbols() { 
    const { N, modOrder } = simState.params; 
    const modInfo = MODULATION_MAPS[modOrder]; 
    simState.txBits = []; 
    simState.txSymbols = []; 
    for (let i = 0; i < N; i++) { 
        const point = modInfo.map[Math.floor(Math.random() * modInfo.map.length)]; 
        const norm = modInfo.norm || 1; 
        simState.txSymbols.push({ real: point.real * norm, imag: point.imag * norm }); 
        simState.txBits.push(...point.bits); 
    } 
}

function calculateIFFT() { simState.timeSignal = ifft(simState.txSymbols); }

function calculateCP() { 
    const { N, cpLength } = simState.params; 
    simState.signalWithCP = [...simState.timeSignal.slice(N - cpLength), ...simState.timeSignal]; 
}

function calculateChannelConv() { 
    const { channelLength } = simState.params; 
    simState.channelTaps = generateGaussianNoise(channelLength, 1 / Math.sqrt(2)); 
    simState.receivedSignal = linearConvolve(simState.signalWithCP, simState.channelTaps); 
}

function calculateNoise() { 
    const { N, snr_dB } = simState.params; 
    const signalPower = simState.timeSignal.reduce((acc, s) => acc + s.real**2 + s.imag**2, 0) / N; 
    const snrLinear = 10**(snr_dB / 10); 
    const noisePower = signalPower / snrLinear; 
    const noiseStdDev = Math.sqrt(noisePower / 2); 
    const noise = generateGaussianNoise(simState.receivedSignal.length, noiseStdDev); 
    simState.noisyReceivedSignal = simState.receivedSignal.map((s, i) => ({ real: s.real + noise[i].real, imag: s.imag + noise[i].imag })); 
}

function calculateCPRemoval() { 
    const { N, cpLength } = simState.params; 
    simState.receivedBlock = simState.noisyReceivedSignal.slice(cpLength, cpLength + N); 
}

function calculateFFT() { 
    simState.Y_freq = fft(simState.receivedBlock); 
}

function calculateEqualization() { 
    const { N, channelLength } = simState.params; 
    const paddedChannel = [...simState.channelTaps, ...Array(N - channelLength).fill({real: 0, imag: 0})]; 
    simState.H_freq = fft(paddedChannel); 
    simState.X_hat_freq = simState.Y_freq.map((y, k) => { 
        const h = simState.H_freq[k]; 
        const h_mag_sq = h.real**2 + h.imag**2 + 1e-9; 
        return { 
            real: (y.real * h.real + y.imag * h.imag) / h_mag_sq, 
            imag: (y.imag * h.real - y.real * h.imag) / h_mag_sq 
        }; 
    }); 
}

function calculateBER() { 
    simState.rxBits = demodulate(simState.X_hat_freq, simState.params.modOrder); 
    let errorBits = 0; 
    for (let i = 0; i < simState.txBits.length; i++) { 
        if (simState.txBits[i] !== simState.rxBits[i]) errorBits++; 
    } 
    simState.errorBits = errorBits; 
    simState.ber = errorBits / simState.txBits.length; 
}

// --- UTILITY FUNCTIONS ---
function dft(signal, direction) { 
    const N = signal.length; 
    const output = []; 
    for (let k = 0; k < N; k++) { 
        let sum = { real: 0, imag: 0 }; 
        for (let n = 0; n < N; n++) { 
            const angle = direction * 2 * Math.PI * k * n / N; 
            const c = Math.cos(angle); 
            const s = Math.sin(angle); 
            sum.real += signal[n].real * c - signal[n].imag * s; 
            sum.imag += signal[n].real * s + signal[n].imag * c; 
        } 
        output.push(sum); 
    } 
    return output; 
}

const ifft = (sig) => dft(sig, 1).map(v => ({real: v.real/sig.length, imag: v.imag/sig.length}));
const fft = (sig) => dft(sig, -1);

function generateGaussianNoise(N, stdDev) { 
    const noise = []; 
    for (let i = 0; i < Math.ceil(N/2); i++) { 
        const u1 = Math.random(), u2 = Math.random(); 
        const mag = stdDev * Math.sqrt(-2.0 * Math.log(u1)); 
        noise.push({ real: mag * Math.cos(2.0 * Math.PI * u2), imag: mag * Math.sin(2.0 * Math.PI * u2) }); 
        if (noise.length < N) { 
            noise.push({real: mag * Math.cos(2.0 * Math.PI * (1-u2)), imag: mag * Math.sin(2.0 * Math.PI * (1-u2))}); 
        } 
    } 
    return noise.slice(0,N); 
}

function linearConvolve(signal, kernel) { 
    const out = []; 
    for (let i = 0; i < signal.length + kernel.length - 1; i++) { 
        let sum = { real: 0, imag: 0 }; 
        for (let j = 0; j < kernel.length; j++) { 
            if (i - j >= 0 && i - j < signal.length) { 
                const s = signal[i-j], h = kernel[j]; 
                sum.real += s.real * h.real - s.imag * h.imag; 
                sum.imag += s.real * h.imag + s.imag * h.real; 
            } 
        } 
        out.push(sum); 
    } 
    return out; 
}

function demodulate(symbols, modOrder) { 
    const modInfo = MODULATION_MAPS[modOrder]; 
    const norm = modInfo.norm || 1; 
    const estimatedBits = []; 
    for (const sym of symbols) { 
        let bestDist = Infinity; 
        let bestBits = []; 
        for (const p of modInfo.map) { 
            const dist = Math.pow(sym.real - p.real * norm, 2) + Math.pow(sym.imag - p.imag * norm, 2); 
            if (dist < bestDist) { 
                bestDist = dist; 
                bestBits = p.bits; 
            } 
        } 
        estimatedBits.push(...bestBits); 
    } 
    return estimatedBits; 
}

// --- UI EVENT HANDLERS ---
function updateNavButtons() { 
    document.getElementById('prevButton').disabled = (currentStage <= 0); 
    document.getElementById('nextButton').disabled = (currentStage >= STAGES.length - 1 || !simState.params); 
}

async function runStage(stageIndex) { 
    const stage = STAGES[stageIndex]; 
    setStatus(`Calculating: ${stage.name}...`); 
    await new Promise(r => setTimeout(r, 20)); 
    stage.calculate(); 
    stage.render(); 
    drawBlockDiagram(); 
    if(stage.name.includes("BER")) updateOutputPanel(); 
    setStatus(stage.name); 
    updateNavButtons(); 
}

async function handleNext() { 
    if (!simState.params) { 
        alert("Please click 'Start New Simulation' first."); 
        return; 
    } 
    if (currentStage < STAGES.length - 1) { 
        currentStage++; 
        await runStage(currentStage); 
    } 
}

function handlePrevious() { 
    if (!simState.params || currentStage <= 0) return; 
    currentStage--; 
    const stage = STAGES[currentStage]; 
    stage.render(); 
    drawBlockDiagram(); 
    setStatus(stage.name); 
    updateNavButtons(); 
}

function resetSimulation() { 
    currentStage = -1; 
    simState = {}; 
    simState.params = { 
        N: parseInt(document.getElementById('subcarriers').value), 
        modOrder: parseInt(document.getElementById('modulation').value), 
        channelLength: parseInt(document.getElementById('channelLength').value), 
        cpLength: parseInt(document.getElementById('cpLength').value), 
        snr_dB: parseFloat(document.getElementById('snr').value) 
    }; 
    stageDisplay.innerHTML = `<h3>Click "Next" to begin the simulation.</h3>`; 
    ['outputBER', 'outputTotalBits', 'outputErrorBits', 'spectralEfficiency', 'papr'].forEach(id => document.getElementById(id).textContent = 'N/A'); 
    setStatus("Ready. Click 'Next' to begin."); 
    drawBlockDiagram(); 
    updateNavButtons(); 
}

function updateOutputPanel() { 
    const { N, cpLength, modOrder } = simState.params; 
    document.getElementById('outputBER').textContent = simState.ber.toExponential(3); 
    document.getElementById('outputTotalBits').textContent = simState.txBits.length; 
    document.getElementById('outputErrorBits').textContent = simState.errorBits; 
    const bitsPerSymbol = MODULATION_MAPS[modOrder].bits; 
    const spectralEfficiency = (bitsPerSymbol * N) / (N + cpLength); 
    document.getElementById('spectralEfficiency').textContent = spectralEfficiency.toFixed(2); 
    const signalPower = simState.timeSignal.reduce((acc, s) => acc + s.real**2 + s.imag**2, 0) / N; 
    const timeSignalPower = simState.timeSignal.map(s => s.real**2 + s.imag**2); 
    const peakPower = Math.max(...timeSignalPower); 
    const papr = 10 * Math.log10(peakPower / signalPower); 
    document.getElementById('papr').textContent = papr.toFixed(2) + ' dB'; 
}

// --- RESPONSIVE CANVAS HANDLING ---
function resizeCanvases() {
    const blockDiagram = document.getElementById('blockDiagram');
    if (blockDiagram) {
        const width = blockDiagram.parentElement.clientWidth;
        const height = window.innerWidth <= 768 ? 80 : 100;
        blockDiagram.width = width;
        blockDiagram.height = height;
        drawBlockDiagram();
    }
    
    // Re-render current stage if needed
    if (currentStage >= 0 && currentStage < STAGES.length) {
        STAGES[currentStage].render();
    }
}

// --- EVENT LISTENERS ---
window.addEventListener('resize', resizeCanvases);
window.addEventListener('orientationchange', resizeCanvases);

// --- INITIALIZE ---
window.onload = () => {
    resizeCanvases();
    updateNavButtons();
    stageDisplay.innerHTML = '<h3>Configure parameters and click "Start New Simulation".</h3>';
};