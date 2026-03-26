import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/Startinning.css"

const URL = import.meta.env.VITE_API_URL;

interface Player {
  _id: string;
  playername: string;
}

const SecondInningSetup = () => {
  const { matchId, inningId } = useParams();
  const navigate = useNavigate();

  const [battingPlayers, setBattingPlayers] = useState<Player[]>([]);
  const [bowlingPlayers, setBowlingPlayers] = useState<Player[]>([]);

  const [formData, setFormData] = useState({
    striker: "",
    nonStriker: "",
    currentBowler: "",
  });

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      const matchRes = await axios.get(`${URL}/api/match/detail/${matchId}`);
      const inningRes = await axios.get(`${URL}/api/inning/${inningId}`);

      const match = matchRes.data;
      const inning = inningRes.data;

    
      if (inning.battingTeam === match.teamA._id) {
        setBattingPlayers(match.playingTeamA);
        setBowlingPlayers(match.playingTeamB);
      } else {
        setBattingPlayers(match.playingTeamB);
        setBowlingPlayers(match.playingTeamA);
      }
    } catch (err) {
      alert("Error loading players");
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await axios.put(`${URL}/api/inning/set-opening/${inningId}`, formData);

    navigate(`/live-score/${matchId}/${inningId}`);
  };

  return (
    <form onSubmit={handleSubmit} className="page-bg">
  <div className="form-card">

    <h2 className="form-title">Start Chase</h2>
    <div className="title-divider"></div>

    <div>
      <label className="form-label">Striker</label>
      <select
        className="form-select"
        onChange={(e) => setFormData({ ...formData, striker: e.target.value })}
      >
        <option>Select Striker</option>
        {battingPlayers.map((p) => (
          <option key={p._id} value={p._id}>
            {p.playername}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="form-label">Non Striker</label>
      <select
        className="form-select"
        onChange={(e) =>
          setFormData({ ...formData, nonStriker: e.target.value })
        }
      >
        <option>Select Non Striker</option>
        {battingPlayers.map((p) => (
          <option key={p._id} value={p._id}>
            {p.playername}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="form-label">Bowler</label>
      <select
        className="form-select"
        onChange={(e) =>
          setFormData({ ...formData, currentBowler: e.target.value })
        }
      >
        <option>Select Bowler</option>
        {bowlingPlayers.map((p) => (
          <option key={p._id} value={p._id}>
            {p.playername}
          </option>
        ))}
      </select>
    </div>

    <button className="form-btn">Start Chase</button>

  </div>
</form>
  );
};

export default SecondInningSetup;
