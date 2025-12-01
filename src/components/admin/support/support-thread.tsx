"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, MapPin, Flag } from "lucide-react";
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
}

interface SupportThreadProps {
  thread: TeamThread;
  onSendMessage: (message: string) => Promise<void>;
}

export function SupportThread({ thread, onSendMessage }: SupportThreadProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [thread.messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(newMessage.trim());
      setNewMessage("");
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
        <h3 className="font-semibold text-frost-100">{thread.teamName}</h3>
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

      {/* Input */}
      <div className="p-4 border-t border-frost-500/20">
        <div className="flex gap-2">
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
            disabled={!newMessage.trim() || isSending}
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
