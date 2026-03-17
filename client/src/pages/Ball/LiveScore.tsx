import '../styles/LiveScore.css'

import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const URL = import.meta.env.VITE_API_URL;

const LiveScore = () => {
  const { matchId, inningId } = useParams();

  const token = localStorage.getItem('token')

  const [score, setScore] = useState<any>({});
  const [overBall, setOverBall] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [inningInfo, setInningInfo] = useState<any>({});
  const [commentry, setCommentry] = useState<string[]>([]);

  const [wicket, setWicket] = useState(false);
  const [bowler, setBowler] = useState(false);

  const [wicketData, setWicketData] = useState({
    wicketType: "",
    outPlayer: "",
    newBatsman: "",
  });

  const [newBowler, setNewBowler] = useState("");

  const loadData = async () => {
    const scoreRes = await axios.get(`${URL}/api/ball/score/${inningId}`);
    setScore(scoreRes.data);

    const commentryRes = await axios.get(`${URL}/api/ball/commentary/${inningId}`,  );
    setCommentry(commentryRes.data);

    const overRes = await axios.get(`${URL}/api/ball/overs/${inningId}`);
    setOverBall(overRes.data);

    const playerRes = await axios.get(`${URL}/api/player/all`, {
  headers: {
    Authorization: `Bearer ${token}`
  }
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
      await axios.post(`${URL}/api/ball/add/${matchId}/${inningId}`, data);
      loadData();
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
    await axios.put(`${URL}/api/inning/change-bowler/${inningId}`, {
      bowlerId: newBowler,
    });
    setBowler(false);
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

  return (
    
    <div className="live-container">
  <h1 className="live-title">Live Score</h1>

  <div className="score-box">
    <h2 className="score-main">
      {score.runs || 0} / {score.wickets || 0}
    </h2>
    <p className="overs-text">Overs : {score.overs}</p>

    {inningInfo.target && (
      <>
        <p className="target-text">Target : {inningInfo.target}</p>
        <p className="rr-text">
          RRR : {rrr} || CRR : {Crr}
        </p>
      </>
    )}
  </div>

  <div className="player-box">
    <div className="player-name">{inningInfo.striker?.playername}</div>
    <div className="player-name">{inningInfo.nonStriker?.playername}</div>
    <div className="bowler-name">Bowler : {inningInfo.currentBowler?.playername}</div>
  </div>

  <div className="run-buttons">
    {[0, 1, 2, 3, 4, 6].map((r) => (
      <button className="run-btn" key={r} onClick={() => addBall({ runsScored: r })}>
        {r}
      </button>
    ))}

    <button className="wicket-btn" onClick={() => setWicket(true)}>W</button>

    <button className="extra-btn" onClick={() => addBall({ extraType: "wide", extraRuns: 1 })}>
      WD
    </button>

    <button className="extra-btn" onClick={() => addBall({ extraType: "no-ball", extraRuns: 1 })}>
      NB
    </button>

    <button className="action-btn" onClick={() => setBowler(true)}>Change Bowler</button>

    <button className="undo-btn" onClick={undoBall}>Undo</button>
  </div>

  <div className="over-box">
    <h3 className="section-title">Corrent Over</h3>
    <div className="over-balls">
      {overBall.slice(-6).map((b,i) => (
        <span className="ball-item" key={i}>
          {b.isWicket ? "W" : b.runsScored }
        </span>
      ))}
    </div>
  </div>

  <div className="scorecard-box">
    <h3 className="section-title">Scorecard</h3>
    {inningInfo.batsmen?.map((player: any) => (
      <div className="scorecard-row" key={player._id}>
        {player.name} - {player.runs} ({player.balls})
      </div>
    ))}
  </div>

  <div className="commentry-box">
    <h3 className="section-title">Commentry</h3>
    {commentry.map((c, i) => (
      <p className="comment-line" key={i}>{c}</p>
    ))}
  </div>

  {wicket && (
    <div className="popup-box">
      <h3 className="section-title">Wicket</h3>

      <select className="select-input"
        onChange={(e) =>
          setWicketData({ ...wicketData, outPlayer: e.target.value })
        }
      >
        <option>Select Out Player</option>
        {players.map((p) => (
          <option key={p._id} value={p._id}>
            {p.playername}
          </option>
        ))}
      </select>

      <select className="select-input"
        onChange={(e) =>
          setWicketData({ ...wicketData, newBatsman: e.target.value })
        }
      >
        <option>Select New Batsman</option>
        {players.map((p) => (
          <option key={p._id} value={p._id}>
            {p.playername}
          </option>
        ))}
      </select>

      <button className="confirm-btn" onClick={confirmWicket}>Confirm</button>
    </div>
  )}

  {bowler && (
    <div className="popup-box">
      <h3 className="section-title">Change Bowler</h3>

      <select className="select-input"
        onChange={(e) => setNewBowler(e.target.value)}
        value={newBowler}
      >
        <option>Select Bowler</option>
        {players.map((p) => (
          <option key={p._id} value={p._id}>
            {p.playername}
          </option>
        ))}
      </select>

      <button className="confirm-btn" onClick={changeBowler}>Confirm</button>
    </div>
  )}
</div>
  );
};

export default LiveScore;
