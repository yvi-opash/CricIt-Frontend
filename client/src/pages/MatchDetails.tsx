import axios from "axios";
import "./styles/MatchDetails.css";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getSocket } from "../socket";
import PlayerCard from "../components/PlayerCard";


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
  extraRuns?: number;
}

interface PlayerOfMatchResult {
  playerName: string;
  reason?: string;
}

const URL = import.meta.env.VITE_API_URL;


const MatchDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { matchId } = useParams();

  const [match, setMatch] = useState<any>(state || null);
  const [matchLoading, setMatchLoading] = useState(!state);
  const [scorecard, setScorecard] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"live" | "stats" | "players" | "charts">("live");
  const [innings, setInnings] = useState<Inning[]>([]);
  const [commentary, setCommentary] = useState<string[]>([]);
  const [currentOver, setCurrentOver] = useState<Ball[]>([]);
  const [inningOverRuns, setInningOverRuns] = useState<Record<string, number[]>>({});
  const [playerOfMatch, setPlayerOfMatch] = useState<PlayerOfMatchResult | null>(null);
  const [playerOfMatchLoading, setPlayerOfMatchLoading] = useState(false);

  // Fetch match details
  const fetchMatch = async () => {
    if (!matchId) return;
    try {
      if (!match) setMatchLoading(true);
      const res = await axios.get(`${URL}/api/match/detail/${matchId}`);
      setMatch(res.data);
    } catch (error) {
      console.log("Error fetching match details:", error);
    } finally {
      setMatchLoading(false);
    }
  };

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

      setCommentary((prev) => {
        const newList = incomingCommentary.filter((line: unknown) => typeof line === "string");
        // Merge intelligently to keep AI text if fetch returns generic for same ball
        if (prev.length > 0 && newList.length > 0) {
          const prevTop = prev[0];
          const newTop = newList[0];
          const prevPrefix = prevTop.match(/^Over \d+\.\d+/)?.[0];
          const newPrefix = newTop.match(/^Over \d+\.\d+/)?.[0];
          
          if (prevPrefix === newPrefix && !newTop.includes("run") && prevTop.length > newTop.length) {
             // Keep the existing AI text if the fetched one is a generic placeholder
             return prev;
          }
        }
        return newList;
      });

      const overRes = await axios.get(`${URL}/api/ball/overs/${inningId}`);
      setCurrentOver(overRes.data || []);
    } catch (error) {
      console.log("Live data not available yet");
    }
  };

  // Initial load
  useEffect(() => {
    if (matchId) {
      fetchMatch();
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

  useEffect(() => {
    const completedByStatus = ["finished", "completed"].includes(
      String(state?.status || "").toLowerCase()
    );
    const completedByInnings = innings.length > 0 && innings.every((inn) => inn.status === "completed");
    const isMatchCompleted = completedByStatus || completedByInnings;
    if (!isMatchCompleted || !matchId) return;

    const localFallback = (() => {
      if (!Array.isArray(scorecard) || scorecard.length === 0) return null;

      const ranked = [...scorecard]
        .map((p: any) => {
          const runs = Number(p?.battingRuns || 0);
          const balls = Number(p?.battingBalls || 0);
          const fours = Number(p?.fours || 0);
          const sixes = Number(p?.sixes || 0);
          const wickets = Number(p?.wickets || 0);
          const runsConceded = Number(p?.runsConceded || 0);
          const catches = Number(p?.catches || 0);
          const runOuts = Number(p?.runOuts || 0);
          const strikeRate = balls > 0 ? (runs / balls) * 100 : 0;

          const score =
            runs * 1.2 +
            fours * 0.8 +
            sixes * 1.3 +
            wickets * 22 +
            catches * 8 +
            runOuts * 10 +
            Math.max(0, (strikeRate - 100) * 0.1) -
            runsConceded * 0.15;

          return {
            playerName: p?.playerId?.playername || "Unknown",
            score,
          };
        })
        .sort((a, b) => b.score - a.score);

      if (!ranked[0]?.playerName) return null;
      return {
        playerName: ranked[0].playerName,
        reason: "Selected from batting, bowling, and fielding impact.",
      };
    })();

    if (localFallback) {
      setPlayerOfMatch(localFallback);
    }

    const fetchPlayerOfMatch = async () => {
      try {
        setPlayerOfMatchLoading(true);
        const res = await axios.get(`${URL}/api/ai/player-of-match/${matchId}`);
        if (res.data?.playerName) {
          setPlayerOfMatch(res.data);
        } else if (localFallback) {
          setPlayerOfMatch(localFallback);
        }
      } catch (error) {
        if (localFallback) {
          setPlayerOfMatch(localFallback);
        }
      } finally {
        setPlayerOfMatchLoading(false);
      }
    };

    fetchPlayerOfMatch();
  }, [match?.status, innings, scorecard, matchId]);

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
  if (matchLoading && !match) {
    return <div className="details-loading">Loading match details...</div>;
  }

  if (!match)
    return (
      <div className="details-error">
        <p>No match data found.</p>
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Go Back
        </button>
      </div>
    );

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

  const normalize = (value: string) => (value || "").trim().toLowerCase();
  const teamAName = normalize(match.teamA?.teamname || "");
  const teamBName = normalize(match.teamB?.teamname || "");

  const teamAInning =
    innings.find((inn: any) => normalize(inn.battingTeam?.teamname || "") === teamAName) ||
    innings.find((inn: any) => inn.inningNumber === 1) ||
    innings[0];

  const teamBInning =
    innings.find((inn: any) => normalize(inn.battingTeam?.teamname || "") === teamBName) ||
    innings.find((inn: any) => inn.inningNumber === 2) ||
    innings[1];

  const inningsRunChartData = innings.map((inn: any) => ({
    label: inn.battingTeam?.teamname || `Innings ${inn.inningNumber}`,
    value: Number(inn.totalRuns || 0),
  }));

  const runRateTrendData = innings.map((inn: any) => {
    const completedOvers = Number(inn.oversCompleted || 0);
    const ballsInOver = Number(inn.ballsInCurrentOver || 0);
    const oversBowled = completedOvers + ballsInOver / 6;
    const runRate = oversBowled > 0 ? Number((Number(inn.totalRuns || 0) / oversBowled).toFixed(2)) : 0;

    return {
      label: inn.battingTeam?.teamname || `Innings ${inn.inningNumber}`,
      runRate,
      overs: oversBowled.toFixed(1),
    };
  });

  const calculateOverRuns = (balls: Ball[]) => {
    const overRuns: number[] = [];
    let currentOverRuns = 0;
    let legalBalls = 0;

    balls.forEach((ball: Ball) => {
      currentOverRuns += Number(ball.runsScored || 0) + Number(ball.extraRuns || 0);

      const isLegalBall = ball.extraType !== "wide" && ball.extraType !== "no-ball";
      if (isLegalBall) {
        legalBalls += 1;
      }

      if (legalBalls === 6) {
        overRuns.push(currentOverRuns);
        currentOverRuns = 0;
        legalBalls = 0;
      }
    });

    if (legalBalls > 0 || currentOverRuns > 0) {
      overRuns.push(currentOverRuns);
    }

    return overRuns;
  };

  useEffect(() => {
    const fetchOverRuns = async () => {
      if (!innings.length) {
        setInningOverRuns({});
        return;
      }

      try {
        const overResults = await Promise.allSettled(
          innings.map(async (inn) => {
            const res = await axios.get(`${URL}/api/ball/overs/${inn._id}`);
            const balls = Array.isArray(res.data) ? res.data : [];
            return { inningId: inn._id, runsByOver: calculateOverRuns(balls) };
          })
        );

        const runsMap: Record<string, number[]> = {};
        overResults.forEach((result) => {
          if (result.status === "fulfilled") {
            const { inningId, runsByOver } = result.value;
            runsMap[inningId] = runsByOver;
          }
        });
        setInningOverRuns(runsMap);
      } catch (error) {
        console.log("Unable to fetch over-wise runs");
      }
    };

    fetchOverRuns();
  }, [innings]);

  const teamAOverRuns = teamAInning ? inningOverRuns[teamAInning._id] || [] : [];
  const teamBOverRuns = teamBInning ? inningOverRuns[teamBInning._id] || [] : [];
  const maxOvers = Math.max(teamAOverRuns.length, teamBOverRuns.length);
  const overByOverComparisonData = Array.from({ length: maxOvers }, (_, index) => ({
    over: `Over ${index + 1}`,
    teamA: teamAOverRuns[index] ?? 0,
    teamB: teamBOverRuns[index] ?? 0,
  }));

  const topBatters = [...scorecard]
    .filter((p: any) => Number(p?.battingRuns || 0) > 0)
    .sort((a: any, b: any) => Number(b?.battingRuns || 0) - Number(a?.battingRuns || 0))
    .slice(0, 5)
    .map((p: any) => ({
      label: p.playerId?.playername || "Unknown",
      value: Number(p.battingRuns || 0),
      meta: `${Number(p.battingBalls || 0)} balls`,
    }));

  const topBowlers = [...scorecard]
    .filter((p: any) => Number(p?.wickets || 0) > 0)
    .sort((a: any, b: any) => Number(b?.wickets || 0) - Number(a?.wickets || 0))
    .slice(0, 5)
    .map((p: any) => ({
      label: p.playerId?.playername || "Unknown",
      value: Number(p.wickets || 0),
      meta: `${Number(p.runsConceded || 0)} runs conceded`,
    }));

  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);

  // Voice Commentary function
  const speakCommentary = (text: string, over?: string, score?: string) => {
    if (!isVoiceEnabled || !window.speechSynthesis) return;

    // Stop any current speech
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/^Over \d+\.\d+ - /, "").trim();

    let speechText = "";
    if (over) speechText += `Over ${over}. `;
    speechText += `${cleanText}. `;
    
    if (score) {
      const [r, w] = score.split("/");
      if (r !== undefined && w !== undefined) {
        speechText += `Score is ${r} runs for ${w} wickets.`;
      } else {
        speechText += `Score is ${score}.`;
      }
    }

    const utterance = new SpeechSynthesisUtterance(speechText);
    
    // Select a female voice
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v => 
      v.name.toLowerCase().includes('female') || 
      v.name.toLowerCase().includes('zira') || 
      v.name.toLowerCase().includes('google uk english f') ||
      v.name.toLowerCase().includes('samantha') ||
      v.name.toLowerCase().includes('victoria')
    );
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.rate = 0.95; // Slightly faster for a more natural female tone
    utterance.pitch = 1.1; // Slightly higher pitch
    window.speechSynthesis.speak(utterance);
  };

  // --------- socket.io (lazy connect — only on this page)
  useEffect(() => {
    if (!ongoingInning?._id) return;

    const s = getSocket();
    s.emit("joinInning", ongoingInning._id);

    const onScoreUpdate = (payload: any) => {
      if (payload?.inningId && payload.inningId !== ongoingInning._id) return;

      if (payload?.commentary) {
        setCommentary((prev: any) => {
          if (prev[0] === payload.commentary) return prev;
          return [payload.commentary, ...prev].slice(0, 100);
        });
        
        // Initial voice for score update if it has commentary
        speakCommentary(payload.commentary, payload.score?.overs, `${payload.score?.runs} for ${payload.score?.wickets}`);
      }

      fetchInnings();
      fetchLiveData(ongoingInning._id);
    };

    const onCommentaryUpdate = (payload: any) => {
      if (payload?.inningId && payload.inningId !== ongoingInning._id) return;

      if (payload?.commentary) {
        setCommentary((prev: any) => {
          // Extract "Over X.Y" from the new commentary
          const overMatch = payload.commentary.match(/^Over \d+\.\d+/);
          const currentOverPrefix = overMatch ? overMatch[0] : null;

          if (currentOverPrefix) {
            // Search in top entries to see if we have a placeholder to replace
            const existingIndex = prev.findIndex((c: string) => c.startsWith(currentOverPrefix));
            if (existingIndex !== -1) {
              const updated = [...prev];
              updated[existingIndex] = payload.commentary;
              return updated;
            }
          }

          // fallback: avoid duplicate same line
          if (prev[0] === payload.commentary) return prev;
          return [payload.commentary, ...prev].slice(0, 100);
        });

        // Trigger voice for the detailed AI commentary
        speakCommentary(payload.commentary, payload.overs, payload.score);
      }
    };

    s.on("scoreUpdate", onScoreUpdate);
    s.on("commentaryUpdate", onCommentaryUpdate);

    return () => {
      s.off("scoreUpdate", onScoreUpdate);
      s.off("commentaryUpdate", onCommentaryUpdate);
    };
  }, [ongoingInning?._id, isVoiceEnabled]);

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
            <span className="meta-badge">
              {(match.matchType || match.type || "T20").toUpperCase()}
            </span>
            <span className={`meta-badge meta-badge--${match.status}`}>
              {match.status.toUpperCase()}
            </span>
            <button 
              className={`voice-toggle ${isVoiceEnabled ? 'voice-toggle--active' : ''}`}
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              title={isVoiceEnabled ? "Turn off voice commentary" : "Turn on voice commentary"}
            >
              {isVoiceEnabled ? "🔊 Voice On" : "🔈 Voice Off"}
            </button>
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
        <button
          className={`tab-button ${activeTab === "charts" ? "tab-button--active" : ""}`}
          onClick={() => setActiveTab("charts")}
        >
          Charts
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
                        className={`ball-item ${b.isWicket ? "ball-wicket" : ""
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
                    {commentary.map((c: string, i: number) => {
                      const scoreMatch = c.match(/\(Score: (.*?)\)$/);
                      const overMatch = c.match(/^Over (\d+\.\d+)/);
                      
                      let textOnly = c.replace(/\(Score: (.*?)\)$/, "").trim();
                      if (overMatch) {
                        textOnly = textOnly.replace(/^Over \d+\.\d+ - /, "").trim();
                      }

                      const scoreVal = scoreMatch ? scoreMatch[1] : null;
                      const overVal = overMatch ? overMatch[1] : null;

                      return (
                        <div key={i} className="commentary-item">
                          <div className="commentary-row">
                            <div className="commentary-content">
                               {overVal && <span className="commentary-over-label">{overVal}</span>}
                               <p className="commentary-text">{textOnly}</p>
                            </div>
                            {scoreVal && (
                              <span className="commentary-score">
                                {scoreVal}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
                    {(match.matchType || match.type || "T20").toUpperCase()}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Status</span>
                  <span className="info-value" style={{ textTransform: 'capitalize' }}>
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
            {(
              ["finished", "completed"].includes(String(match?.status || "").toLowerCase()) ||
              (innings.length > 0 && innings.every((inn) => inn.status === "completed"))
            ) && (
                <div className="card">
                  <h3 className="card-title">AI Predicted Player of the Match</h3>
                  {playerOfMatchLoading ? (
                    <p className="no-data">Generating AI decision...</p>
                  ) : playerOfMatch?.playerName ? (
                    <div className="pom-wrap">


                      <p className="pom-name">{playerOfMatch.playerName}</p>
                    </div>
                  ) : (
                    <p className="no-data">Player of the Match not available yet</p>
                  )}
                </div>
              )}

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
                            <PlayerCard
                              key={p._id}
                              playername={p.playername}
                              role={p.role || "Player"}
                              teamName={label}
                              stats={{
                                runs: `${runs}(${balls})`,
                                sr: strikeRate,
                                wickets: wickets,
                                fours: stats?.fours || 0,
                                sixes: stats?.sixes || 0,
                                eco: bowlerBalls > 0 ? (runsGiven / (bowlerBalls / 6)).toFixed(1) : "0.0"
                              }}
                              onClick={() => navigate(`/player-history/${p._id}`)}
                            />
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

        {/* CHARTS TAB */}
        {activeTab === "charts" && (
          <>
            <div className="card">
              <h3 className="card-title">Innings Runs Comparison</h3>
              <div className="chart-list">
                {inningsRunChartData.length > 0 ? (
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={inningsRunChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" name="Runs" radius={[8, 8, 0, 0]}>
                          {inningsRunChartData.map((_, idx) => (
                            <Cell key={`innings-${idx}`} fill="#f97316" />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="no-data">No innings data available</p>
                )}
              </div>
            </div>

            <div className="card">
              <h3 className="card-title">Over-by-Over Runs Comparison</h3>
              <div className="chart-list">
                {overByOverComparisonData.length > 0 ? (
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={overByOverComparisonData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="over" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="teamA"
                          name={match.teamA.teamname}
                          stroke="#0ea5e9"
                          strokeWidth={3}
                          dot={{ r: 4, fill: "#0ea5e9" }}
                          activeDot={{ r: 7 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="teamB"
                          name={match.teamB.teamname}
                          stroke="#f97316"
                          strokeWidth={3}
                          dot={{ r: 4, fill: "#f97316" }}
                          activeDot={{ r: 7 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="no-data">No over-wise data available yet</p>
                )}
              </div>
            </div>

            <div className="live-grid">
              <div className="card">
                <h3 className="card-title">Top Batters</h3>
                <div className="chart-list">
                  {topBatters.length > 0 ? (
                    <>
                      <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={280}>
                          <BarChart data={topBatters}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" name="Runs" radius={[8, 8, 0, 0]}>
                              {topBatters.map((_, idx) => (
                                <Cell key={`bat-${idx}`} fill="#f59e0b" />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="chart-meta-list">
                        {topBatters.map((item) => (
                          <span key={`${item.label}-meta`} className="chart-meta">
                            {item.label}: {item.meta}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="no-data">No batting stats available yet</p>
                  )}
                </div>
              </div>

              <div className="card">
                <h3 className="card-title">Top Bowlers (Wickets)</h3>
                <div className="chart-list">
                  {topBowlers.length > 0 ? (
                    <>
                      <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={280}>
                          <BarChart data={topBowlers}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" name="Wickets" radius={[8, 8, 0, 0]}>
                              {topBowlers.map((_, idx) => (
                                <Cell key={`bowl-${idx}`} fill="#8b5cf6" />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="chart-meta-list">
                        {topBowlers.map((item) => (
                          <span key={`${item.label}-meta`} className="chart-meta">
                            {item.label}: {item.meta}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="no-data">No wicket stats available yet</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MatchDetails;
