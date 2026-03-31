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
                  <span className={`badge badge--status badge--${match.status}`}>
                    {isLive && <span className="live-dot" />}
                    {match.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="match-card__divider" />

              {/* Teams */}
              <div className="match-card__teams">
                {/* Team A */}
                <div className={`team-row ${isFinished && match.winner?._id === match.teamA._id ? "team-row--winner" : ""}`}>
                  <div className="team-row__left">
                    {isFinished && match.winner?._id === match.teamA._id && (
                      <span className="crown">🏆</span>
                    )}
                    <span className="team-row__name">{match.teamA.teamname}</span>
                  </div>
                  {match.teamAScore ? (
                    <div className="team-row__score">
                      <span className="score-main">
                        {match.teamAScore.runs}
                        <span className="score-wickets">/{match.teamAScore.wickets}</span>
                      </span>
                      <span className="score-overs">({match.teamAScore.overs} ov)</span>
                    </div>
                  ) : (
                    <span className="score-empty">—</span>
                  )}
                </div>

                {/* VS */}
                <div className="vs-row">
                  <div className="vs-row__line" />
                  <span className="vs-row__text">VS</span>
                  <div className="vs-row__line" />
                </div>

                {/* Team B */}
                <div className={`team-row ${isFinished && match.winner?._id === match.teamB._id ? "team-row--winner" : ""}`}>
                  <div className="team-row__left">
                    {isFinished && match.winner?._id === match.teamB._id && (
                      <span className="crown">🏆</span>
                    )}
                    <span className="team-row__name">{match.teamB.teamname}</span>
                  </div>
                  {match.teamBScore ? (
                    <div className="team-row__score">
                      <span className="score-main">
                        {match.teamBScore.runs}
                        <span className="score-wickets">/{match.teamBScore.wickets}</span>
                      </span>
                      <span className="score-overs">({match.teamBScore.overs} ov)</span>
                    </div>
                  ) : (
                    <span className="score-empty">—</span>
                  )}
                </div>
              </div>

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
                  View Details →
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