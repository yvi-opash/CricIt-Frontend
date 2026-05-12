import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./styles/BcciMatches.css";
import Loader from "../components/Loader";

const URL = import.meta.env.VITE_API_URL;

interface CricScoreRow {
  r?: number;
  w?: number;
  o?: number;
  inning?: string;
}

interface CricMatch {
  id: string;
  name?: string;
  matchType?: string;
  status?: string;
  venue?: string;
  date?: string;
  dateTimeGMT?: string;
  teams?: string[];
  score?: CricScoreRow[];
}

interface CricApiPayload {
  status?: string;
  data?: CricMatch[] | null;
  reason?: string;
}

const getStatusTone = (status?: string) => {
  const value = status?.toLowerCase() || "";
  if (value.includes("live")) return "is-live";
  if (value.includes("won") || value.includes("completed")) return "is-done";
  if (value.includes("upcoming")) return "is-upcoming";
  return "is-neutral";
};

const formatUtc = (dateTimeGMT?: string) => {
  if (!dateTimeGMT) return "";
  const dt = new Date(dateTimeGMT);
  if (Number.isNaN(dt.getTime())) return dateTimeGMT;
  return dt.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const splitTeamsFromName = (name?: string) => {
  if (!name) return [];
  const normalized = name
    .replace(/\s+vs\.?\s+/i, " vs ")
    .replace(/\s+v\/s\s+/i, " vs ");
  const parts = normalized.split(/\s+vs\s+/i).map((t) => t.trim());
  return parts.filter(Boolean);
};

const scoreByTeam = (match: CricMatch, teamName: string) => {
  if (!match.score || match.score.length === 0) return undefined;
  const lowerTeam = teamName.toLowerCase();
  return match.score.find((s) =>
    (s.inning || "").toLowerCase().includes(lowerTeam)
  );
};

const BcciMatches = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<CricMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);

  const fetchMatches = useCallback(async (pageOffset: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${URL}/api/cricapi/matches?offset=${pageOffset}`
      );
      const payload = (await res.json()) as CricApiPayload & {
        message?: string;
      };

      if (!res.ok) {
        toast.error(payload.message || "Could not load BCCI matches");
        setMatches([]);
        return;
      }

      if (payload.status === "failure") {
        toast.error(payload.reason || "CricAPI returned failure");
        setMatches([]);
        return;
      }

      const list = payload.data;
      setMatches(Array.isArray(list) ? list : []);
    } catch {
      toast.error("Network error loading matches");
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches(offset);
  }, [offset, fetchMatches]);

  if (loading) return <Loader />;

  return (
    <div className="bcci-page">
      <div className="bcci-header">
        <h2 className="bcci-title">BCCI Current Matches</h2>
      </div>

      <div className="bcci-toolbar">
        <button
          type="button"
          className="bcci-page-btn"
          disabled={offset === 0}
          onClick={() => setOffset((o) => Math.max(0, o - 25))}
        >
          Previous page
        </button>
        <span className="bcci-offset-label">Page offset: {offset}</span>
        <button
          type="button"
          className="bcci-page-btn"
          onClick={() => setOffset((o) => o + 25)}
        >
          Next page
        </button>
      </div>

      <div className="bcci-match-list">
        {matches.length === 0 && (
          <p className="bcci-empty">No matches returned for this page.</p>
        )}

        {matches.map((match) => {
          const teams =
            match.teams && match.teams.length > 0
              ? match.teams
              : splitTeamsFromName(match.name);
          const teamA = teams[0] || "Team A";
          const teamB = teams[1] || "Team B";

          const teamAScore = scoreByTeam(match, teamA) || match.score?.[0];
          const teamBScore = scoreByTeam(match, teamB) || match.score?.[1];

          return (
            <article 
              key={match.id} 
              className="bcci-card-home"
              onClick={() => navigate(`/bcci-match-info/${match.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="bcci-card__top">
                <div className="bcci-card__badges">
                  {match.matchType && (
                    <span className="bcci-badge bcci-badge--type">
                      {match.matchType.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              <div className="bcci-card__divider" />

              <div className="bcci-card__teams">
                <div className="bcci-team-row">
                  <span className="bcci-team-name">{teamA}</span>
                  <div className="bcci-team-score">
                    <span className="bcci-runs">
                      {teamAScore?.r ?? "—"}
                      <span className="bcci-wickets"> / {teamAScore?.w ?? "—"}</span>
                    </span>
                    <span className="bcci-overs">
                      ({teamAScore?.o ?? "—"} overs)
                    </span>
                  </div>
                </div>

                <div className="bcci-vs-row">VS</div>

                <div className="bcci-team-row">
                  <span className="bcci-team-name">{teamB}</span>
                  <div className="bcci-team-score">
                    <span className="bcci-runs">
                      {teamBScore?.r ?? "—"}
                      <span className="bcci-wickets"> / {teamBScore?.w ?? "—"}</span>
                    </span>
                    <span className="bcci-overs">
                      ({teamBScore?.o ?? "—"} overs)
                    </span>
                  </div>
                </div>
              </div>

              <div className="bcci-meta-wrap">
                <div className="bcci-meta-line">
                  <span className="bcci-meta-label">MATCH</span>
                  <span className="bcci-meta-value">{match.name || "Match"}</span>
                </div>
                {match.venue && (
                  <div className="bcci-meta-line">
                    <span className="bcci-meta-label">VENUE</span>
                    <span className="bcci-meta-value">{match.venue}</span>
                  </div>
                )}
                {(match.date || match.dateTimeGMT) && (
                  <div className="bcci-meta-line">
                    <span className="bcci-meta-label">DATE</span>
                    <span className="bcci-meta-value">
                      {match.date || "-"}
                      {match.dateTimeGMT ? ` • ${formatUtc(match.dateTimeGMT)}` : ""}
                    </span>
                  </div>
                )}
              </div>

              {match.status && (
                <div className={`bcci-result-banner ${getStatusTone(match.status)}`}>
                  {match.status}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default BcciMatches;
