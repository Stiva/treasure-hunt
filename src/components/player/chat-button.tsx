"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageCircle } from "lucide-react";
import { ChatModal } from "./chat-modal";

interface ChatButtonProps {
  locale: string;
}

export function ChatButton({ locale }: ChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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

  // Reset unread count when modal opens
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-frost-500 hover:bg-frost-400 text-white shadow-lg transition-all hover:scale-110 active:scale-95"
        aria-label={locale === "it" ? "Apri chat supporto" : "Open support chat"}
      >
        <MessageCircle className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Chat Modal */}
      <ChatModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        locale={locale}
      />
    </>
  );
}
