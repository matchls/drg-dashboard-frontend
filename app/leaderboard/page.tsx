"use client";
import { useState } from "react";
import { useEffect } from "react";
import {
  fetchLeaderboard,
  fetchCommunityTotals,
  LEADERBOARD_PAGE_SIZE,
} from "@/lib/data/players";
import { useAsync } from "@/lib/hooks/useAsync";
import { useTranslation } from "@/lib/i18n";
import {
  getFriends,
  addFriend,
  removeFriend,
  isFriend,
  normalizeName,
} from "@/lib/friends";
import { getCurrentIdentity } from "@/lib/session";
import { type SortKey } from "@/lib/leaderboard";
import Podium from "@/components/leaderboard/Podium";
import PlayerTable from "@/components/leaderboard/PlayerTable";
import CompanyQuota from "@/components/leaderboard/CompanyQuota";
import BountyTargets from "@/components/leaderboard/BountyTargets";

export default function LeaderboardPage() {
  const [currentPlayerName, setCurrentPlayerName] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("total_missions");
  const [sortAsc, setSortAsc] = useState(false);
  const [friendsOnly, setFriendsOnly] = useState(false);
  const [friends, setFriends] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const t = useTranslation();

  // Leaderboard paginé — le tri et la page déclenchent un nouveau fetch serveur
  const { data: playersData } = useAsync(
    () => fetchLeaderboard({ sortKey, ascending: sortAsc, page, pageSize: LEADERBOARD_PAGE_SIZE }),
    [sortKey, sortAsc, page],
  );
  const players = playersData ?? [];

  // Agrégats communautaires — requête séparée, indépendante de la pagination
  const { data: totalsData } = useAsync(() => fetchCommunityTotals());
  const communityKills    = totalsData?.kills    ?? 0;
  const communityMissions = totalsData?.missions ?? 0;

  useEffect(() => {
    const id = getCurrentIdentity();
    setCurrentPlayerName(id.displayName || null);
    setFriends(getFriends());
  }, []);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
    setPage(0); // retour page 1 à chaque changement de tri
  }

  function toggleFriend(name: string) {
    if (isFriend(name)) {
      removeFriend(name);
    } else {
      addFriend(name);
    }
    setFriends(getFriends());
  }

  // Filtre "amis seulement" côté client sur la page courante (option A)
  const meKey = currentPlayerName ? normalizeName(currentPlayerName) : null;
  const displayedPlayers = friendsOnly
    ? players.filter(
        (p) =>
          normalizeName(p.player_name) === meKey ||
          friends.includes(normalizeName(p.player_name)),
      )
    : players;

  // hasMore : si la page est pleine on suppose qu'il y a une suivante
  const hasMore = players.length === LEADERBOARD_PAGE_SIZE;

  return (
    <div className="min-h-screen bg-background scanline-overlay p-6 flex flex-col gap-6">
      <Podium players={players} t={t} />

      <PlayerTable
        players={displayedPlayers}
        currentPlayerName={currentPlayerName}
        sortKey={sortKey}
        sortAsc={sortAsc}
        friendsOnly={friendsOnly}
        friends={friends}
        t={t}
        onSort={handleSort}
        onToggleFriend={toggleFriend}
        onFriendsOnlyChange={setFriendsOnly}
        page={page}
        pageSize={LEADERBOARD_PAGE_SIZE}
        hasMore={hasMore}
        onPrevPage={() => setPage((p) => Math.max(0, p - 1))}
        onNextPage={() => setPage((p) => p + 1)}
      />

      <div className="grid grid-cols-2 gap-4">
        <CompanyQuota players={players} sortKey={sortKey} t={t} />
        <BountyTargets
          communityKills={communityKills}
          communityMissions={communityMissions}
          t={t}
        />
      </div>
    </div>
  );
}
