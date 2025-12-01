"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { Loader2, CheckCircle, XCircle, RotateCcw, Trash2 } from "lucide-react";

interface AdminUserActionsProps {
  userId: number;
  clerkId: string;
  currentUserId: string;
  status: string;
}

export function AdminUserActions({
  userId,
  clerkId,
  currentUserId,
  status,
}: AdminUserActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isCurrentUser = clerkId === currentUserId;

  const handleAction = async (action: "approve" | "reject" | "delete") => {
    setIsLoading(action);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: action === "delete" ? "DELETE" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: action !== "delete" ? JSON.stringify({ action }) : undefined,
      });

      const data = await response.json();
      if (data.success) {
        router.refresh();
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
    } finally {
      setIsLoading(null);
      setShowDeleteConfirm(false);
    }
  };

  // Don't show any actions for current user
  if (isCurrentUser) {
    return null;
  }

  if (showDeleteConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-frost-400">Confermare?</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDeleteConfirm(false)}
          disabled={isLoading !== null}
        >
          No
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAction("delete")}
          disabled={isLoading !== null}
          className="text-red-400 hover:text-red-300"
        >
          {isLoading === "delete" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Sì"
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {status === "pending" && (
        <>
          <Button
            variant="default"
            size="sm"
            onClick={() => handleAction("approve")}
            disabled={isLoading !== null}
            className="bg-green-600 hover:bg-green-500"
          >
            {isLoading === "approve" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Approva
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction("reject")}
            disabled={isLoading !== null}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            {isLoading === "reject" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-1" />
                Rifiuta
              </>
            )}
          </Button>
        </>
      )}

      {status === "approved" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAction("reject")}
          disabled={isLoading !== null}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          {isLoading === "reject" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <XCircle className="h-4 w-4 mr-1" />
              Revoca
            </>
          )}
        </Button>
      )}

      {status === "rejected" && (
        <>
          <Button
            variant="default"
            size="sm"
            onClick={() => handleAction("approve")}
            disabled={isLoading !== null}
            className="bg-green-600 hover:bg-green-500"
          >
            {isLoading === "approve" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <RotateCcw className="h-4 w-4 mr-1" />
                Riattiva
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-frost-500 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}
