import { useState, useEffect } from "react";
 import { useParams } from "react-router-dom";
import { getPlayerQuickStats, getPlayerAllMatches } from "../../api/playerStats";
import '../styles/Player.css'


const URL = import.meta.env.VITE_API_URL;

type PlayerRole = "batsman" | "bowler" | "all-rounder" | "";
type Tag = "Player" | "Captain" | "Wise-Captain" | "wicket-keeper" | "";

interface Player {
  _id: string;
  playername: string;
  role: PlayerRole;
  tags: Tag;
  teamId: { _id: string; teamname: string };
}

interface Team {
  _id: string;
  teamname: string;
}

const Player = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);


  const [careerStats, setCareerStats] = useState<any>(null);
  const [matchHistory, setMatchHistory] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");
   const { playerId } = useParams<{ playerId: string }>();



  const [formData, setFormData] = useState<{
    playername: string;
    role: PlayerRole;
    tags: Tag;
    teamId: string;
  }>({
    playername: "",
    role: "",
    tags: "",
    teamId: "",
  });

  const token = localStorage.getItem("token");

  const roles: PlayerRole[] = ["batsman", "bowler", "all-rounder"];
  const tags: Tag[] = ["Player", "Captain", "Wise-Captain", "wicket-keeper"];

 
  const fetchPlayers = async () => {
    const response = await fetch(`${URL}/api/player/all/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (response.ok) setPlayers(data);
  };

  
  const fetchTeams = async () => {
    const response = await fetch(`${URL}/api/team/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (response.ok) setTeams(data);
  };

  useEffect(() => {
    fetchPlayers();
    fetchTeams();
  }, []);


  const handleCreate = async () => {
    const response = await fetch(`${URL}/api/player/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Player Created");
      setFormData({ playername: "", role: "", tags: "",teamId:""});
      fetchPlayers();
    } else {
      alert(data.msg || "Failed");
    }
  };


  const handleEdit = (player: Player) => {
    setEditingPlayer(player);

    setFormData({
      playername: player.playername,
      role: player.role,
      tags: player.tags,
      teamId: player.teamId?._id,
    });
  };


  const handleUpdate = async () => {
    if (!editingPlayer) return;

    const response = await fetch(
      `${URL}/api/player/update/${editingPlayer._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      }
    );

    const data = await response.json();

    if (response.ok) {
      alert("Player Updated");
      setEditingPlayer(null);
      setFormData({ playername: "", role: "", tags: "", teamId: ""});
      fetchPlayers();
    } else {
      alert(data.message || "Update Failed");
    }
  };


  const handleDelete = async (id: string) => {
    const response = await fetch(`${URL}/api/player/delete/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      alert("Player Deleted");
      fetchPlayers();
    }
  };

  //-----------------------player stats

  const fetchPlayerStats = async (playerId: string) => {
    try {
      setStatsLoading(true);
      const statsRes = await getPlayerQuickStats(playerId);
      setCareerStats(statsRes.data.data.careerStats);
      
      const matchRes = await getPlayerAllMatches(playerId);
      setMatchHistory(matchRes.data.data);
      setStatsError("");
    } catch (error: any) {
      setStatsError(error.response?.data?.message || "Failed to fetch stats");
    } finally {
      setStatsLoading(false);
    }
  };
 
  useEffect(() => {
    if (playerId) {
      fetchPlayerStats(playerId);
    }
  }, [playerId]);

  //-----------------------player stats

  return (
    <div className="player-page">

  <div className="player-form-card">
    <h2 className="player-title">
      {editingPlayer ? "Update Player" : "Create Player"}
    </h2>

    <div className="player-form-grid">

      <input
        className="input-field"
        type="text"
        placeholder="Player Name"
        value={formData.playername}
        onChange={(e) =>
          setFormData({ ...formData, playername: e.target.value })
        }
      />

      <select
        className="input-field"
        value={formData.role}
        onChange={(e) =>
          setFormData({ ...formData, role: e.target.value as PlayerRole})
        }
      >
        <option value="">Select Role</option>
        {roles.map((role) => (
          <option key={role} value={role}>{role}</option>
        ))}
      </select>

      <select
        className="input-field"
        value={formData.tags}
        onChange={(e) =>
          setFormData({ ...formData, tags: e.target.value as Tag})
        }
      >
        <option value="">Select Tag</option>
        {tags.map((tag) => (
          <option key={tag} value={tag}>
            {tag === "Wise-Captain" ? "Vice Captain" : tag}
          </option>
        ))}
      </select>

      <select
        className="input-field"
        value={formData.teamId}
        onChange={(e) =>
          setFormData({ ...formData, teamId: e.target.value })
        }
      >
        <option value="">Select Team</option>
        {teams.map((team) => (
          <option key={team._id} value={team._id}>
            {team.teamname}
          </option>
        ))}
      </select>

    </div>

    <div className="player-btn-group">
      {editingPlayer ? (
        <>
          <button className="update-btn" onClick={handleUpdate}>Update</button>
          <button className="cancel-btn" onClick={() => setEditingPlayer(null)}>Cancel</button>
        </>
      ) : (
        <button className="create-btn" onClick={handleCreate}>Create</button>
      )}
    </div>

  </div>

  {/* Player Table */}

  <div className="player-table-card">
    <h2 className="player-title">Player List</h2>

    <div className="table-wrapper">
      <table className="player-table">
        <thead>
          <tr>
            <th>Player</th>
            <th>Role</th>
            <th>Tags</th>
            <th>Team</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {players.map((p) => (
            <tr key={p._id}>
              <td>{p.playername}</td>
              <td>{p.role}</td>
              <td>{p.tags === "Wise-Captain" ? "Vice Captain" : p.tags}</td>
              <td>{p.teamId?.teamname}</td>
              <td>
                <button className="edit-btn" onClick={() => handleEdit(p)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(p._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  </div>

  //-----------------------player stats

  <div className="player-stats-section">
          <h2>Career Statistics</h2>
          
          {statsLoading && <p>Loading stats...</p>}
          {statsError && <p style={{ color: "red" }}>{statsError}</p>}
          
          {careerStats && (
            <div className="stats-grid">
              <div className="stat-card">
                <p className="stat-label">Total Runs</p>
                <p className="stat-value">{careerStats.totalRuns || 0}</p>
              </div>
              
              <div className="stat-card">
                <p className="stat-label">Total Wickets</p>
                <p className="stat-value">{careerStats.totalWickets || 0}</p>
              </div>
              
              <div className="stat-card">
                <p className="stat-label">Matches</p>
                <p className="stat-value">{careerStats.totalMatches || 0}</p>
              </div>
              
              <div className="stat-card">
                <p className="stat-label">Strike Rate</p>
                <p className="stat-value">
                  {careerStats.careerStrikeRate?.toFixed(2) || "0"}%
                </p>
              </div>
            </div>
          )}
          
          {matchHistory.length > 0 && (
            <div className="match-history">
              <h3>Recent Matches</h3>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Runs</th>
                    <th>Wickets</th>
                    <th>Strike Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {matchHistory.map((match: any) => (
                    <tr key={match._id}>
                      <td>{new Date(match.createdAt).toLocaleDateString()}</td>
                      <td>{match.runsScored}</td>
                      <td>{match.wicketsTaken}</td>
                      <td>{match.strikeRate?.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
 //-----------------------player stats

</div>
  );
};

export default Player;