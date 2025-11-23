"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type AlarmSound = "digital" | "bell" | "wood" | "kitchen";
export type TickingSound = "none" | "fast" | "slow" | "white-noise" | "brown-noise";

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playClick: () => void;
  playSuccess: () => void;
  playDelete: () => void;
  playError: () => void;
  // New options
  alarmSound: AlarmSound;
  setAlarmSound: (sound: AlarmSound) => void;
  tickingSound: TickingSound;
  setTickingSound: (sound: TickingSound) => void;
  volume: number;
  setVolume: (vol: number) => void;
  playAlarm: () => void;
  startAmbient: () => void;
  stopAmbient: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [alarmSound, setAlarmSoundState] = useState<AlarmSound>("digital");
  const [tickingSound, setTickingSoundState] = useState<TickingSound>("none");
  const [volume, setVolumeState] = useState(0.5);
  
  // Refs for ambient sound control
  const ambientSourceRef = React.useRef<AudioBufferSourceNode | null>(null);
  const ambientGainRef = React.useRef<GainNode | null>(null);
  const nextTickTimeRef = React.useRef<number>(0);
  const tickTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const isAmbientPlayingRef = React.useRef(false);

  useEffect(() => {
    const storedMute = localStorage.getItem("krsna_mute");
    const storedAlarm = localStorage.getItem("krsna_alarm");
    const storedTicking = localStorage.getItem("krsna_ticking");
    const storedVolume = localStorage.getItem("krsna_volume");

    if (storedMute) setIsMuted(JSON.parse(storedMute));
    if (storedAlarm) setAlarmSoundState(storedAlarm as AlarmSound);
    if (storedTicking) setTickingSoundState(storedTicking as TickingSound);
    if (storedVolume) setVolumeState(parseFloat(storedVolume));
    
    // Initialize AudioContext on user interaction to comply with browser policies
    const initAudio = () => {
        if (!audioContext) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                const ctx = new AudioContextClass();
                setAudioContext(ctx);
            }
        }
    };

    window.addEventListener('click', initAudio, { once: true });
    return () => window.removeEventListener('click', initAudio);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAmbient();
    };
  }, []);

  // Restart ambient if sound changes while playing
  useEffect(() => {
    if (isAmbientPlayingRef.current) {
      stopAmbient();
      startAmbient();
    }
  }, [tickingSound, volume, isMuted]);

  const toggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    localStorage.setItem("krsna_mute", JSON.stringify(newState));
  };

  const setAlarmSound = (sound: AlarmSound) => {
    setAlarmSoundState(sound);
    localStorage.setItem("krsna_alarm", sound);
  };

  const setTickingSound = (sound: TickingSound) => {
    setTickingSoundState(sound);
    localStorage.setItem("krsna_ticking", sound);
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
    localStorage.setItem("krsna_volume", vol.toString());
  };

  const playTone = useCallback((freq: number, type: OscillatorType, duration: number, vol: number = 0.1) => {
    if (isMuted || !audioContext) return;

    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioContext.currentTime);
    
    // Apply master volume
    const effectiveVolume = vol * volume;

    gainNode.gain.setValueAtTime(effectiveVolume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);

    osc.start();
    osc.stop(audioContext.currentTime + duration);
  }, [isMuted, audioContext, volume]);

  const playClick = useCallback(() => {
    playTone(800, "sine", 0.05, 0.05);
  }, [playTone]);

  const playSuccess = useCallback(() => {
    if (isMuted || !audioContext) return;
    const now = audioContext.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        
        const effectiveVolume = 0.1 * volume;
        gain.gain.setValueAtTime(effectiveVolume, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.3);
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.3);
    });
  }, [isMuted, audioContext, volume]);

  const playDelete = useCallback(() => {
    if (isMuted || !audioContext) return;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(150, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.2);
    
    const effectiveVolume = 0.1 * volume;
    gain.gain.setValueAtTime(effectiveVolume, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.start();
    osc.stop(audioContext.currentTime + 0.2);
  }, [isMuted, audioContext, volume]);

  const playError = useCallback(() => {
    if (isMuted || !audioContext) return;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(100, audioContext.currentTime);
    
    const effectiveVolume = 0.1 * volume;
    gain.gain.setValueAtTime(effectiveVolume, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.start();
    osc.stop(audioContext.currentTime + 0.3);
  }, [isMuted, audioContext, volume]);

  const playAlarm = useCallback(() => {
    if (isMuted || !audioContext) return;
    const now = audioContext.currentTime;
    const effectiveVolume = 0.3 * volume;

    switch (alarmSound) {
      case "digital":
        // Beep beep beep
        for (let i = 0; i < 3; i++) {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.type = "square";
          osc.frequency.value = 880;
          gain.gain.setValueAtTime(effectiveVolume, now + i * 0.2);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.2 + 0.1);
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.start(now + i * 0.2);
          osc.stop(now + i * 0.2 + 0.1);
        }
        break;
      case "bell":
        // Ding
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now); // C5
        gain.gain.setValueAtTime(effectiveVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start(now);
        osc.stop(now + 2);
        break;
      case "wood":
        // Wood block
        const oscW = audioContext.createOscillator();
        const gainW = audioContext.createGain();
        oscW.type = "sine";
        oscW.frequency.setValueAtTime(800, now);
        gainW.gain.setValueAtTime(effectiveVolume, now);
        gainW.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        oscW.connect(gainW);
        gainW.connect(audioContext.destination);
        oscW.start(now);
        oscW.stop(now + 0.1);
        break;
        case "kitchen":
          // Brrrrring
          const oscK = audioContext.createOscillator();
          const gainK = audioContext.createGain();
          // Modulate frequency to simulate mechanical ring
          const lfo = audioContext.createOscillator();
          lfo.frequency.value = 20; // 20Hz rattle
          const lfoGain = audioContext.createGain();
          lfoGain.gain.value = 50;
          lfo.connect(lfoGain);
          lfoGain.connect(oscK.frequency);
          
          oscK.type = "triangle";
          oscK.frequency.value = 1000;
          
          gainK.gain.setValueAtTime(effectiveVolume, now);
          gainK.gain.linearRampToValueAtTime(0, now + 1.5);
          
          lfo.start(now);
          oscK.connect(gainK);
          gainK.connect(audioContext.destination);
          oscK.start(now);
          
          lfo.stop(now + 1.5);
          oscK.stop(now + 1.5);
          break;
    }
  }, [isMuted, audioContext, alarmSound, volume]);

  // --- Ambient Sound Logic ---

  const createWhiteNoiseBuffer = (ctx: AudioContext) => {
    const bufferSize = 2 * ctx.sampleRate; // 2 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  };

  const createBrownNoiseBuffer = (ctx: AudioContext) => {
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Compensate for gain loss
    }
    return buffer;
  };

  const scheduleTick = useCallback(() => {
    if (!audioContext || !isAmbientPlayingRef.current) return;

    const tickInterval = tickingSound === "fast" ? 0.5 : 1.0;
    const lookahead = 0.1; // 100ms
    const now = audioContext.currentTime;

    if (nextTickTimeRef.current < now) {
        nextTickTimeRef.current = now + 0.1;
    }

    while (nextTickTimeRef.current < now + lookahead) {
        // Play tick sound
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        // High quality mechanical tick
        // Short burst of noise + high freq sine
        osc.type = "triangle";
        osc.frequency.setValueAtTime(2000, nextTickTimeRef.current);
        osc.frequency.exponentialRampToValueAtTime(100, nextTickTimeRef.current + 0.03);
        
        const effectiveVolume = 0.05 * volume;
        gain.gain.setValueAtTime(effectiveVolume, nextTickTimeRef.current);
        gain.gain.exponentialRampToValueAtTime(0.001, nextTickTimeRef.current + 0.03);
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.start(nextTickTimeRef.current);
        osc.stop(nextTickTimeRef.current + 0.03);

        nextTickTimeRef.current += tickInterval;
    }

    tickTimerRef.current = setTimeout(scheduleTick, 25);
  }, [audioContext, tickingSound, volume]);

  const startAmbient = useCallback(() => {
    if (isMuted || !audioContext || tickingSound === "none") return;
    if (isAmbientPlayingRef.current) return; // Already playing

    isAmbientPlayingRef.current = true;

    if (tickingSound === "white-noise" || tickingSound === "brown-noise") {
        // Play Noise
        const buffer = tickingSound === "white-noise" 
            ? createWhiteNoiseBuffer(audioContext) 
            : createBrownNoiseBuffer(audioContext);
        
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        
        const gain = audioContext.createGain();
        // Noise needs to be quieter
        const effectiveVolume = 0.05 * volume; 
        gain.gain.value = effectiveVolume;
        
        // Low pass filter for brown noise to make it smoother
        if (tickingSound === "brown-noise") {
             // Brown noise is already filtered by algorithm, but let's add a gentle LP
             const filter = audioContext.createBiquadFilter();
             filter.type = "lowpass";
             filter.frequency.value = 500;
             source.connect(filter);
             filter.connect(gain);
        } else {
             source.connect(gain);
        }

        gain.connect(audioContext.destination);
        source.start();
        
        ambientSourceRef.current = source;
        ambientGainRef.current = gain;
    } else {
        // Play Ticking (Scheduled)
        nextTickTimeRef.current = audioContext.currentTime;
        scheduleTick();
    }
  }, [isMuted, audioContext, tickingSound, volume, scheduleTick]);

  const stopAmbient = useCallback(() => {
    isAmbientPlayingRef.current = false;
    
    // Stop Noise
    if (ambientSourceRef.current) {
        try {
            ambientSourceRef.current.stop();
        } catch (e) { /* ignore */ }
        ambientSourceRef.current.disconnect();
        ambientSourceRef.current = null;
    }
    if (ambientGainRef.current) {
        ambientGainRef.current.disconnect();
        ambientGainRef.current = null;
    }

    // Stop Ticking
    if (tickTimerRef.current) {
        clearTimeout(tickTimerRef.current);
        tickTimerRef.current = null;
    }
  }, []);

  return (
    <SoundContext.Provider value={{ 
      isMuted, toggleMute, playClick, playSuccess, playDelete, playError,
      alarmSound, setAlarmSound, tickingSound, setTickingSound, volume, setVolume,
      playAlarm, startAmbient, stopAmbient, playTicking: () => {} // Deprecated, handled internally
    }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
}
