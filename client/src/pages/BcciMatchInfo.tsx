import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

import "./styles/BcciMatches.css";

const URL = import.meta.env.VITE_API_URL;

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

  useEffect(() => {
    if (!id) return;

    const fetchInfo = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${URL}/api/cricapi/match_info?id=${id}`);
        const payload = await res.json();

        if (!res.ok || payload.status === "failure") {
          toast.error(payload.reason || payload.message || "Failed to load match info");
          return;
        }

        if (payload.data) {
          setData(payload.data);
        }
      } catch (err) {
        toast.error("Network error fetching match info");
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [id]);

  if (loading) return <Loader />;

  if (!data) {
    return (
      <div className="bcci-page">
        <button onClick={() => navigate(-1)} className="bcci-page-btn" style={{ marginBottom: '1rem' }}>&larr; Back</button>
        <p className="bcci-empty">Match data not found.</p>
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
      <button onClick={() => navigate(-1)} className="bcci-page-btn" style={{ marginBottom: '1rem', width: 'fit-content' }}>
        &larr; Back
      </button>

      <div className="bcci-card-home" style={{ maxWidth: '800px', margin: '0 auto', gap: '1.5rem' }}>
        <div style={{ textAlign: 'center' }}>
           <h2 className="bcci-title-match" style={{ fontSize: '1.4rem' }}>{data.name}</h2>
           <p className="bcci-sub" style={{ marginTop: '0.5rem' }}>
             {data.venue} • {data.date}
           </p>
           {data.matchType && (
             <span className="bcci-badge bcci-badge--type" style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
               {data.matchType.toUpperCase()}
             </span>
           )}
        </div>

        <div className="bcci-card__divider" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
          
          {/* Team A */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
             {teamA.img ? (
               <img src={teamA.img} alt={teamA.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'contain', background: '#fff' }} />
             ) : (
               <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{teamA.shortname || teamA.name.slice(0,2)}</div>
             )}
             <span className="bcci-team-name" style={{ textAlign: 'center', maxWidth: '100%', whiteSpace: 'normal', fontSize: '1.1rem' }}>{teamA.name}</span>
             <div className="bcci-team-score" style={{ alignItems: 'center' }}>
                <span className="bcci-runs" style={{ fontSize: '1.5rem' }}>{scoreA?.r ?? "—"}<span className="bcci-wickets" style={{ fontSize: '1rem' }}>/{scoreA?.w ?? "—"}</span></span>
                <span className="bcci-overs">({scoreA?.o ?? "—"} ov)</span>
             </div>
          </div>

          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--muted)', padding: '0 1rem' }}>VS</div>

          {/* Team B */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
             {teamB.img ? (
               <img src={teamB.img} alt={teamB.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'contain', background: '#fff' }} />
             ) : (
               <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{teamB.shortname || teamB.name.slice(0,2)}</div>
             )}
             <span className="bcci-team-name" style={{ textAlign: 'center', maxWidth: '100%', whiteSpace: 'normal', fontSize: '1.1rem' }}>{teamB.name}</span>
             <div className="bcci-team-score" style={{ alignItems: 'center' }}>
                <span className="bcci-runs" style={{ fontSize: '1.5rem' }}>{scoreB?.r ?? "—"}<span className="bcci-wickets" style={{ fontSize: '1rem' }}>/{scoreB?.w ?? "—"}</span></span>
                <span className="bcci-overs">({scoreB?.o ?? "—"} ov)</span>
             </div>
          </div>
        </div>

        <div className="bcci-card__divider" />

        <div style={{ background: 'var(--surface2)', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
           <div className="bcci-meta-line" style={{ justifyContent: 'space-between' }}>
              <span className="bcci-meta-label">TOSS</span>
              <span className="bcci-meta-value" style={{ textTransform: 'capitalize' }}>
                {data.tossWinner ? `${data.tossWinner} chose to ${data.tossChoice}` : 'Pending'}
              </span>
           </div>
           
           <div className="bcci-meta-line" style={{ justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.6rem' }}>
              <span className="bcci-meta-label">STATUS</span>
              <span className="bcci-meta-value">{data.status}</span>
           </div>

           {data.matchWinner && (
             <div className="bcci-meta-line" style={{ justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.6rem' }}>
                <span className="bcci-meta-label">WINNER</span>
              <span className="bcci-meta-value" style={{ color: 'var(--green-lt)', fontWeight: 800 }}>{data.matchWinner}</span>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default BcciMatchInfo;
  