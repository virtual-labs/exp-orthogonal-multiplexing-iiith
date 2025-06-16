We start with a data stream that is encoded using a **QAM constellation**, resulting in a complex symbol stream.  
This set of symbols will now be sent across a set of narrowband channels.

We denote this sequence by:

$$X[0], X[1], ..., X[N-1]$$


These are effectively the discrete frequency components of the modulator output \(s(t)\).


## Transmitter

### 1. Series-to-Parallel and IFFT

These symbols are passed through:

- A **series-to-parallel converter**
- Followed by an **N-point IFFT** to convert them into time-domain samples:

\[
x[n] = \frac{1}{\sqrt{N}} \sum_{i=0}^{N-1} X[i] e^{j \frac{2\pi n}{N} i}, \quad 0 \leq n \leq N-1
\]

### 2. Parallel-to-Series and Cyclic Prefix

- The time-domain samples are **converted back to serial form**
- A **cyclic prefix** of length \( \mu \) is added (†)

### 3. Digital-to-Analog and RF Modulation

- The resulting signal is **converted to analog (D/A)**
- Modulated using a carrier frequency \( f_0 \)

![OFDM Transmitter Schematic](ofdm_tx.png)  
*Figure 1: OFDM transmitter schematic*

---

## Channel

- The transmitted signal is **distorted by the channel** (modeled as a FIR filter \( h[n] \) of length \( \mu \)) and **corrupted by noise** \( \nu[n] \).
- The received analog signal \( r(t) \) is **down-converted** to baseband and sampled:

\[
y[n] = \tilde{x}[n] * h[n] + \nu[n], \quad -\mu \leq n \leq N-1
\]

---

## Receiver

### 1. Cyclic Prefix Removal and FFT

- The **cyclic prefix** (first \( \mu \) samples) is **removed**
- The remaining \( N \) samples are:

  - **Converted to parallel form**
  - Passed through an **FFT block** to recover frequency-domain symbols:

\[
Y[i] = H[i] X[i] + \tilde{\nu}[i]
\]

where:

- \( H[i] = H(f_i) \): flat-fading channel gain for the \( i \)-th subcarrier
- \( \tilde{\nu}[i] \): noise in frequency domain

### 2. QAM Demodulation

- The FFT output is **converted to serial**
- **QAM demodulation and estimation** is performed to recover the original data

![OFDM Receiver Schematic](ofdm_rx.png)  
*Figure 2: OFDM receiver schematic*

---

## † Cyclic Prefix

The **cyclic prefix** is added to convert the **linear convolution** from the channel into a **circular convolution**, which is compatible with the DFT framework.

With a cyclic prefix:

\[
Y[i] = \text{DFT}\{ y[n] = h[n] \circledast x[n] \} = H[i] X[i], \quad 0 \leq i \leq N-1
\]

This would **not hold** if the convolution were linear.

> *Further mathematical details have been omitted.*
