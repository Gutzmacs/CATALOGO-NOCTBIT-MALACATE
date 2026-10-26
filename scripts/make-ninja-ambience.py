"""Original 24-second flute-and-wind loop for the Ninja gallery. Requires numpy/scipy."""
import sys, wave
import numpy as np
from scipy.signal import butter, sosfilt
rate, seconds = 24000, 24
rng = np.random.default_rng(320)
t = np.arange(rate * seconds) / rate
noise = rng.standard_normal(len(t))
wind = sosfilt(butter(2, [150, 1050], btype='bandpass', fs=rate, output='sos'), noise)
wind *= .032 * (0.70 + .20 * np.sin(2*np.pi*t/8) + .10*np.sin(2*np.pi*t/3))
flute = np.zeros(len(t))
# A spacious original hirajoshi-inspired phrase, with breathing pauses.
notes = [(0.9,74,1.5),(2.65,76,.7),(3.55,77,1.6),(5.6,81,1.3),(7.3,82,.85),(8.4,81,1.8),
         (11.6,77,1.7),(13.7,76,1.0),(15.1,74,1.9),(18.1,69,1.05),(19.6,74,2.6)]
for start, midi, duration in notes:
    at=int(start*rate); n=int(duration*rate); u=np.arange(n)/rate
    f=440*2**((midi-69)/12)
    freq=f*(1+.0028*np.sin(2*np.pi*4.8*u)*(1-np.exp(-u*4))-.009*np.exp(-u*24))
    phase=2*np.pi*np.cumsum(freq)/rate
    tone=np.sin(phase)+.12*np.sin(2*phase)+.028*np.sin(3*phase)
    breath=sosfilt(butter(2,[1200,4300],btype='bandpass',fs=rate,output='sos'),rng.standard_normal(n))
    envelope=np.minimum(u/.13,1)*np.minimum((duration-u)/.28,1)*(.91+.09*np.sin(np.pi*u/duration))
    flute[at:at+n]+=(tone*.12+breath*.012)*envelope
# Gentle stereo reflections, all tails resolved before the loop boundary.
left=wind+flute; right=wind*.92+flute
for delay, gain in [(.17,.16),(.31,.11),(.49,.06)]:
    shift=int(delay*rate)
    left[shift:]+=flute[:-shift]*gain
    right[shift:]+=flute[:-shift]*(gain*.9)
fade=np.minimum(t/.6,1)*np.minimum((seconds-t)/.9,1)
out=np.column_stack([left*fade,right*fade])
assert np.max(np.abs(out))<.8
print('Peak:',round(float(np.max(np.abs(out))),3),'RMS:',round(float(np.sqrt(np.mean(out*out))),3))
with wave.open(sys.argv[1],'wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(rate);w.writeframes((out*32767).astype('<i2').tobytes())
