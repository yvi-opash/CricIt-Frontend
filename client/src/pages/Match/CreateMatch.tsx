import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/CreateMatch.css'


const URL = import.meta.env.VITE_API_URL;

type MatchType = "odi" | "t20" | "box" | "simple";

interface Team {
  _id: string;
  teamname: string;
}
const CreateMatch = () => {
  const matchtypes: MatchType[] = ["odi", "t20", "simple", "box"];

  const navigate = useNavigate();

  const [team, setTeam] = useState<Team[]>([]);
  const [formData, setFormData] = useState<{
    teamA: string;
    teamB: string;
    venue: string;
    matchDate: string;
    matchType: string;
    totalOverInMatch: number;
  }>({
    teamA: "",
    teamB: "",
    venue: "",
    matchDate: "",
    matchType: "",
    totalOverInMatch: 20,
  });

  const token = localStorage.getItem("token");

  const fetchTeam = async () => {
    const responce = await fetch(`${URL}/api/team/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await responce.json();
    setTeam(data);
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();

    const responce = await fetch(`${URL}/api/match/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await responce.json();

    if (responce.ok) {
      alert("match Created");
      setFormData({
        teamA: "",
        teamB: "",
        venue: "",
        matchDate: "",
        matchType: "",
        totalOverInMatch: 20,
      });
      navigate(`/playing-team/${data.match._id}`)
    } else {
      alert(data.msg || "Failed");
    }
  };

  return (
    <div className="match-page">

  <h2 className="match-title">Create New Match</h2>

  <form className="match-form" onSubmit={handleCreateMatch}>

   
    <div className="form-group">
      <label className="match-label">Select Team 1</label>
      <select
        className="match-input"
        value={formData.teamA}
        onChange={(e) =>
          setFormData({ ...formData, teamA: e.target.value })
        }
      >
        <option value="">Select</option>
        {team.map((team) => (
          <option key={team._id} value={team._id}>
            {team.teamname}
          </option>
        ))}
      </select>
    </div>

    
    <div className="form-group">
      <label className="match-label">Select Team 2</label>
      <select
        className="match-input"
        value={formData.teamB}
        onChange={(e) =>
          setFormData({ ...formData, teamB: e.target.value })
        }
      >
        <option value="">Select</option>
        {team.map((team) => (
          <option key={team._id} value={team._id}>
            {team.teamname}
          </option>
        ))}
      </select>
    </div>

    
    <div className="form-group">
      <label className="match-label">Enter Venue</label>
      <input
        className="match-input"
        type="text"
        placeholder="Enter Venue"
        value={formData.venue}
        onChange={(e) =>
          setFormData({ ...formData, venue: e.target.value })
        }
      />
    </div>

    
    <div className="form-group">
      <label className="match-label">Match Date</label>
      <input
        className="match-input"
        type="date"
        value={formData.matchDate}
        onChange={(e) =>
          setFormData({ ...formData, matchDate: e.target.value })
        }
      />
    </div>

   
    <div className="form-group">
      <label className="match-label">Select Match Type</label>
      <select
        className="match-input"
        value={formData.matchType}
        onChange={(e) =>
          setFormData({
            ...formData,
            matchType: e.target.value as MatchType,
          })
        }
      >
        <option value="">Select</option>
        {matchtypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
    </div>

    
    <div className="form-group">
      <label className="match-label">Total Overs</label>
      <input
        className="match-input"
        type="number"
        placeholder="Total Number of Overs"
        value={formData.totalOverInMatch}
        onChange={(e) =>
          setFormData({
            ...formData,
            totalOverInMatch: Number(e.target.value),
          })
        }
      />
    </div>

    <button className="match-btn" type="submit">
      Create Match
    </button>

  </form>

</div>
  );
};

export default CreateMatch;
