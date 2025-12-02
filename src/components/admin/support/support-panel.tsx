"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, MessageCircle, Users } from "lucide-react";
import { SupportThread } from "./support-thread";

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

interface SupportPanelProps {
  sessionId: number;
}

export function SupportPanel({ sessionId }: SupportPanelProps) {
  const [threads, setThreads] = useState<TeamThread[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/sessions/${sessionId}/support`);
      const data = await response.json();
      if (data.success) {
        // API returns TeamWithMessages[] directly - use it as-is
        const threadList: TeamThread[] = data.data.messagesByTeam.map(
          (team: {
            teamId: number;
            teamName: string;
            unreadCount: number;
            lastMessage: Message | null;
            messages: Message[];
            gpsHintEnabled: boolean;
            currentStage: number;
            nextLocationCoords: { latitude: string | null; longitude: string | null } | null;
          }) => ({
            teamId: team.teamId,
            teamName: team.teamName,
            messages: team.messages,
            unreadCount: team.unreadCount,
            lastMessageAt:
              team.lastMessage?.createdAt || new Date().toISOString(),
            gpsHintEnabled: team.gpsHintEnabled,
            currentStage: team.currentStage,
            nextLocationCoords: team.nextLocationCoords,
          })
        );

        setThreads(threadList);
        setTotalUnread(data.data.unreadCount);

        // Auto-select first thread if none selected
        if (!selectedTeamId && threadList.length > 0) {
          setSelectedTeamId(threadList[0].teamId);
        }
      }
    } catch (err) {
      console.error("Error fetching support messages:", err);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, selectedTeamId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const selectedThread = threads.find((t) => t.teamId === selectedTeamId);

  const handleSendMessage = async (message: string) => {
    if (!selectedTeamId) return;

    try {
      const response = await fetch(`/api/admin/sessions/${sessionId}/support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: selectedTeamId,
          message,
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchMessages();
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleMarkAsRead = async (teamId: number) => {
    try {
      await fetch(`/api/admin/sessions/${sessionId}/support`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
      });
      await fetchMessages();
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const handleToggleGpsHint = async (teamId: number, enabled: boolean) => {
    try {
      const response = await fetch(
        `/api/admin/sessions/${sessionId}/teams/${teamId}/gps-hint`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enabled }),
        }
      );
      const data = await response.json();
      if (data.success) {
        // Update local state
        setThreads((prev) =>
          prev.map((t) =>
            t.teamId === teamId ? { ...t, gpsHintEnabled: enabled } : t
          )
        );
      }
    } catch (err) {
      console.error("Error toggling GPS hint:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-frost-400" />
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-frost-400">
        <MessageCircle className="h-16 w-16 mb-4 opacity-50" />
        <p className="text-lg">Nessun messaggio di supporto</p>
        <p className="text-sm opacity-75">
          I messaggi dei giocatori appariranno qui
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-200px)] min-h-[500px]">
      {/* Team List */}
      <div className="md:col-span-1 bg-night-800 rounded-lg border border-frost-500/20 overflow-hidden">
        <div className="p-4 border-b border-frost-500/20">
          <h3 className="font-semibold text-frost-100 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Conversazioni
            {totalUnread > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {totalUnread}
              </span>
            )}
          </h3>
        </div>
        <div className="overflow-y-auto h-[calc(100%-60px)]">
          {threads.map((thread) => (
            <button
              key={thread.teamId}
              onClick={() => {
                setSelectedTeamId(thread.teamId);
                if (thread.unreadCount > 0) {
                  handleMarkAsRead(thread.teamId);
                }
              }}
              className={`w-full text-left p-4 border-b border-frost-500/10 hover:bg-frost-500/10 transition-colors ${
                selectedTeamId === thread.teamId ? "bg-frost-500/20" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-frost-100">
                  {thread.teamName}
                </span>
                {thread.unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {thread.unreadCount}
                  </span>
                )}
              </div>
              <p className="text-sm text-frost-400 truncate mt-1">
                {thread.messages[thread.messages.length - 1]?.message || "..."}
              </p>
              <p className="text-xs text-frost-500 mt-1">
                {new Date(thread.lastMessageAt).toLocaleTimeString("it-IT", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Thread */}
      <div className="md:col-span-2">
        {selectedThread ? (
          <SupportThread
            thread={selectedThread}
            onSendMessage={handleSendMessage}
            onToggleGpsHint={handleToggleGpsHint}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-night-800 rounded-lg border border-frost-500/20">
            <p className="text-frost-400">
              Seleziona una conversazione per visualizzarla
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
