import { getAllAdminUsers } from "@/lib/db/queries/admin-users";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { UserCog, Clock, CheckCircle, XCircle, Shield } from "lucide-react";
import { AdminUserActions } from "@/components/admin/admin-user-actions";
import { auth } from "@clerk/nextjs/server";

interface UsersPageProps {
  params: Promise<{ locale: string }>;
}

export default async function UsersManagementPage({ params }: UsersPageProps) {
  const { locale } = await params;
  const { userId: currentUserId } = await auth();
  const users = await getAllAdminUsers();

  const pendingUsers = users.filter((u) => u.status === "pending");
  const approvedUsers = users.filter((u) => u.status === "approved");
  const rejectedUsers = users.filter((u) => u.status === "rejected");

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
            <CheckCircle className="h-3 w-3" />
            Approvato
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
            <XCircle className="h-3 w-3" />
            Rifiutato
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-sand-500/20 text-sand-400 border border-sand-500/30">
            <Clock className="h-3 w-3" />
            In attesa
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-frost-100 flex items-center gap-2">
          <UserCog className="h-7 w-7 text-frost-400" />
          Gestione Utenti Admin
        </h1>
        <p className="text-frost-400 mt-1">
          Gestisci gli utenti che possono accedere al pannello di amministrazione
        </p>
      </div>

      {/* Pending Users */}
      {pendingUsers.length > 0 && (
        <Card variant="frost" className="border-sand-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sand-400">
              <Clock className="h-5 w-5" />
              Richieste in Attesa ({pendingUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-night-800 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-frost-100">
                        {user.firstName} {user.lastName}
                      </p>
                      <StatusBadge status={user.status} />
                    </div>
                    <p className="text-sm text-frost-400">{user.email}</p>
                    <p className="text-xs text-frost-500 mt-1">
                      Registrato il {formatDate(user.createdAt)}
                    </p>
                  </div>
                  <AdminUserActions
                    userId={user.id}
                    clerkId={user.clerkId}
                    currentUserId={currentUserId || ""}
                    status={user.status}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approved Users */}
      <Card variant="frost">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-400" />
            Utenti Approvati ({approvedUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {approvedUsers.length === 0 ? (
            <p className="text-frost-500 text-sm">Nessun utente approvato</p>
          ) : (
            <div className="space-y-3">
              {approvedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-night-800 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-frost-100">
                        {user.firstName} {user.lastName}
                      </p>
                      <StatusBadge status={user.status} />
                      {user.clerkId === currentUserId && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-frost-600/20 text-frost-300 border border-frost-600/30">
                          Tu
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-frost-400">{user.email}</p>
                    <p className="text-xs text-frost-500 mt-1">
                      Approvato il {formatDate(user.approvedAt)}
                      {user.approvedBy && ` da ${user.approvedBy}`}
                    </p>
                  </div>
                  <AdminUserActions
                    userId={user.id}
                    clerkId={user.clerkId}
                    currentUserId={currentUserId || ""}
                    status={user.status}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rejected Users */}
      {rejectedUsers.length > 0 && (
        <Card variant="frost" className="border-red-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <XCircle className="h-5 w-5" />
              Utenti Rifiutati ({rejectedUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rejectedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-night-800 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-frost-100">
                        {user.firstName} {user.lastName}
                      </p>
                      <StatusBadge status={user.status} />
                    </div>
                    <p className="text-sm text-frost-400">{user.email}</p>
                    <p className="text-xs text-frost-500 mt-1">
                      Registrato il {formatDate(user.createdAt)}
                    </p>
                  </div>
                  <AdminUserActions
                    userId={user.id}
                    clerkId={user.clerkId}
                    currentUserId={currentUserId || ""}
                    status={user.status}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
