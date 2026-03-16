import { useEffect, useState } from "react";
import axios from "axios";

import '../styles/AllMatch.css'

interface Match {
  _id: string;
  teamA: string;
  teamB: string;
  matchDate: string;
  venue: string;
  status: string;
}

const MatchDetailPage = () => {

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const getMatches = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/match/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      setMatches(res.data);
      setLoading(false);

    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getMatches();
  }, []);

  return (
    <div className="match-page">
      <h1 className="match-title">My Matches</h1>

      {loading ? (
        <p className="loading">Loading Matches...</p>
      ) : matches.length === 0 ? (
        <p className="no-match">No Matches Found</p>
      ) : (
        <div className="table-container">
          <table className="match-table">
            <thead>
              <tr>
                <th>Team A</th>
                <th>Team B</th>
                <th>Date</th>
                <th>Venue</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {matches.map((match) => (
                <tr key={match._id}>
                  <td>{match.teamA}</td>
                  <td>{match.teamB}</td>
                  <td>{new Date(match.matchDate).toLocaleDateString()}</td>
                  <td>{match.venue}</td>
                  <td>
                    <span className={`status ${match.status}`}>
                      {match.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MatchDetailPage;