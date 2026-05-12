  import { useEffect, useState } from "react";
  import { useNavigate } from "react-router-dom";
  import "./styles/Home.css";
  import { toast } from "react-toastify";
  import Loader from "../components/Loader";
  import { getSocket } from "../socket";


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


    const [loading, setLoading] = useState(true);

    const fetchMatches = async () => {

      setLoading(true);

      const token = localStorage.getItem("token");
      const res = await fetch(`${URL}/api/match/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setMatches(data);
       setLoading(false);
    };

    //  INITIAL LOAD
    useEffect(() => {
      fetchMatches();
    }, []);

    //  SOCKET (lazy connect — only when Home is mounted)
    useEffect(() => {
      const s = getSocket();
      const onScoreUpdate = () => {
        fetchMatches();
      };
      s.on("scoreUpdate", onScoreUpdate);
      return () => {
        s.off("scoreUpdate", onScoreUpdate);
      };
    }, []);

    const handleViewDetails = async (matchId: string) => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${URL}/api/match/detail/${matchId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.message || "Error fetching details");
          return;
        }
        navigate(`/match-details/${matchId}`, { state: data });
      } catch (error) {
        toast.error("Error fetching details: " + error);
      }
    };

    const filteredMatches =
      filter === "all" ? matches : matches.filter((m) => m.status === filter);

    // PURE FUNCTIOn
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
          <div className="score-main">
            <span className="score-runs-home">
              {runs}
              <span className="score-wickets-home">/{wickets}</span>
            </span>
            <span className="score-overs">({overs})</span>
          </div>
        </div>
      ) : (
        <span className="score-empty">—</span>
      );
    };
    
    if (loading) return <Loader />;

    return (
      <div className="home-page">
        <div className="home-header">
          <h2 className="home-title">Matches</h2>

          <div className="filter-bar">
            {["all", "upcoming", "live", "finished"].map((f) => (
              <button
                key={f}
                className={`filter-btns ${
                  filter === f ? "filter-btn--active" : ""
                }`}
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

          {filteredMatches.map((match) => {
            const isLive = match.status === "live";
            const isFinished = match.status === "finished";

            const inn2 = match.innings?.find((i) => i.inningNumber === 2);
            const showTarget = isLive && inn2?.target !== undefined;

            return (
              <div
                key={match._id}
                className={`match-card-home ${
                  isLive ? "match-card--live" : ""
                }`}
              >
                <div className="match-card__header">
                  <div className="match-card__badges">
                    <span className="badge badge--format">
                      {(match.matchType || match.type || "T20").toUpperCase()}
                    </span>
                    <span className={`badge badge--${match.status}`}>
                      {isLive && <span className="live-dot" />}
                      {match.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="match-card__main">
                  <div className="match-card__team-area">
                    {/* Team A */}
                    <div className="team-block">
                      <div className="team-avatar">{match.teamA.teamname[0]}</div>
                      <span className="team-block__name">{match.teamA.teamname}</span>
                      {renderScore(match, match.teamA._id, match.teamAScore)}
                    </div>

                    <div className="vs-divider">
                      <div className="vs-line" />
                      <div className="vs-circle">VS</div>
                      <div className="vs-line" />
                    </div>

                    {/* Team B */}
                    <div className="team-block">
                      <div className="team-avatar">{match.teamB.teamname[0]}</div>
                      <span className="team-block__name">{match.teamB.teamname}</span>
                      {renderScore(match, match.teamB._id, match.teamBScore)}
                    </div>
                  </div>
                </div>

                <div className="match-card__extra">
                  {showTarget && inn2 && (
                    <div className="match-banner target-banner">
                      <span className="banner-icon">🎯</span>
                      <div className="banner-content">
                        <strong>Target: {inn2.target}</strong>
                        <span>Need {(inn2.target ?? 0) - inn2.totalRuns} runs</span>
                      </div>
                    </div>
                  )}

                  {match.winner && (
                    <div className="match-banner winner-banner">
                      <span className="banner-icon">🏆</span>
                      <div className="banner-content">
                        <strong>{match.winner.teamname} won</strong>
                      </div>
                    </div>
                  )}
                </div>

                <div className="match-card__footer">
                  <button
                    className="action-btn-primary"
                    onClick={() => handleViewDetails(match._id)}
                  >
                    <span>View Analytics</span>
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
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