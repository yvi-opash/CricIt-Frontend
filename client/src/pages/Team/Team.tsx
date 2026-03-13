import { useState, useEffect } from "react";
import CreateTeam from "./CreateTeam";
import { Link } from "react-router-dom";
const URL = import.meta.env.VITE_API_URL;

import '../styles/Team.css'

interface Team {
  _id: string;
  teamname: string;
  createdBy: {
    _id: string;
    username: string;
    email: string;
  };
  createdAt: string;
}

const Team = () => {
  const [teams, setTeams] = useState<Team[]>([]);


  //const navigate = useNavigate();



  const fetchTeams = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${URL}/api/team/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setTeams(data);
        //navigate("/player")
      } else {
        alert(data.msg || "Failed to fetch teams");
      }
    } catch (error) {
      alert("Error: " + error);
    }
  };

  const handleDelete = async (teamId: string) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${URL}/api/team/delete/${teamId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("Team deleted successfully!");
        fetchTeams();
      } else {
        const data = await response.json();
        alert(data.msg || "Failed to delete ");
      }
    } catch (error) {
      alert("Error: " + error);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return (
    <div className="team-page">

  <div className="team-create">
    <CreateTeam />
  </div>

  {/* <div className="team-next">
    <Link to="/player" className="next-btn">Next</Link>
  </div> */}

  <div className="team-list-card">
    <h2 className="team-title">Team List</h2>

    <div className="table-wrapper">
      <table className="team-table">
        <thead>
          <tr>
            <th>Team Name</th>
            <th>Created By</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {teams.map((team) => (
            <tr key={team._id}>
              <td>{team.teamname}</td>
              <td>{team.createdBy.username}</td>
              <td>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(team._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>

  </div>

</div>
  );
};

export default Team;
