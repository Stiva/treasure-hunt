"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";
import { Loader2, Play, Pause, Pencil, Trash2 } from "lucide-react";
import type { Session } from "@/lib/db/schema";

interface SessionActionsProps {
  session: Session;
  locale: string;
}

export function SessionActions({ session, locale }: SessionActionsProps) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleToggleActive = async () => {
    setIsLoading("toggle");
    try {
      const response = await fetch(`/api/admin/sessions/${session.id}/activate`, {
        method: "POST",
      });
      const data = await response.json();
      if (data.success) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error toggling session:", error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleDelete = async () => {
    setIsLoading("delete");
    try {
      const response = await fetch(`/api/admin/sessions/${session.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        router.push(`/${locale}/admin/sessions`);
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    } finally {
      setIsLoading(null);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Toggle Active Button */}
      <Button
        variant={session.isActive ? "ghost" : "default"}
        size="sm"
        onClick={handleToggleActive}
        disabled={isLoading !== null}
      >
        {isLoading === "toggle" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : session.isActive ? (
          <>
            <Pause className="h-4 w-4 mr-1" />
            {t("deactivate")}
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-1" />
            {t("activate")}
          </>
        )}
      </Button>

      {/* Edit Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/${locale}/admin/sessions/${session.id}/edit`)}
        disabled={isLoading !== null}
      >
        <Pencil className="h-4 w-4 mr-1" />
        {t("edit")}
      </Button>

      {/* Delete Button */}
      {showDeleteConfirm ? (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/30">
          <span className="text-sm text-red-400">Confermi?</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={isLoading !== null}
          >
            Annulla
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isLoading !== null}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
          >
            {isLoading === "delete" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Elimina"
            )}
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isLoading !== null}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          {t("delete")}
        </Button>
      )}
    </div>
  );
}
