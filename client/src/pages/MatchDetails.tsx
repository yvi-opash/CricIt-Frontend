import axios from "axios";
import "./styles/MatchDetails.css";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { io } from "socket.io-client";


interface Inning {
  _id: string;
  inningNumber: number;
  totalRuns: number;
  totalWickets: number;
  oversCompleted: number;
  ballsInCurrentOver: number;
  striker?: { playername: string; _id: string };
  nonStriker?: { playername: string; _id: string };
  currentBowler?: { playername: string; _id: string };
  status: string;
  target?: number;
  battingTeam: { teamname: string };
  extras: number;
}

interface Ball {
  isWicket: boolean;
  extraType?: string;
  runsScored: number;
}

const URL = import.meta.env.VITE_API_URL;
const socket = io(URL);



const MatchDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { matchId } = useParams();

  // State management
  const [scorecard, setScorecard] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"live" | "stats" | "players">("live");
  const [innings, setInnings] = useState<Inning[]>([]);
  const [commentary, setCommentary] = useState<string[]>([]);
  const [currentOver, setCurrentOver] = useState<Ball[]>([]);

  // Fetch scorecard data
  const fetchScorecard = async () => {
    try {
      const res = await fetch(`${URL}/api/player/history/match/${matchId}`);
      const data = await res.json();
      setScorecard(data);
    } catch (error) {
      console.log("Error fetching scorecard:", error);
    }
  };

  // Fetch innings data
  const fetchInnings = async () => {
    try {
      const res = await axios.get(`${URL}/api/inning/match/${matchId}`);
      setInnings(res.data);
    } catch (error) {
      console.log("Error fetching innings:", error);
    }
  };

  // Fetch live data (commentary and current over)
  const fetchLiveData = async (inningId: string) => {
    if (!inningId) return;

    try {
      const commentRes = await axios.get(
        `${URL}/api/ball/commentary/${inningId}`
      );
      const incomingCommentary = Array.isArray(commentRes.data)
        ? commentRes.data
        : Array.isArray(commentRes.data?.commentary)
        ? commentRes.data.commentary
        : [];

      setCommentary(incomingCommentary.filter((line: unknown) => typeof line === "string"));

      const overRes = await axios.get(`${URL}/api/ball/overs/${inningId}`);
      setCurrentOver(overRes.data || []);
    } catch (error) {
      console.log("Live data not available yet");
    }
  };

  // Initial load
  useEffect(() => {
    if (matchId) {
      fetchScorecard();
      fetchInnings();
    }
  }, [matchId]);

  // Fetch live data when innings change
  useEffect(() => {
    if (innings.length > 0) {
      const last = innings[innings.length - 1];
      if (last?._id) {
        fetchLiveData(last._id);
      }
    }
  }, [innings]);

  // Auto-refresh live data every 3 seconds
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (innings.length > 0) {
  //       const last = innings[innings.length - 1];
  //       if (last?._id) {
  //         fetchLiveData(last._id);
  //       }
  //     }
  //   }, 3000);

  //   return () => clearInterval(interval);
  // }, [innings]);

  // Get stats for a player
  const getStats = (playerId: string) => {
    return scorecard.find((p: any) => p.playerId?._id === playerId);
  };

  // Error state
  if (!state)
    return (
      <div className="details-error">
        <p>No match data found.</p>
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Go Back
        </button>
      </div>
    );

  const match = state;

  // Teams data
  const teamsData = [
    { label: match.teamA.teamname, id: match.teamA._id, players: match.playingTeamA },
    { label: match.teamB.teamname, id: match.teamB._id, players: match.playingTeamB },
  ];

  // Display teams based on filter
  const displayTeams = selectedTeam
    ? teamsData.filter((t) => t.id === selectedTeam)
    : teamsData;

  // Get ongoing inning
  const ongoingInning = innings.find((inn: any) => inn.status === "ongoing");

  const teamAInning = innings.find(
  (inn: any) => inn.battingTeam?._id === match.teamA._id
);

const teamBInning = innings.find(
  (inn: any) => inn.battingTeam?._id === match.teamB._id
);

  // --------- socket.io 
useEffect(() => {
  if (!ongoingInning?._id) return;

  socket.emit("joinInning", ongoingInning._id);

  const onScoreUpdate = (payload: {
    inningId?: string;
    commentary?: string | null;
  }) => {
    if (payload?.inningId && payload.inningId !== ongoingInning._id) return;

    if (payload?.commentary) {
      setCommentary((prev: any) => {
        // avoid duplicate same line
        if (prev[0] === payload.commentary) return prev;
        return [payload.commentary, ...prev].slice(0, 100);
      });
    }

    // refresh score/over UI
    fetchInnings();
    fetchLiveData(ongoingInning._id);
  };

  socket.on("scoreUpdate", onScoreUpdate);

  return () => {
    socket.off("scoreUpdate", onScoreUpdate);
  };
}, [ongoingInning?._id]);

  return (
    <div className="details-page design3">
      {/* ─── BACK BUTTON ─── */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* ─── MATCH SCORE HERO SECTION ─── */}
      <div className="match-hero">
        <div className="match-hero__header">
          <div className="match-meta">
            {match.matchType && (
              <span className="meta-badge">{match.matchType.toUpperCase()}</span>
            )}
            <span className={`meta-badge meta-badge--${match.status}`}>
              {match.status.toUpperCase()}
            </span>
          </div>
          <h1 className="match-title-hero">
            {match.teamA.teamname} vs {match.teamB.teamname}
          </h1>
        </div>

        {/* <div className="score-grid-hero">
          {match.innings && match.innings.length > 0 ? (
            match.innings.map((inn: any, idx: number) => (
              <div key={idx} className="score-box-hero">
                <p className="score-label">{inn.battingTeam.teamname}</p>
                <div className="score-display">
                  <span className="score-runs">{inn.totalRuns}</span>
                  <span className="score-slash">/</span>
                  <span className="score-wickets">{inn.totalWickets}</span>
                </div>
                <p className="score-overs">
                  ({inn.oversCompleted}.{inn.ballsInCurrentOver} ov)
                </p>
              </div>
            ))
          ) : (
            <>
              <div className="score-box-hero">
                <p className="score-label">{match.teamA.teamname}</p>
                <div className="score-display">
                  <span className="score-runs">—</span>
                  <span className="score-slash">/</span>
                  <span className="score-wickets">—</span>
                </div>
              </div>
              <div className="score-box-hero">
                <p className="score-label">{match.teamB.teamname}</p>
                <div className="score-display">
                  <span className="score-runs">—</span>
                  <span className="score-slash">/</span>
                  <span className="score-wickets">—</span>
                </div>
              </div>
            </>
          )}
        </div> */}
      
        <div className="score-grid-hero">
  {innings && innings.length > 0 ? (
    innings.map((inn: any, idx: number) => (
      <div key={idx} className="score-box-hero">
        <p className="score-label">{inn.battingTeam.teamname}</p>

        <div className="score-display">
          <span className="score-runs">{inn.totalRuns}</span>
          <span className="score-slash">/</span>
          <span className="score-wickets">{inn.totalWickets}</span>
        </div>

        <p className="score-overs">
          ({inn.oversCompleted}.{inn.ballsInCurrentOver} ov)
        </p>
      </div>
    ))
  ) : (
    <>
      <div className="score-box-hero">
        <p className="score-label">{match.teamA.teamname}</p>
        <div className="score-display">
          <span className="score-runs">—</span>
          <span className="score-slash">/</span>
          <span className="score-wickets">—</span>
        </div>
      </div>

      <div className="score-box-hero">
        <p className="score-label">{match.teamB.teamname}</p>
        <div className="score-display">
          <span className="score-runs">—</span>
          <span className="score-slash">/</span>
          <span className="score-wickets">—</span>
        </div>
      </div>
    </>
  )}
</div>

        {match.winner && (
          <div className="winner-badge">
            {match.winner.teamname} Won
          </div>
        )}
      </div>

      {/* ─── TABS NAVIGATION ─── */}
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === "live" ? "tab-button--active" : ""}`}
          onClick={() => setActiveTab("live")}
        >
          Live Feed
        </button>
        <button
          className={`tab-button ${activeTab === "stats" ? "tab-button--active" : ""}`}
          onClick={() => setActiveTab("stats")}
        >
          Stats
        </button>
        <button
          className={`tab-button ${activeTab === "players" ? "tab-button--active" : ""}`}
          onClick={() => setActiveTab("players")}
        >
          Players
        </button>
      </div>

      {/* ─── TAB CONTENT ─── */}
      <div className="tabs-content">
        {/* LIVE FEED TAB */}
        {activeTab === "live" && (
          <>
            {/* Current Over & Live Players Grid */}
            <div className="live-grid">
              {/* Current Over */}
              <div className="card card-live">
                <h3 className="card-title">Current Over</h3>
                <div className="over-balls-large">
                  {currentOver && currentOver.length > 0 ? (
                    currentOver.slice(-6).map((b: any, i: number) => (
                      <span
                        key={i}
                        className={`ball-item ${
                          b.isWicket ? "ball-wicket" : ""
                        } ${b.extraType ? "ball-extra" : ""}`}
                      >
                        {b.isWicket
                          ? "W"
                          : b.extraType === "wide"
                          ? "Wd"
                          : b.extraType === "no-ball"
                          ? "Nb"
                          : b.runsScored}
                      </span>
                    ))
                  ) : (
                    <span className="no-data">No balls yet</span>
                  )}
                </div>
              </div>

              {/* Live Players */}
              <div className="card card-live">
                <h3 className="card-title">On Field</h3>
                <div className="live-players-compact">
                  {ongoingInning ? (
                    <>
                      {ongoingInning.striker && (
                        <div className="live-player-item">
                          <span className="player-role">🏏 Striker</span>
                          <span className="player-name">
                            {ongoingInning.striker.playername}
                          </span>
                          {/* Get striker stats */}
                          {(() => {
                            const stats = getStats(ongoingInning.striker._id);
                            return stats ? (
                              <span className="player-runs">
                                {stats.battingRuns || 0} ({stats.battingBalls || 0})
                              </span>
                            ) : null;
                          })()}
                        </div>
                      )}
                      {ongoingInning.nonStriker && (
                        <div className="live-player-item">
                          <span className="player-role">🏏 Non-Striker</span>
                          <span className="player-name">
                            {ongoingInning.nonStriker.playername}
                          </span>
                          {/* Get non-striker stats */}
                          {(() => {
                            const stats = getStats(ongoingInning.nonStriker._id);
                            return stats ? (
                              <span className="player-runs">
                                {stats.battingRuns || 0} ({stats.battingBalls || 0})
                              </span>
                            ) : null;
                          })()}
                        </div>
                      )}
                      {ongoingInning.currentBowler && (
                        <div className="live-player-item">
                          <span className="player-role">🎯 Bowler</span>
                          <span className="player-name">
                            {ongoingInning.currentBowler.playername}
                          </span>
                          {/* Get bowler stats */}
                          {(() => {
                            const stats = getStats(ongoingInning.currentBowler._id);
                            if (stats) {
                              const bowlerBalls = stats.bowlingBalls || 0;
                              const overs = `${Math.floor(bowlerBalls / 6)}.${bowlerBalls % 6}`;
                              const wickets = stats.wickets || 0;
                              const runsGiven = stats.runsConceded || 0;
                              return (
                                <span className="player-runs">
                                  {overs} ov | {runsGiven} R | {wickets} W
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="no-data">No ongoing innings</span>
                  )}
                </div>
              </div>
            </div>

            {/* Ball-by-Ball Commentary */}
            <div className="card card-commentary">
              <h3 className="card-title">Ball-by-Ball Commentary</h3>
              <div className="commentary-scroll">
                {commentary && commentary.length > 0 ? (
                  <div className="commentary-list">
                    {commentary.map((c: string, i: number) => (
                      <div key={i} className="commentary-item">
                        <p className="commentary-text">{c}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No commentary yet</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* STATS TAB */}
        {activeTab === "stats" && (
          <>
            {/* Match Info */}
            <div className="card">
              <h3 className="card-title">Match Information</h3>
              <div className="info-rows">
                <div className="info-row">
                  <span className="info-label">Match Type</span>
                  <span className="info-value">
                    {match.matchType ? match.matchType.toUpperCase() : "—"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Status</span>
                  <span className="info-value" style={{textTransform: 'capitalize'}}>
                    {match.status}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Toss Winner</span>
                  <span className="info-value">
                    {match.tossWinner?.teamname ?? "—"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Match Winner</span>
                  <span className="info-value">
                    {match.winner?.teamname ?? "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Innings Details */}
            {match.innings && match.innings.length > 0 && (
              <div className="card">
                <h3 className="card-title">Innings Details</h3>
                <div className="innings-list">
                  {match.innings.map((inn: any) => (
                    <div key={inn._id} className="innings-item">
                      <div className="innings-header-stat">
                        <div>
                          <p className="innings-num">
                            Innings {inn.inningNumber} - {inn.battingTeam.teamname}
                          </p>
                          <p className="innings-score">
                            {inn.totalRuns}/{inn.totalWickets}
                          </p>
                        </div>
                        <div className="innings-meta">
                          <p className="innings-overs">
                            {inn.oversCompleted}.{inn.ballsInCurrentOver} ov
                          </p>
                          <p className={`innings-status innings-status--${inn.status}`}>
                            {inn.status.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      {inn.target && (
                        <div className="innings-target-info">
                          🎯 Target: {inn.target}
                        </div>
                      )}
                      {inn.extras > 0 && (
                        <div className="innings-extras-info">
                          Extras: {inn.extras}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* PLAYERS TAB */}
        {activeTab === "players" && (
          <>
            {/* Team Filter */}
            <div className="team-filter">
              <button
                className={`filter-btn ${selectedTeam === null ? "filter-btn--active" : ""}`}
                onClick={() => setSelectedTeam(null)}
              >
                All Players
              </button>
              {teamsData.map(({ label, id }) => (
                <button
                  key={id}
                  className={`filter-btn ${selectedTeam === id ? "filter-btn--active" : ""}`}
                  onClick={() => setSelectedTeam(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Players Grid */}
            <div className="card">
              <h3 className="card-title">All Players</h3>
              <div className="players-grid-design3">
                {displayTeams.map(({ label, players }) => (
                  <div key={label}>
                    <div className="team-section-title">{label}</div>
                    <div className="player-cards-grid">
                      {players && players.length > 0 ? (
                        players.map((p: any, i: number) => {
                          const stats = getStats(p._id);
                          const runs = stats?.battingRuns || 0;
                          const balls = stats?.battingBalls || 0;
                          const strikeRate =
                            balls > 0 ? ((runs / balls) * 100).toFixed(1) : "0.0";
                          const bowlerBalls = stats?.bowlingBalls || 0;
                          const overs = `${Math.floor(bowlerBalls / 6)}.${bowlerBalls % 6}`;
                          const wickets = stats?.wickets || 0;
                          const runsGiven = stats?.runsConceded || 0;

                          return (
                            <div
                              key={p._id}
                              className="player-card"
                              onClick={() => navigate(`/player-history/${p._id}`)}
                            >
                              <div className="player-card-header">
                                <p className="player-name">{p.playername}</p>
                                <p className="player-number">#{i + 1}</p>
                              </div>

                              <div className="player-stats-row">
                                <div className="stat-box">
                                  <p className="stat-label">Batting</p>
                                  <p className="stat-value">
                                    {runs}({balls})
                                  </p>
                                  <p className="stat-meta">SR: {strikeRate}</p>
                                </div>
                                <div className="stat-box">
                                  <p className="stat-label">Bowling</p>
                                  <p className="stat-value">
                                    {wickets}/{runsGiven}
                                  </p>
                                  <p className="stat-meta">{overs} ov</p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="no-data">No players</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MatchDetails;
