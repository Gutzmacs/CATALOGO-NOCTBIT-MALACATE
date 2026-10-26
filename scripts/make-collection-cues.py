"""Original plucked-string collection cues. Requires numpy/scipy; argv[1] is scratch output."""
import sys
import wave
from pathlib import Path
import numpy as np
from scipy.signal import lfilter

RATE = 24000
rng = np.random.default_rng(942)

def pluck(midi, length, bright=False):
    frequency = 440 * 2 ** ((midi - 69) / 12)
    period = max(2, round(RATE / frequency))
    size = int(length * RATE)
    excitation = np.zeros(size)
    excitation[:period] = rng.uniform(-1, 1, period)
    denominator = np.zeros(period + 2)
    denominator[0] = 1
    denominator[period] = -.497
    denominator[period + 1] = -.497
    tone = lfilter([1], denominator, excitation)
    t = np.arange(size) / RATE
    tone *= np.minimum(t / .003, 1) * np.minimum((length - t) / .06, 1)
    if bright:
        tone += .14 * np.sin(2 * np.pi * frequency * 3 * t) * np.exp(-t * 35)
        tone = np.round(tone * 35) / 35
    return tone

def render(name, duration, notes, bright=False):
    output = np.zeros(int(duration * RATE))
    for start, midi, length, volume in notes:
        at = int(start * RATE)
        tone = pluck(midi, length, bright) * volume
        end = min(at + len(tone), len(output))
        output[at:end] += tone[:end-at]
    for delay, gain in [(.09, .13), (.21, .09)]:
        shift = int(delay * RATE)
        output[shift:] += output[:-shift].copy() * gain
    t = np.arange(len(output)) / RATE
    output *= np.minimum(t / .015, 1) * np.minimum((duration - t) / .3, 1)
    output *= .72 / max(.72, np.max(np.abs(output)))
    if bright:
        output = np.round(output * 127) / 127
    path = Path(sys.argv[1]) / (name + '.wav')
    with wave.open(str(path), 'wb') as file:
        file.setnchannels(1)
        file.setsampwidth(2)
        file.setframerate(RATE)
        file.writeframes((output * 32767).astype('<i2').tobytes())
    print(name, 'seconds', duration, 'peak', round(float(np.max(np.abs(output))), 3))

# Seb: shamisen-inspired plectrum, a retro texture, and an ascending ending.
seb = [(i * .23 + .08, midi, .62 if i < 13 else 1.05, .65 if i % 3 else .85)
       for i, midi in enumerate([62, 69, 74, 77, 76, 74, 69, 72, 74, 77, 79, 81, 84, 86])]
seb += [(i * .69, midi, .5, .50) for i, midi in enumerate([38, 45, 43, 45, 50])]
render('seb-shamisen-8bit', 4.65, seb, bright=True)

# Nai: original major pentatonic, inspired by Chinese plucked zithers.
nai = [(i * .28 + .1, midi, .9 if i < 10 else 1.0, .67)
       for i, midi in enumerate([72, 76, 79, 81, 79, 76, 74, 76, 79, 84, 88])]
nai += [(0, 48, 1.2, .4), (.84, 55, 1, .35), (1.68, 57, 1, .35), (2.52, 60, 1.1, .45)]
render('nai-pentatonic-strings', 3.95, nai)
