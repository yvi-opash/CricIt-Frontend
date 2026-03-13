import  { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import '../styles/PlayingTeam.css'

const URL = import.meta.env.VITE_API_URL;

interface Player {
  _id: string;
  playername: string;
}

interface Match {
  _id: string;
  teamA: {
    _id: string;
    teamname: string;
  };
  teamB: {
    _id: string;
    teamname: string;
  };
}

const PlayingTeamPage = () => {
  const { matchId } = useParams(); //----- Dynamic URL FEtch Kare From All URL

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [match, setMatch] = useState<Match | null>(null);

  const [teamAPlayers, setTeamAPlayers] = useState<Player[]>([]);
  const [teamBPlayers, setTeamBPlayers] = useState<Player[]>([]);

  const [selectedA, setSelectedA] = useState<string[]>([]);
  const [selectedB, setSelectedB] = useState<string[]>([]);

  
  const fetchMatch = async () => {
    const res = await fetch(`${URL}/api/match/detail/${matchId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setMatch(data);
  };

  


  const fetchPlayers = async (teamId: string, type: "A" | "B") => {
    const res = await fetch(`${URL}/api/player/team/${teamId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    console.log(data)

    if (type === "A") setTeamAPlayers(data);
    else setTeamBPlayers(data);
  };

  useEffect(() => {
    fetchMatch();
  }, []);

  useEffect(() => {
    if (match) {
      fetchPlayers(match.teamA._id, "A");
      fetchPlayers(match.teamB._id, "B");
    }
  }, [match]);

  
  const handleSelect = (
    playerId: string,
    teamType: "A" | "B"
  ) => {
    if (teamType === "A") {
      if (selectedA.includes(playerId)) {
        setSelectedA(selectedA.filter((id) => id !== playerId));
      } else {
        if (selectedA.length >= 11) return alert("Only 11 players allowed");
        setSelectedA([...selectedA, playerId]);
      }
    } else {
      if (selectedB.includes(playerId)) {
        setSelectedB(selectedB.filter((id) => id !== playerId));
      } else {
        if (selectedB.length >= 11) return alert("Only 11 players allowed");
        setSelectedB([...selectedB, playerId]);
      }
    }
  };

  

const submitPlayingTeam = async () => {
  if (!match) return;

  // if (selectedA.length !== 11) {
  //   return alert("Team A must have 11 players");
  // }

  // if (selectedB.length !== 11) {
  //   return alert("Team B must have 11 players");
  // }



  const res = await fetch(`${URL}/api/match/team/${matchId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      playingTeamA: selectedA,
      playingTeamB: selectedB,
    }),
  });

  const data = await res.json();
  console.log(data);

  if (!res.ok) {
    alert(data.message || "Error selecting team");
    return;
  }

  alert("Playing Team Selwected...");
  navigate(`/toss/${matchId}`);
};


  return (
    <div className="playing-team-page">

  <h2 className="playing-title">Playing Team Selection</h2>

  <div className="playing-container">

    {/* Team A */}
    <div className="team-box">
      <h3 className="team-heading">Team A Players</h3>

      {teamAPlayers.map((p) => (
        <div key={p._id} className="player-row">
          <input
            className="player-checkbox"
            type="checkbox"
            onChange={() => handleSelect(p._id, "A")}
          />
          <span className="player-name">{p.playername}</span>
        </div>
      ))}

    </div>

    {/* Team B */}
    <div className="team-box">
      <h3 className="team-heading">Team B Players</h3>

      {teamBPlayers.map((p) => (
        <div key={p._id} className="player-row">
          <input
            className="player-checkbox"
            type="checkbox"
            onChange={() => handleSelect(p._id, "B")}
          />
          <span className="player-name">{p.playername}</span>
        </div>
      ))}

    </div>

  </div>

  <button className="submit-playing-btn" onClick={submitPlayingTeam}>
    Submit Playing Team
  </button>

</div>
  );
};

export default PlayingTeamPage;