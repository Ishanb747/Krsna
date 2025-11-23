"use client";

import { useTheme, LIGHT_THEMES, DARK_THEMES, THEME_LABELS } from "@/contexts/ThemeContext";
import { Check } from "lucide-react";
import clsx from "clsx";

export default function SettingsPage() {
  const { theme, themeVariant, setThemeVariant } = useTheme();

  const availableThemes = theme === "light" ? LIGHT_THEMES : DARK_THEMES;

  return (
    <div className="max-w-4xl">
      <h1 className="mb-8 text-4xl font-bold" style={{ color: "var(--color-text)" }}>
        Settings
      </h1>

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
