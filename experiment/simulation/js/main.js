
// --- Complex Number Class and DSP Helper Functions ---
class Complex {
    constructor(re, im = 0) {
        this.re = re;
        this.im = im;
    }
    add(other) {
        return new Complex(this.re + other.re, this.im + other.im);
    }
    sub(other) {
        return new Complex(this.re - other.re, this.im - other.im);
    }
    mul(other) {
        return new Complex(
            this.re * other.re - this.im * other.im,
            this.re * other.im + this.im * other.re
        );
    }
    div(other) {
        if (other.re === 0 && other.im === 0) return new Complex(Infinity, Infinity);
        const den = other.re * other.re + other.im * other.im;
        return new Complex(
            (this.re * other.re + this.im * other.im) / den,
            (this.im * other.re - this.re * other.im) / den
        );
    }
    magSq() {
        return this.re * this.re + this.im * this.im;
    }
    mag() {
        return Math.sqrt(this.magSq());
    }
    conj() {
        return new Complex(this.re, -this.im);
    }
    toString() {
        if (this.im === 0) return this.re.toFixed(3);
        if (this.re === 0) return `${this.im.toFixed(3)}i`;
        const sign = this.im > 0 ? '+' : '';
        return `${this.re.toFixed(3)}${sign}${this.im.toFixed(3)}i`;
    }
}
function fft(x) {
    const N = x.length;
    if (N <= 1) return x;
    const even = [];
    const odd = [];
    for (let i = 0; i < N / 2; i++) {
        even[i] = x[i * 2];
        odd[i] = x[i * 2 + 1];
    }
    const Y_even = fft(even);
    const Y_odd = fft(odd);
    const Y = new Array(N);
    for (let k = 0; k < N / 2; k++) {
        const t = new Complex(Math.cos(-2 * Math.PI * k / N), Math.sin(-2 * Math.PI * k / N)).mul(Y_odd[k]);
        Y[k] = Y_even[k].add(t);
        Y[k + N / 2] = Y_even[k].sub(t);
    }
    return Y;
}
function ifft(X) {
    const N = X.length;
    if (N <= 1) return X;
    const X_conj = X.map(c => new Complex(c.re, -c.im));
    const y_conj = fft(X_conj);
    return y_conj.map(c => new Complex(c.re / N, -c.im / N));
}
function fftshift(arr) {
    const mid = Math.floor(arr.length / 2);
    return [...arr.slice(mid), ...arr.slice(0, mid)];
}
function dbToLinear(db) {
    return Math.pow(10, db / 10);
}
function linearToDb(linear) {
    if (linear <= 0 || !isFinite(linear)) return -100;
    const dbValue = 10 * Math.log10(linear);
    return isFinite(dbValue) ? dbValue : -100;
}
function randn() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}
function bpskModulate(bit) { return new Complex(2 * bit - 1); }
function qpskModulate(bits) {
    const real = (2 * bits[0] - 1) / Math.sqrt(2);
    const imag = (2 * bits[1] - 1) / Math.sqrt(2);
    return new Complex(real, imag);
}
function qam16Modulate(bits) {
    const map = {
        "0000": new Complex(-3 / Math.sqrt(10), -3 / Math.sqrt(10)), "0001": new Complex(-3 / Math.sqrt(10), -1 / Math.sqrt(10)),
        "0010": new Complex(-3 / Math.sqrt(10), 3 / Math.sqrt(10)), "0011": new Complex(-3 / Math.sqrt(10), 1 / Math.sqrt(10)),
        "0100": new Complex(-1 / Math.sqrt(10), -3 / Math.sqrt(10)), "0101": new Complex(-1 / Math.sqrt(10), -1 / Math.sqrt(10)),
        "0110": new Complex(-1 / Math.sqrt(10), 3 / Math.sqrt(10)), "0111": new Complex(-1 / Math.sqrt(10), 1 / Math.sqrt(10)),
        "1000": new Complex(3 / Math.sqrt(10), -3 / Math.sqrt(10)), "1001": new Complex(3 / Math.sqrt(10), -1 / Math.sqrt(10)),
        "1010": new Complex(3 / Math.sqrt(10), 3 / Math.sqrt(10)), "1011": new Complex(3 / Math.sqrt(10), 1 / Math.sqrt(10)),
        "1100": new Complex(1 / Math.sqrt(10), -3 / Math.sqrt(10)), "1101": new Complex(1 / Math.sqrt(10), -1 / Math.sqrt(10)),
        "1110": new Complex(1 / Math.sqrt(10), 3 / Math.sqrt(10)), "1111": new Complex(1 / Math.sqrt(10), 1 / Math.sqrt(10)),
    };
    return map[bits.join('')];
}
function bpskDemodulate(symbol) { return symbol.re > 0 ? 1 : 0; }
function qpskDemodulate(symbol) {
    return [symbol.re > 0 ? 1 : 0, symbol.im > 0 ? 1 : 0];
}
function qam16Demodulate(symbol) {
    const constellationPoints = {
        "0000": new Complex(-3 / Math.sqrt(10), -3 / Math.sqrt(10)), "0001": new Complex(-3 / Math.sqrt(10), -1 / Math.sqrt(10)),
        "0010": new Complex(-3 / Math.sqrt(10), 3 / Math.sqrt(10)), "0011": new Complex(-3 / Math.sqrt(10), 1 / Math.sqrt(10)),
        "0100": new Complex(-1 / Math.sqrt(10), -3 / Math.sqrt(10)), "0101": new Complex(-1 / Math.sqrt(10), -1 / Math.sqrt(10)),
        "0110": new Complex(-1 / Math.sqrt(10), 3 / Math.sqrt(10)), "0111": new Complex(-1 / Math.sqrt(10), 1 / Math.sqrt(10)),
        "1000": new Complex(3 / Math.sqrt(10), -3 / Math.sqrt(10)), "1001": new Complex(3 / Math.sqrt(10), -1 / Math.sqrt(10)),
        "1010": new Complex(3 / Math.sqrt(10), 3 / Math.sqrt(10)), "1011": new Complex(3 / Math.sqrt(10), 1 / Math.sqrt(10)),
        "1100": new Complex(1 / Math.sqrt(10), -3 / Math.sqrt(10)), "1101": new Complex(1 / Math.sqrt(10), -1 / Math.sqrt(10)),
        "1110": new Complex(1 / Math.sqrt(10), 3 / Math.sqrt(10)), "1111": new Complex(1 / Math.sqrt(10), 1 / Math.sqrt(10)),
    };
    let minDistanceSq = Infinity;
    let demodulatedBits = '';
    for (const bitString in constellationPoints) {
        const idealPoint = constellationPoints[bitString];
        const distanceSq = (symbol.re - idealPoint.re) ** 2 + (symbol.im - idealPoint.im) ** 2;
        if (distanceSq < minDistanceSq) {
            minDistanceSq = distanceSq;
            demodulatedBits = bitString;
        }
    }
    return demodulatedBits.split('').map(Number);
}

function generateBits(numBits) { return Array.from({ length: numBits }, () => Math.random() > 0.5 ? 1 : 0); }

function openTab(evt, tabName) {
    // Hide all tab contents
    const tabContents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].style.display = "none";
    }

    // Remove active class from all tab links
    const tabLinks = document.getElementsByClassName("tab-link");
    for (let i = 0; i < tabLinks.length; i++) {
        tabLinks[i].classList.remove("active");
    }

    // Show the selected tab and mark button as active
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.classList.add("active");

    // Reset charts and UI state when switching tabs
    if (tabName === 'simulationTab') {
        // Show the first chart when entering simulation tab
        updateChartVisibility(0);
    } else {
        hideStepByStepCharts();
    }
    hideOutputCharts();
    
    if (tabName === 'simulationTab') {
        // Reset to first block for step-by-step
        currentBlockIndex = 0;
        highlightBlock(currentBlockIndex);
    }
}

function modulate(bits, modulationScheme, bitsPerSymbol) {
    const modulatedSymbols = [];
    let modulateFunc;
    switch (modulationScheme) {
        case 'BPSK': modulateFunc = bpskModulate; break;
        case 'QPSK': modulateFunc = qpskModulate; break;
        case '16QAM': modulateFunc = qam16Modulate; break;
        default: throw new Error('Invalid modulation scheme.');
    }
    for (let i = 0; i < bits.length; i += bitsPerSymbol) {
        const currentBits = bits.slice(i, i + bitsPerSymbol);
        if (bitsPerSymbol === 1) {
            modulatedSymbols.push(modulateFunc(currentBits[0]));
        } else {
            modulatedSymbols.push(modulateFunc(currentBits));
        }
    }
    return modulatedSymbols;
}

function mapToSubcarriers(symbols, nFFTSize, numSubcarriers) {
    const inputiFFT = Array.from({ length: nFFTSize }, () => new Complex(0));
    let symbolIdx = 0;
    
    if (nFFTSize === 64 && numSubcarriers === 52) {
        // 802.11a standard mapping
        const subcarrierIndices = [
            -26,-25,-24,-23,-22,-21,-20,-19,-18,-17,-16,-15,-14,-13,-12,-11,
            -10,-9,-8,-7,-6,-5,-4,-3,-2,-1,
            1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26
        ];
        for (const scIdx of subcarrierIndices) {
            let arrayIdx = scIdx > 0 ? scIdx : nFFTSize + scIdx;
            if (symbolIdx < symbols.length) {
                inputiFFT[arrayIdx] = symbols[symbolIdx++];
            }
        }
    } else {
        // Generic symmetric mapping - must match extraction
        const halfSubcarriers = Math.floor(numSubcarriers / 2);
        const extraSubcarrier = numSubcarriers % 2;
        
        // Map to positive frequencies first
        for (let i = 1; i <= halfSubcarriers + extraSubcarrier && symbolIdx < symbols.length; i++) {
            inputiFFT[i] = symbols[symbolIdx++];
        }
        
        // Map to negative frequencies
        for (let i = nFFTSize - halfSubcarriers; i < nFFTSize && symbolIdx < symbols.length; i++) {
            inputiFFT[i] = symbols[symbolIdx++];
        }
    }
    
    return inputiFFT;
}

function addCyclicPrefix(signal, cpLength) {
    const cyclicPrefix = signal.slice(signal.length - cpLength);
    return [...cyclicPrefix, ...signal];
}

// --- Replace the existing applyMultitapChannel and addAwgn functions ---

function applyMultitapChannel(signal, numTaps) {
    // Generate channel coefficients (normalized so E[||h||^2] = 1)
    const h = Array.from({ length: numTaps }, () => {
        const h_real = randn() / Math.sqrt(2 * numTaps);
        const h_imag = randn() / Math.sqrt(2 * numTaps);
        return new Complex(h_real, h_imag);
    });
    
    // Apply convolution: y[n] = sum(h[l] * x[n-l])
    const fadedSignal = new Array(signal.length).fill(new Complex(0));
    for (let n = 0; n < signal.length; n++) {
        for (let l = 0; l < numTaps && n - l >= 0; l++) {
            fadedSignal[n] = fadedSignal[n].add(signal[n - l].mul(h[l]));
        }
    }
    
    return { fadedSignal, channelCoeffs: h };
}

// Fix 3: Improved AWGN function for better noise scaling
function addAwgn(signal, snrDb, nFFT, cpLen, numDataCarriers) {
    // Calculate signal power from actual signal samples
    const signalPower = signal.reduce((sum, s) => sum + s.magSq(), 0) / signal.length;
    if (signalPower === 0) return signal;

    // Convert SNR to linear scale
    const snrLinear = dbToLinear(snrDb);
    
    // Calculate noise power: P_noise = P_signal / SNR
    const noisePower = signalPower / snrLinear;
    const noiseStdDev = Math.sqrt(noisePower / 2); // /2 because complex noise has two dimensions

    const noisySignal = signal.map(sample => {
        const noiseReal = randn() * noiseStdDev;
        const noiseImag = randn() * noiseStdDev;
        return sample.add(new Complex(noiseReal, noiseImag));
    });
    
    return noisySignal;
}

function removeCyclicPrefix(signalWithCP, cpLength, nFFTSize) {
    return signalWithCP.slice(cpLength, cpLength + nFFTSize);
}

// Replace your existing equalize function with this one
function equalize(receivedSymbolsFFT, channelGainsFFT, method, snrDb) {
    const snrLinear = dbToLinear(snrDb);
    return receivedSymbolsFFT.map((sym, i) => {
        const channelGain = channelGainsFFT[i];
        if (channelGain.magSq() < 1e-10) {
            return new Complex(0, 0); // Avoid division by zero
        }

        let equalizedSymbol;
        switch (method) {
            case 'MMSE':
                const channelMagSq = channelGain.magSq();
                const mmseWeight = channelGain.conj().div(new Complex(channelMagSq + 1 / snrLinear));
                equalizedSymbol = sym.mul(mmseWeight);
                break;
            
            case 'ZF':
            default:
                equalizedSymbol = sym.div(channelGain);
                break;
        }

        // Safety check for huge numbers after equalization
        if (!isFinite(equalizedSymbol.re) || !isFinite(equalizedSymbol.im) || Math.abs(equalizedSymbol.re) > 100 || Math.abs(equalizedSymbol.im) > 100) {
            return new Complex(0, 0);
        }
        return equalizedSymbol;
    });
}

function demodulate(symbols, modulationScheme) {
    const demodulatedBits = [];
    let demodulateFunc;
    switch (modulationScheme) {
        case 'BPSK': demodulateFunc = bpskDemodulate; break;
        case 'QPSK': demodulateFunc = qpskDemodulate; break;
        case '16QAM': demodulateFunc = qam16Demodulate; break;
        default: throw new Error('Invalid modulation scheme.');
    }
    for (const symbol of symbols) {
        const bits = demodulateFunc(symbol);
        if (Array.isArray(bits)) {
            demodulatedBits.push(...bits);
        } else {
            demodulatedBits.push(bits);
        }
    }
    return demodulatedBits;
}

function calculateBer(originalBits, receivedBits) {
    if (!originalBits || !receivedBits) return 1.0;
    
    let errors = 0;
    const minLength = Math.min(originalBits.length, receivedBits.length);
    
    if (minLength === 0) return 1.0;
    
    for (let i = 0; i < minLength; i++) {
        if (originalBits[i] !== receivedBits[i]) {
            errors++;
        }
    }
    
    return errors / minLength;
}

// --- Utility Functions ---
function formatComplexArrayForDisplay(arr, count = 5) {
    if (!arr || arr.length === 0) return "N/A";
    const sample = arr.slice(0, count).map(c => c.toString()).join(', ');
    return `[${sample}${arr.length > count ? ', ...' : ''}]`;
}
function formatBitArrayForDisplay(arr, count = 20) {
    if (!arr || arr.length === 0) return "N/A";
    const sample = arr.slice(0, count).join('');
    return `${sample}${arr.length > count ? '...' : ''}`;
}

// --- Global Variables & Simulation Logic ---
let globalTransmittedBits = [];
let globalModulatedSymbols = [];
let globalTxWaveformPreChannel = [];
let globalRxWaveformPostChannel = [];
let globalRxNoCP = [];
let globalRxFFTOutput = [];
let globalReceivedSymbols = [];
let globalChannelGainsFFT = [];

// --- BER Plotting Globals for Multi-Curve Support (New) ---
let berChartDatasets = [];
const MAX_BER_PLOTS = 6;
const BER_COLORS = [
    'rgb(59, 130, 246)',    // Blue
    'rgb(239, 68, 68)',     // Red
    'rgb(34, 197, 94)',     // Green
    'rgb(234, 179, 8)',     // Yellow
    'rgb(168, 85, 247)',    // Purple
    'rgb(14, 165, 233)'     // Cyan
];

const fsMHz = 20;
const fftLengthForSpectrum = 4096;
const frequencies = Array.from({ length: fftLengthForSpectrum }, (_, i) =>
    (i - fftLengthForSpectrum / 2) * fsMHz / fftLengthForSpectrum
);

// Fix 1: Corrected Post-Channel Spectrum Calculation
// Replace the existing runStepByStepSimulation function's spectrum calculation part:

async function runStepByStepSimulation() {
    // --- 1. Get Parameters from UI ---
    const nFFTSize = parseInt(document.getElementById('nFFTSize').value);
    const numSubcarriers = parseInt(document.getElementById('numSubcarriers').value);
    const modulationScheme = document.getElementById('modulationScheme').value;
    const cpLength = parseInt(document.getElementById('cpLength').value);
    const snrDb = parseFloat(document.getElementById('snrDb').value);
    const equalizationMethod = document.getElementById('equalization').value;

    // --- 2. Setup UI ---
    document.getElementById('loadingSpinner').style.display = 'block';
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('errorMessage').textContent = '';

    const bitsPerSymbol = (modulationScheme === 'BPSK') ? 1 : (modulationScheme === 'QPSK' ? 2 : 4);
    const numBitsPerOFDMSymbol = numSubcarriers * bitsPerSymbol;

    try {
        // --- 3. Transmitter Chain ---
        globalTransmittedBits = generateBits(numBitsPerOFDMSymbol);
        globalModulatedSymbols = modulate(globalTransmittedBits, modulationScheme, bitsPerSymbol);
        let ifftInput = mapToSubcarriers(globalModulatedSymbols, nFFTSize, numSubcarriers);
        let ifftOutput = ifft(ifftInput);
        globalTxWaveformPreChannel = addCyclicPrefix(ifftOutput, cpLength);

        // --- 4. Channel Simulation ---
        const { fadedSignal, channelCoeffs } = applyMultitapChannel(globalTxWaveformPreChannel, 5);
        globalRxWaveformPostChannel = addAwgn(fadedSignal, snrDb, nFFTSize, cpLength, numSubcarriers);

        // --- 5. Receiver Chain ---
        globalRxNoCP = removeCyclicPrefix(globalRxWaveformPostChannel, cpLength, nFFTSize);
        globalRxFFTOutput = fft(globalRxNoCP);
        const channelPadded = [...channelCoeffs];
        while (channelPadded.length < nFFTSize) channelPadded.push(new Complex(0));
        globalChannelGainsFFT = fft(channelPadded);

        // Plot channel delay response (tap magnitudes)
        updateChannelDelayResponseChart(channelCoeffs);

        // Plot channel frequency response
        updateChannelFrequencyResponseChart(globalChannelGainsFFT);

        globalReceivedSymbols = equalize(globalRxFFTOutput, globalChannelGainsFFT, equalizationMethod, snrDb);

        // --- 6. PLOTTING LOGIC (with error color-coding) ---

        // Update standard charts first
        updateTransmittedConstellationChart(globalModulatedSymbols, modulationScheme);

        const preChannelPadded = [...globalTxWaveformPreChannel, ...Array(fftLengthForSpectrum - globalTxWaveformPreChannel.length).fill(new Complex(0))];
        updateSpectrumChart(preChannelSpectrumChart, frequencies, fftshift(fft(preChannelPadded)).map(c => linearToDb(c.magSq())));

        const postChannelPadded = [...globalRxWaveformPostChannel, ...Array(fftLengthForSpectrum - globalRxWaveformPostChannel.length).fill(new Complex(0))];
        updateSpectrumChart(postChannelSpectrumChart, frequencies, fftshift(fft(postChannelPadded)).map(c => linearToDb(c.magSq())));
        
        const equalizedTimeWaveform = ifft(globalReceivedSymbols);
        const equalizedPadded = [...equalizedTimeWaveform, ...Array(fftLengthForSpectrum - equalizedTimeWaveform.length).fill(new Complex(0))];
        updateSpectrumChart(equalizedSpectrumChart, frequencies, fftshift(fft(equalizedPadded)).map(c => linearToDb(c.magSq())));

        // **NEW**: Sort symbols into correct and incorrect arrays for plotting
        const receivedDataSymbols = extractDataSubcarriers(globalReceivedSymbols, nFFTSize, numSubcarriers);
        const decidedBits = demodulate(receivedDataSymbols, modulationScheme);
        const decidedIdealSymbols = modulate(decidedBits, modulationScheme);
        
        // --- Find this section in runStepByStepSimulation and REPLACE the 'for' loop ---

        const correctlyMappedSymbols = [];
        const incorrectlyMappedSymbols = [];

        // This loop now safely checks for undefined symbols and compares numbers correctly
        for (let i = 0; i < receivedDataSymbols.length; i++) {
            const originalSymbol = globalModulatedSymbols[i];
            const receivedSymbol = receivedDataSymbols[i];

            if (originalSymbol && receivedSymbol) {
                // Use demodulation to determine if the symbol was decoded correctly
                const originalBits = demodulateSymbol(originalSymbol, modulationScheme);
                const receivedBits = demodulateSymbol(receivedSymbol, modulationScheme);
                
                // Compare the actual bit sequences
                const isCorrect = arraysEqual(originalBits, receivedBits);
                
                if (isCorrect) {
                    correctlyMappedSymbols.push(receivedSymbol);
                } else {
                    incorrectlyMappedSymbols.push(receivedSymbol);
                }
            } else {
                incorrectlyMappedSymbols.push(receivedSymbol);
            }
        }
        
        // Update the Received Constellation chart with the color-coded symbols
        updateReceivedConstellationChart(receivedConstellationChart, correctlyMappedSymbols, incorrectlyMappedSymbols, modulationScheme);

        // --- 7. Final UI updates ---
        currentBlockIndex = 0;
        highlightBlock(currentBlockIndex);
        document.getElementById('nextBlockBtn').disabled = false;
        document.getElementById('prevBlockBtn').disabled = true;

    } catch (error) {
        console.error("Step-by-step simulation error:", error);
        displayError(`Step-by-step simulation failed: ${error.message}. Please check inputs.`);
    } finally {
        document.getElementById('loadingSpinner').style.display = 'none';
    }
}

function updateChannelDelayResponseChart(channelCoeffs) {
    if (!channelDelayResponseChart || !channelCoeffs) return;
    
    const tapMagnitudes = channelCoeffs.map(c => c.mag());
    const tapIndices = channelCoeffs.map((_, i) => i);
    
    channelDelayResponseChart.data.labels = tapIndices;
    channelDelayResponseChart.data.datasets[0].data = tapMagnitudes;
    channelDelayResponseChart.update();
}

function updateChannelFrequencyResponseChart(channelGainsFFT) {
    if (!channelFrequencyResponseChart || !channelGainsFFT) return;
    
    const shifted = fftshift(channelGainsFFT);
    const magnitudesDb = shifted.map(c => linearToDb(c.magSq()));
    const normalizedFreq = shifted.map((_, i) => (i - shifted.length / 2) / shifted.length);
    
    channelFrequencyResponseChart.data.labels = normalizedFreq.map(f => f.toFixed(3));
    channelFrequencyResponseChart.data.datasets[0].data = magnitudesDb;
    channelFrequencyResponseChart.update();
}

// --- Add this new helper function to your main script ---

function extractDataSubcarriers(allSymbols, nFFTSize, numSubcarriers) {
    const dataSymbols = [];
    if (!allSymbols || allSymbols.length !== nFFTSize) {
        console.warn(`Invalid FFT output: expected ${nFFTSize} symbols, got ${allSymbols ? allSymbols.length : 0}`);
        return dataSymbols;
    }

    if (nFFTSize === 64 && numSubcarriers === 52) {
        // 802.11a standard subcarrier mapping (matches the mapping function)
        const subcarrierIndices = [
            -26,-25,-24,-23,-22,-21,-20,-19,-18,-17,-16,-15,-14,-13,-12,-11,
            -10,-9,-8,-7,-6,-5,-4,-3,-2,-1,
            1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26
        ];
        
        for (const scIdx of subcarrierIndices) {
            const arrayIdx = scIdx > 0 ? scIdx : nFFTSize + scIdx;
            if (arrayIdx >= 0 && arrayIdx < nFFTSize) {
                dataSymbols.push(allSymbols[arrayIdx]);
            }
        }
    } else {
        // Generic symmetric extraction
        const halfSubcarriers = Math.floor(numSubcarriers / 2);
        const extraSubcarrier = numSubcarriers % 2;
        
        // Positive frequencies
        for (let i = 1; i <= halfSubcarriers + extraSubcarrier && i < nFFTSize; i++) {
            dataSymbols.push(allSymbols[i]);
        }
        
        // Negative frequencies
        for (let i = nFFTSize - halfSubcarriers; i < nFFTSize; i++) {
            dataSymbols.push(allSymbols[i]);
        }
    }
    
    if (dataSymbols.length !== numSubcarriers) {
        console.warn(`Subcarrier extraction mismatch: expected ${numSubcarriers}, extracted ${dataSymbols.length}`);
    }
    
    return dataSymbols;
}

// Matrix transpose function
function transpose(matrix) {
    if (!matrix || matrix.length === 0) return [];
    const rows = matrix.length;
    const cols = matrix[0].length;
    const result = [];
    
    for (let j = 0; j < cols; j++) {
        const newRow = [];
        for (let i = 0; i < rows; i++) {
            newRow.push(matrix[i][j]);
        }
        result.push(newRow);
    }
    return result;
}

// AWGN function matching MATLAB's awgn with 'measured' mode
function addAwgnMatlab(signal, snrDb) {
    return signal.map(row => {
        // Calculate signal power
        const signalPower = row.reduce((sum, s) => sum + s.magSq(), 0) / row.length;
        if (signalPower === 0) return row;

        // Convert SNR to linear scale
        const snrLinear = dbToLinear(snrDb);
        
        // Calculate noise power
        const noisePower = signalPower / snrLinear;
        const noiseStdDev = Math.sqrt(noisePower / 2);

        return row.map(sample => {
            const noiseReal = randn() * noiseStdDev;
            const noiseImag = randn() * noiseStdDev;
            return sample.add(new Complex(noiseReal, noiseImag));
        });
    });
}

// Fix 2 & 3: Optimized BER Simulation with Corrected Logic
// === Corrected BER Simulation Function ===
async function runBerSimulation() {
    document.getElementById('loadingSpinnerBER').style.display = 'block';
    document.getElementById('errorMessageBER').style.display = 'none';

    const L = parseInt(document.getElementById('ber_ofdmLength').value);
    const Ncp = parseInt(document.getElementById('ber_cpLength').value);
    const modulationScheme = document.getElementById('ber_modulationScheme').value;
    const SNRincrement = parseFloat(document.getElementById('ber_snrIncrement').value);
    
    const configLabel = `${modulationScheme} (L=${L}, Ncp=${Ncp})`;

    if (berChartDatasets.length >= MAX_BER_PLOTS) {
        displayErrorBER(`Maximum of ${MAX_BER_PLOTS} plots reached. Please clear existing plots before running a new simulation.`);
        document.getElementById('loadingSpinnerBER').style.display = 'none';
        return;
    }

    // Check if this configuration already exists (optional, but good practice)
    if (berChartDatasets.some(d => d.label === configLabel)) {
        displayErrorBER(`Configuration '${configLabel}' already plotted. Clear or change parameters.`);
        document.getElementById('loadingSpinnerBER').style.display = 'none';
        return;
    }


    if (Ncp >= L) {
        displayErrorBER('Cyclic Prefix length must be less than OFDM data length');
        document.getElementById('loadingSpinnerBER').style.display = 'none';
        return;
    }

    const bitsPerSymbol = (modulationScheme === 'BPSK') ? 1 : (modulationScheme === 'QPSK' ? 2 : 4);
    const maxSymbolValue = Math.pow(2, bitsPerSymbol) - 1;
    const numOfdmSymbols = 100;
    const snrRange = [];
    const berResults = [];
    
    const BER_SATURATION_THRESHOLD = 1e-6; // BER threshold for saturation
    const SATURATION_COUNT = 3; // Number of consecutive saturated points needed

    try {
        let consecutiveSaturatedPoints = 0;
        let snr = 0;
        
        console.log(`BER Simulation: L=${L}, Ncp=${Ncp}, Symbols=${numOfdmSymbols}, Modulation=${modulationScheme}`);

        while (consecutiveSaturatedPoints < SATURATION_COUNT) {
            snrRange.push(snr);
            let totalErrors = 0;
            let totalBits = 0;

            for (let symIdx = 0; symIdx < numOfdmSymbols; symIdx++) {
                // === TRANSMITTER ===
                const Tx_data = [];
                for (let i = 0; i < L; i++) {
                    const row = [];
                    for (let j = 0; j < Ncp; j++) {
                        row.push(Math.floor(Math.random() * (maxSymbolValue + 1)));
                    }
                    Tx_data.push(row);
                }

                const mod_data = Tx_data.map(row =>
                    row.map(symbolInt => modulateBER(symbolInt, modulationScheme))
                );

                const s2p = transposeBER(mod_data);
                const ifftOutput = s2p.map(col => ifftBER(col));
                const p2s = transposeBER(ifftOutput);
                const txSignal = p2s.map(row => {
                    const cpPart = row.slice(row.length - Ncp);
                    return [...cpPart, ...row];
                });

                // === CHANNEL: AWGN ===
                const snrLinear = Math.pow(10, snr / 10);
                let signalPower = 0;
                let sampleCount = 0;
                for (const row of txSignal) {
                    for (const sample of row) {
                        signalPower += sample.magSq();
                        sampleCount++;
                    }
                }
                signalPower /= sampleCount;

                const noiseVar = signalPower / (2 * snrLinear);
                const noiseStd = Math.sqrt(noiseVar);

                const rxSignal = txSignal.map(row =>
                    row.map(sample => {
                        const noiseRe = randnBER() * noiseStd;
                        const noiseIm = randnBER() * noiseStd;
                        return sample.add(new ComplexBER(noiseRe, noiseIm));
                    })
                );

                // === RECEIVER ===
                const rxNoCp = rxSignal.map(row => row.slice(Ncp));
                const rxS2P = transposeBER(rxNoCp);
                const fftOutput = rxS2P.map(col => fftBER(col));
                const rxP2S = transposeBER(fftOutput);

                const Rx_data = rxP2S.map(row =>
                    row.map(symbol => demodulateBER(symbol, modulationScheme))
                );

                // === BER CALCULATION ===
                for (let i = 0; i < L; i++) {
                    for (let j = 0; j < Ncp; j++) {
                        const txSym = Tx_data[i][j];
                        const rxSym = Rx_data[i][j];
                        let diff = txSym ^ rxSym;
                        while (diff > 0) {
                            totalErrors += (diff & 1);
                            diff >>= 1;
                        }
                        totalBits += bitsPerSymbol;
                    }
                }
            }

            const ber = totalBits > 0 ? totalErrors / totalBits : 1.0;
            const clampedBER = Math.max(ber, 1e-6);
            berResults.push(clampedBER);

            console.log(`SNR: ${snr} dB | BER: ${ber.toExponential(2)} | Errors: ${totalErrors}/${totalBits}`);

            // Check for saturation
            if (ber <= BER_SATURATION_THRESHOLD) {
                consecutiveSaturatedPoints++;
            } else {
                consecutiveSaturatedPoints = 0;
            }

            snr += SNRincrement;
            
            // Safety limit to prevent infinite loops
            if (snr > 50) {
                console.log('Reached maximum SNR limit of 50 dB');
                break;
            }
        }

        // Plot only up to the saturation point
        const plotSnrRange = snrRange.slice(0, -SATURATION_COUNT + 1);
        const plotBerResults = berResults.slice(0, -SATURATION_COUNT + 1);

        // --- NEW PLOTTING LOGIC FOR MULTIPLE CURVES ---
        berChartDatasets.push({
            label: configLabel,
            data: plotBerResults.map((ber, index) => ({ x: plotSnrRange[index], y: ber })),
            color: BER_COLORS[(berChartDatasets.length) % BER_COLORS.length]
        });
        
        updateBerChart(); // Call without arguments
        document.getElementById('berCurveChart').parentElement.style.display = 'block';

    } catch (error) {
        console.error("BER simulation error:", error);
        displayErrorBER(`BER simulation failed: ${error.message}`);
    } finally {
        document.getElementById('loadingSpinnerBER').style.display = 'none';
    }
}


// ============================================
// BER ANALYSIS SECTION - INDEPENDENT FUNCTIONS
// ============================================

// Complex number operations for BER section
class ComplexBER {
    constructor(re, im = 0) {
        this.re = re;
        this.im = im;
    }
    add(other) {
        return new ComplexBER(this.re + other.re, this.im + other.im);
    }
    mul(other) {
        return new ComplexBER(
            this.re * other.re - this.im * other.im,
            this.re * other.im + this.im * other.re
        );
    }
    magSq() {
        return this.re * this.re + this.im * this.im;
    }
}

// Gaussian random number generator for BER
function randnBER() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Matrix transpose for BER
function transposeBER(matrix) {
    if (!matrix || matrix.length === 0) return [];
    const rows = matrix.length;
    const cols = matrix[0].length;
    const result = [];
    
    for (let j = 0; j < cols; j++) {
        const newRow = [];
        for (let i = 0; i < rows; i++) {
            newRow.push(matrix[i][j]);
        }
        result.push(newRow);
    }
    return result;
}

// FFT implementation for BER
function fftBER(x) {
    const N = x.length;
    if (N <= 1) return x;
    
    const even = [];
    const odd = [];
    for (let i = 0; i < N / 2; i++) {
        even[i] = x[i * 2];
        odd[i] = x[i * 2 + 1];
    }
    
    const Y_even = fftBER(even);
    const Y_odd = fftBER(odd);
    const Y = new Array(N);
    
    for (let k = 0; k < N / 2; k++) {
        const angle = -2 * Math.PI * k / N;
        const twiddle = new ComplexBER(Math.cos(angle), Math.sin(angle));
        const t = twiddle.mul(Y_odd[k]);
        Y[k] = Y_even[k].add(t);
        Y[k + N / 2] = Y_even[k].add(new ComplexBER(-t.re, -t.im));
    }
    return Y;
}

// IFFT implementation for BER
function ifftBER(X) {
    const N = X.length;
    if (N <= 1) return X;
    
    // Conjugate input
    const X_conj = X.map(c => new ComplexBER(c.re, -c.im));
    
    // Apply FFT
    const y_conj = fftBER(X_conj);
    
    // Conjugate output and scale
    return y_conj.map(c => new ComplexBER(c.re / N, -c.im / N));
}

// QAM modulation for BER (supporting BPSK, QPSK, 16QAM)
function modulateBER(symbolInt, modulationScheme) {
    const bitsPerSymbol = (modulationScheme === 'BPSK') ? 1 : (modulationScheme === 'QPSK' ? 2 : 4);
    
    // Convert integer to bits
    const bits = [];
    let val = symbolInt;
    for (let b = 0; b < bitsPerSymbol; b++) {
        bits.unshift(val % 2);
        val = Math.floor(val / 2);
    }
    
    if (modulationScheme === 'BPSK') {
        return new ComplexBER(2 * bits[0] - 1, 0);
    } else if (modulationScheme === 'QPSK') {
        const scale = 1 / Math.sqrt(2);
        return new ComplexBER((2 * bits[0] - 1) * scale, (2 * bits[1] - 1) * scale);
    } else { // 16QAM
        const qamMap = {
            0: [-3, -3], 1: [-3, -1], 2: [-3, 3], 3: [-3, 1],
            4: [-1, -3], 5: [-1, -1], 6: [-1, 3], 7: [-1, 1],
            8: [3, -3], 9: [3, -1], 10: [3, 3], 11: [3, 1],
            12: [1, -3], 13: [1, -1], 14: [1, 3], 15: [1, 1]
        };
        const scale = 1 / Math.sqrt(10);
        const [re, im] = qamMap[symbolInt];
        return new ComplexBER(re * scale, im * scale);
    }
}

// QAM demodulation for BER
function demodulateBER(symbol, modulationScheme) {
    if (modulationScheme === 'BPSK') {
        return symbol.re > 0 ? 1 : 0;
    } else if (modulationScheme === 'QPSK') {
        const bit0 = symbol.re > 0 ? 1 : 0;
        const bit1 = symbol.im > 0 ? 1 : 0;
        return bit0 * 2 + bit1;
    } else { // 16QAM
        const qamPoints = [
            [-3, -3], [-3, -1], [-3, 3], [-3, 1],
            [-1, -3], [-1, -1], [-1, 3], [-1, 1],
            [3, -3], [3, -1], [3, 3], [3, 1],
            [1, -3], [1, -1], [1, 3], [1, 1]
        ];
        const scale = 1 / Math.sqrt(10);
        
        let minDist = Infinity;
        let symbolInt = 0;
        
        for (let i = 0; i < 16; i++) {
            const [re, im] = qamPoints[i];
            const dist = Math.pow(symbol.re - re * scale, 2) + Math.pow(symbol.im - im * scale, 2);
            if (dist < minDist) {
                minDist = dist;
                symbolInt = i;
            }
        }
        return symbolInt;
    }
}

function displayErrorBER(message) {
    const errorMessageDiv = document.getElementById('errorMessageBER');
    errorMessageDiv.textContent = message;
    errorMessageDiv.style.display = 'block';
    document.getElementById('loadingSpinnerBER').style.display = 'none';
}

// Find and modify these arrays
const allOfdmBlockIds = ['block-tx', 'block-idft', 'block-addcp', 'block-channel', 'block-removecp', 'block-fft', 'block-equalizer', 'block-rx'];
const blockOutputTitles = [
    'S/P & Mapping Output',
    'IDFT Output',
    'Add CP Output',
    'Channel Output',
    'Remove CP Output',
    'FFT Output',
    'Equalizer Output', // New title
    'Demapping & P/S Output'
];
let currentBlockIndex = 0;

function demodulateSymbol(symbol, modulationScheme) {
    switch (modulationScheme) {
        case 'BPSK': return [bpskDemodulate(symbol)];
        case 'QPSK': return qpskDemodulate(symbol);
        case '16QAM': return qam16Demodulate(symbol);
        default: return [];
    }
}

function arraysEqual(arr1, arr2) {
    if (!arr1 || !arr2 || arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}

// Also update the highlightBlock function where it highlights arrows:
function highlightBlock(index) {
    const nextBtn = document.getElementById('nextBlockBtn');
    const prevBtn = document.getElementById('prevBlockBtn');
    
    // Enable/disable buttons based on index
    nextBtn.disabled = (index >= allOfdmBlockIds.length - 1);
    prevBtn.disabled = (index <= 0);

    // Remove all highlights
    allOfdmBlockIds.forEach(id => {
        const block = document.getElementById(id);
        if (block) {
            block.classList.remove('highlighted');
            const texts = block.querySelectorAll('.ofdm-block-text');
            texts.forEach(t => t.classList.remove('highlighted'));
        }
    });
    
    document.querySelectorAll('.arrow').forEach(arrow => arrow.classList.remove('highlighted'));

    // Add highlight to current block
    if (index >= 0 && index < allOfdmBlockIds.length) {
        const currentBlockElement = document.getElementById(allOfdmBlockIds[index]);
        if (currentBlockElement) {
            currentBlockElement.classList.add('highlighted');
            currentBlockElement.querySelectorAll('.ofdm-block-text').forEach(t => t.classList.add('highlighted'));
        }
        
        // Highlight the arrow leading to this block
        if (index > 0) {
            const prevArrowIds = getArrowId(index - 1, index);
            prevArrowIds.forEach(arrowId => {
                const arrowElement = document.getElementById(arrowId);
                if (arrowElement) arrowElement.classList.add('highlighted');
            });
        }
    }

    updateChartVisibility(index);
    updateBlockOutputDisplayContent(index);
}

// Replace your getArrowId function with this improved version that handles multiple arrows:
function getArrowId(fromIndex, toIndex) {
    const transitions = {
        '0-1': ['mapping-to-idft'],
        '1-2': ['idft-to-addcp'],
        '2-3': ['addcp-to-channel'],
        '3-4': ['channel-to-awgn', 'awgn-to-removecp'],
        '4-5': ['removecp-to-fft'],
        '5-6': ['fft-to-equalizer'],
        '6-7': ['equalizer-to-demapping']
    };
    return transitions[`${fromIndex}-${toIndex}`] || [];
}

function hideStepByStepCharts() {
    const stepByStepCharts = [
        'constellationChart', 'preChannelSpectrumChart', 
        'postChannelSpectrumChart', 'receivedConstellationChart',
        'channelDelayResponseChart', 'channelFrequencyResponseChart'
    ];
    
    stepByStepCharts.forEach(chartId => {
        document.getElementById(chartId).parentElement.style.display = 'none';
    });
}

function showOutputChart(chartId) {
    hideOutputCharts();
    document.getElementById(chartId).parentElement.style.display = 'block';
}

function hideOutputCharts() {
    document.getElementById('receivedConstellationChart').parentElement.style.display = 'none';
    document.getElementById('berCurveChart').parentElement.style.display = 'none';
}

function updateChartVisibility(blockIndex) {
    // Hide all charts first
    const allChartContainers = [
        'constellationChart', 'preChannelSpectrumChart', 
        'postChannelSpectrumChart', 'receivedConstellationChart',
        'equalizedSpectrumChart', 'channelDelayResponseChart', 
        'channelFrequencyResponseChart'
    ];
    
    allChartContainers.forEach(chartId => {
        const chartEl = document.getElementById(chartId);
        if(chartEl) chartEl.parentElement.style.display = 'none';
    });
    
    // Show the relevant chart for the current block
    switch (allOfdmBlockIds[blockIndex]) {
        case 'block-tx':
            document.getElementById('constellationChart').parentElement.style.display = 'block';
            break;
        case 'block-addcp':
            document.getElementById('preChannelSpectrumChart').parentElement.style.display = 'block';
            break;
        case 'block-channel':
            document.getElementById('postChannelSpectrumChart').parentElement.style.display = 'block';
            document.getElementById('channelDelayResponseChart').parentElement.style.display = 'block';
            document.getElementById('channelFrequencyResponseChart').parentElement.style.display = 'block';
            break;
        case 'block-equalizer':
            document.getElementById('equalizedSpectrumChart').parentElement.style.display = 'block';
            break;
        case 'block-rx':
            document.getElementById('receivedConstellationChart').parentElement.style.display = 'block';
            break;
    }
}

function showChart(chartId) {
    document.getElementById(chartId).parentElement.style.display = 'block';
}

/**
 * Updates the step-by-step info panel with a text description and styled symbol boxes.
 */
function updateBlockOutputDisplayContent(blockIndex) {
    const titleDiv = document.getElementById('blockOutputTitle');
    const descriptionDiv = document.getElementById('blockOutputDisplay');
    titleDiv.textContent = blockOutputTitles[blockIndex];

    const nFFTSize = parseInt(document.getElementById('nFFTSize').value);
    const cpLength = parseInt(document.getElementById('cpLength').value);
    
    let description = "Run a simulation to see the step-by-step output here.";
    let showSymbols = false;
    let symbolData = [];

    switch (allOfdmBlockIds[blockIndex]) {
        case 'block-tx':
            if (globalTransmittedBits.length) {
                description = `Generated Bits: ${formatBitArrayForDisplay(globalTransmittedBits)}\n`
                            + `Modulated to ${globalModulatedSymbols.length} ${document.getElementById('modulationScheme').value} symbols.`;
                showSymbols = true;
                symbolData = formatSymbolDisplay(
                    globalModulatedSymbols.map((s, i) => ({
                        value: s,
                        label: `X[${i}]`, // Capital X for frequency-domain
                        type: 'data'
                    }))
                );
            }
            break;

        case 'block-idft':
            if (globalTxWaveformPreChannel.length) {
                description = `Converted frequency-domain symbols to a time-domain signal of ${nFFTSize} samples.`;
                showSymbols = true;
                symbolData = formatSymbolDisplay(
                    globalTxWaveformPreChannel.slice(cpLength).map((s, i) => ({
                        value: s,
                        label: `x[${i}]`, // Lowercase x for time-domain
                        type: 'data'
                    }))
                );
            }
            break;

        case 'block-addcp':
            if (globalTxWaveformPreChannel.length) {
                description = `Prepended ${cpLength} samples from the end to the beginning. Total signal length is now ${nFFTSize + cpLength}.`;
                showSymbols = true;
                symbolData = formatCPSymbolDisplay(globalTxWaveformPreChannel, nFFTSize, cpLength);
            }
            break;

        case 'block-channel':
            if (globalRxWaveformPostChannel.length) {
                description = `Signal passed through a simulated channel with fading and noise.`;
                showSymbols = true;
                symbolData = formatSymbolDisplay(
                    globalRxWaveformPostChannel.map((s, i) => ({
                        value: s,
                        label: `y[${i}]`,
                        type: 'data'
                    }))
                );
            }
            break;

        case 'block-removecp':
            if (globalRxNoCP.length) {
                description = `Removed the ${cpLength}-sample cyclic prefix. Remaining signal length is ${globalRxNoCP.length}.`;
                showSymbols = true;
                symbolData = formatSymbolDisplay(
                    globalRxNoCP.map((s, i) => ({
                        value: s,
                        label: `r[${i}]`,
                        type: 'data'
                    }))
                );
            }
            break;

        case 'block-fft':
            if (globalRxFFTOutput.length) {
                description = `Converted the time-domain signal back to the frequency domain to recover symbols on each subcarrier.`;
                showSymbols = true;
                symbolData = formatSymbolDisplay(
                    globalRxFFTOutput.map((s, i) => ({
                        value: s,
                        label: `R[${i}]`,
                        type: 'data'
                    }))
                );
            }
            break;

        // Add this new case for the equalizer
        case 'block-equalizer':
            if (globalReceivedSymbols.length) {
                const method = document.getElementById('equalization').value;
                const nFFTSize = parseInt(document.getElementById('nFFTSize').value);
                const numSubcarriers = parseInt(document.getElementById('numSubcarriers').value);
                
                // Extract only data symbols for display
                const dataSymbols = extractDataSubcarriers(globalReceivedSymbols, nFFTSize, numSubcarriers);
                
                description = `Applied ${method} equalization to compensate for channel distortion and noise. Extracted ${dataSymbols.length} data symbols.`;
                showSymbols = true;
                symbolData = formatSymbolDisplay(
                    dataSymbols.map((s, i) => ({
                        value: s,
                        label: `X̂[${i}]`,
                        type: 'data'
                    }))
                );
            }
            break;

        case 'block-rx':
            if (globalReceivedSymbols.length) {
                const nFFTSize = parseInt(document.getElementById('nFFTSize').value);
                const numSubcarriers = parseInt(document.getElementById('numSubcarriers').value);
                const modulationScheme = document.getElementById('modulationScheme').value;
                const bitsPerSymbol = (modulationScheme === 'BPSK') ? 1 : (modulationScheme === 'QPSK' ? 2 : 4);

                // Extract only the data symbols from the correct subcarrier positions
                const receivedDataSymbols = extractDataSubcarriers(globalReceivedSymbols, nFFTSize, numSubcarriers);
                
                // Demodulate the extracted data symbols
                const receivedBits = demodulate(receivedDataSymbols, modulationScheme);

                // Calculate BER correctly
                const ber = calculateBer(globalTransmittedBits, receivedBits);
                
                description = `Demapped symbols into a bitstream.\nFinal Bit Error Rate (BER): ${ber.toExponential(2)}`;
                showSymbols = true;
                
                // Display symbol-wise demapping (groups of bits per symbol)
                const numSymbolsToDisplay = Math.min(10, globalModulatedSymbols.length); // Show first 10 symbols
                symbolData = [];
                
                for (let i = 0; i < numSymbolsToDisplay; i++) {
                    const startBitIdx = i * bitsPerSymbol;
                    const endBitIdx = startBitIdx + bitsPerSymbol;
                    
                    // Get transmitted bits for this symbol
                    const txBits = globalTransmittedBits.slice(startBitIdx, endBitIdx);
                    // Get received bits for this symbol
                    const rxBits = receivedBits.slice(startBitIdx, endBitIdx);
                    
                    // Check if all bits in the symbol match
                    const isSymbolCorrect = txBits.every((bit, idx) => bit === rxBits[idx]);
                    
                    // Format bit strings
                    const txBitString = txBits.join('');
                    const rxBitString = rxBits.map(b => b !== undefined ? b : '?').join('');
                    
                    symbolData.push({
                        value: `Symbol ${i}: Tx[${txBitString}] → Rx[${rxBitString}]`,
                        label: `${txBitString}→${rxBitString}`,
                        type: isSymbolCorrect ? 'data' : 'cp' // 'data' for correct (green), 'cp' for error (red)
                    });
                }
                
                // Add ellipsis if there are more symbols
                if (globalModulatedSymbols.length > numSymbolsToDisplay) {
                    symbolData.push({ label: '...', type: 'ellipsis' });
                    symbolData.push({
                        value: `Total: ${globalModulatedSymbols.length} symbols`,
                        label: `(${globalModulatedSymbols.length} total)`,
                        type: 'ellipsis'
                    });
                }
            }
            break;
    }

    descriptionDiv.textContent = description;
    updateSymbolDisplay(showSymbols, symbolData);
}

function clearAllChartData() {
    const charts = [constellationChart, preChannelSpectrumChart, postChannelSpectrumChart, receivedConstellationChart, equalizedSpectrumChart, channelDelayResponseChart, channelFrequencyResponseChart, berCurveChart];
    charts.forEach(chart => {
        if (chart) {
            chart.data.labels = [];
            chart.data.datasets.forEach(dataset => { dataset.data = []; });
            chart.update();
        }
    });
}

function resetSimulation() {
    clearAllChartData();
    hideStepByStepCharts();
    hideOutputCharts();

    currentBlockIndex = 0;
    highlightBlock(currentBlockIndex);
    
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('blockOutputTitle').textContent = "Simulation Step Output";
    document.getElementById('blockOutputDisplay').innerHTML = "Run a simulation to see the step-by-step output here.";

    document.getElementById('nFFTSize').value = 64;
    document.getElementById('numSubcarriers').value = 52;
    document.getElementById('modulationScheme').value = 'BPSK';
    document.getElementById('cpLength').value = 16;
    document.getElementById('snrDb').value = 20;
    document.getElementById('numSymbolsBer').value = 1000;
}

function getIdealConstellationPoints(modulationScheme) {
    switch (modulationScheme) {
        case 'BPSK':
            return [new Complex(-1), new Complex(1)];
        case 'QPSK':
            const qpskScale = 1 / Math.sqrt(2);
            return [
                new Complex(qpskScale, qpskScale), new Complex(qpskScale, -qpskScale),
                new Complex(-qpskScale, qpskScale), new Complex(-qpskScale, -qpskScale)
            ];
        case '16QAM':
            const qam16Scale = 1 / Math.sqrt(10);
            const levels = [-3, -1, 1, 3];
            const points = [];
            for (const re of levels) {
                for (const im of levels) {
                    points.push(new Complex(re * qam16Scale, im * qam16Scale));
                }
            }
            return points;
        default:
            return [];
    }
}

let constellationChart, preChannelSpectrumChart, postChannelSpectrumChart, equalizedSpectrumChart, receivedConstellationChart, channelDelayResponseChart, channelFrequencyResponseChart, berCurveChart;

// Updated initializeCharts function for better responsiveness
function initializeCharts() {
    // Set canvas dimensions based on container size
    const setCanvasDimensions = (id) => {
        const canvas = document.getElementById(id);
        if (canvas) {
            const container = canvas.parentElement;
            const containerWidth = container.offsetWidth;
            canvas.style.width = '100%';
            canvas.style.height = '350px';
            canvas.width = Math.min(containerWidth, 800);
            canvas.height = 350;
        }
    };

    const canvases = ['constellationChart', 'preChannelSpectrumChart', 'postChannelSpectrumChart', 'receivedConstellationChart', 'equalizedSpectrumChart', 'channelDelayResponseChart', 'channelFrequencyResponseChart', 'berCurveChart'];
    canvases.forEach(setCanvasDimensions);

        // --- Find the initializeCharts function and REPLACE the constellationConfig object with this CORRECTED version ---

    const constellationConfig = {
        type: 'scatter',
        data: { datasets: [{ label: 'Constellation Diagram', data: [], backgroundColor: 'rgb(34, 197, 94)', pointRadius: 5, pointHoverRadius: 7 }] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: false },
                legend: { display: false },
                tooltip: { callbacks: { label: c => `(${c.parsed.x.toFixed(2)}, ${c.parsed.y.toFixed(2)}i)` } }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    min: -2,
                    max: 2,
                    title: { display: true, text: 'In-phase (Real)', font: { size: 12, weight: 'bold' }, color: '#4b5563' },
                    grid: {
                        // --- AXIS HIGHLIGHT (Chart.js v3+) ---
                        color: context => (context.tick.value === 0 ? '#6b7280' : '#e5e7eb'),
                        lineWidth: context => (context.tick.value === 0 ? 2 : 1)
                    },
                    ticks: { color: '#6b7280', font: { size: 10 } }
                },
                y: {
                    type: 'linear',
                    position: 'left',
                    min: -2,
                    max: 2,
                    title: { display: true, text: 'Quadrature (Imaginary)', font: { size: 12, weight: 'bold' }, color: '#4b5563' },
                    grid: {
                        // --- AXIS HIGHLIGHT (Chart.js v3+) ---
                        color: context => (context.tick.value === 0 ? '#6b7280' : '#e5e7eb'),
                        lineWidth: context => (context.tick.value === 0 ? 2 : 1)
                    },
                    ticks: { color: '#6b7280', font: { size: 10 } }
                }
            }
        }
    };

    const spectrumConfig = {
        type: 'line',
        data: { datasets: [{ data: [], borderWidth: 2, pointRadius: 0, fill: false, tension: 0.1 }] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { 
                    title: { display: true, text: 'Frequency (MHz)', font: { size: 12, weight: 'bold' }, color: '#4b5563' }, 
                    grid: { color: '#e2e8f0' },
                    ticks: { font: { size: 10 } }
                },
                y: { 
                    title: { display: true, text: 'PSD (dB)', font: { size: 12, weight: 'bold' }, color: '#4b5563' }, 
                    grid: { color: '#e2e8f0' },
                    ticks: { font: { size: 10 } }
                }
            }
        }
    };

    // Add these two new chart configurations after equalizedSpectrumChart initialization
    const channelDelayResponseConfig = {
        type: 'line',
        data: { datasets: [{ data: [], borderWidth: 2, pointRadius: 3, fill: false, tension: 0, borderColor: 'rgb(147, 51, 234)', backgroundColor: 'rgba(147, 51, 234, 0.2)' }] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { 
                    title: { display: true, text: 'Tap Index', font: { size: 12, weight: 'bold' }, color: '#4b5563' }, 
                    grid: { color: '#e2e8f0' },
                    ticks: { font: { size: 10 } }
                },
                y: { 
                    title: { display: true, text: 'Magnitude', font: { size: 12, weight: 'bold' }, color: '#4b5563' }, 
                    grid: { color: '#e2e8f0' },
                    ticks: { font: { size: 10 } }
                }
            }
        }
    };

    const channelFrequencyResponseConfig = {
        type: 'line',
        data: { datasets: [{ data: [], borderWidth: 2, pointRadius: 0, fill: false, tension: 0.1, borderColor: 'rgb(236, 72, 153)', backgroundColor: 'rgba(236, 72, 153, 0.2)' }] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { 
                    title: { display: true, text: 'Normalized Frequency', font: { size: 12, weight: 'bold' }, color: '#4b5563' }, 
                    grid: { color: '#e2e8f0' },
                    ticks: { font: { size: 10 } }
                },
                y: { 
                    title: { display: true, text: 'Magnitude (dB)', font: { size: 12, weight: 'bold' }, color: '#4b5563' }, 
                    grid: { color: '#e2e8f0' },
                    ticks: { font: { size: 10 } }
                }
            }
        }
    };

    // After all the chart assignments, add these two:
    channelDelayResponseChart = new Chart(document.getElementById('channelDelayResponseChart').getContext('2d'), channelDelayResponseConfig);
    channelFrequencyResponseChart = new Chart(document.getElementById('channelFrequencyResponseChart').getContext('2d'), channelFrequencyResponseConfig);

    // Also, in initializeCharts(), replace the berConfig with this:
    const berConfig = {
        type: 'scatter', // Changed from 'line' to 'scatter' to support {x,y} data format
        data: { datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { 
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: SNR=${context.parsed.x}dB, BER=${context.parsed.y.toExponential(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: { 
                    type: 'linear', // Explicitly set to linear
                    min: 0, 
                    max: 25,
                    title: { display: true, text: 'SNR (dB)', font: { size: 12, weight: 'bold' }, color: '#4b5563' },
                    ticks: { font: { size: 10 } }
                },
                y: { 
                    type: 'logarithmic',
                    title: { display: true, text: 'BER', font: { size: 12, weight: 'bold' }, color: '#4b5563' }, 
                    min: 1e-6, 
                    max: 1,
                    ticks: { 
                        callback: v => {
                            const exp = Math.log10(v);
                            if (Number.isInteger(exp) && exp >= -6 && exp <= 0) {
                                return v.toExponential(0);
                            }
                            return null;
                        },
                        font: { size: 10 }
                    }
                }
            }
        }
    };

    constellationChart = new Chart(document.getElementById('constellationChart').getContext('2d'), constellationConfig);
    preChannelSpectrumChart = new Chart(document.getElementById('preChannelSpectrumChart').getContext('2d'), { ...spectrumConfig, data: { datasets: [{ ...spectrumConfig.data.datasets[0], borderColor: 'rgb(59, 130, 246)', backgroundColor: 'rgba(59, 130, 246, 0.2)' }] } });
    postChannelSpectrumChart = new Chart(document.getElementById('postChannelSpectrumChart').getContext('2d'), { ...spectrumConfig, data: { datasets: [{ ...spectrumConfig.data.datasets[0], borderColor: 'rgb(234, 88, 12)', backgroundColor: 'rgba(234, 88, 12, 0.2)' }] } });
    equalizedSpectrumChart = new Chart(document.getElementById('equalizedSpectrumChart').getContext('2d'), { ...spectrumConfig, data: { datasets: [{ ...spectrumConfig.data.datasets[0], borderColor: 'rgb(132, 204, 22)', backgroundColor: 'rgba(132, 204, 22, 0.2)' }] } });
    receivedConstellationChart = new Chart(document.getElementById('receivedConstellationChart').getContext('2d'), { ...constellationConfig, data: { datasets: [{ ...constellationConfig.data.datasets[0], label: 'Received Constellation', backgroundColor: 'rgb(34, 197, 94)' }] } });
    berCurveChart = new Chart(document.getElementById('berCurveChart').getContext('2d'), berConfig);

    // Add window resize handler
    window.addEventListener('resize', () => {
        setTimeout(() => {
            canvases.forEach(setCanvasDimensions);
            [constellationChart, preChannelSpectrumChart, postChannelSpectrumChart, receivedConstellationChart, berCurveChart].forEach(chart => {
                if (chart) chart.resize();
            });
        }, 100);
    });
}

/**
 * Renders the symbol boxes in the dedicated symbol display area.
 */
function updateSymbolDisplay(show, symbolData) {
    const symbolDisplay = document.getElementById('symbolDisplay');
    if (!symbolDisplay) return;

    if (show && symbolData && symbolData.length > 0) {
        symbolDisplay.innerHTML = '';
        symbolDisplay.style.display = 'flex';

        symbolData.forEach(symbol => {
            if (symbol.type === 'separator') {
                const separator = document.createElement('div');
                separator.className = 'symbol-separator';
                separator.textContent = symbol.label;
                symbolDisplay.appendChild(separator);
            } else if (symbol.symbolLabel) {
                // Special rendering for bit-to-symbol mapping with bracket
                const container = document.createElement('div');
                container.className = 'symbol-item with-bracket';
                
                // Bits in colored box
                const bitsBox = document.createElement('div');
                bitsBox.className = `symbol-bits-box ${symbol.type}`;
                bitsBox.textContent = symbol.label;
                
                // Bracket and label below
                const bracketContainer = document.createElement('div');
                bracketContainer.className = 'symbol-bracket-container';
                
                const bracketDiv = document.createElement('div');
                bracketDiv.className = 'symbol-bracket';
                bracketDiv.textContent = '⎵';
                
                const labelDiv = document.createElement('div');
                labelDiv.className = 'symbol-label';
                labelDiv.textContent = symbol.symbolLabel;
                
                bracketContainer.appendChild(bracketDiv);
                bracketContainer.appendChild(labelDiv);
                
                container.appendChild(bitsBox);
                container.appendChild(bracketContainer);
                symbolDisplay.appendChild(container);
            } else {
                const item = document.createElement('div');
                item.className = `symbol-item ${symbol.type}`;
                item.textContent = symbol.label;
                
                if (symbol.value) {
                    item.title = `${symbol.label}: ${symbol.value.toString()}`;
                }
                symbolDisplay.appendChild(item);
            }
        });
    } else {
        symbolDisplay.style.display = 'none';
    }
}

/**
 * Formats a long array of symbols to show the first few, an ellipsis, and the last one.
 */
function formatSymbolDisplay(symbols) {
    if (symbols.length <= 12) {
        return symbols;
    }
    // Show first 5, ellipsis, and last 2
    return [
        ...symbols.slice(0, 5),
        { label: '...', type: 'ellipsis' },
        ...symbols.slice(symbols.length - 2)
    ];
}

/**
 * Specifically formats the signal with a styled cyclic prefix.
 */
function formatCPSymbolDisplay(cpAddedSignal, M, L) {
    const result = [];
    const cpData = cpAddedSignal.slice(0, L).map((s, i) => ({
        label: `x[${M - L + i}]`,
        type: 'cp',
        value: s
    }));
    
    const dataPart = cpAddedSignal.slice(L).map((s, i) => ({
        label: `x[${i}]`,
        type: 'data',
        value: s
    }));

    if (L > 4) {
        result.push(cpData[0], { label: '...', type: 'ellipsis' }, cpData[L - 1]);
    } else {
        result.push(...cpData);
    }

    result.push({ label: '|', type: 'separator' });

    if (M > 8) {
        result.push(...dataPart.slice(0, 3), { label: '...', type: 'ellipsis' }, ...dataPart.slice(M - 2));
    } else {
        result.push(...dataPart);
    }
    return result;
}

function updateSpectrumChart(chartInstance, labels, data) {
    if (chartInstance) {
        const validLabels = [];
        const validData = [];
        
        for (let i = 0; i < data.length; i++) {
            const value = data[i];
            if (isFinite(value) && !isNaN(value) && value > -200 && value < 100) {
                validLabels.push(parseFloat(labels[i]).toFixed(2));
                validData.push(value);
            }
        }
        
        chartInstance.data.labels = validLabels;
        chartInstance.data.datasets[0].data = validData;
        chartInstance.update();
    }
}

function updateConstellationChart(chart, symbols, modulationScheme) {
if (!chart) return;

let maxMag = 0;
const idealPoints = getIdealConstellationPoints(modulationScheme);
if (idealPoints.length > 0) {
maxMag = Math.max(...idealPoints.map(p => Math.max(Math.abs(p.re), Math.abs(p.im))));
}

// Set a minimum axis range and ensure it's finite
let axisMax = Math.max(maxMag * 1.5, 2.0); // Minimum range of 2.0

// Safety check to prevent infinite or NaN values
if (!isFinite(axisMax) || axisMax <= 0) {
axisMax = 2.0; // Default fallback value
}

// Cap the maximum range to prevent overly large plots
axisMax = Math.min(axisMax, 10.0); // Maximum range of 10.0

const validData = symbols.filter(s => 
isFinite(s.re) && isFinite(s.im) &&
Math.abs(s.re) <= 20 && Math.abs(s.im) <= 20 // Filter out extreme values
).map(s => ({ x: s.re, y: s.im }));

chart.options.scales.x.min = -axisMax;
chart.options.scales.x.max = axisMax;
chart.options.scales.y.min = -axisMax;
chart.options.scales.y.max = axisMax;

chart.data.datasets[0].data = validData;
chart.update();
}

function updateTransmittedConstellationChart(symbols, modulationScheme) {
    updateConstellationChart(constellationChart, symbols, modulationScheme);
}

// --- REPLACE the old updateReceivedConstellationChart function with this ---

// --- REPLACE your existing updateReceivedConstellationChart function with this ---

function updateReceivedConstellationChart(chart, correctSymbols, incorrectSymbols, modulationScheme) {
    if (!chart) return;

    const idealPoints = getIdealConstellationPoints(modulationScheme);
    const maxMag = Math.max(...idealPoints.map(p => Math.max(Math.abs(p.re), Math.abs(p.im))));
    const axisMax = Math.min(Math.max(maxMag * 1.5, 1.5), 10.0);

    chart.options.scales.x.min = -axisMax;
    chart.options.scales.x.max = axisMax;
    chart.options.scales.y.min = -axisMax;
    chart.options.scales.y.max = axisMax;
    chart.options.plugins.legend.display = true;

    chart.data.datasets = [
        {
            label: 'Ideal Points',
            data: idealPoints.map(s => ({ x: s.re, y: s.im })),
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            pointStyle: 'crossRot',
            radius: 8,
            order: 1 // Render in the back
        },
        {
            label: 'Correctly Demapped',
            data: correctSymbols.map(s => ({ x: s.re, y: s.im })),
            backgroundColor: 'rgb(34, 197, 94)', // Green
            pointRadius: 5,
            pointHoverRadius: 7,
            order: 2
        },
        {
            label: 'Incorrectly Demapped',
            data: incorrectSymbols.map(s => ({ x: s.re, y: s.im })),
            backgroundColor: 'rgb(239, 68, 68)', // Red
            pointRadius: 5,
            pointHoverRadius: 7,
            order: 3
        }
    ];

    chart.update();
}

// Replace the updateBerChart function with this corrected version:
function updateBerChart() {
    if (!berCurveChart) return;

    // Clear existing labels (not needed for scatter plot mode)
    berCurveChart.data.labels = [];

    // Convert global array into Chart.js datasets
    berCurveChart.data.datasets = berChartDatasets.map((config, index) => ({
        label: config.label,
        data: config.data, // Already in {x, y} format
        borderColor: config.color,
        backgroundColor: config.color.replace('rgb', 'rgba').replace(')', ', 0.2)'),
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: config.color,
        fill: false,
        tension: 0.1,
        showLine: true
    }));

    // Determine max SNR for X-axis scaling
    let maxSNR = 25; // Default max
    if (berChartDatasets.length > 0) {
        maxSNR = Math.max(...berChartDatasets.flatMap(d => d.data.map(p => p.x)));
    }
    
    // Update Chart options
    berCurveChart.options.scales.x.min = 0;
    berCurveChart.options.scales.x.max = maxSNR > 0 ? Math.ceil(maxSNR) + 2 : 25;
    berCurveChart.options.plugins.legend.display = berChartDatasets.length > 1; // Show legend if multiple plots
    
    berCurveChart.update();
}

function displayError(message) {
    const errorMessageDiv = document.getElementById('errorMessage');
    errorMessageDiv.textContent = message;
    errorMessageDiv.style.display = 'block';
    document.getElementById('loadingSpinner').style.display = 'none';
}

// Replace your window.onload section with this version that includes debugging:
window.onload = function() {
    initializeCharts();
    document.getElementById('runStepByStepBtn').addEventListener('click', runStepByStepSimulation);
    document.getElementById('runBerSimBtn').addEventListener('click', runBerSimulation);
    
    // Debug: Log when Next button is clicked
    document.getElementById('nextBlockBtn').addEventListener('click', () => {
        console.log('Next button clicked! Current index:', currentBlockIndex, 'Max index:', allOfdmBlockIds.length - 1);
        if (currentBlockIndex < allOfdmBlockIds.length - 1) {
            currentBlockIndex++;
            console.log('Moving to index:', currentBlockIndex);
            highlightBlock(currentBlockIndex);
        } else {
            console.log('Already at last block');
        }
    });
    
    document.getElementById('prevBlockBtn').addEventListener('click', () => {
        console.log('Previous button clicked! Current index:', currentBlockIndex);
        if (currentBlockIndex > 0) {
            currentBlockIndex--;
            console.log('Moving to index:', currentBlockIndex);
            highlightBlock(currentBlockIndex);
        } else {
            console.log('Already at first block');
        }
    });
    
    // Show the simulation tab by default
    document.getElementById('simulationTab').style.display = 'block';
    resetSimulation();
};
