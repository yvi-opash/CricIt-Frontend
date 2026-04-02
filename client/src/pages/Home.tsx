import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/Home.css";

const URL = import.meta.env.VITE_API_URL;

interface Team {
  _id: string;
  teamname: string;
}

interface Score {
  runs: number;
  wickets: number;
  overs: number;
}

interface Innings {
  _id: string;
  inningNumber: 1 | 2;
  battingTeam: Team;
  totalRuns: number;
  totalWickets: number;
  oversCompleted: number;
  ballsInCurrentOver: number;
  status: "ongoing" | "completed";
  target?: number;
}

interface Match {
  _id: string;
  teamA: Team;
  teamB: Team;
  status: string;
  matchType?: string;
  matchDate?: string;
  teamAScore?: Score;
  teamBScore?: Score;
  winner?: Team;
  innings?: Innings[];
}

const Home = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  const fetchMatches = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${URL}/api/match/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setMatches(data);
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleViewDetails = async (matchId: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${URL}/api/match/detail/${matchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Error fetching details");
        return;
      }
      navigate(`/match-details/${matchId}`, { state: data });
    } catch (error) {
      console.log(error);
    }
  };

  const filteredMatches =
    filter === "all" ? matches : matches.filter((m) => m.status === filter);

  // Returns innings-aware score block for a given team
  const renderScore = (
    match: Match,
    teamId: string,
    fallback?: Score
  ) => {
    const inn = match.innings?.find((i) => i.battingTeam._id === teamId);
    const runs = inn?.totalRuns ?? fallback?.runs;
    const wickets = inn?.totalWickets ?? fallback?.wickets;
    const overs = inn
      ? `${inn.oversCompleted}.${inn.ballsInCurrentOver}`
      : fallback?.overs;

    return runs !== undefined ? (
      <div className="team-row__score">
        <span className="score-runs">
          {runs}
          <span className="score-wickets">/ {wickets}</span>
        </span>
        <span className="score-overs">({overs} overs)</span>
      </div>
    ) : (
      <span className="score-empty">—</span>
    );
  };

  return (
    <div className="home-page">
      <div className="home-header">
        <h2 className="home-title">
          <span>🏏</span> Matches
        </h2>

        <div className="filter-bar">
          {["all", "upcoming", "live", "finished"].map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? "filter-btn--active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "live" && <span className="live-dot" />}
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="match-list">
        {filteredMatches.length === 0 && (
          <p className="match-empty">No matches found.</p>
        )}

        {filteredMatches.map((match, index) => {
          const isLive = match.status === "live";
          const isFinished = match.status === "finished";

          
          const inn2 = match.innings?.find((i) => i.inningNumber === 2);
          const showTarget = isLive && inn2?.target !== undefined;

          return (
            <div
              key={match._id}
              className={`match-card ${isLive ? "match-card--live" : ""}`}
            >
              {/* Top Row */}
              <div className="match-card__top">
                <span className="match-card__num">Match #{index + 1}</span>
                <div className="match-card__badges">
                  {match.matchType && (
                    <span className="badge badge--type">
                      {match.matchType.toUpperCase()}
                    </span>
                  )}
                  <span
                    className={`badge badge--${match.status}`}
                  >
                    {isLive && <span className="live-dot" />}
                    {match.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="match-card__divider" />

              {/* Teams */}
              <div className="match-card__teams">
                {/* Team A */}
                <div
                  className={`team-row ${
                    isFinished && match.winner?._id === match.teamA._id
                      ? "team-row--winner"
                      : ""
                  }`}
                >
                  <div className="team-row__left">
                    {isFinished && match.winner?._id === match.teamA._id && (
                      <span className="crown">🏆</span>
                    )}
                    <span className="team-row__name">
                      {match.teamA.teamname}
                    </span>
                  </div>
                  {renderScore(match, match.teamA._id, match.teamAScore)}
                </div>

                {/* VS */}
                <div className="vs-row">
                  <div className="vs-row__line" />
                  <span className="vs-row__text">VS</span>
                  <div className="vs-row__line" />
                </div>

                {/* Team B */}
                <div
                  className={`team-row ${
                    isFinished && match.winner?._id === match.teamB._id
                      ? "team-row--winner"
                      : ""
                  }`}
                >
                  <div className="team-row__left">
                    {isFinished && match.winner?._id === match.teamB._id && (
                      <span className="crown">🏆</span>
                    )}
                    <span className="team-row__name">
                      {match.teamB.teamname}
                    </span>
                  </div>
                  {renderScore(match, match.teamB._id, match.teamBScore)}
                </div>
              </div>

              {/* Target Bar — live 2nd innings only */}
              {showTarget && inn2 && (
                <div className="target-bar">
                  🎯 Target: {inn2.target} &nbsp;•&nbsp; Need{" "}
                  {(inn2.target ?? 0) - inn2.totalRuns} more run
                  {(inn2.target ?? 0) - inn2.totalRuns !== 1 ? "s" : ""}
                </div>
              )}

              {/* Result */}
              {match.winner && (
                <div className="result-banner">
                  🎉 {match.winner.teamname} won the match
                </div>
              )}

              {/* Footer */}
              <div className="match-card__footer">
                {match.matchDate && (
                  <span className="match-card__date">
                    {new Date(match.matchDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}
                <button
                  className="details-btn"
                  onClick={() => handleViewDetails(match._id)}
                >
                  View Details 
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;