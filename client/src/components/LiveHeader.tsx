import { useEffect, useState } from "react";
import "./Style/LiveHeader.css";

const URL = import.meta.env.VITE_API_URL;

const LiveHeader = () => {
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    getLiveMatches();

    // const interval = setInterval(() => {
    //   getLiveMatches();
    // }, 60000);

    // return () => clearInterval(interval);
  }, []);

  const getLiveMatches = async () => {
    try {
      const res = await fetch(`${URL}/api/match/live`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const matches = await res.json();

      const live = matches.filter((m: any) => m.status === "live");

      let finalData: any[] = [];

      for (let match of live) {
        const inningRes = await fetch(`${URL}/api/inning/match/${match._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const innings = await inningRes.json();

        const ongoing = innings.find((i: any) => i.status === "ongoing");

        finalData.push({
          ...match,
          inning: ongoing || null,
        });
      }

      setLiveMatches(finalData);
    } catch (error) {
      console.log(error);
    }
  };

  const showScore = (m: any) => {
    if (!m.inning)
      return `${m.teamA.teamname} Vs ${m.teamB.teamname} - Strting Soon`;

    const batTeam =
      m.inning.battingTeam === m.teamA._id
        ? m.teamA.teamname
        : m.teamB.teamname;

    const overs = `${m.inning.oversCompleted}.${m.inning.ballsInCurrentOver}`;

    return `${m.teamA.teamname} vs ${m.teamB.teamname} - ${batTeam} ${m.inning.totalRuns}/${m.inning.totalWickets} (${overs})`;
  };

  if (liveMatches.length === 0) return `no Live Matches..........`;

  return (
    <div className="ticker">
      <div className="ticker-live-badge">LIVE</div>

      <div className="ticker-track">
        <div className="animate-marquee">
          {liveMatches.map((m, i) => (
            <span key={i} className="ticker-text">
              {showScore(m)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveHeader;
