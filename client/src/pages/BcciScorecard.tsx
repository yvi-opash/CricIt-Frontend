import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

const URL = import.meta.env.VITE_API_URL;

interface BcciScorecardProps {
  matchId: string;
}

export const BcciScorecard = ({ matchId }: BcciScorecardProps) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScorecard = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${URL}/api/cricapi/match_scorecard?id=${matchId}`);
        const payload = await res.json();

        if (!res.ok || payload.status === "failure") {
          toast.error(payload.reason || "Failed to load scorecard");
          return;
        }

        setData(payload.data);
      } catch (err) {
        toast.error("Network error fetching scorecard");
      } finally {
        setLoading(false);
      }
    };
    fetchScorecard();
  }, [matchId]);

  if (loading) return <Loader />;
  if (!data || !data.length) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Scorecard data not available.</p>;

  return (
    <div className="bcci-scorecard-wrap" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {data.map((inning: any, idx: number) => (
        <div key={idx} className="bcci-card-home" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ background: 'var(--surface2)', padding: '1rem', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>{inning.inning}</span>
              <span style={{ color: 'var(--orange)' }}>
                {inning.totals?.R}/{inning.totals?.W} ({inning.totals?.O} ov)
              </span>
            </h3>
          </div>

          <div style={{ padding: '1rem', overflowX: 'auto' }}>
            <h4 style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.8rem', textTransform: 'uppercase' }}>Batting</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left', minWidth: '500px' }}>
              <thead>
                <tr style={{ color: 'var(--muted-lt)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '0.5rem' }}>Batter</th>
                  <th style={{ padding: '0.5rem' }}></th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>R</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>B</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>4s</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>6s</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>SR</th>
                </tr>
              </thead>
              <tbody>
                {inning.batting?.map((bat: any, bIdx: number) => (
                  <tr key={bIdx} style={{ borderBottom: '1px solid var(--surface2)' }}>
                    <td style={{ padding: '0.6rem 0.5rem', fontWeight: 600, color: 'var(--white)' }}>
                      {bat.batsman?.name}
                    </td>
                    <td style={{ padding: '0.6rem 0.5rem', color: 'var(--muted)', fontSize: '0.75rem' }}>
                      {bat.dismissal}
                    </td>
                    <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right', fontWeight: 700, color: 'var(--orange-lt)' }}>{bat.r}</td>
                    <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>{bat.b}</td>
                    <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>{bat['4s']}</td>
                    <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>{bat['6s']}</td>
                    <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>{bat.sr}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {inning.extras && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
                <span>Extras: <strong>{inning.totals?.E || '-'}</strong></span>
                <span>(b {inning.extras.b || 0}, lb {inning.extras.lb || 0}, w {inning.extras.w || 0}, nb {inning.extras.nb || 0}, p {inning.extras.p || 0})</span>
              </div>
            )}
          </div>

          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.1)', overflowX: 'auto', borderTop: '1px solid var(--surface2)' }}>
            <h4 style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.8rem', textTransform: 'uppercase' }}>Bowling</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left', minWidth: '500px' }}>
              <thead>
                <tr style={{ color: 'var(--muted-lt)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '0.5rem' }}>Bowler</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>O</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>M</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>R</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>W</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>ECON</th>
                </tr>
              </thead>
              <tbody>
                {inning.bowling?.map((bowl: any, bwIdx: number) => (
                  <tr key={bwIdx} style={{ borderBottom: '1px solid var(--surface2)' }}>
                    <td style={{ padding: '0.6rem 0.5rem', fontWeight: 600, color: 'var(--white)' }}>
                      {bowl.bowler?.name}
                    </td>
                    <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>{bowl.o}</td>
                    <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>{bowl.m}</td>
                    <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>{bowl.r}</td>
                    <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right', fontWeight: 700, color: 'var(--orange-lt)' }}>{bowl.w}</td>
                    <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>{bowl.eco}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};
