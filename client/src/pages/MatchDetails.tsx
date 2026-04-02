

import { useLocation, useNavigate } from "react-router-dom";
import "./styles/MatchDetails.css";

const MatchDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state)
    return (
      <div className="details-error">
        <p>No match data found.</p>
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Go Back
        </button>
      </div>
    );

  const match = state;

  return (
    <div className="details-page">

      {/* Back */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* Title */}
      <div className="details-title-block">
        <h2 className="details-title">
          {match.teamA.teamname}
          <span className="details-vs">vs</span>
          {match.teamB.teamname}
        </h2>
        <div className="details-meta">
          {match.matchType && (
            <span className="badge badge--type">
              {match.matchType.toUpperCase()}
            </span>
          )}
          <span className={`badge badge--${match.status}`}>
            {match.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Info Card */}
      <div className="details-card">
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Toss Winner</span>
            <span className="info-value">
              {match.tossWinner?.teamname ?? "—"}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Match Winner</span>
            <span
              className={`info-value ${match.winner ? "info-value--winner" : ""}`}
            >
              {match.winner?.teamname ?? "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Score Summary Cards */}
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
                  className={`score-card ${
                    match.winner?._id === team._id ? "score-card--winner" : ""
                  }`}
                >
                  {match.winner?._id === team._id && (
                    <span className="score-card__winner-tag">Winner</span>
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

      {/* ─── Innings Details ─── */}
      {match.innings?.length > 0 && (
        <div className="innings-section">
          <h3 className="section-title">🏏 Innings</h3>

          {match.innings.map((inn: any) => (
            <div key={inn._id} className="details-card innings-card">

              {/* Innings Header */}
              <div className="innings-header">
                <span className="innings-label">
                  Innings {inn.inningNumber} —{" "}
                  <strong>{inn.battingTeam.teamname}</strong> batting
                </span>
                <span
                  className={`badge badge--status badge--$`}
                  
                >
                  {inn.status.toUpperCase()}
                </span>
              </div>

              <div className="section-divider" />

              {/* Score */}
              <div className="innings-score-row">
                <span className="innings-runs">
                  {inn.totalRuns}
                  <span className="innings-wickets">/{inn.totalWickets}</span>
                </span>
                <span className="innings-overs">
                  ({inn.oversCompleted}.{inn.ballsInCurrentOver} ov)
                </span>
              </div>

              {/* Extras */}
              {inn.extras > 0 && (
                <div className="innings-extras">
                  Extras: {inn.extras}
                </div>
              )}

              {/* Target */}
              {inn.target !== undefined && (
                <div className="innings-target">
                  🎯 Target: {inn.target}
                  {inn.status === "ongoing" && (
                    <span className="innings-target__need">
                      &nbsp;• Need {inn.target - inn.totalRuns} more run
                      {inn.target - inn.totalRuns !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              )}

              {/* Live Players — only when innings is ongoing */}
              {inn.status === "ongoing" &&
                (inn.striker || inn.currentBowler) && (
                  <div className="innings-live-info">
                    <div className="section-divider" />
                    <p className="innings-live-title">🔴 Live</p>
                    <div className="live-players-grid">
                      {inn.striker && (
                        <div className="live-player">
                          <span className="live-player__icon">🏏</span>
                          <span className="live-player__name">
                            {inn.striker.playername}
                          </span>
                          <span className="live-player__role">striker</span>
                        </div>
                      )}
                      {inn.nonStriker && (
                        <div className="live-player">
                          <span className="live-player__icon">🏏</span>
                          <span className="live-player__name">
                            {inn.nonStriker.playername}
                          </span>
                          <span className="live-player__role">
                            non-striker
                          </span>
                        </div>
                      )}
                      {inn.currentBowler && (
                        <div className="live-player">
                          <span className="live-player__icon">🎯</span>
                          <span className="live-player__name">
                            {inn.currentBowler.playername}
                          </span>
                          <span className="live-player__role">bowling</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

            </div>
          ))}
        </div>
      )}

      {/* ─── Playing XI ─── */}
      <div className="players-grid">
        {[
          { label: match.teamA.teamname, players: match.playingTeamA },
          { label: match.teamB.teamname, players: match.playingTeamB },
        ].map(({ label, players }) => (
          <div key={label} className="details-card">
            <h3 className="section-title">{label}</h3>
            <div className="section-divider" />
            {players?.length ? (
              players.map((p: any, i: number) => (
                <div key={p._id} className="player-row">
                  <span className="player-row__num">{i + 1}</span>
                  <span className="player-row__name">{p.playername}</span>
                </div>
              ))
            ) : (
              <p className="players-empty">No players</p>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};

export default MatchDetails;