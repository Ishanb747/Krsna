"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type ThemeVariant = 
  | "morning-mist" | "sunny-meadow" | "cloudy-sky" 
  | "cherry-blossom" | "ocean-breeze" | "autumn-path"
  | "gita-wisdom"
  | "starry-night" | "midnight-forest" | "nebula"
  | "rainy-window" | "firefly-sanctuary" | "aurora-borealis"
  | "yamuna-night"
  | "vishwaroopam";

export const LIGHT_THEMES: ThemeVariant[] = [
  "morning-mist", "sunny-meadow", "cloudy-sky",
  "cherry-blossom", "ocean-breeze", "autumn-path",
  "gita-wisdom"
];

export const DARK_THEMES: ThemeVariant[] = [
  "starry-night", "midnight-forest", "nebula",
  "rainy-window", "firefly-sanctuary", "aurora-borealis",
  "yamuna-night", "vishwaroopam"
];

export const THEME_LABELS: Record<ThemeVariant, string> = {
  "morning-mist": "Morning Mist",
  "sunny-meadow": "Sunny Meadow",
  "cloudy-sky": "Cloudy Sky",
  "cherry-blossom": "Cherry Blossom",
  "ocean-breeze": "Ocean Breeze",
  "autumn-path": "Autumn Path",
  "gita-wisdom": "Gita Wisdom",
  "starry-night": "Starry Night",
  "midnight-forest": "Midnight Forest",
  "nebula": "Nebula",
  "rainy-window": "Rainy Window",
  "firefly-sanctuary": "Firefly Sanctuary",
  "aurora-borealis": "Aurora Borealis",
  "yamuna-night": "Yamuna Night",
  "vishwaroopam": "Vishwaroopam",
};

interface ThemeContextType {
  theme: Theme;
  themeVariant: ThemeVariant;
  toggleTheme: () => void;
  setThemeVariant: (variant: ThemeVariant) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  themeVariant: "morning-mist",
  toggleTheme: () => {},
  setThemeVariant: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");
  const [themeVariant, setThemeVariantState] = useState<ThemeVariant>("morning-mist");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    const savedVariant = localStorage.getItem("themeVariant") as ThemeVariant;
    
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }

    if (savedVariant) {
      setThemeVariantState(savedVariant);
    } else {
      // Set default variant based on theme
      setThemeVariantState(savedTheme === "dark" ? "starry-night" : "morning-mist");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    
    // Switch to a default variant for the new theme if current variant doesn't match
    const isCurrentVariantForNewTheme = newTheme === "light" 
      ? LIGHT_THEMES.includes(themeVariant)
      : DARK_THEMES.includes(themeVariant);
    
    if (!isCurrentVariantForNewTheme) {
      const defaultVariant = newTheme === "light" ? "morning-mist" : "starry-night";
      setThemeVariantState(defaultVariant);
      localStorage.setItem("themeVariant", defaultVariant);
    }
  };

  const setThemeVariant = (variant: ThemeVariant) => {
    setThemeVariantState(variant);
    localStorage.setItem("themeVariant", variant);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeVariant, toggleTheme, setThemeVariant }}>
      {children}
    </ThemeContext.Provider>
  );
};
