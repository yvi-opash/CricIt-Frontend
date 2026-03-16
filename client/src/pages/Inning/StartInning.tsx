import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import '../styles/Startinning.css'

const URL = import.meta.env.VITE_API_URL;

interface Player {
  _id: string;
  playername: string;
}

interface Match {
  _id: string;
  teamA: { _id: string; teamname: string };
  teamB: { _id: string; teamname: string };
  tossWinner: string;
  tossDecision: "bat" | "bowl";
  playingTeamA: Player[];
  playingTeamB: Player[];
}

const StartInning = () => {
  const { matchId } = useParams();
  const token = localStorage.getItem("token");

  const [battingPlayers, setBattingPlayers] = useState<Player[]>([]);
  const [bowlingPlayers, setBowlingPlayers] = useState<Player[]>([]);

  const [formData, setFormData] = useState({
    striker: "",
    nonStriker: "",
    currentBowler: "",
  });

  useEffect(() => {
    fetchMatch();
  }, []);

  const fetchMatch = async () => {
    try {
      const response = await fetch(`${URL}/api/match/detail/${matchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const match: Match = await response.json();

      let batting: Player[] = [];
      let bowling: Player[] = [];

      const opponent =
        match.tossWinner === match.teamA._id
          ? match.teamB._id
          : match.teamA._id;

      if (match.tossDecision === "bat") {
        batting =
          match.tossWinner === match.teamA._id
            ? match.playingTeamA
            : match.playingTeamB;

        bowling =
          match.tossWinner === match.teamA._id
            ? match.playingTeamB
            : match.playingTeamA;
      } else {
        batting =
          opponent === match.teamA._id
            ? match.playingTeamA
            : match.playingTeamB;

        bowling =
          opponent === match.teamA._id
            ? match.playingTeamB
            : match.playingTeamA;
      }

      setBattingPlayers(batting);
      setBowlingPlayers(bowling);
    } catch (error) {
      console.log("Error loading players");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const startinning = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.striker === formData.nonStriker) {
      return alert("Striker and Non-Striker cannot be same");
    }

    try {
      const response = await fetch(`${URL}/api/inning/create/${matchId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        return alert(data.message);
      }

      alert("Inning Started Successfully");
    } catch (error) {
      alert("Error starting inning");
    }
  };

  return (
    <div className="page-bg">
  <div className="form-card">

    <h2 className="form-title">Start Inning</h2>
    <div className="title-divider"></div>

    <form onSubmit={startinning}>

      <label className="form-label">Striker</label>
      <select name="striker" onChange={handleChange} className="form-select">
        <option value="">Select Striker</option>
        {battingPlayers.map((p) => (
          <option key={p._id} value={p._id}>
            {p.playername}
          </option>
        ))}
      </select>

      <label className="form-label">Non-Striker</label>
      <select name="nonStriker" onChange={handleChange} className="form-select">
        <option value="">Select Non-Striker</option>
        {battingPlayers.map((p) => (
          <option key={p._id} value={p._id}>
            {p.playername}
          </option>
        ))}
      </select>

      <label className="form-label">Opening Bowler</label>
      <select name="currentBowler" onChange={handleChange} className="form-select">
        <option value="">Select Opening Bowler</option>
        {bowlingPlayers.map((p) => (
          <option key={p._id} value={p._id}>
            {p.playername}
          </option>
        ))}
      </select>

      <button type="submit" className="form-btn">
        Start Inning
      </button>

    </form>

  </div>
</div>
  );
};

export default StartInning;
