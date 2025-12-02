"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Menu,
  X,
  Map,
  MessageCircle,
  RefreshCw,
  LogOut,
  Navigation,
  Loader2,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { ChatModal } from "./chat-modal";

// Dynamic import per evitare SSR issues con Leaflet
const MapModal = dynamic(
  () => import("./map-modal").then((mod) => mod.MapModal),
  { ssr: false }
);

interface PlayerMenuProps {
  locale: string;
  destinationCoords?: {
    latitude: string;
    longitude: string;
  } | null;
  onRefresh: () => void;
  onLogout: () => void;
  isLoading: boolean;
}

export function PlayerMenu({
  locale,
  destinationCoords,
  onRefresh,
  onLogout,
  isLoading,
}: PlayerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const hasDestination =
    destinationCoords?.latitude && destinationCoords?.longitude;

  const t = {
    map: locale === "it" ? "Mappa" : "Map",
    support: locale === "it" ? "Supporto" : "Support",
    refresh: locale === "it" ? "Aggiorna" : "Refresh",
    logout: locale === "it" ? "Esci" : "Logout",
    gpsActive: locale === "it" ? "GPS attivo" : "GPS active",
    theme: locale === "it" ? "Tema" : "Theme",
    lightMode: locale === "it" ? "Chiaro" : "Light",
    darkMode: locale === "it" ? "Scuro" : "Dark",
  };

  const isDark = resolvedTheme === "dark";

  const handleThemeToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  // Fetch unread count periodically
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch("/api/player/chat");
      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Error fetching chat:", err);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 5000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Reset unread count when chat opens
  useEffect(() => {
    if (isChatOpen) {
      setUnreadCount(0);
    }
  }, [isChatOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMapClick = () => {
    setIsOpen(false);
    setIsMapOpen(true);
  };

  const handleSupportClick = () => {
    setIsOpen(false);
    setIsChatOpen(true);
  };

  const handleRefreshClick = () => {
    setIsOpen(false);
    onRefresh();
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <>
      {/* Hamburger Menu Button */}
      <div ref={menuRef} className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all ${
            isOpen
              ? "bg-primary text-primary-foreground"
              : "bg-card border border-border text-foreground hover:bg-muted"
          }`}
          aria-label={isOpen ? "Chiudi menu" : "Apri menu"}
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
          {/* Badge for notifications */}
          {!isOpen && (unreadCount > 0 || hasDestination) && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1 text-xs font-bold text-white bg-primary rounded-full">
              {unreadCount > 0 ? (unreadCount > 9 ? "9+" : unreadCount) : "!"}
            </span>
          )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-14 right-0 w-56 bg-card border border-border rounded-2xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Mappa */}
            <button
              onClick={handleMapClick}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
            >
              {hasDestination ? (
                <Navigation className="h-5 w-5 text-accent animate-pulse" />
              ) : (
                <Map className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="text-foreground flex-1">{t.map}</span>
              {hasDestination && (
                <span className="text-xs text-accent bg-accent/20 px-2 py-0.5 rounded-full">
                  {t.gpsActive}
                </span>
              )}
            </button>

            {/* Supporto */}
            <button
              onClick={handleSupportClick}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left border-t border-border"
            >
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
              <span className="text-foreground flex-1">{t.support}</span>
              {unreadCount > 0 && (
                <span className="flex items-center justify-center min-w-5 h-5 px-1 text-xs font-bold text-white bg-primary rounded-full">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Refresh */}
            <button
              onClick={handleRefreshClick}
              disabled={isLoading}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left border-t border-border disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
              ) : (
                <RefreshCw className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="text-foreground">{t.refresh}</span>
            </button>

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={handleThemeToggle}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left border-t border-border"
              >
                {isDark ? (
                  <Sun className="h-5 w-5 text-accent" />
                ) : (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="text-foreground flex-1">{t.theme}</span>
                <span className="text-xs text-muted-foreground">
                  {isDark ? t.lightMode : t.darkMode}
                </span>
              </button>
            )}

            {/* Logout */}
            <button
              onClick={handleLogoutClick}
              disabled={isLoading}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-error/10 transition-colors text-left border-t border-border disabled:opacity-50"
            >
              <LogOut className="h-5 w-5 text-error" />
              <span className="text-error">{t.logout}</span>
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <MapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        locale={locale}
        destinationCoords={destinationCoords}
      />
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        locale={locale}
      />
    </>
  );
}
