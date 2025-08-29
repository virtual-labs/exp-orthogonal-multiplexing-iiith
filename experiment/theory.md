We first motivate the use of OFDM by a discussion on inter-symbol interference in frequency-selective fading channels and how multi-carrier modulation can be used to overcome it.

## Background
As the bandwidth of the signal used for communication increases, it becomes impractical to assume that the channel has a constant (flat) frequency response for the entire bandwidth of the signal. We will therefore have to account for the frequency-selective nature of the channel. One of the major consequences of this is intersymbol interference, caused by distortion (spreading) of the transmitted pulses $^†$.

Multicarrier modulation is one method of mitigating ISI. In this scheme, the channel is divided into multiple subcarriers (carrier signals occupying distinct frequency bands), such that the fading on each subcarrier can be assumed to be flat. Mathematically,

$$
s(t) = \sum_{i=0}^{N-1} s_i g(t) \cos(2\pi f_i t + \phi_i)
$$

where, $g(t)$ is the pulse shaping waveform, which has a bandwidth of $B_N$. The carrier frequencies are given by $f_k=f_0+(k-1)B_N, \, k=1,\dots,N$. The total bandwidth of the transmitted signal is hence, $B=NB_N$ and the subcarrier spacing is $\Delta f = B_N$.

$^†$ In a wireless channel it is in generally true that higher frequency EM waves are absorbed more by obstacles than those of lower frequency. This means the higher frequency signals are attenuated more. This gives the wireless channel a low-pass characteristic. We know that if we reduce the bandwidth of a signal (for ex., by passing it through a low-pass filter), it spreads in time, thereby leading to intersymbol interference.

How exactly this scheme leads to ISI mitigation will be explained in the section on the OFDM transmitter. Now we are ready to talk about how OFDM is implemented as a form of multicarrier modulation.

## OFDM scheme

We start with a data stream that is encoded using a **QAM constellation**, resulting in a complex symbol stream.  
This set of symbols will now be sent across a set of narrowband channels.

We denote this sequence by:

$$X[0], X[1], ..., X[N-1]$$


These are effectively the discrete frequency components of the modulator output \(s(t)\).


## Transmitter

### 1. Series-to-Parallel and IFFT

These symbols are passed through:

- A **series-to-parallel converter**. (The symbols are placed in different subcarriers (parallel) instead of different slots within a single coherence time (series). Hence, each symbol occupies the entire symbol time, but in its respective frequency band. Since the symbols are better spaced in time, ISI is mitigated.)

- Followed by an **N-point IFFT** to convert them into time-domain samples:

$$
\begin{aligned}
    x[n] = \frac{1}{\sqrt{N}} \sum_{i=0}^{N-1} X[i] e^{j \frac{2\pi n}{N} i}, \quad 0 \leq n \leq N-1
\end{aligned}
$$

### 2. Parallel-to-Series and Cyclic Prefix

- The time-domain samples are **converted back to serial form**
- A **cyclic prefix** of length \( \mu \) is added ††

### 3. Digital-to-Analog and RF Modulation

- The resulting signal is **converted to analog (D/A)**
- Modulated using a carrier frequency $f_0$

<p align="center">
<img src="./images/ofdm_tx.png" width="73%"> 
</p>
*Figure 1: OFDM transmitter schematic*


## Channel

- The transmitted signal is **distorted by the channel** (modeled as a FIR filter \( h[n] \) of length \( \mu \)) and **corrupted by noise** \( \nu[n] \).
- The received analog signal \( r(t) \) is **down-converted** to baseband and sampled:

$$
\begin{aligned}
    y[n] = \tilde{x}[n] * h[n] + \nu[n], \quad -\mu \leq n \leq N-1
\end{aligned}
$$

## Receiver

### 1. Cyclic Prefix Removal and FFT

- The **cyclic prefix** (first $\mu$ samples) is **removed**
- The remaining $N$ samples are:

  - **Converted to parallel form**
  - Passed through an **FFT block** to recover frequency-domain symbols:

$$
\begin{aligned}
    Y[i] = H[i] X[i] + \tilde{\nu}[i]
\end{aligned}
$$

where:

- $H[i] = H(f_i)$: flat-fading channel gain for the $i$-th subcarrier
- $\tilde{\nu}[i]$: noise in frequency domain

### 2. QAM Demodulation

- The FFT output is **converted to serial**
- **QAM demodulation and estimation** is performed to recover the original data

<p align="center">
<img src="./images/ofdm_rx.png" width="73%">
</p>
*Figure 2: OFDM receiver schematic*

## †† Cyclic Prefix

The **cyclic prefix** is added to convert the **linear convolution** from the channel into a **circular convolution**, which is compatible with the DFT framework.

With a cyclic prefix:

$$
\begin{aligned}
    Y[i] = \text{DFT}\{ y[n] = h[n] \circledast x[n] \} = H[i] X[i], \quad 0 \leq i \leq N-1
\end{aligned}
$$

This would **not hold** if the convolution were linear.

> *Further mathematical details have been omitted.*
