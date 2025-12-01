import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCurrentPlayer } from "@/lib/utils/player-session";
import { getTeamGameState, getTeamPath } from "@/lib/db/queries";
import { GameDashboard } from "@/components/player/game-dashboard";

interface PlayPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PlayPage({ params }: PlayPageProps) {
  const { locale } = await params;
  const t = await getTranslations("game");

  // Check if logged in
  const sessionData = await getCurrentPlayer();
  if (!sessionData) {
    redirect(`/${locale}/play/login`);
  }

  const { player, team } = sessionData;

  // Check if player has a team
  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-night-950 to-pitch-950 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-frost-100 mb-4">
            Squadra non assegnata
          </h1>
          <p className="text-frost-400">
            Non sei ancora stato assegnato a una squadra.
            <br />
            Contatta l'organizzatore dell'evento.
          </p>
        </div>
      </div>
    );
  }

  // Get game state
  const gameState = await getTeamGameState(team.id);
  const path = await getTeamPath(team.id);

  // Check if paths are generated
  if (!path || path.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-night-950 to-pitch-950 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-frost-100 mb-4">
            In attesa dell'inizio
          </h1>
          <p className="text-frost-400">
            Il percorso non è ancora stato generato.
            <br />
            Attendi che l'organizzatore avvii la sessione.
          </p>
        </div>
      </div>
    );
  }

  return (
    <GameDashboard
      player={player}
      team={team}
      gameState={gameState!}
      pathLength={path.length}
      locale={locale}
    />
  );
}
