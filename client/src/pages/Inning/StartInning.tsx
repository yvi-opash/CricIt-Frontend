// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import '../styles/Startinning.css'

// const URL = import.meta.env.VITE_API_URL;

// interface Player {
//   _id: string;
//   playername: string;
// }

// interface Match {
//   _id: string;
//   teamA: { _id: string; teamname: string };
//   teamB: { _id: string; teamname: string };
//   tossWinner: string;
//   tossDecision: "bat" | "bowl";
//   playingTeamA: Player[];
//   playingTeamB: Player[];
//   inningNumber: number;
// }

// const StartInning = () => {
//   const { matchId } = useParams();
//   const token = localStorage.getItem("token");

//   const navigate = useNavigate();

//   const [battingPlayers, setBattingPlayers] = useState<Player[]>([]);
//   const [bowlingPlayers, setBowlingPlayers] = useState<Player[]>([]);

//   const [formData, setFormData] = useState({
//     striker: "",
//     nonStriker: "",
//     currentBowler: "",
//   });

//   useEffect(() => {
//     fetchMatch();
//   }, []);

//   const fetchMatch = async () => {
//     try {
//       const response = await fetch(`${URL}/api/match/detail/${matchId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const match: Match = await response.json();

//       let batting: Player[] = [];
//       let bowling: Player[] = [];

// const opponent =
//   match.tossWinner.toString() !== match.teamA._id.toString()
//     ? match.teamB._id
//     : match.teamA._id;

// const tossWinnerStr = match.tossWinner.toString();
// const teamAStr = match.teamA._id.toString();
// const teamBStr = match.teamB._id.toString();

// if (match.tossDecision === "bat") {
//   if (tossWinnerStr === teamAStr) {
//     batting = match.playingTeamA;    // Team A bats
//     bowling = match.playingTeamB;    // Team B bowls
//   } else {
//     batting = match.playingTeamB;    // Team B bats
//     bowling = match.playingTeamA;    // Team A bowls
//   }
// } else {
//   // When "bowl" is chosen, opponent bats
//   if (tossWinnerStr === teamAStr) {
//     batting = match.playingTeamB;    // Opponent bats
//     bowling = match.playingTeamA;    // Winner bowls
//   } else {
//     batting = match.playingTeamA;
//     bowling = match.playingTeamB;
//   }
// }
// // if (match.tossDecision === "bat") {
// //   batting =
// //     match.tossWinner.toString() === match.teamA._id.toString()
// //       ? match.playingTeamA
// //       : match.playingTeamB;

// //   bowling =
// //     match.tossWinner.toString() === match.teamA._id.toString()
// //       ? match.playingTeamB
// //       : match.playingTeamA;

// // } else {
// //   batting =
// //     opponent.toString() === match.teamA._id.toString()
// //       ? match.playingTeamA
// //       : match.playingTeamB;

// //   bowling =
// //     opponent.toString() === match.teamA._id.toString()
// //       ? match.playingTeamB
// //       : match.playingTeamA;
// // }

// setBattingPlayers(batting);
// setBowlingPlayers(bowling);
//     } catch (error) {
//       console.log("Error loading players");
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const startinning = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (formData.striker === formData.nonStriker) {
//       return alert("Striker and Non-Striker cannot be same");
//     }

//     try {
//       const response = await fetch(`${URL}/api/inning/start/${matchId}`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(formData),
//       });

//       const data = await response.json();
//       const inningId = data.inning._id

//       if (!response.ok) {
//         return alert(data.message);

//       }
//       navigate(`/live-score/${matchId}/${inningId}`)
//       alert("Inning Started Successfully");
//     } catch (error) {
//       alert("Error starting inning");
//     }
//   };

//   return (
//     <div className="page-bg">
//   <div className="form-card">

//     <h2 className="form-title">Start Inning</h2>
//     <div className="title-divider"></div>

//     <form onSubmit={startinning}>

//       <label className="form-label">Striker</label>
//       <select name="striker" onChange={handleChange} className="form-select">
//         <option value="">Select Striker</option>
//         {battingPlayers.map((p) => (
//           <option key={p._id} value={p._id}>
//             {p.playername}
//           </option>
//         ))}
//       </select>

//       <label className="form-label">Non-Striker</label>
//       <select name="nonStriker" onChange={handleChange} className="form-select">
//         <option value="">Select Non-Striker</option>
//         {battingPlayers.map((p) => (
//           <option key={p._id} value={p._id}>
//             {p.playername}
//           </option>
//         ))}
//       </select>

//       <label className="form-label">Opening Bowler</label>
//       <select name="currentBowler" onChange={handleChange} className="form-select">
//         <option value="">Select Opening Bowler</option>
//         {bowlingPlayers.map((p) => (
//           <option key={p._id} value={p._id}>
//             {p.playername}
//           </option>
//         ))}
//       </select>

//       <button type="submit" className="form-btn">
//         Start Inning
//       </button>

//     </form>

//   </div>
// </div>
//   );
// };

// export default StartInning;

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/Startinning.css";

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
  const [loading, setLoading] = useState(true);

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
      const teamBId = match.teamB._id;

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

      // console.log("Toss Winner Team ID:", winnerTeamId);
      // console.log("Team A ID:", teamAId);
      // console.log("Team B ID:", teamBId);
      // console.log("Toss Decision:", match.tossDecision);

      let battingTeamPlayers: Player[] = [];
      let bowlingTeamPlayers: Player[] = [];

      if (match.tossDecision === "bat") {
        if (winnerTeamId === teamAId) {
          battingTeamPlayers = match.playingTeamA;
          bowlingTeamPlayers = match.playingTeamB;
        } else {
          battingTeamPlayers = match.playingTeamB;
          bowlingTeamPlayers = match.playingTeamA;
        }
      } else if (match.tossDecision === "bowl") {
        if (winnerTeamId === teamAId) {
          battingTeamPlayers = match.playingTeamB;
          bowlingTeamPlayers = match.playingTeamA;
        } else {
          battingTeamPlayers = match.playingTeamA;
          bowlingTeamPlayers = match.playingTeamB;
        }
      }

      console.log("Batting Team Players:", battingTeamPlayers);
      console.log("Bowling Team Players:", bowlingTeamPlayers);

      setStrikerOptions(battingTeamPlayers);
      setNonStrikerOptions(battingTeamPlayers);
      setBowlerOptions(bowlingTeamPlayers);

      setLoading(false);
    } catch (error) {
      console.error("Error loading match:", error);
      alert("Error loading match data");
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.striker) {
      alert(" select a striker");
      return;
    }
    if (!formData.nonStriker) {
      alert(" select a non-striker");
      return;
    }
    if (!formData.currentBowler) {
      alert(" select a bowler");
      return;
    }
    if (formData.striker === formData.nonStriker) {
      alert("Striker and Non-Striker must be different players");
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
        alert(data.message || "Failed to start inning");
        return;
      }

      alert("Inning started successfully!");
      const inningId = data.inning._id;
      navigate(`/live-score/${matchId}/${inningId}`);
    } catch (error) {
      console.error("Error:", error);
      alert("Error starting inning");
    }
  };

  if (loading) {
    return (
      <div className="page-bg">
        <div className="form-card">
          <h2 className="form-title">Loading Match Data...</h2>
        </div>
      </div>
    );
  }

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
