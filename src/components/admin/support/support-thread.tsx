"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, MapPin, Flag, Navigation, Paperclip, X, Video } from "lucide-react";
import { Button, Input } from "@/components/ui";

interface Message {
  id: number;
  message: string;
  attachmentUrl: string | null;
  attachmentType: string | null;
  isFromAdmin: boolean;
  isRead: boolean;
  gameContext: {
    teamName?: string;
    currentStage?: number;
    totalStages?: number;
    locationName?: string;
  } | null;
  createdAt: string;
  player?: {
    firstName: string;
    lastName: string;
  } | null;
  adminUser?: {
    name: string;
  } | null;
}

interface TeamThread {
  teamId: number;
  teamName: string;
  messages: Message[];
  unreadCount: number;
  lastMessageAt: string;
  gpsHintEnabled: boolean;
  currentStage: number;
  nextLocationCoords: {
    latitude: string | null;
    longitude: string | null;
  } | null;
}

interface SupportThreadProps {
  thread: TeamThread;
  onSendMessage: (message: string, attachmentUrl?: string, attachmentType?: string) => Promise<void>;
  onToggleGpsHint: (teamId: number, enabled: boolean) => Promise<void>;
}

export function SupportThread({ thread, onSendMessage, onToggleGpsHint }: SupportThreadProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTogglingGps, setIsTogglingGps] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [attachment, setAttachment] = useState<{
    url: string;
    type: "image" | "video";
  } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [thread.messages]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Validate file type
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      setUploadError("Tipo di file non supportato. Usa immagini o video.");
      return;
    }

    // Validate file size (10MB for images, 100MB for videos)
    const maxSize = file.type.startsWith("video/") ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      setUploadError(`File troppo grande. Massimo ${maxSizeMB}MB.`);
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload", {
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
        setUploadError(data.error || "Errore nel caricamento del file");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError("Errore nel caricamento del file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSend = async () => {
    if ((!newMessage.trim() && !attachment) || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(
        newMessage.trim() || (attachment ? "📎" : ""),
        attachment?.url,
        attachment?.type
      );
      setNewMessage("");
      setAttachment(null);
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

  const handleToggleGps = async () => {
    setIsTogglingGps(true);
    try {
      await onToggleGpsHint(thread.teamId, !thread.gpsHintEnabled);
    } finally {
      setIsTogglingGps(false);
    }
  };

  const hasGpsCoordinates = thread.nextLocationCoords?.latitude && thread.nextLocationCoords?.longitude;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("it-IT", {
      day: "numeric",
      month: "short",
    });
  };

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  let currentDate = "";

  for (const msg of thread.messages) {
    const msgDate = formatDate(msg.createdAt);
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groupedMessages.push({ date: msgDate, messages: [] });
    }
    groupedMessages[groupedMessages.length - 1].messages.push(msg);
  }

  return (
    <div className="flex flex-col h-full bg-night-800 rounded-lg border border-frost-500/20 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-frost-500/20 bg-night-900">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-frost-100">{thread.teamName}</h3>
          {/* GPS Hint Button */}
          <Button
            variant={thread.gpsHintEnabled ? "sand" : "outline"}
            size="sm"
            onClick={handleToggleGps}
            disabled={isTogglingGps || !hasGpsCoordinates}
            title={
              !hasGpsCoordinates
                ? "Nessuna coordinata GPS per questa tappa"
                : thread.gpsHintEnabled
                ? "GPS Hint attivo - Clicca per disabilitare"
                : "Abilita GPS Hint"
            }
          >
            {isTogglingGps ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation
                className={`h-4 w-4 ${thread.gpsHintEnabled ? "" : "opacity-50"}`}
              />
            )}
            <span className="ml-2 hidden sm:inline">
              {thread.gpsHintEnabled ? "GPS On" : "GPS"}
            </span>
          </Button>
        </div>
        {thread.messages[0]?.gameContext && (
          <div className="flex items-center gap-4 mt-1 text-sm text-frost-400">
            <span className="flex items-center gap-1">
              <Flag className="h-3 w-3" />
              Tappa {(thread.messages[0].gameContext.currentStage || 0) + 1}/
              {thread.messages[0].gameContext.totalStages || "?"}
            </span>
            {thread.messages[0].gameContext.locationName && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {thread.messages[0].gameContext.locationName}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {groupedMessages.map((group, groupIdx) => (
          <div key={groupIdx}>
            {/* Date separator */}
            <div className="flex items-center justify-center my-4">
              <span className="text-xs text-frost-500 bg-night-700 px-3 py-1 rounded-full">
                {group.date}
              </span>
            </div>

            {group.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col mb-4 ${
                  msg.isFromAdmin ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.isFromAdmin
                      ? "bg-frost-500 text-white"
                      : "bg-night-700 text-frost-100"
                  }`}
                >
                  {/* Sender */}
                  <div
                    className={`text-xs mb-1 ${
                      msg.isFromAdmin ? "text-frost-100" : "text-frost-400"
                    }`}
                  >
                    {msg.isFromAdmin
                      ? msg.adminUser?.name || "Admin"
                      : msg.player
                        ? `${msg.player.firstName} ${msg.player.lastName}`
                        : "Giocatore"}
                  </div>

                  {/* Game context for player messages */}
                  {!msg.isFromAdmin && msg.gameContext && (
                    <div className="text-xs text-frost-500 mb-2 p-2 bg-night-800 rounded">
                      <div className="flex items-center gap-2">
                        <Flag className="h-3 w-3" />
                        Tappa {(msg.gameContext.currentStage || 0) + 1}/
                        {msg.gameContext.totalStages || "?"}
                        {msg.gameContext.locationName && (
                          <>
                            <span className="text-frost-600">•</span>
                            <MapPin className="h-3 w-3" />
                            {msg.gameContext.locationName}
                          </>
                        )}
                      </div>
                    </div>
                  )}

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
                            alt="Allegato"
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
                <span
                  className={`text-xs text-frost-500 mt-1 ${
                    msg.isFromAdmin ? "mr-2" : "ml-2"
                  }`}
                >
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Upload error */}
      {uploadError && (
        <div className="px-4 py-2 bg-red-500/10 text-red-400 text-sm text-center">
          {uploadError}
        </div>
      )}

      {/* Attachment preview */}
      {attachment && (
        <div className="px-4 py-2 border-t border-frost-500/20 bg-night-700">
          <div className="relative inline-block">
            {attachment.type === "image" ? (
              <img
                src={attachment.url}
                alt="Anteprima"
                className="h-16 w-16 object-cover rounded-lg"
              />
            ) : (
              <div className="h-16 w-16 bg-night-800 rounded-lg flex items-center justify-center">
                <Video className="h-8 w-8 text-frost-400" />
              </div>
            )}
            <button
              onClick={() => setAttachment(null)}
              className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-frost-500/20">
        <div className="flex gap-2 items-end">
          {/* File input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex-shrink-0"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Paperclip className="h-4 w-4" />
            )}
          </Button>

          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Scrivi una risposta..."
            className="flex-1"
            disabled={isSending}
          />
          <Button
            onClick={handleSend}
            disabled={(!newMessage.trim() && !attachment) || isSending}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
