"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * SoundProvider — device #8, micro-sound.
 * Opt-in, off by default. A single soft click on primary
 * actions — nothing playful. Synthesized with Web Audio.
 */

type SoundEngine = {
  click: () => void;
  resume: () => void;
};

function createEngine(): SoundEngine {
  const ctx = new AudioContext();

  const click = () => {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(520, t + 0.06);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.055, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  };

  return {
    click,
    resume: () => {
      if (ctx.state === "suspended") void ctx.resume();
    },
  };
}

type SoundContextValue = {
  enabled: boolean;
  toggle: () => void;
  click: () => void;
};

const SoundContext = createContext<SoundContextValue>({
  enabled: false,
  toggle: () => {},
  click: () => {},
});

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const engineRef = useRef<SoundEngine | null>(null);

  const getEngine = useCallback(() => {
    if (!engineRef.current) engineRef.current = createEngine();
    return engineRef.current;
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      if (!prev) {
        try {
          const engine = getEngine();
          engine.resume();
        } catch {}
      }
      return !prev;
    });
  }, [getEngine]);

  const click = useCallback(() => {
    if (!enabled) return;
    try {
      getEngine().click();
    } catch {}
  }, [enabled, getEngine]);

  return (
    <SoundContext.Provider value={{ enabled, toggle, click }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  return useContext(SoundContext);
}
