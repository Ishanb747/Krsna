"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CheckSquare,
  Clock,
  Book,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Flame,
} from "lucide-react";
import clsx from "clsx";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "To-Do", href: "/todo", icon: CheckSquare },
  { name: "Focus", href: "/focus", icon: Clock },
  { name: "Journal", href: "/journal", icon: Book },
  { name: "Habits", href: "/habits", icon: Flame },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className={clsx(
        "relative flex h-screen flex-col border-r-2 border-gray-800 bg-[var(--color-card)] text-[var(--color-text)] transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
      style={{ borderColor: "var(--color-text)" }}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-9 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--color-text)] bg-[var(--color-card)] text-[var(--color-text)] shadow-sm hover:scale-110"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      <div className="flex h-20 items-center justify-center border-b-2 border-[var(--color-text)]">
        <h1
          className={clsx(
            "font-bold tracking-wider transition-all duration-300",
            isCollapsed ? "text-xl" : "text-3xl"
          )}
          style={{ color: "var(--color-primary)" }}
        >
          {isCollapsed ? "F" : "Flow"}
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-2 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={clsx(
                    "flex items-center rounded-[var(--border-radius)] px-4 py-3 transition-all duration-200",
                    isActive
                      ? "bg-[var(--color-primary)] text-white shadow-[2px_2px_0px_var(--color-text)] border-2 border-[var(--color-text)]"
                      : "text-[var(--color-text)] hover:bg-[var(--color-secondary)] hover:text-white hover:shadow-[2px_2px_0px_var(--color-text)] hover:border-2 hover:border-[var(--color-text)] border-2 border-transparent"
                  )}
                >
                  <Icon className={clsx("h-6 w-6", isCollapsed ? "mx-auto" : "mr-3")} />
                  {!isCollapsed && <span className="font-bold">{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t-2 border-[var(--color-text)] p-4">
        <button
          onClick={toggleTheme}
          className={clsx(
            "mb-4 flex w-full items-center justify-center rounded-[var(--border-radius)] border-2 border-[var(--color-text)] bg-[var(--color-card)] py-2 shadow-[2px_2px_0px_var(--color-text)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
            isCollapsed ? "px-2" : "px-4"
          )}
        >
          {theme === "light" ? (
            <>
              <Moon className="h-5 w-5 text-[var(--color-text)]" />
              {!isCollapsed && <span className="ml-2 font-bold">Dark Mode</span>}
            </>
          ) : (
            <>
              <Sun className="h-5 w-5 text-[var(--color-accent)]" />
              {!isCollapsed && <span className="ml-2 font-bold">Light Mode</span>}
            </>
          )}
        </button>

        <div className={clsx("flex items-center", isCollapsed && "justify-center")}>
          <div className="h-10 w-10 rounded-full border-2 border-[var(--color-text)] bg-[var(--color-secondary)]"></div>
          {!isCollapsed && (
            <div className="ml-3 overflow-hidden">
              <p className="truncate text-sm font-bold">User</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
