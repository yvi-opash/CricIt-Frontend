import axios from "axios";
import "./styles/MatchDetailsDesign3.css";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

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

const MatchDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { matchId } = useParams();

  const [scorecard, setScorecard] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"live" | "stats" | "players">("live");
  const [innings, setInnings] = useState<Inning[]>([]);
  const [commentary, setCommentary] = useState<string[]>([]);
  const [currentOver, setCurrentOver] = useState<Ball[]>([]);

  const fetchScorecard = async () => {
    const res = await fetch(`${URL}/api/player/history/match/${matchId}`);
    const data = await res.json();
    setScorecard(data);
  };

  const fetchInnings = async () => {
    const res = await axios.get(`${URL}/api/inning/match/${matchId}`);
    setInnings(res.data);
  };

  const fetchLiveData = async (inningId: string) => {
    if (!inningId) return;

    try {
      const commentRes = await axios.get(
        `${URL}/api/ball/commentary/${inningId}`
      );
      setCommentary(commentRes.data);

      const overRes = await axios.get(`${URL}/api/ball/overs/${inningId}`);
      setCurrentOver(overRes.data);
    } catch (error) {
      console.log("Live data not available yet");
    }
  };

  useEffect(() => {
    if (matchId) {
      fetchScorecard();
      fetchInnings();
    }
  }, [matchId]);

  useEffect(() => {
    if (innings.length > 0) {
      const last = innings[innings.length - 1];
      fetchLiveData(last._id);
    }
  }, [innings]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (innings.length > 0) {
        const last = innings[innings.length - 1];
        fetchLiveData(last._id);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [innings]);

  const getStats = (playerId: string) => {
    return scorecard.find((p: any) => p.playerId?._id === playerId);
  };

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

  const teamsData = [
    { label: match.teamA.teamname, id: match.teamA._id, players: match.playingTeamA },
    { label: match.teamB.teamname, id: match.teamB._id, players: match.playingTeamB },
  ];

  const displayTeams = selectedTeam
    ? teamsData.filter((t) => t.id === selectedTeam)
    : teamsData;

  const latestInning = innings[innings.length - 1];
  const ongoingInning = match.innings?.find((inn: any) => inn.status === "ongoing");

  // Get all players for player cards
  const allPlayers = [...(match.playingTeamA || []), ...(match.playingTeamB || [])];

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

        <div className="score-grid-hero">
          <div className="score-box-hero">
            <p className="score-label">{match.teamA.teamname}</p>
            <div className="score-display">
              <span className="score-runs">
                {match.teamAScore?.runs || "—"}
              </span>
              <span className="score-slash">/</span>
              <span className="score-wickets">
                {match.teamAScore?.wickets || "—"}
              </span>
            </div>
            <p className="score-overs">
              {match.teamAScore?.overs ? `${match.teamAScore.overs} overs` : ""}
            </p>
          </div>

          <div className="score-box-hero">
            <p className="score-label">{match.teamB.teamname}</p>
            <div className="score-display">
              <span className="score-runs">
                {match.teamBScore?.runs || "—"}
              </span>
              <span className="score-slash">/</span>
              <span className="score-wickets">
                {match.teamBScore?.wickets || "—"}
              </span>
            </div>
            <p className="score-overs">
              {match.teamBScore?.overs ? `${match.teamBScore.overs} overs` : ""}
            </p>
          </div>
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
                        </div>
                      )}
                      {ongoingInning.nonStriker && (
                        <div className="live-player-item">
                          <span className="player-role">🏏 Non-Striker</span>
                          <span className="player-name">
                            {ongoingInning.nonStriker.playername}
                          </span>
                        </div>
                      )}
                      {ongoingInning.currentBowler && (
                        <div className="live-player-item">
                          <span className="player-role">🎯 Bowler</span>
                          <span className="player-name">
                            {ongoingInning.currentBowler.playername}
                          </span>
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

// import axios from "axios";
// import "./styles/MatchDetails.css";
// import { useEffect, useState } from "react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";

// interface Inning {
//   _id: string;
//   inningNumber: number;
//   totalRuns: number;
//   totalWickets: number;
//   oversCompleted: number;
//   ballsInCurrentOver: number;
//   striker?: { playername: string };
//   nonStriker?: { playername: string };
//   currentBowler?: { playername: string };
//   status: string;
//   target?: number;
// }

// interface Ball {
//   isWicket: boolean;
//   extraType?: string;
//   runsScored: number;
// }

// const URL = import.meta.env.VITE_API_URL;

// const MatchDetails = () => {
//   const { state } = useLocation();
//   const navigate = useNavigate();
//   const { matchId } = useParams();

//   const [scorecard, setScorecard] = useState<any[]>([]);
//   const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

//   const fetchScorecard = async () => {
//     const res = await fetch(`${URL}/api/player/history/match/${matchId}`);
//     const data = await res.json();
//     setScorecard(data);
//   };

//   useEffect(() => {
//     if (matchId) fetchScorecard();
//   }, [matchId]);

//   const getStats = (playerId: string) => {
//     return scorecard.find((p: any) => p.playerId?._id === playerId);
//   };

//   if (!state)
//     return (
//       <div className="details-error">
//         <p>No match data found.</p>
//         <button className="back-btn" onClick={() => navigate(-1)}>
//           ← Go Back
//         </button>
//       </div>
//     );

//   const match = state;

//   // Determine which team's players to show
//   const teamsData = [
//     { label: match.teamA.teamname, id: match.teamA._id, players: match.playingTeamA },
//     { label: match.teamB.teamname, id: match.teamB._id, players: match.playingTeamB },
//   ];

//   // Filter based on selected team
//   const displayTeams = selectedTeam
//     ? teamsData.filter((t) => t.id === selectedTeam)
//     : teamsData;


// const [innings, setInnings] = useState<Inning[]>([]);

// const fetchInnings = async () => {
//   const res = await axios.get(`${URL}/api/inning/match/${matchId}`);
//   setInnings(res.data);
// };

// const latestInning = innings[innings.length - 1];
// const inningId = latestInning?._id;



// const [commentary, setCommentary] = useState<string[]>([]);
// const [currentOver, setCurrentOver] = useState<Ball[]>([]);

// const fetchLiveData = async (inningId: string) => {
//   if (!inningId) return;

//   const commentRes = await axios.get(
//     `${URL}/api/ball/commentary/${inningId}`
//   );
//   setCommentary(commentRes.data);

//   const overRes = await axios.get(
//     `${URL}/api/ball/overs/${inningId}`
//   );
//   setCurrentOver(overRes.data);
// };

// useEffect(() => {
//   fetchInnings();
// }, []);

// useEffect(() => {
//   if (innings.length > 0) {
//     const last = innings[innings.length - 1];
//     fetchLiveData(last._id);
//   }
// }, [innings]);

// useEffect(() => {
//   const interval = setInterval(() => {
//     if (innings.length > 0) {
//       const last = innings[innings.length - 1];
//       fetchLiveData(last._id);
//     }
//   }, 3000); 

//   return () => clearInterval(interval);
// }, [innings]);


// return (
//     <div className="details-page">
 
//       {/* ─── LIVE INFO SECTION (Top) ─── */}
      
 
//       {/* ─── BACK BUTTON ─── */}
//       <button className="back-btn" onClick={() => navigate(-1)}>
//         ← Back
//       </button>
 
//       {/* ─── MATCH TITLE ─── */}
//       <div className="details-title-block">
//         <h2 className="details-title">
//           {match.teamA.teamname}
//           <span className="details-vs">vs</span>
//           {match.teamB.teamname}
//         </h2>
//         <div className="details-meta">
//           {match.matchType && (
//             <span className="badge badge--type">
//               {match.matchType.toUpperCase()}
//             </span>
//           )}
//           <span className={`badge badge--${match.status}`}>
//             {match.status.toUpperCase()}
//           </span>
//         </div>
//       </div>
 
//       {/* ─── INFO CARD (Toss, Winner) ─── */}
//       <div className="details-card">
//         <div className="info-grid">
//           <div className="info-item">
//             <span className="info-label">Toss Winner</span>
//             <span className="info-value">
//               {match.tossWinner?.teamname ?? "—"}
//             </span>
//           </div>
//           <div className="info-item">
//             <span className="info-label">Match Winner</span>
//             <span
//               className={`info-value ${match.winner ? "info-value--winner" : ""}`}
//             >
//               {match.winner?.teamname ?? "—"}
//             </span>
//           </div>
//         </div>
//       </div>
 
//       {/* ─── SCORE CARDS ─── */}
//       {(match.teamAScore || match.teamBScore) && (
//         <div className="scores-row">
//           {[
//             { team: match.teamA, score: match.teamAScore },
//             { team: match.teamB, score: match.teamBScore },
//           ].map(
//             ({ team, score }) =>
//               score && (
//                 <div
//                   key={team._id}
//                   className={`score-card ${
//                     match.winner?._id === team._id ? "score-card--winner" : ""
//                   }`}
//                 >
//                   {match.winner?._id === team._id && (
//                     <span className="score-card__winner-tag">Winner</span>
//                   )}
//                   <p className="score-card__team">{team.teamname}</p>
//                   <p className="score-card__runs">
//                     {score.runs}
//                     <span className="score-card__wickets">/{score.wickets}</span>
//                   </p>
//                   <p className="score-card__overs">{score.overs} overs</p>
//                 </div>
//               )
//           )}
//         </div>
//       )}
 
//       {/* ─── INNINGS DETAILS ─── */}
//       {match.innings && match.innings.length > 0 && (
//         <div className="innings-section">
//           <h3 className="section-title">🏏 Innings</h3>
 
//           <div className="innings-cards-grid">
//             {match.innings.map((inn: any) => (
//               <div key={inn._id} className="innings-card">
//                 <div className="innings-header">
//                   <span className="innings-label">
//                     <strong>Innings {inn.inningNumber}</strong>
//                     <span className="innings-label-sub">
//                       {inn.battingTeam.teamname}
//                     </span>
//                   </span>
//                   <span className={`badge badge--status badge--${inn.status}`}>
//                     {inn.status.toUpperCase()}
//                   </span>
//                 </div>
 
//                 <div className="innings-score-row">
//                   <span className="innings-runs">
//                     {inn.totalRuns}
//                     <span className="innings-wickets">/{inn.totalWickets}</span>
//                   </span>
//                   <span className="innings-overs">
//                     ({inn.oversCompleted}.{inn.ballsInCurrentOver} ov)
//                   </span>
//                 </div>
 
//                 {inn.extras > 0 && (
//                   <div className="innings-extras">Extras: {inn.extras}</div>
//                 )}
 
//                 {inn.target !== undefined && (
//                   <div className="innings-target">
//                     🎯 Target: {inn.target}
//                     {inn.status === "ongoing" && (
//                       <span className="innings-target__need">
//                         &nbsp;• Need {inn.target - inn.totalRuns} more run
//                         {inn.target - inn.totalRuns !== 1 ? "s" : ""}
//                       </span>
//                     )}
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
 
//           {/* Live Players */}
//           {match.innings?.some((inn: any) => inn.status === "ongoing") && (
//             <div className="innings-live-info">
//               <p className="innings-live-title">🔴 Live</p>
//               <div className="live-players-grid">
//                 {match.innings.map((inn: any) =>
//                   inn.status === "ongoing" && (
//                     <div key={`${inn._id}-live`}>
//                       {inn.striker && (
//                         <div className="live-player">
//                           <span className="live-player__icon">🏏</span>
//                           <span className="live-player__name">
//                             {inn.striker.playername}
//                           </span>
//                           <span className="live-player__role">striker</span>
//                         </div>
//                       )}
//                       {inn.nonStriker && (
//                         <div className="live-player">
//                           <span className="live-player__icon">🏏</span>
//                           <span className="live-player__name">
//                             {inn.nonStriker.playername}
//                           </span>
//                           <span className="live-player__role">non-striker</span>
//                         </div>
//                       )}
//                       {inn.currentBowler && (
//                         <div className="live-player">
//                           <span className="live-player__icon">🎯</span>
//                           <span className="live-player__name">
//                             {inn.currentBowler.playername}
//                           </span>
//                           <span className="live-player__role">bowling</span>
//                         </div>
//                       )}
//                     </div>
//                   )
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       )}


//       <div className="live-info-container">
        
//         {/* Current Over */}
//         <div className="over-box">
//           <h3>Current Over</h3>
//           <div className="over-balls">
//             {currentOver && currentOver.length > 0 ? (
//               currentOver.slice(-6).map((b: any, i: number) => (
//                 <span key={i}>
//                   {b.isWicket
//                     ? "W"
//                     : b.extraType === "wide"
//                     ? "Wd"
//                     : b.extraType === "no-ball"
//                     ? "Nb"
//                     : b.runsScored}
//                 </span>
//               ))
//             ) : (
//               <span style={{ color: "#999", fontSize: "12px" }}>No balls yet</span>
//             )}
//           </div>
//         </div>
 
//         {/* Live Commentary */}
//         <div className="commentary-box">
//           <h3>Live Commentary</h3>
//           {commentary && commentary.length > 0 ? (
//             <div className="commentary-list">
//               {commentary.map((c: string, i: number) => (
//                 <p key={i}>{c}</p>
//               ))}
//             </div>
//           ) : (
//             <p style={{ color: "#999", fontSize: "12px" }}>No commentary yet</p>
//           )}
//         </div>
//       </div>
 
//       {/* ─── TEAM FILTER TABS ─── */}
//       <div className="team-filter-tabs">
//         {teamsData.map(({ label, id }) => (
//           <button
//             key={id}
//             className={`filter-tab ${selectedTeam === id ? "filter-tab--active" : ""}`}
//             onClick={() => setSelectedTeam(id)}
//           >
//             {label}
//           </button>
//         ))}
//       </div>
 
//       {/* ─── PLAYERS GRID ─── */}
//       <div className="players-grid">
//         {displayTeams.map(({ label, players }) => (
//           <div key={label} className="details-card">
//             <h3 className="section-title">{label.toUpperCase()}</h3>
//             <div className="section-divider" />
 
//             {players && players.length > 0 ? (
//               players.map((p: any, i: number) => {
//                 const stats = getStats(p._id);
 
//                 const runs = stats?.battingRuns || 0;
//                 const balls = stats?.battingBalls || 0;
//                 const strikeRate =
//                   balls > 0 ? ((runs / balls) * 100).toFixed(1) : "0.0";
 
//                 const bowlerBalls = stats?.bowlingBalls || 0;
//                 const overs = `${Math.floor(bowlerBalls / 6)}.${bowlerBalls % 6}`;
//                 const wickets = stats?.wickets || 0;
//                 const runsGiven = stats?.runsConceded || 0;
 
//                 return (
//                   <div key={p._id} className="player-row">
//                     <span className="player-row__num">{i + 1}</span>
 
//                     <span
//                       className="player-row__name"
//                       onClick={() => navigate(`/player-history/${p._id}`)}
//                     >
//                       {p.playername}
//                     </span>
 
//                     <span className="player-batting">
//                       {runs} ({balls}) | SR: {strikeRate}
//                     </span>
 
//                     <span className="player-bowling">
//                       {overs} ov | {runsGiven} R | {wickets} W
//                     </span>
//                   </div>
//                 );
//               })
//             ) : (
//               <p className="players-empty">No players</p>
//             )}
//           </div>
//         ))}
//       </div>
 
//     </div>
//   );
// };

// export default MatchDetails;

// import "./styles/MatchDetails.css";
// import { useEffect, useState } from "react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import axios from "axios";

// const URL = import.meta.env.VITE_API_URL;

// const MatchDetails = () => {
//   const { state } = useLocation();
//   const navigate = useNavigate();
//   const { matchId } = useParams();

//   const [scorecard, setScorecard] = useState<any[]>([]);
//   const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

//   // ✅ NEW STATES
//   const [innings, setInnings] = useState<any[]>([]);
//   const [commentary, setCommentary] = useState<string[]>([]);
//   const [currentOver, setCurrentOver] = useState<any[]>([]);

//   // ---------------- SCORECARD ----------------
//   const fetchScorecard = async () => {
//     const res = await fetch(`${URL}/api/player/history/match/${matchId}`);
//     const data = await res.json();
//     setScorecard(data);
//   };

//   // ---------------- INNINGS ----------------
//   const fetchInnings = async () => {
//     const res = await axios.get(`${URL}/api/inning/match/${matchId}`);
//     setInnings(res.data);
//   };

//   // ---------------- LIVE DATA ----------------
//   const fetchLiveData = async (inningId: string) => {
//     if (!inningId) return;

//     const commentRes = await axios.get(
//       `${URL}/api/ball/commentary/${inningId}`
//     );
//     setCommentary(commentRes.data);

//     const overRes = await axios.get(
//       `${URL}/api/ball/overs/${inningId}`
//     );
//     setCurrentOver(overRes.data);
//   };

//   // ---------------- LOAD ----------------
//   useEffect(() => {
//     if (matchId) {
//       fetchScorecard();
//       fetchInnings();
//     }
//   }, [matchId]);

//   // fetch live data
//   useEffect(() => {
//     if (innings.length > 0) {
//       const latest = innings[innings.length - 1];
//       fetchLiveData(latest._id);
//     }
//   }, [innings]);

//   // 🔥 AUTO REFRESH
//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (innings.length > 0) {
//         const latest = innings[innings.length - 1];
//         fetchLiveData(latest._id);
//       }
//     }, 3000);

//     return () => clearInterval(interval);
//   }, [innings]);

//   const getStats = (playerId: string) => {
//     return scorecard.find((p: any) => p.playerId?._id === playerId);
//   };

//   if (!state)
//     return (
//       <div className="details-error">
//         <p>No match data found.</p>
//         <button className="back-btn" onClick={() => navigate(-1)}>
//           ← Go Back
//         </button>
//       </div>
//     );

//   const match = state;

//   const teamsData = [
//     { label: match.teamA.teamname, id: match.teamA._id, players: match.playingTeamA },
//     { label: match.teamB.teamname, id: match.teamB._id, players: match.playingTeamB },
//   ];

//   const displayTeams = selectedTeam
//     ? teamsData.filter((t) => t.id === selectedTeam)
//     : teamsData;

//   return (
//     <div className="details-page">

//       <button className="back-btn" onClick={() => navigate(-1)}>
//         ← Back
//       </button>

//       <div className="details-title-block">
//         <h2 className="details-title">
//           {match.teamA.teamname} <span className="details-vs">vs</span> {match.teamB.teamname}
//         </h2>
//       </div>

//       {/* ================= LIVE SECTION ================= */}
//       {innings.length > 0 && (
//         <div className="live-section">

//           {/* 🔥 CURRENT OVER */}
//           <div className="over-box">
//             <h3>Current Over</h3>

//             <div className="over-balls">
//               {currentOver.slice(-6).map((b, i) => (
//                 <span key={i} className="ball">
//                   {b.isWicket
//                     ? "W"
//                     : b.extraType === "wide"
//                     ? "Wd"
//                     : b.extraType === "no-ball"
//                     ? "Nb"
//                     : b.runsScored}
//                 </span>
//               ))}
//             </div>
//           </div>

//           {/* 🔥 COMMENTARY */}
//           <div className="commentary-box">
//             <h3>Live Commentary</h3>

//             {commentary.length === 0 ? (
//               <p>No commentary yet</p>
//             ) : (
//               commentary.map((c, i) => (
//                 <p key={i}>{c}</p>
//               ))
//             )}
//           </div>
//         </div>
//       )}

//       {/* ================= PLAYERS ================= */}
//       <div className="team-filter-tabs">
//         {teamsData.map(({ label, id }) => (
//           <button
//             key={id}
//             className={`filter-tab ${selectedTeam === id ? "active" : ""}`}
//             onClick={() => setSelectedTeam(id)}
//           >
//             {label}
//           </button>
//         ))}
//       </div>

//       <div className="players-grid">
//         {displayTeams.map(({ label, players }) => (
//           <div key={label} className="details-card">
//             <h3>{label}</h3>

//             {players.map((p: any, i: number) => {
//               const stats = getStats(p._id);

//               return (
//                 <div key={p._id} className="player-row">
//                   <span>{i + 1}</span>
//                   <span>{p.playername}</span>

//                   <span>
//                     {stats?.battingRuns || 0} ({stats?.battingBalls || 0})
//                   </span>

//                   <span>
//                     {stats?.wickets || 0}W
//                   </span>
//                 </div>
//               );
//             })}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default MatchDetails;


//   return (
//     <div className="details-page">

//       <div className="over-box">
//   <h3>Current Over</h3>

//   <div className="over-balls">
//     {currentOver.slice(-6).map((b, i) => (
//       <span key={i}>
//         {b.isWicket
//           ? "W"
//           : b.extraType === "wide"
//           ? "Wd"
//           : b.extraType === "no-ball"
//           ? "Nb"
//           : b.runsScored}
//       </span>
//     ))}
//   </div>
// </div>

// <div className="commentary-box">
//   <h3>Live Commentary</h3>

//   {commentary.map((c, i) => (
//     <p key={i}>{c}</p>
//   ))}
// </div>

//       {/* Back Button */}
//       <button className="back-btn" onClick={() => navigate(-1)}>
//         ← Back
//       </button>

//       {/* Title Block */}
//       <div className="details-title-block">
//         <h2 className="details-title">
//           {match.teamA.teamname}
//           <span className="details-vs">vs</span>
//           {match.teamB.teamname}
//         </h2>
//         <div className="details-meta">
//           {match.matchType && (
//             <span className="badge badge--type">
//               {match.matchType.toUpperCase()}
//             </span>
//           )}
//           <span className={`badge badge--${match.status}`}>
//             {match.status.toUpperCase()}
//           </span>
//         </div>
//       </div>

//       {/* Info Card */}
//       <div className="details-card">
//         <div className="info-grid">
//           <div className="info-item">
//             <span className="info-label">Toss Winner</span>
//             <span className="info-value">
//               {match.tossWinner?.teamname ?? "—"}
//             </span>
//           </div>
//           <div className="info-item">
//             <span className="info-label">Match Winner</span>
//             <span
//               className={`info-value ${match.winner ? "info-value--winner" : ""}`}
//             >
//               {match.winner?.teamname ?? "—"}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Score Summary Cards */}
//       {(match.teamAScore || match.teamBScore) && (
//         <div className="scores-row">
//           {[
//             { team: match.teamA, score: match.teamAScore },
//             { team: match.teamB, score: match.teamBScore },
//           ].map(
//             ({ team, score }) =>
//               score && (
//                 <div
//                   key={team._id}
//                   className={`score-card ${
//                     match.winner?._id === team._id ? "score-card--winner" : ""
//                   }`}
//                 >
//                   {match.winner?._id === team._id && (
//                     <span className="score-card__winner-tag">Winner</span>
//                   )}
//                   <p className="score-card__team">{team.teamname}</p>
//                   <p className="score-card__runs">
//                     {score.runs}
//                     <span className="score-card__wickets">/{score.wickets}</span>
//                   </p>
//                   <p className="score-card__overs">{score.overs} overs</p>
//                 </div>
//               )
//           )}
//         </div>
//       )}

//       {/* ─── Innings Details ─── */}
//       {match.innings?.length > 0 && (
//         <div className="innings-section">
//           <h3 className="section-title">🏏 Innings</h3>

//           <div className="innings-cards-grid">
//             {match.innings.map((inn: any) => (
//               <div key={inn._id} className="innings-card">

//                 {/* Innings Header */}
//                 <div className="innings-header">
//                   <span className="innings-label">
//                     <strong>Innings {inn.inningNumber}</strong>
//                     <span className="innings-label-sub">{inn.battingTeam.teamname}</span>
//                   </span>
//                   <span className={`badge badge--status badge--${inn.status}`}>
//                     {inn.status.toUpperCase()}
//                   </span>
//                 </div>

//                 {/* Score */}
//                 <div className="innings-score-row">
//                   <span className="innings-runs">
//                     {inn.totalRuns}
//                     <span className="innings-wickets">/{inn.totalWickets}</span>
//                   </span>
//                   <span className="innings-overs">
//                     ({inn.oversCompleted}.{inn.ballsInCurrentOver} ov)
//                   </span>
//                 </div>

//                 {/* Extras */}
//                 {inn.extras > 0 && (
//                   <div className="innings-extras">
//                     Extras: {inn.extras}
//                   </div>
//                 )}

//                 {/* Target */}
//                 {inn.target !== undefined && (
//                   <div className="innings-target">
//                     🎯 Target: {inn.target}
//                     {inn.status === "ongoing" && (
//                       <span className="innings-target__need">
//                         &nbsp;• Need {inn.target - inn.totalRuns} more run
//                         {inn.target - inn.totalRuns !== 1 ? "s" : ""}
//                       </span>
//                     )}
//                   </div>
//                 )}

//               </div>
//             ))}
//           </div>

//           {/* Live Players Section (below cards if needed) */}
//           {match.innings?.some((inn: any) => inn.status === "ongoing") && (
//             <div className="innings-live-info">
//               <p className="innings-live-title">🔴 Live</p>
//               <div className="live-players-grid">
//                 {match.innings.map((inn: any) =>
//                   inn.status === "ongoing" && (
//                     <div key={`${inn._id}-live`}>
//                       {inn.striker && (
//                         <div className="live-player">
//                           <span className="live-player__icon">🏏</span>
//                           <span className="live-player__name">
//                             {inn.striker.playername}
//                           </span>
//                           <span className="live-player__role">striker</span>
//                         </div>
//                       )}
//                       {inn.nonStriker && (
//                         <div className="live-player">
//                           <span className="live-player__icon">🏏</span>
//                           <span className="live-player__name">
//                             {inn.nonStriker.playername}
//                           </span>
//                           <span className="live-player__role">
//                             non-striker
//                           </span>
//                         </div>
//                       )}
//                       {inn.currentBowler && (
//                         <div className="live-player">
//                           <span className="live-player__icon">🎯</span>
//                           <span className="live-player__name">
//                             {inn.currentBowler.playername}
//                           </span>
//                           <span className="live-player__role">bowling</span>
//                         </div>
//                       )}
//                     </div>
//                   )
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Team Filter Tabs */}
//       <div className="team-filter-tabs">
//         {teamsData.map(({ label, id }) => (
//           <button
//             key={id}
//             className={`filter-tab ${selectedTeam === id ? "filter-tab--active" : ""}`}
//             onClick={() => setSelectedTeam(id)}
//           >
//             {label}
//           </button>
//         ))}
//       </div>

//       {/* Players Grid */}
//       <div className="players-grid">
//         {displayTeams.map(({ label, players }) => (
//           <div key={label} className="details-card">
//             <h3 className="section-title">{label.toUpperCase()}</h3>
//             <div className="section-divider" />

//             {players?.length ? (
//               players.map((p: any, i: number) => {
//                 const stats = getStats(p._id);

//                 const runs = stats?.battingRuns || 0;
//                 const balls = stats?.battingBalls || 0;

//                 const strikeRate =
//                   balls > 0 ? ((runs / balls) * 100).toFixed(1) : "0.0";

//                 const bowlerBalls = stats?.bowlingBalls || 0;
//                 const overs = `${Math.floor(bowlerBalls / 6)}.${bowlerBalls % 6}`;
//                 const wickets = stats?.wickets || 0;
//                 const runsGiven = stats?.runsConceded || 0;

//                 return (
//                   <div key={p._id} className="player-row">

//                     <span className="player-row__num">{i + 1}</span>

//                     <span className="player-row__name"
//                       onClick={() => navigate(`/player-history/${p._id}`)}
//                     >
//                       {p.playername}
//                     </span>

                    
//                     <span className="player-batting">
//                       {runs} ({balls}) | SR: {strikeRate}
//                     </span>

                   
//                     <span className="player-bowling">
//                       {overs} ov | {runsGiven} R | {wickets} W
//                     </span>

//                   </div>
//                 );
//               })
//             ) : (
//               <p className="players-empty">No players</p>
//             )}
//           </div>
//         ))}
//       </div>

//     </div>
//   );
// }