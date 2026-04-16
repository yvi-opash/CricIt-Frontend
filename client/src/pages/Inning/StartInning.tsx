import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./style/Startinning.css";
import { toast } from "react-toastify";



const URL = import.meta.env.VITE_API_URL;

interface Player {
  _id: string;
  playername: string;
}

interface Team {
  _id: string;
  teamname: string;
}

interface Match {
  _id: string;
  teamA: Team;
  teamB: Team;
  tossWinner: Team | string;
  tossDecision: "bat" | "bowl";
  playingTeamA: Player[];
  playingTeamB: Player[];
}




const StartInning = () => {
  const { matchId } = useParams();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [strikerOptions, setStrikerOptions] = useState<Player[]>([]);
  const [nonStrikerOptions, setNonStrikerOptions] = useState<Player[]>([]);
  const [bowlerOptions, setBowlerOptions] = useState<Player[]>([]);
  
  const [formData, setFormData] = useState({
    striker: "",
    nonStriker: "",
    currentBowler: "",
  });

  useEffect(() => {
    loadMatchData();
  }, []);


  

  const loadMatchData = async () => {
    try {
      const response = await fetch(`${URL}/api/match/detail/${matchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const match: Match = await response.json();

      const teamAId = match.teamA._id;
      //const teamBId = match.teamB._id;

      let winnerTeamId: string;
      if (
        typeof match.tossWinner === "object" &&
        match.tossWinner &&
        "_id" in match.tossWinner
      ) {
        winnerTeamId = (match.tossWinner as Team)._id;
      } else {
        winnerTeamId = match.tossWinner as string;
      }




      let battingTeamPlayers: Player[] = [];
      let bowlingTeamPlayers: Player[] = [];

      const decision = match.tossDecision || "bat";

      if (decision === "bat") {
        if (winnerTeamId === teamAId) {
          battingTeamPlayers = match.playingTeamA;
          bowlingTeamPlayers = match.playingTeamB;
        } else {
          battingTeamPlayers = match.playingTeamB;
          bowlingTeamPlayers = match.playingTeamA;
        }
      } else if (decision === "bowl") {
        if (winnerTeamId === teamAId) {
          battingTeamPlayers = match.playingTeamB;
          bowlingTeamPlayers = match.playingTeamA;
        } else {
          battingTeamPlayers = match.playingTeamA;
          bowlingTeamPlayers = match.playingTeamB;
        }
      }


      setStrikerOptions(battingTeamPlayers);
      setNonStrikerOptions(battingTeamPlayers);
      setBowlerOptions(bowlingTeamPlayers);

     
    } catch (error) {
      
        toast.error("Error loading match data");
      
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.striker) {
      toast.error("select a striker");
      return;
    }
    if (!formData.nonStriker) {
      toast.error(" select a non-striker");
      return;
    }
    if (!formData.currentBowler) {
      toast.error("select a bowler");
      return;
    }
    if (formData.striker === formData.nonStriker) {
      toast.error("Striker and Non-Striker must be different players");
      return;
    }

    try {
      const response = await fetch(`${URL}/api/inning/start/${matchId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });


      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to start inning");
        return;
      }

      toast.success("Inning started successfully!");
      const inningId = data.inning._id;
      navigate(`/live-score/${matchId}/${inningId}`);
    } catch (error) {
      
      toast.error("Error starting inning");
    }
  };

  return (
    <div className="page-bg">
      <div className="form-card">
        <h2 className="form-title">Start Inning</h2>
        <div className="title-divider"></div>

        <form onSubmit={handleSubmit}>
          <label className="form-label">Striker</label>
          <select
            name="striker"
            onChange={handleChange}
            className="form-select"
            value={formData.striker}
            required
          >
            <option value="">Select Striker</option>
            {strikerOptions.map((player) => (
              <option key={player._id} value={player._id}>
                {player.playername}
              </option>
            ))}
          </select>

          <label className="form-label">Non-Striker</label>
          <select
            name="nonStriker"
            onChange={handleChange}
            className="form-select"
            value={formData.nonStriker}
            required
          >
            <option value="">Select Non-Striker</option>
            {nonStrikerOptions.map((player) => (
              <option key={player._id} value={player._id}>
                {player.playername}
              </option>
            ))}
          </select>

          <label className="form-label">Opening Bowler</label>
          <select
            name="currentBowler"
            onChange={handleChange}
            className="form-select"
            value={formData.currentBowler}
            required
          >
            <option value="">Select Opening Bowler</option>
            {bowlerOptions.map((player) => (
              <option key={player._id} value={player._id}>
                {player.playername}
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