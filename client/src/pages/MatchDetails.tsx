import { useLocation, useNavigate } from "react-router-dom";
import "./styles/MatchDetails.css";

const MatchDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state)
    return (
      <div className="details-error">
        <p>No match data found.</p>
        <button className="back-btn" onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    );

  const match = state;


  
  return (
    <div className="details-page">

      {/* Back */}
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      {/* Title */}
      <div className="details-title-block">
        <h2 className="details-title">
          {match.teamA.teamname}
          <span className="details-vs">vs</span>
          {match.teamB.teamname}
        </h2>
        <div className="details-meta">
          {match.matchType && (
            <span className="badge badge--type">{match.matchType.toUpperCase()}</span>
          )}
          <span className={`badge badge--status badge--${match.status}`}>
            {match.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Info Card */}
      <div className="details-card">
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Toss Winner</span>
            <span className="info-value">{match.tossWinner?.teamname ?? "—"}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Match Winner</span>
            <span className={`info-value ${match.winner ? "info-value--winner" : ""}`}>
              {match.winner?.teamname ?? "—"}
            </span>
          </div>
        </div>
      </div>

      
      {(match.teamAScore || match.teamBScore) && (
        <div className="scores-row">
          {[
            { team: match.teamA, score: match.teamAScore },
            { team: match.teamB, score: match.teamBScore },
          ].map(
            ({ team, score }) =>
              score && (
                <div
                  key={team._id}
                  className={`score-card ${match.winner?._id === team._id ? "score-card--winner" : ""}`}
                >
                  {match.winner?._id === team._id && (
                    <span className="score-card__winner-tag"> Winner</span>
                  )}
                  <p className="score-card__team">{team.teamname}</p>
                  <p className="score-card__runs">
                    {score.runs}
                    <span className="score-card__wickets">/{score.wickets}</span>
                  </p>
                  <p className="score-card__overs">{score.overs} overs</p>
                </div>
              )
          )}
        </div>
      )}







      
      <div className="players-grid">
        {[
          { label: match.teamA.teamname, players: match.playingTeamA },
          { label: match.teamB.teamname, players: match.playingTeamB },
        ].map(({ label, players }) => (
          <div key={label} className="details-card">
            <h3 className="section-title"> {label}</h3>
            <div className="section-divider" />
            {players?.length ? (
              players.map((p: any, i: number) => (
                <div key={p._id} className="player-row">
                  <span className="player-row__num">{i + 1}</span>
                  <span className="player-row__name">{p.playername}</span>
                </div>
              ))
            ) : (
              <p className="players-empty">No player szdfsfdsf</p>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};

export default MatchDetails;