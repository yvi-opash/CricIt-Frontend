import "../styles/LiveScore.css";

import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const URL = import.meta.env.VITE_API_URL;

const LiveScore = () => {
  const { matchId, inningId } = useParams();

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [score, setScore] = useState<any>({});
  const [overBall, setOverBall] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [inningInfo, setInningInfo] = useState<any>({});
  const [commentry, setCommentry] = useState<string[]>([]);

  const [wicket, setWicket] = useState(false);
  const [overDone, setOverDone] = useState(false);

  const [wicketData, setWicketData] = useState({
    wicketType: "",
    outPlayer: "",
    newBatsman: "",
  });

  const [newBowler, setNewBowler] = useState("");

  const loadData = async () => {
    const scoreRes = await axios.get(`${URL}/api/ball/score/${inningId}`);
    setScore(scoreRes.data);

    const commentryRes = await axios.get(
      `${URL}/api/ball/commentary/${inningId}`,
    );
    setCommentry(commentryRes.data);

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
      alert(msg);
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
    if (!newBowler) return alert("Please select a bowler");

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
          (inningInfo.totalOvers - parseFloat(score.overs))
        ).toFixed(2)
      : null;

  console.log(inningInfo);

  const handleStartSecondInning = async () => {
    const res = await axios.post(`${URL}/api/inning/secstart/${matchId}`);

    const inningId = res.data.inning._id;

    navigate(`/second-inning-setup/${matchId}/${inningId}`);
  };
  return (
    <div className="live-container">
      <h1 className="live-title">Live Score</h1>

      <div className="live-grid">
        <div className="score-box">
          <h2 className="score-main">
            {score.runs || 0} / {score.wickets || 0}
          </h2>
          <div className="score-right">
            <p className="overs-text">Overs : {score.overs}</p>
            {inningInfo.target && (
              <>
                <p className="target-text">Target : {inningInfo.target}</p>
                <p className="rr-text"> | RRR : {rrr}</p>
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
          </div>

          <div className="player-name">
            <span className="dot"></span>
            {inningInfo.nonStriker?.playername}
          </div>

          <div className="bowler-name">
            <span className="dot"></span>
            <span className="bowler-label">Bowling —&nbsp;</span>
            {inningInfo.currentBowler?.playername}
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
              ↩ Undo Last Ball
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

        <div className="scorecard-box">
          <h3 className="section-title">Scorecard</h3>
          {inningInfo.batsmen?.map((player: any) => (
            <div className="scorecard-row" key={player._id}>
              <span>{player.name}</span>
              <span>
                {player.runs} ({player.balls})
              </span>
            </div>
          ))}
          {inningInfo.status === "completed" &&
            inningInfo.inningNumber === 1 && (
              <button onClick={handleStartSecondInning} className="undo-btn">
                Start Second Inning
              </button>
            )}
        </div>

        <div className="commentry-box">
          <h3 className="section-title">Commentary</h3>
          {commentry.map((c, i) => (
            <p className="comment-line" key={i}>
              {" "}
              {c}
            </p>
          ))}
        </div>
      </div>

      {wicket && (
        <div className="popup-box">
          <div className="popup-card">
            <h3 className="section-title">Wicket Details</h3>

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

            <select
              className="select-input"
              onChange={(e) =>
                setWicketData({ ...wicketData, newBatsman: e.target.value })
              }
            >
              <option value="">Select New Batsman</option>
              {players
                .filter((p) => p.teamId?._id === inningInfo.battingTeam)
                .map((p) => (
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
              {players
                .filter((p) => p.teamId?._id === inningInfo.bowlingTeam)
                .map((p) => (
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
    </div>
  );
};

export default LiveScore;
