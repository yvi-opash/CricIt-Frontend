import { useState, useEffect } from "react";
import './style/Player.css'
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


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

import PlayerCard from "../../components/PlayerCard";

const Player = () => {
  const navigate = useNavigate();
  const [viewType, setViewType] = useState<"table" | "cards">("cards");
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);



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
      toast.success("Player Created");
      setFormData({ playername: "", role: "", tags: "", teamId: "" });
      fetchPlayers();
    } else {
      toast.error(data.msg || "Failed to create player");
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
      toast.success("Player Updated");
      setEditingPlayer(null);
      setFormData({ playername: "", role: "", tags: "", teamId: "" });
      fetchPlayers();
    } else {
      toast.error(data.message || "Update Failed");
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
      toast.success("Player Deleted");
      fetchPlayers();
    }
  };



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
              setFormData({ ...formData, role: e.target.value as PlayerRole })
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
              setFormData({ ...formData, tags: e.target.value as Tag })
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
        <div className="view-header">
          <h2 className="player-title">Player List</h2>
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewType === 'cards' ? 'active' : ''}`}
              onClick={() => setViewType('cards')}
            >
              Cards
            </button>
            <button 
              className={`toggle-btn ${viewType === 'table' ? 'active' : ''}`}
              onClick={() => setViewType('table')}
            >
              Table
            </button>
          </div>
        </div>

        {viewType === 'cards' ? (
          <div className="player-cards-grid">
            {players.map((p, index) => (
              <PlayerCard
                key={p._id}
                playername={p.playername}
                role={p.role}
                teamName={p.teamId?.teamname}
                onClick={() => navigate(`/player-history/${p._id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="table-wrapper">
          <table className="player-table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Role</th>
                <th>Tags</th>
                <th>Team</th>
                <th>History</th>
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
                    <button
                      className="edit-btn"
                      onClick={() => navigate(`/player-history/${p._id}`)}
                    >
                      View
                    </button>

                  </td>

                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(p)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

      </div>



    </div>
  );
};

export default Player;