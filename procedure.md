### Procedure

In this experiment, you will evaluate the performance of an **OFDM transmission scheme**. You will first simulate the signal flow through the system, analysing the various stages of the OFDM scheme. Then you will analyse the performance quantitatively by plotting the **BER vs SNR** curve.

---

### **Signal Flow Simulation**

You are allowed to vary the following parameters as part of this simulation:

1. **FFT Size (N):**  
   This determines the size of the IDFT and DFT operations at the transmitter and receiver, respectively.

2. **No. of subcarriers (N):**  
   This is the number of frequency carriers in each OFDM time slot.

3. **Modulation scheme:**  
   You can choose from **BPSK**, **QPSK**, **16-QAM**, and **64-QAM**.

4. **Cyclic prefix length (\(L_{cp}\)):**  
   This is the number of symbols in the cyclic prefix added to the signal before transmission.

5. **SNR (dB):**  
   You also get to decide at which SNR the system is operating.

6. **Equalization method:**  
   You can choose between **ZF** and **MMSE** as the equalization method at the receiver.

---

> **Note:**  
> **Channel length \(\mu\)** – This is the length of the channel impulse response that will be convolved with the transmitted signal to get the output of the channel.  
> In other words, this channel has \(\mu\) delay taps.  
> For this simulation, this value is **fixed at 5**.

---

Once the simulation has been run, you can use the **‘Previous’** and **‘Next’** buttons in the centre section of the window to observe the state of the system (symbols) at each stage.

On the right side of the window, you can see the relevant plots (constellation diagrams, channel response, etc.) for each stage of the simulation.

---

### **BER Performance Analysis**

In this section, you can vary:

- Data symbol length **L**
- Cyclic prefix length
- Modulation scheme
- Increment in SNR (this determines the resolution of the BER vs SNR plot)

You can plot the **BER–SNR** curve for a maximum of **6 configurations**.