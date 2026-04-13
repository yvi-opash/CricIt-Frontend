import axios from "axios";
import "./style/LiveScore.css"


import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { toast } from "react-toastify";


interface Player {
  _id: string;
  playername: string;
}

const URL = import.meta.env.VITE_API_URL;

const LiveScore = () => {
  const { matchId, inningId } = useParams();

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [score, setScore] = useState<any>({});
  const [overBall, setOverBall] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [inningInfo, setInningInfo] = useState<any>({});

  const [matchEnd, setMatchEnd] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);

  const [wicket, setWicket] = useState(false);
  const [overDone, setOverDone] = useState(false);

  const [wicketData, setWicketData] = useState({
    wicketType: "",
    outPlayer: "",
    newBatsman: "",
  });

  const [match, setMatch] = useState<any>({});


  const [newBowler, setNewBowler] = useState("");



  const [scorecard, setScorecard] = useState<any[]>([]);


 


  const loadData = async () => {
    const scoreRes = await axios.get(`${URL}/api/ball/score/${inningId}`);
    setScore(scoreRes.data);

    const overRes = await axios.get(`${URL}/api/ball/overs/${inningId}`);
    setOverBall(overRes.data);

    const playerRes = await axios.get(`${URL}/api/player/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setPlayers(playerRes.data);

    const inningRes = await axios.get(`${URL}/api/inning/${inningId}`);
    setInningInfo(inningRes.data);


    const scorecardRes = await axios.get(`${URL}/api/player/history/match/${matchId}`);
    setScorecard(scorecardRes.data);


    const matchRes = await axios.get(`${URL}/api/match/detail/${matchId}`);
    setMatch(matchRes.data);
  };



  useEffect(() => {
    loadData();
  }, []);




  const addBall = async (data: any) => {
    try {
      const res = await axios.post(
        `${URL}/api/ball/add/${matchId}/${inningId}`,
        data,
      );
      loadData();
      const updatedInning = res.data.inning;
      if (
        updatedInning.ballsInCurrentOver === 0 &&
        updatedInning.status === "ongoing"
      ) {
        setOverDone(true);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to add ball";
      toast.error(msg);
      loadData();
    }
  };




  const undoBall = async () => {
    await axios.delete(`${URL}/api/ball/undo/${inningId}`);
    loadData();
  };





  const confirmWicket = () => {
    addBall({
      isWicket: true,
      wicketType: wicketData.wicketType,
      outPlayer: wicketData.outPlayer,
      newBatsman: wicketData.newBatsman,
    });
    setWicket(false);
  };




  const changeBowler = async () => {
    if (!newBowler) return toast.error("Please select a bowler");

    await axios.put(`${URL}/api/inning/change-bowler/${inningId}`, {
      bowlerId: newBowler,
    });
    setOverDone(false);
    setNewBowler("");
    loadData();
  };



  const Crr = score.overs
    ? (score.runs / parseFloat(score.overs)).toFixed(2)
    : null;



  const rrr =
    inningInfo.target && score.overs
      ? (
        (inningInfo.target - score.runs) /
        (parseFloat(inningInfo.totalOvers) - parseFloat(score.overs))
      ).toFixed(2)
      : null;


  const handleStartSecondInning = async () => {
    const res = await axios.post(`${URL}/api/inning/secstart/${matchId}`);

    const inningId = res.data._id;

    navigate(`/second-inning-setup/${matchId}/${inningId}`);
  };



  const handleEndMatch = async () => {
    try {
      const response = await axios.post(`${URL}/api/match/end/${matchId}`);
      setMatchResult(response.data);
      setMatchEnd(true);
    } catch (error) {
      toast.error("Failed to complete match");

    }
  }


  useEffect(() => {
    if (inningInfo.inningNumber === 2 && inningInfo.start === "completed" && !matchEnd) {
      const timer = setTimeout(() => {
        handleEndMatch();
      }, 3000);
      return () => { clearTimeout(timer) }
    }
  }, [inningInfo, matchEnd])





  const getPlayerStats = (playerId: string) => {
    return scorecard.find(
      (p: any) => p.playerId?._id === playerId
    );
  };

  const getBowlerStats = (playerId: string) => {
    return scorecard.find(
      (p: any) => p.playerId?._id === playerId
    );
  };

  const bowler = inningInfo?.currentBowler;
  const bowlerStats = getBowlerStats(bowler?._id);

  const balls = bowlerStats?.bowlingBalls || 0;

  const overs = `${Math.floor(balls / 6)}.${balls % 6}`;

  const nonStrikerStats = getPlayerStats(inningInfo.nonStriker?._id);
  const strikerStats = getPlayerStats(inningInfo.striker?._id);



  const getBattingPlayers = () => {
    if (!match || !inningInfo) return [];

    return inningInfo.battingTeam === match.teamA?._id
      ? match.playingTeamA
      : match.playingTeamB;
  };

  const getBowlingPlayers = () => {
    if (!match || !inningInfo) return [];

    return inningInfo.bowlingTeam === match.teamA?._id
      ? match.playingTeamA
      : match.playingTeamB;
  };


  return (
    <div className="live-container live-score-page">

      {/* start 222 */}
      {inningInfo.status === "completed" && inningInfo.inningNumber === 1 && (
        <button onClick={handleStartSecondInning} className="undo-btn">
          Start Second Inning
        </button>
      )}

      {/* end match */}


      {inningInfo.status === "completed" && inningInfo.inningNumber === 2 && !matchEnd && (
        <button onClick={handleEndMatch} className="undo-btn">
          End Match
        </button>
      )}


      <div className="live-grid">
        <div className="score-box">
          <h2 className="score-main">
            {score.runs || 0} / {score.wickets || 0}
          </h2>
          <div className="score-right">
            <p className="overs-text">Overs : {score.overs} | {inningInfo.totalOvers}</p>
            {inningInfo.target && (
              <>
                <p className="target-text">Target : {inningInfo.target}</p>
                <p className="rr-text"> RRR : {rrr} </p>
              </>
            )}
            <p className="rr-text">CRR : {Crr} </p>
          </div>
        </div>

        <div className="player-box">
          <p className="player-box-header">At the Crease</p>

          <div className={`player-name striker`}>

            <span className="dot"></span>
            {inningInfo.striker?.playername}
            <span className="on-strike">*</span>

            <span className="player-stats">
              {strikerStats?.battingRuns || 0} ({strikerStats?.battingBalls || 0})
            </span>
          </div>

          <div className="player-name">

            <span className="dot"></span>
            {inningInfo.nonStriker?.playername}

            <span className="player-stats">
              {nonStrikerStats?.battingRuns || 0} ({nonStrikerStats?.battingBalls || 0})
            </span>

          </div>

          <div className="bowler-name">
            <span className="dot"></span>

            {inningInfo.currentBowler?.playername}

            <span className="bowler-stats">
              {overs} ov | {bowlerStats?.runsConceded || 0} R | {bowlerStats?.wickets || 0} W
            </span>
          </div>
        </div>

        <div className="run-buttons-card">
          <p className="run-buttons-title">Add Ball</p>
          <div className="run-buttons">
            {[0, 1, 2, 3, 4, 6].map((r) => (
              <button
                className="run-btn"
                key={r}
                onClick={() => addBall({ runsScored: r })}
              >
                {r}
              </button>
            ))}

            <button className="wicket-btn" onClick={() => setWicket(true)}>
              W
            </button>

            <button
              className="extra-btn"
              onClick={() => addBall({ extraType: "wide", extraRuns: 1 })}
            >
              WD
            </button>

            <button
              className="extra-btn"
              onClick={() => addBall({ extraType: "no-ball", extraRuns: 1 })}
            >
              NB
            </button>

            <button className="undo-btn" onClick={undoBall}>
              ↩ Undo
            </button>
          </div>
        </div>

        <div className="over-box">
          <h3 className="section-title">Current Over</h3>
          <div className="over-balls">
            {overBall.slice(-6).map((b, i) => (
              <span
                className={`ball-item ${b.isWicket ? "is-wicket" : b.runsScored === 4 ? "is-four" : b.runsScored === 6 ? "is-six" : b.extraType === "wide" ? "is-wide" : b.extraType === "no-ball" ? "is-noball" : ""}`}
                key={i}
              >
                {b.isWicket
                  ? "W"
                  : b.extraType === "wide"
                    ? "Wd"
                    : b.extraType === "no-ball"
                      ? "Nb"
                      : b.runsScored}
              </span>
            ))}
          </div>
        </div>

        {/* <div className="scorecard-box">
          <h3 className="section-title">Scorecard</h3>

          {scorecard.map((p: any) => (
            <div className="scorecard-item" key={p._id}>
              {p.playerId?.playername} - {p.battingRuns} ({p.battingBalls})
              
              
            
            </div>
          ))}
        </div> */}

      </div>

      {wicket && (
        <div className="popup-box">
          <div className="popup-card">
            <h3 className="section-title">Wicket Details</h3>

            {/* Wicket Type */}
            <select
              className="select-input"
              onChange={(e) =>
                setWicketData({ ...wicketData, wicketType: e.target.value })
              }
            >
              <option value="">Select Wicket Type</option>
              {[
                "bowled",
                "caught",
                "lbw",
                "run-out",
                "stumped",
                "hit-wicket",
                "retired-out",
              ].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {/* Out Player */}
            <select
              className="select-input"
              onChange={(e) =>
                setWicketData({ ...wicketData, outPlayer: e.target.value })
              }
            >
              <option value="">Select Out Player</option>

              {inningInfo.striker && (
                <option value={inningInfo.striker._id}>
                  {inningInfo.striker.playername}
                </option>
              )}

              {inningInfo.nonStriker && (
                <option value={inningInfo.nonStriker._id}>
                  {inningInfo.nonStriker.playername}
                </option>
              )}
            </select>

            {/* New Batsman */}
            <select
              className="select-input"
              onChange={(e) =>
                setWicketData({ ...wicketData, newBatsman: e.target.value })
              }
            >
              <option value="">Select New Batsman</option>

              {getBattingPlayers().map((p: Player) => (
                <option key={p._id} value={p._id}>
                  {p.playername}
                </option>
              ))}
            </select>

            <button className="confirm-btn" onClick={confirmWicket}>
              Confirm Wicket
            </button>
          </div>
        </div>
      )}

      {overDone && (
        <div className="popup-box">
          <div className="popup-card">
            <h3 className="section-title">Over Complete!</h3>

            <p
              style={{
                color: "var(--muted)",
                fontSize: "13px",
                marginTop: "-8px",
              }}
            >
              Select next bowler
            </p>

            <select
              className="select-input"
              onChange={(e) => setNewBowler(e.target.value)}
              value={newBowler}
            >
              <option value="">Select Bowler</option>

              {getBowlingPlayers().map((p: Player) => (
                <option key={p._id} value={p._id}>
                  {p.playername}
                </option>
              ))}
            </select>

            <button className="confirm-btn" onClick={changeBowler}>
              Confirm Bowler
            </button>
          </div>
        </div>
      )}

      {matchEnd && matchResult && (
        <div className="match-overlay">
          <div className="match-card">

            <h2 className="match-title">Match Completed</h2>

            <div className="match-scores">

              <div className="team-box">
                <h3>{matchResult.firstInning.battingTeamName}</h3>
                <p className="score">
                  {matchResult.firstInning.runs}/{matchResult.firstInning.wickets}
                </p>
                <p className="overs">{matchResult.firstInning.overs} Overs</p>
              </div>

              <div className="vs">VS</div>

              <div className="team-box">
                <h3>{matchResult.secondInning.battingTeamName}</h3>
                <p className="score">
                  {matchResult.secondInning.runs}/{matchResult.secondInning.wickets}
                </p>
                <p className="overs">{matchResult.secondInning.overs} Overs</p>
              </div>

            </div>

            <div className="winner-box">

              <p>{matchResult.resultDescription}</p>
            </div>

            <button onClick={() => navigate("/")} className="cricit-btn-primary">
              Back to Home
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default LiveScore;
