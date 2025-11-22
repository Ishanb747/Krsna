"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  LogOut,
  User as UserIcon,
  Upload,
  X,
  Camera,
} from "lucide-react";
import clsx from "clsx";
import { useState, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "To-Do", href: "/todo", icon: CheckSquare },
  { name: "Focus", href: "/focus", icon: Clock },
  { name: "Journal", href: "/journal", icon: Book },
  { name: "Habits", href: "/habits", icon: Flame },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout, updateUserProfile } = useAuth();
  
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const openEditProfile = () => {
    setDisplayName(user?.displayName || "");
    setIsUploadModalOpen(true);
    setIsProfileMenuOpen(false);
  };

  const handleSaveProfile = async () => {
    setUploading(true);
    try {
      let photoURL = user?.photoURL;

      // Upload new image if selected
      if (fileInputRef.current?.files?.[0]) {
        const file = fileInputRef.current.files[0];
        const storageRef = ref(storage, `profile_pictures/${user?.uid}`);
        await uploadBytes(storageRef, file);
        photoURL = await getDownloadURL(storageRef);
      }

      await updateUserProfile({
        displayName: displayName,
        photoURL: photoURL || undefined
      });
      
      setIsUploadModalOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Just trigger a re-render to show preview if needed, or just rely on the file input
    // For now, we'll keep it simple and just let the user click save
  };

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

        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className={clsx(
              "flex w-full items-center rounded-[var(--border-radius)] border-2 border-transparent p-2 transition-all hover:bg-[var(--color-bg)]",
              isCollapsed && "justify-center",
              isProfileMenuOpen && "bg-[var(--color-bg)] border-[var(--color-text)]"
            )}
          >
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="Profile" 
                className="h-10 w-10 rounded-full border-2 border-[var(--color-text)] object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--color-text)] bg-[var(--color-secondary)] text-white">
                <UserIcon className="h-6 w-6" />
              </div>
            )}
            
            {!isCollapsed && (
              <div className="ml-3 overflow-hidden text-left">
                <p className="truncate text-sm font-bold">{user?.displayName || "User"}</p>
                <p className="truncate text-xs opacity-70">{user?.email}</p>
              </div>
            )}
          </button>

          {/* Profile Menu Popover */}
          {isProfileMenuOpen && (
            <div className={clsx(
              "absolute bottom-full left-0 mb-2 w-full min-w-[200px] overflow-hidden rounded-[var(--border-radius)] border-2 border-[var(--color-text)] bg-[var(--color-card)] shadow-[4px_4px_0px_var(--color-text)]",
              isCollapsed && "left-full ml-2 bottom-0"
            )}>
              <div className="p-2">
                <button
                  onClick={openEditProfile}
                  className="flex w-full items-center rounded-[var(--border-radius)] px-3 py-2 text-sm font-bold hover:bg-[var(--color-bg)]"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Edit Profile
                </button>
                <div className="my-1 h-[2px] bg-[var(--color-text)] opacity-10"></div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center rounded-[var(--border-radius)] px-3 py-2 text-sm font-bold text-[var(--color-danger)] hover:bg-[var(--color-bg)]"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="cozy-card w-full max-w-sm p-6 text-center">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">Edit Profile</h3>
              <button onClick={() => setIsUploadModalOpen(false)}>
                <X className="h-6 w-6 hover:text-[var(--color-danger)]" />
              </button>
            </div>
            
            <div className="mb-6 flex justify-center">
              <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-[var(--color-text)] bg-[var(--color-bg)]">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-full w-full p-6 text-[var(--color-secondary)]" />
                )}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100"
                >
                  <Camera className="h-8 w-8 text-white" />
                </button>
              </div>
            </div>

            <div className="mb-6 text-left">
              <label className="mb-1 block text-sm font-bold">Username</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter username"
                className="w-full rounded-[var(--border-radius)] border-2 border-[var(--color-text)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />

            <button
              onClick={handleSaveProfile}
              disabled={uploading}
              className="cozy-btn w-full bg-[var(--color-primary)] py-3 font-bold text-white hover:bg-[var(--color-secondary)] disabled:opacity-50"
            >
              {uploading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
