"use client";

import { useTheme, LIGHT_THEMES, DARK_THEMES, THEME_LABELS } from "@/contexts/ThemeContext";
import { Check, Sparkles } from "lucide-react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AgentConfig } from "@/types/agent";

export default function SettingsPage() {
  const { theme, themeVariant, setThemeVariant } = useTheme();
  const { user } = useAuth();
  
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetch('/api/data/agent/config', { headers: { 'x-user-id': user.uid } })
        .then(res => res.json())
        .then(data => {
          setConfig(data.config);
          setLoading(false);
        });
    }
  }, [user]);

  const updateConfig = async (updates: Partial<AgentConfig>) => {
     if (!user || !config) return;
     const newConfig = { ...config, ...updates };
     setConfig(newConfig);
     setSaving(true);
     try {
        await fetch('/api/data/agent/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': user.uid },
            body: JSON.stringify(updates)
        });
     } finally {
        setSaving(false);
     }
  };

  const availableThemes = theme === "light" ? LIGHT_THEMES : DARK_THEMES;

  return (
    <div className="max-w-4xl pb-20">
      <h1 className="mb-8 text-4xl font-bold" style={{ color: "var(--color-text)" }}>
        Settings
      </h1>

      {/* AI Agent Settings Section */}
      <div className="cozy-card p-6 mb-8 border-2 border-[var(--color-primary)] shadow-[4px_4px_0px_var(--color-primary)]">
         <h2 className="mb-4 text-2xl font-bold flex items-center gap-2" style={{ color: "var(--color-text)" }}>
           <Sparkles className="h-5 w-5 text-[var(--color-primary)] animate-pulse" />
           AI Agent Settings
         </h2>
         
         <div className="grid gap-6 md:grid-cols-2">
            <div>
               <label className="block text-sm font-bold mb-2 uppercase opacity-60" style={{ color: "var(--color-text)" }}>Personality Mode</label>
               <select 
                  value={config?.personalityMode || 'coach'}
                  onChange={(e) => updateConfig({ personalityMode: e.target.value as any })}
                  className="w-full bg-[var(--color-background)] border-2 border-[var(--color-text)] p-3 rounded-xl font-bold"
                  style={{ color: "var(--color-text)" }}
               >
                  <option value="coach">Coach (Default)</option>
                  <option value="friend">Friend (Chill)</option>
                  <option value="strict">Strict (Drill Sergeant)</option>
                  <option value="guru">Guru (Wise)</option>
               </select>
            </div>

            <div>
               <label className="block text-sm font-bold mb-2 uppercase opacity-60" style={{ color: "var(--color-text)" }}>Coaching Style</label>
               <select 
                  value={config?.coachingStyle || 'standard'}
                  onChange={(e) => updateConfig({ coachingStyle: e.target.value as any })}
                  className="w-full bg-[var(--color-background)] border-2 border-[var(--color-text)] p-3 rounded-xl font-bold"
                  style={{ color: "var(--color-text)" }}
               >
                  <option value="standard">Standard</option>
                  <option value="narrative">Narrative (Story Chapters)</option>
                  <option value="simulation">Simulation (Regret/Future)</option>
               </select>
            </div>

            <div>
               <label className="block text-sm font-bold mb-2 uppercase opacity-60" style={{ color: "var(--color-text)" }}>Honesty Level ({config?.honestyLevel}%)</label>
               <input 
                  type="range" min="0" max="100"
                  value={config?.honestyLevel || 50}
                  onChange={(e) => updateConfig({ honestyLevel: parseInt(e.target.value) })}
                  className="w-full accent-[var(--color-primary)]"
               />
               <div className="flex justify-between text-xs font-bold opacity-40 uppercase" style={{ color: "var(--color-text)" }}>
                  <span>Polite</span>
                  <span>Brutal</span>
               </div>
            </div>

            <div>
               <label className="block text-sm font-bold mb-2 uppercase opacity-60" style={{ color: "var(--color-text)" }}>Strict Check-in Interval (Mins)</label>
               <input 
                  type="number" step="0.5" min="0.5"
                   value={config?.checkInInterval || 10}
                   onChange={(e) => setConfig(prev => prev ? { ...prev, checkInInterval: parseFloat(e.target.value) } : null)}
                   onBlur={(e) => updateConfig({ checkInInterval: parseFloat(e.target.value) })}
                  className="w-full bg-[var(--color-background)] border-2 border-[var(--color-text)] p-3 rounded-xl font-bold"
                  style={{ color: "var(--color-text)" }}
               />
               <p className="text-[10px] mt-1 opacity-40 font-bold uppercase" style={{ color: "var(--color-text)" }}>Strict mode defaults to 0.5 (30 sec)</p>
            </div>
         </div>

         <div className="mt-8 p-4 bg-[var(--color-primary)]/10 rounded-xl border border-[var(--color-primary)]/20">
            <label className="block text-sm font-bold mb-2 uppercase opacity-60" style={{ color: "var(--color-text)" }}>Focus Video URL (Direct Link)</label>
            <input 
               type="text"
               value={config?.focusVideoUrl || ''}
               onChange={(e) => setConfig(prev => prev ? { ...prev, focusVideoUrl: e.target.value } : null)}
               onBlur={(e) => updateConfig({ focusVideoUrl: e.target.value })}
               placeholder="https://.../video.mp4"
               className="w-full bg-[var(--color-background)] border-2 border-[var(--color-text)] p-3 rounded-xl font-bold mb-2"
               style={{ color: "var(--color-text)" }}
            />
            {saving && <p className="text-xs font-bold text-[var(--color-primary)] animate-pulse uppercase">Syncing with Cloud Agent...</p>}
         </div>
      </div>

      <div className="cozy-card p-6">
        <h2 className="mb-4 text-2xl font-bold" style={{ color: "var(--color-text)" }}>
          Theme Backgrounds
        </h2>
        <p className="mb-6 opacity-70" style={{ color: "var(--color-text)" }}>
          Choose your favorite {theme === "light" ? "light" : "dark"} mode theme. 
          Toggle between light and dark mode using the sidebar button.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          {availableThemes.map((variant) => (
            <button
              key={variant}
              onClick={() => setThemeVariant(variant)}
              className={clsx(
                "cozy-card relative overflow-hidden p-4 text-left transition-all hover:scale-105",
                themeVariant === variant && "border-[var(--color-primary)] shadow-[4px_4px_0px_var(--color-primary)]"
              )}
            >
              {/* Preview */}
              <div className="mb-3 h-24 w-full rounded-[var(--border-radius)] overflow-hidden border-2 border-[var(--color-text)]">
                <ThemePreview variant={variant} />
              </div>

              {/* Label */}
              <div className="flex items-center justify-between">
                <span className="font-bold" style={{ color: "var(--color-text)" }}>
                  {THEME_LABELS[variant]}
                </span>
                {themeVariant === variant && (
                  <Check className="h-5 w-5 text-[var(--color-primary)]" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ThemePreview({ variant }: { variant: string }) {
  const previewStyles: Record<string, string> = {
    "morning-mist": "bg-gradient-to-b from-[#ffecd2] via-[#fcb69f] to-[#ff9a9e]",
    "sunny-meadow": "bg-gradient-to-b from-[#FFE5B4] via-[#FFDAB3] to-[#F4E4C1]",
    "cloudy-sky": "bg-gradient-to-b from-[#87CEEB] to-[#E0F6FF]",
    "cherry-blossom": "bg-gradient-to-b from-[#FFDEE9] to-[#B5FFFC]",
    "ocean-breeze": "bg-gradient-to-b from-[#4facfe] to-[#00f2fe]",
    "autumn-path": "bg-gradient-to-b from-[#f12711] to-[#f5af19]",
    "gita-wisdom": "bg-cover bg-center",
    "starry-night": "bg-gradient-to-b from-[#2d1b4e] to-[#1a0b2e]",
    "midnight-forest": "bg-gradient-to-b from-[#0f2027] via-[#203a43] to-[#2c5364]",
    "nebula": "bg-gradient-to-br from-[#4E54C8] via-[#8F94FB] to-[#E94560]",
    "rainy-window": "bg-gradient-to-b from-[#203A43] to-[#2C5364]",
    "firefly-sanctuary": "bg-gradient-to-b from-[#000000] to-[#0f9b0f]",
    "aurora-borealis": "bg-[#0B1026]",
    "yamuna-night": "bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e]",
    "vishwaroopam": "bg-cover bg-center",
  };

  const style = 
    variant === "gita-wisdom" ? { backgroundImage: 'url("/themes/krishna-gita.png")' } :
    variant === "vishwaroopam" ? { backgroundImage: 'url("/themes/vishwaroopam.png")' } : 
    {};

  return <div className={clsx("h-full w-full", previewStyles[variant])} style={style} />;
}
