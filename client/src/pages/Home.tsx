import React, { useEffect, useState } from "react";
import OneMatchCard from "../components/OneMatchCard";
import '../pages/styles/Home.css';

const URL = import.meta.env.VITE_API_URL;

interface Team {
  _id: string;
  teamname: string;
}

interface Match {
  _id: string;
  teamA: Team;
  teamB: Team;
  venue: string;
  matchDate: string;
  matchType: string;
  status: string;
  tossWinner?: string;
}

const Home = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const token = localStorage.getItem("token");

  // Fetch all matches
  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${URL}/api/match/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMatches(data);
      } else {
        setError(data.message || "Failed to fetch matches");
      }
    } catch (err) {
      setError(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMatches();
    } else {
      setError("Please login to view matches");
      setLoading(false);
    }
  }, [token]);

  // Filter 
  const filteredMatches =
    filterStatus === "all"
      ? matches
      : matches.filter((match) => match.status === filterStatus);

  return (
    <div className="home-page">
      <div className="home-header">
        <h1 className="home-title">Cricket Matches</h1>
        <p className="home-subtitle">View all upcoming and ongoing matches</p>
      </div>

      
      <div className="filter-section">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            All Matches
          </button>
          <button
            className={`filter-btn ${filterStatus === "upcoming" ? "active" : ""}`}
            onClick={() => setFilterStatus("upcoming")}
          >
            Upcoming
          </button>
          <button
            className={`filter-btn ${filterStatus === "live" ? "active" : ""}`}
            onClick={() => setFilterStatus("live")}
          >
            Live
          </button>
          <button
            className={`filter-btn ${filterStatus === "finished" ? "active" : ""}`}
            onClick={() => setFilterStatus("finished")}
          >
            Finished
          </button>
        </div>
      </div>

     
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading matches...</p>
        </div>
      )}

      
      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
          {token && (
            <button className="retry-btn" onClick={fetchMatches}>
              Retry
            </button>
          )}
        </div>
      )}

      {/* Matches Grid */}
      {!loading && !error && (
        <div className="matches-container">
          {filteredMatches.length > 0 ? (
            <div className="matches-grid">
              {filteredMatches.map((match) => (
                <OneMatchCard key={match._id} match={match} />
              ))}
            </div>
          ) : (
            <div className="no-matches">
              <p>No matches found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;