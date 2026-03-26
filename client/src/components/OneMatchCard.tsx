import React from "react";
import { Link } from "react-router-dom";
import './Style/OneMatchCard.css';

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

interface OneMatchCardProps {
  match: Match;
}

const OneMatchCard: React.FC<OneMatchCardProps> = ({ match }) => {
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "status-upcoming";
      case "live":
        return "status-live";
      case "finished":
        return "status-finished";
      default:
        return "status-default";
    }
  };

 
  const getActionButton = () => {
    if (status === "upcoming") {
      return { text: "Start Match", path: `/create-match/${match._id}` };
    } else if (status === "live") {
      return { text: "Live Score", path: `/live-score/${match._id}` };
    } else {
      return { text: "View Details", path: `/match-details/${match._id}` };
    }
  };

  const status = match.status || "upcoming";
  const action = getActionButton();

  return (
    <div className="match-card">
      <div className="match-header">
        <span className={`match-status ${getStatusColor(status)}`}>
          {status.toUpperCase()}
        </span>
        <span className="match-type">{match.matchType?.toUpperCase() || "T20"}</span>
      </div>

      <div className="match-body">
        
        <div className="team-section team-a">
          <div className="team-name">{match.teamA?.teamname || "Team A"}</div>
        </div>

        
        <div className="vs-section">
          <span className="vs-text">vs</span>
        </div>

       
        <div className="team-section team-b">
          <div className="team-name">{match.teamB?.teamname || "Team B"}</div>
        </div>
      </div>

      <div className="match-footer">
        <div className="match-info">
          <div className="info-item">
            <span className="info-label">Venue:</span>
            <span className="info-value">{match.venue || "Not Specified"}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Date:</span>
            <span className="info-value">{formatDate(match.matchDate)}</span>
          </div>
        </div>

        <Link to={action.path} className="match-action-btn">
          {action.text}
        </Link>
      </div>
    </div>
  );
};

export default OneMatchCard;