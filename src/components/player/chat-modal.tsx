"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Send, Paperclip, Loader2, Image, Video } from "lucide-react";
import { Button } from "@/components/ui";

interface Message {
  id: number;
  message: string;
  attachmentUrl: string | null;
  attachmentType: string | null;
  isFromAdmin: boolean;
  createdAt: string;
  player?: {
    name: string;
  } | null;
  adminUser?: {
    name: string;
  } | null;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}

export function ChatModal({ isOpen, onClose, locale }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [attachment, setAttachment] = useState<{
    url: string;
    type: "image" | "video";
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adminDisplayName, setAdminDisplayName] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultAdminName = locale === "it" ? "Admin" : "Admin";

  const t = {
    title: locale === "it" ? "Supporto" : "Support",
    placeholder: locale === "it" ? "Scrivi un messaggio..." : "Write a message...",
    send: locale === "it" ? "Invia" : "Send",
    noMessages: locale === "it"
      ? "Nessun messaggio. Scrivi per contattare il supporto!"
      : "No messages. Write to contact support!",
    uploading: locale === "it" ? "Caricamento..." : "Uploading...",
    uploadError: locale === "it"
      ? "Errore nel caricamento del file"
      : "Error uploading file",
    sendError: locale === "it"
      ? "Errore nell'invio del messaggio"
      : "Error sending message",
    you: locale === "it" ? "Tu" : "You",
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch("/api/player/chat");
      const data = await response.json();
      if (data.success) {
        setMessages(data.data.messages || []);
        if (data.data.adminDisplayName) {
          setAdminDisplayName(data.data.adminDisplayName);
        }
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  }, []);

  // Initial fetch and polling
  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    fetchMessages().finally(() => setIsLoading(false));

    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [isOpen, fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Validate file type
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      setError(
        locale === "it"
          ? "Tipo di file non supportato. Usa immagini o video."
          : "Unsupported file type. Use images or videos."
      );
      return;
    }

    // Validate file size (10MB for images, 100MB for videos)
    const maxSize = file.type.startsWith("video/") ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      setError(
        locale === "it"
          ? `File troppo grande. Massimo ${maxSizeMB}MB.`
          : `File too large. Maximum ${maxSizeMB}MB.`
      );
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setAttachment({
          url: data.data.url,
          type: data.data.type,
        });
      } else {
        setError(data.error || t.uploadError);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(t.uploadError);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSend = async () => {
    if ((!newMessage.trim() && !attachment) || isSending) return;

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch("/api/player/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newMessage.trim() || (attachment ? "📎" : ""),
          attachmentUrl: attachment?.url,
          attachmentType: attachment?.type,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewMessage("");
        setAttachment(null);
        await fetchMessages();
      } else {
        setError(data.error || t.sendError);
      }
    } catch (err) {
      console.error("Send error:", err);
      setError(t.sendError);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(locale === "it" ? "it-IT" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md h-[80vh] sm:h-[600px] bg-card border border-border rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{t.title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-center px-4">
              {t.noMessages}
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.isFromAdmin ? "items-start" : "items-end"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.isFromAdmin
                      ? "bg-muted text-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {/* Sender name */}
                  <div className={`text-xs mb-1 ${
                    msg.isFromAdmin ? "text-muted-foreground" : "text-primary-foreground/80"
                  }`}>
                    {msg.isFromAdmin
                      ? msg.adminUser?.name || adminDisplayName || defaultAdminName
                      : t.you}
                  </div>

                  {/* Attachment */}
                  {msg.attachmentUrl && (
                    <div className="mb-2">
                      {msg.attachmentType === "image" ? (
                        <a
                          href={msg.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={msg.attachmentUrl}
                            alt="Attachment"
                            className="max-w-full rounded-lg max-h-48 object-cover"
                          />
                        </a>
                      ) : msg.attachmentType === "video" ? (
                        <video
                          src={msg.attachmentUrl}
                          controls
                          className="max-w-full rounded-lg max-h-48"
                        />
                      ) : null}
                    </div>
                  )}

                  {/* Message text */}
                  {msg.message && msg.message !== "📎" && (
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {msg.message}
                    </p>
                  )}
                </div>

                {/* Time */}
                <span className={`text-xs text-muted-foreground mt-1 ${
                  msg.isFromAdmin ? "ml-2" : "mr-2"
                }`}>
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error message */}
        {error && (
          <div className="px-4 py-2 bg-error/10 text-error text-sm text-center">
            {error}
          </div>
        )}

        {/* Attachment preview */}
        {attachment && (
          <div className="px-4 py-2 border-t border-border bg-muted">
            <div className="relative inline-block">
              {attachment.type === "image" ? (
                <img
                  src={attachment.url}
                  alt="Preview"
                  className="h-16 w-16 object-cover rounded-lg"
                />
              ) : (
                <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center">
                  <Video className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <button
                onClick={() => setAttachment(null)}
                className="absolute -top-2 -right-2 bg-error rounded-full p-1"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex items-end gap-2">
            {/* File input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-2 rounded-full hover:bg-muted transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <Paperclip className="h-5 w-5 text-muted-foreground" />
              )}
            </button>

            {/* Text input */}
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.placeholder}
              rows={1}
              className="flex-1 resize-none bg-muted border border-border rounded-xl px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[40px] max-h-[120px]"
              style={{ height: "auto" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.min(target.scrollHeight, 120) + "px";
              }}
            />

            {/* Send button */}
            <Button
              onClick={handleSend}
              disabled={(!newMessage.trim() && !attachment) || isSending}
              className="rounded-full p-2 h-10 w-10"
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
