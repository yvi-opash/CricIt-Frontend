import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import { BcciScorecard } from "./BcciScorecard";

import "./styles/BcciMatches.css";

const URL = import.meta.env.VITE_API_URL || "";

interface TeamInfo {
  name: string;
  shortname: string;
  img: string;
}

interface ScoreInfo {
  r: number;
  w: number;
  o: number;
  inning: string;
}

interface MatchInfoData {
  id: string;
  name: string;
  matchType: string;
  status: string;
  venue: string;
  date: string;
  dateTimeGMT: string;
  teams: string[];
  teamInfo: TeamInfo[];
  score: ScoreInfo[];
  tossWinner: string;
  tossChoice: string;
  matchWinner: string;
}

const BcciMatchInfo = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<MatchInfoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "scorecard">("info");

  useEffect(() => {
    if (!id) return;

    const fetchInfo = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${URL}/api/cricapi/match_info?id=${id}`);
        
        if (!res.ok) {
           const text = await res.text();
           let errorMessage = "Failed to load match info";
           try {
             const json = JSON.parse(text);
             errorMessage = json.reason || json.message || errorMessage;
           } catch {
             // Not JSON
           }
           toast.error(errorMessage);
           return;
        }

        const payload = await res.json();

        if (payload.status === "failure") {
          toast.error(payload.reason || payload.message || "Failed to load match info");
          return;
        }

        if (payload.data) {
          setData(payload.data);
        } else {
          // Sometimes the data is at the root if it's a specific CricAPI response
          setData(payload as any);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Network error fetching match info. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [id]);

  if (loading) return <Loader />;

  if (!data || !data.name) {
    return (
      <div className="bcci-page">
        <button onClick={() => navigate(-1)} className="bcci-page-btn" style={{ marginBottom: '1rem' }}>&larr; Back</button>
        <div className="bcci-empty-state">
           <p className="bcci-empty">Match data not found or currently unavailable.</p>
           <button onClick={() => window.location.reload()} className="bcci-page-btn" style={{ marginTop: '1rem' }}>Retry</button>
        </div>
      </div>
    );
  }

  const teamA = data.teamInfo?.[0] || { name: data.teams?.[0] || "Team A", img: "", shortname: "" };
  const teamB = data.teamInfo?.[1] || { name: data.teams?.[1] || "Team B", img: "", shortname: "" };

  const getScore = (teamName: string) => {
    if (!data.score) return null;
    return data.score.find(s => s.inning.toLowerCase().includes(teamName.toLowerCase()));
  };

  const scoreA = getScore(teamA.name);
  const scoreB = getScore(teamB.name);

  return (
    <div className="bcci-page">
      <div className="bcci-detail-header" style={{ maxWidth: '900px', margin: '0 auto 2rem' }}>
        <button onClick={() => navigate(-1)} className="bcci-back-btn">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to matches
        </button>
      </div>

      <div className="bcci-main-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Match Info Summary Card */}
        <div className="bcci-card-home bcci-match-header-card" style={{ padding: '2rem' }}>
          <div className="bcci-match-meta" style={{ textAlign: 'center', marginBottom: '2rem' }}>
             <span className="bcci-badge bcci-badge--live-pulse">{data.status.toUpperCase()}</span>
             <h1 className="bcci-match-title-large" style={{ fontSize: '1.8rem', margin: '1rem 0 0.5rem', fontWeight: 800 }}>{data.name}</h1>
             <p className="bcci-match-venue-sub" style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
               {data.venue} • {data.date}
             </p>
          </div>

          <div className="bcci-teams-display" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: '1rem' }}>
            {/* Team A */}
            <div className="bcci-team-focus">
               <div className="bcci-team-logo-wrap">
                 {teamA.img ? (
                   <img src={teamA.img} alt={teamA.name} />
                 ) : (
                   <div className="bcci-team-placeholder">{teamA.shortname || teamA.name.slice(0,2)}</div>
                 )}
               </div>
               <h3 className="bcci-team-name-large">{teamA.name}</h3>
               <div className="bcci-team-score-focus">
                  <span className="bcci-score-runs">{scoreA?.r ?? "—"}</span>
                  <span className="bcci-score-wickets">/{scoreA?.w ?? "—"}</span>
                  <div className="bcci-score-overs-label">{scoreA?.o ?? "0.0"} ov</div>
               </div>
            </div>

            <div className="bcci-vs-indicator">
              <div className="vs-line" />
              <div className="vs-text">VS</div>
              <div className="vs-line" />
            </div>

            {/* Team B */}
            <div className="bcci-team-focus">
               <div className="bcci-team-logo-wrap">
                 {teamB.img ? (
                   <img src={teamB.img} alt={teamB.name} />
                 ) : (
                   <div className="bcci-team-placeholder">{teamB.shortname || teamB.name.slice(0,2)}</div>
                 )}
               </div>
               <h3 className="bcci-team-name-large">{teamB.name}</h3>
               <div className="bcci-team-score-focus">
                  <span className="bcci-score-runs">{scoreB?.r ?? "—"}</span>
                  <span className="bcci-score-wickets">/{scoreB?.w ?? "—"}</span>
                  <div className="bcci-score-overs-label">{scoreB?.o ?? "0.0"} ov</div>
               </div>
            </div>
          </div>

          <div className="bcci-match-status-footer" style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
             <p className="bcci-toss-info" style={{ fontStyle: 'italic', color: 'var(--orange-lt)', fontWeight: 500 }}>
                {data.tossWinner ? `🏏 ${data.tossWinner} won the toss and elected to ${data.tossChoice}` : 'Toss pending'}
             </p>
             {data.matchWinner && (
               <div className="bcci-winner-highlight" style={{ marginTop: '1rem', background: 'rgba(76, 175, 80, 0.1)', padding: '0.8rem', borderRadius: '12px', border: '1px solid rgba(76, 175, 80, 0.2)' }}>
                  <span style={{ color: 'var(--green-lt)', fontWeight: 800, fontSize: '1.1rem' }}>🏆 {data.matchWinner} won</span>
               </div>
             )}
          </div>
        </div>

        {/* Tabs for Info / Scorecard */}
        <div className="bcci-tabs" style={{ display: 'flex', gap: '0.5rem', margin: '2rem 0 1rem' }}>
          <button 
            className={`bcci-tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Overview
          </button>
          <button 
            className={`bcci-tab-btn ${activeTab === 'scorecard' ? 'active' : ''}`}
            onClick={() => setActiveTab('scorecard')}
          >
            Full Scorecard
          </button>
        </div>

        {/* Tab Content */}
        <div className="bcci-tab-content">
          {activeTab === 'info' ? (
            <div className="bcci-overview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div className="bcci-card-home" style={{ padding: '1.5rem' }}>
                <h4 style={{ color: 'var(--muted)', marginBottom: '1rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Match Details</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="bcci-info-row">
                    <span className="label">Format</span>
                    <span className="value">{data.matchType?.toUpperCase()}</span>
                  </div>
                  <div className="bcci-info-row">
                    <span className="label">Venue</span>
                    <span className="value">{data.venue}</span>
                  </div>
                  <div className="bcci-info-row">
                    <span className="label">Date</span>
                    <span className="value">{data.date}</span>
                  </div>
                </div>
              </div>
              
              <div className="bcci-card-home" style={{ padding: '1.5rem' }}>
                <h4 style={{ color: 'var(--muted)', marginBottom: '1rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Status</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="bcci-info-row">
                    <span className="label">Match State</span>
                    <span className="value" style={{ color: 'var(--orange-lt)' }}>{data.status}</span>
                  </div>
                  {data.matchWinner && (
                    <div className="bcci-info-row">
                      <span className="label">Result</span>
                      <span className="value">{data.matchWinner} won</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <BcciScorecard matchId={id || ""} />
          )}
        </div>
      </div>
    </div>
  );
};

export default BcciMatchInfo;
  