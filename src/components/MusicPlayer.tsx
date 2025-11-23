"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Music, Play, ExternalLink, Youtube } from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

type MusicType = "youtube" | "spotify";

interface Track {
  id: string;
  type: MusicType;
  title: string;
  url: string;
  embedUrl: string;
}

const DEFAULT_PLAYLIST: Track[] = [
  {
    id: "jfKfPfyJRdk",
    type: "youtube",
    title: "Lofi Girl - beats to relax/study to",
    url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    embedUrl: "https://www.youtube.com/embed/jfKfPfyJRdk"
  },
  {
    id: "4xDzrJKX8EY",
    type: "youtube",
    title: "Synthwave Radio - beats to chill/game to",
    url: "https://www.youtube.com/watch?v=4xDzrJKX8EY",
    embedUrl: "https://www.youtube.com/embed/4xDzrJKX8EY"
  },
  {
    id: "37i9dQZF1DX8Uebhn9wzrS",
    type: "spotify",
    title: "Chill Lofi Study Beats",
    url: "https://open.spotify.com/playlist/37i9dQZF1DX8Uebhn9wzrS",
    embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX8Uebhn9wzrS"
  }
];

export default function MusicPlayer() {
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [inputUrl, setInputUrl] = useState("");
  const [error, setError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAudioOnly, setIsAudioOnly] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("krsna_playlist");
    if (stored) {
      setPlaylist(JSON.parse(stored));
    } else {
      setPlaylist(DEFAULT_PLAYLIST);
      localStorage.setItem("krsna_playlist", JSON.stringify(DEFAULT_PLAYLIST));
    }
  }, []);

  const parseUrl = (input: string): Track | null => {
    try {
      const url = new URL(input);
      const hostname = url.hostname.toLowerCase();
      const pathname = url.pathname;

      // YouTube
      if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
        let id = "";
        
        if (hostname.includes("youtu.be")) {
          id = pathname.slice(1);
        } else if (pathname.startsWith("/shorts/")) {
          id = pathname.split("/")[2];
        } else if (pathname.startsWith("/embed/")) {
          id = pathname.split("/")[2];
        } else if (pathname.startsWith("/v/")) {
          id = pathname.split("/")[2];
        } else if (url.searchParams.has("v")) {
          id = url.searchParams.get("v") || "";
        }

        if (id && id.length === 11) {
          return {
            id,
            type: "youtube",
            title: `YouTube Video (${id})`,
            url: input,
            embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1`
          };
        }
      }

      // Spotify
      if (hostname.includes("spotify.com")) {
        const match = pathname.match(/\/(track|album|playlist)\/([a-zA-Z0-9]+)/);
        if (match) {
          const [, type, id] = match;
          return {
            id,
            type: "spotify",
            title: `Spotify ${type.charAt(0).toUpperCase() + type.slice(1)}`,
            url: input,
            embedUrl: `https://open.spotify.com/embed/${type}/${id}`
          };
        }
      }
    } catch (e) {
      // Not a valid URL, maybe it's a raw ID?
      if (input.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(input)) {
         return {
            id: input,
            type: "youtube",
            title: `YouTube Video (${input})`,
            url: `https://www.youtube.com/watch?v=${input}`,
            embedUrl: `https://www.youtube.com/embed/${input}?autoplay=1`
          };
      }
    }

    return null;
  };

  const handleAddTrack = () => {
    setError("");
    if (!inputUrl.trim()) return;

    const track = parseUrl(inputUrl);
    if (track) {
      if (playlist.some(t => t.id === track.id && t.type === track.type)) {
        setError("This track is already in your playlist.");
        return;
      }
      const newPlaylist = [...playlist, track];
      setPlaylist(newPlaylist);
      localStorage.setItem("krsna_playlist", JSON.stringify(newPlaylist));
      setCurrentTrack(track); // Auto-play the new track
      setInputUrl("");
      setIsAdding(false);
    } else {
      setError("Invalid YouTube or Spotify URL.");
    }
  };

  const removeTrack = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const newPlaylist = playlist.filter((_, i) => i !== index);
    setPlaylist(newPlaylist);
    localStorage.setItem("krsna_playlist", JSON.stringify(newPlaylist));
    if (currentTrack === playlist[index]) {
      setCurrentTrack(null);
    }
  };

  if (isCollapsed) {
    return (
      <div 
        onClick={() => setIsCollapsed(false)}
        className="cozy-card fixed bottom-8 right-8 z-50 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-lg transition-transform hover:scale-110"
      >
        <Music className="h-6 w-6" />
        {currentTrack && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-white"></span>
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="cozy-card flex flex-col overflow-hidden transition-all h-full max-h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-text)]/10">
        <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--color-text)" }}>
          <Music className="h-5 w-5 text-[var(--color-primary)]" />
          Music
        </h3>
        <div className="flex items-center gap-1">
           <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded-md hover:bg-[var(--color-text)]/5 transition-colors"
            style={{ color: "var(--color-text)" }}
            title="Minimize"
          >
            <div className="h-0.5 w-3 bg-current" />
          </button>
           <button
            onClick={() => setIsAudioOnly(!isAudioOnly)}
            className={clsx(
              "p-1.5 rounded-md text-xs font-medium transition-colors",
              isAudioOnly ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text)] hover:bg-[var(--color-text)]/5"
            )}
            title="Toggle Audio Only Mode"
          >
            {isAudioOnly ? "Audio" : "Video"}
          </button>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="p-1.5 rounded-full hover:bg-[var(--color-text)]/5 transition-colors"
            style={{ color: "var(--color-text)" }}
          >
            <Plus className={clsx("h-4 w-4 transition-transform", isAdding && "rotate-45")} />
          </button>
        </div>
      </div>

      {/* Add Track Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-[var(--color-text)]/10 bg-[var(--color-bg)]/50"
          >
            <div className="p-3">
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="Paste link..."
                  className="flex-1 px-3 py-1.5 text-sm rounded-md border bg-transparent focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  style={{ borderColor: "var(--color-text)", opacity: 0.5, color: "var(--color-text)" }}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTrack()}
                />
                <button
                  onClick={handleAddTrack}
                  className="px-3 py-1.5 text-sm rounded-md bg-[var(--color-primary)] text-white font-medium hover:opacity-90"
                >
                  Add
                </button>
              </div>
              {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player Embed Area */}
      <div className={clsx("relative transition-all duration-300", currentTrack ? "border-b border-[var(--color-text)]/10" : "hidden")}>
        {currentTrack && (
          <div className={clsx("relative", isAudioOnly && currentTrack.type === "youtube" ? "h-0 opacity-0 pointer-events-none" : "block")}>
             <iframe
              src={currentTrack.embedUrl}
              width="100%"
              height={currentTrack.type === "spotify" ? "80" : "200"}
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
              className="block"
            />
          </div>
        )}
        
        {/* Now Playing Info (Visible even if video is hidden) */}
        {currentTrack && (
          <div className="p-3 bg-[var(--color-card)] flex justify-between items-center">
            <div className="flex-1 min-w-0 pr-2">
               <p className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider mb-0.5">Now Playing</p>
               <p className="text-sm font-medium truncate" style={{ color: "var(--color-text)" }}>{currentTrack.title}</p>
            </div>
            <button 
              onClick={() => setCurrentTrack(null)}
              className="p-1.5 hover:bg-[var(--color-danger)]/10 rounded-full text-[var(--color-text)] hover:text-[var(--color-danger)] transition-colors"
              title="Stop"
            >
              <div className="h-3 w-3 bg-current rounded-sm" />
            </button>
          </div>
        )}
      </div>

      {/* Playlist */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {playlist.map((track, index) => (
          <div
            key={`${track.id}-${index}`}
            onClick={() => setCurrentTrack(track)}
            className={clsx(
              "group flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all border",
              currentTrack === track
                ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)]"
                : "bg-transparent border-transparent hover:bg-[var(--color-text)]/5 hover:border-[var(--color-text)]/10"
            )}
          >
            <div className={clsx(
              "p-1.5 rounded-full flex-shrink-0",
              track.type === "youtube" ? "text-red-500 bg-red-500/10" : "text-green-500 bg-green-500/10"
            )}>
              {track.type === "youtube" ? <Youtube className="h-3 w-3" /> : <Music className="h-3 w-3" />}
            </div>
            
            <div className="flex-1 min-w-0 text-left">
              <p className="font-medium truncate text-xs" style={{ color: "var(--color-text)" }}>
                {track.title}
              </p>
            </div>

            <button
              onClick={(e) => removeTrack(e, index)}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-[var(--color-danger)]/10 hover:text-[var(--color-danger)] transition-all"
              style={{ color: "var(--color-text)" }}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
        
        {playlist.length === 0 && (
          <div className="text-center py-8 opacity-50">
            <Music className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs" style={{ color: "var(--color-text)" }}>No tracks</p>
          </div>
        )}
      </div>
    </div>
  );
}
