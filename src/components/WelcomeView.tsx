"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ChevronRight, Calendar, PartyPopper } from "lucide-react";

const QUOTES = [
  "The only way to do great work is to love what you do.",
  "Believe you can and you're halfway there.",
  "Your time is limited, don't waste it living someone else's life.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "Don't watch the clock; do what it does. Keep going.",
  "Success is not final, failure is not fatal: It is the courage to continue that counts.",
  "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
  "Happiness is not something ready made. It comes from your own actions.",
  "Focus on being productive instead of busy.",
  "Small steps in the right direction can turn out to be the biggest step of your life."
];

interface ImportantDate {
  id: string;
  date: string; // YYYY-MM-DD
  label: string;
}

export default function WelcomeView({ onNavigate }: { onNavigate: () => void }) {
  const [quote, setQuote] = useState("");
  const [dates, setDates] = useState<ImportantDate[]>([]);
  const [isAddingDate, setIsAddingDate] = useState(false);
  const [newDateLabel, setNewDateLabel] = useState("");
  const [newDateValue, setNewDateValue] = useState("");

  useEffect(() => {
    // Set random quote
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

    // Load dates
    const storedDates = localStorage.getItem("krsna_important_dates");
    if (storedDates) {
      setDates(JSON.parse(storedDates));
    }
  }, []);

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const specialToday = dates.find(d => {
    const dDate = new Date(d.date);
    return dDate.getDate() === today.getDate() && 
           dDate.getMonth() === today.getMonth();
  });

  const addDate = () => {
    if (!newDateLabel || !newDateValue) return;
    
    const newDate: ImportantDate = {
      id: Date.now().toString(),
      label: newDateLabel,
      date: newDateValue
    };

    const updatedDates = [...dates, newDate].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setDates(updatedDates);
    localStorage.setItem("krsna_important_dates", JSON.stringify(updatedDates));
    
    setNewDateLabel("");
    setNewDateValue("");
    setIsAddingDate(false);
  };

  const removeDate = (id: string) => {
    const updatedDates = dates.filter(d => d.id !== id);
    setDates(updatedDates);
    localStorage.setItem("krsna_important_dates", JSON.stringify(updatedDates));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12 p-8">
      {/* Date Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]">
          {formattedDate}
        </h1>
        
        {/* Today's Events Highlight - Stunning Glass Card */}
        <AnimatePresence>
          {dates.filter(d => {
            const dDate = new Date(d.date);
            const now = new Date();
            return dDate.getDate() === now.getDate() && 
                   dDate.getMonth() === now.getMonth() &&
                   dDate.getFullYear() === now.getFullYear();
          }).map(event => (
            <motion.div 
              key={event.id}
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              className="mb-6 inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-md border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)]"
            >
              <div className="p-2 rounded-full bg-amber-500/20 text-amber-500">
                <PartyPopper className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-amber-500/80 uppercase tracking-wider">Happening Today</p>
                <p className="text-xl font-bold text-[var(--color-text)]">{event.label}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="max-w-2xl relative z-10"
      >
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl italic font-light leading-relaxed px-4" style={{ color: "var(--color-text)", opacity: 0.9 }}>
          "{quote}"
        </p>
      </motion.div>

      {/* Important Dates Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--color-text)" }}>
            <Calendar className="h-5 w-5 text-[var(--color-primary)]" />
            Upcoming Events
          </h3>
          <button
            onClick={() => setIsAddingDate(!isAddingDate)}
            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-card)] hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300 border border-[var(--color-text)]/10"
            style={{ color: "var(--color-text)" }}
          >
            <span className="text-sm font-medium">Add Event</span>
            <Plus className={`h-4 w-4 transition-transform duration-300 ${isAddingDate ? 'rotate-45' : ''}`} />
          </button>
        </div>

        <AnimatePresence>
          {isAddingDate && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="flex gap-3 p-4 rounded-xl bg-[var(--color-card)]/80 backdrop-blur-sm border border-[var(--color-text)]/10 shadow-lg">
                <input
                  type="text"
                  placeholder="Event Name"
                  value={newDateLabel}
                  onChange={(e) => setNewDateLabel(e.target.value)}
                  className="flex-1 bg-transparent border-b-2 border-[var(--color-text)]/10 focus:border-[var(--color-primary)] outline-none px-2 py-2 transition-colors"
                  style={{ color: "var(--color-text)" }}
                />
                <input
                  type="date"
                  value={newDateValue}
                  onChange={(e) => setNewDateValue(e.target.value)}
                  className="bg-transparent border-b-2 border-[var(--color-text)]/10 focus:border-[var(--color-primary)] outline-none px-2 py-2 transition-colors"
                  style={{ color: "var(--color-text)" }}
                />
                <button
                  onClick={addDate}
                  className="px-6 py-2 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:brightness-110 transition-all shadow-md active:scale-95"
                >
                  Add
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {dates.filter(date => {
            const eventDate = new Date(date.date);
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const threeDaysFromNow = new Date(now);
            threeDaysFromNow.setDate(now.getDate() + 3);
            return eventDate > now && eventDate <= threeDaysFromNow;
          }).length === 0 ? (
            <div className="p-8 text-center rounded-2xl border-2 border-dashed border-[var(--color-text)]/10">
              <p className="text-lg opacity-40 font-medium">No upcoming events in the next 3 days</p>
            </div>
          ) : (
            dates.filter(date => {
              const eventDate = new Date(date.date);
              const now = new Date();
              now.setHours(0, 0, 0, 0);
              const threeDaysFromNow = new Date(now);
              threeDaysFromNow.setDate(now.getDate() + 3);
              return eventDate > now && eventDate <= threeDaysFromNow;
            }).map((date) => (
              <motion.div
                key={date.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className="group relative flex items-center justify-between p-4 rounded-xl bg-[var(--color-card)]/40 hover:bg-[var(--color-card)]/80 backdrop-blur-sm border border-[var(--color-text)]/5 hover:border-[var(--color-primary)]/30 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    <span className="text-xs font-bold uppercase">{new Date(date.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="text-lg font-bold leading-none">{new Date(date.date).getDate()}</span>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg" style={{ color: "var(--color-text)" }}>{date.label}</p>
                    <p className="text-xs font-medium opacity-60 uppercase tracking-wide">{new Date(date.date).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeDate(date.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 rounded-full transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Navigation Hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, repeat: Infinity, repeatType: "reverse", duration: 2 }}
        className="fixed bottom-8 right-8 flex items-center gap-2 cursor-pointer group"
        onClick={onNavigate}
      >
        <span className="hidden sm:inline text-sm font-medium opacity-60 group-hover:opacity-100 transition-opacity" style={{ color: "var(--color-text)" }}>
          Press Right Arrow to Dashboard
        </span>
        <div className="p-2 rounded-full bg-[var(--color-card)] shadow-lg group-hover:scale-110 transition-transform">
          <ChevronRight className="h-6 w-6" style={{ color: "var(--color-primary)" }} />
        </div>
      </motion.div>
    </div>
  );
}
