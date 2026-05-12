import React from 'react';
import './Style/PlayerCard.css';

interface PlayerCardProps {
  playername: string;
  role: string;
  teamName?: string;
  stats?: {
    runs?: number | string;
    sr?: number | string;
    fours?: number | string;
    sixes?: number | string;
    wickets?: number | string;
    eco?: number | string;
  };
  onClick?: () => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ 
  playername, 
  role, 
  teamName, 
  stats,
  onClick 
}) => {
  const getRoleAbbr = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes('bat')) return 'BAT';
    if (r.includes('bowl')) return 'BWL';
    if (r.includes('all')) return 'AR';
    return 'PLR';
  };

  // Mock stats if not provided to fill the FIFA 6-stat grid
  const displayStats = [
    { label: 'RUN', value: stats?.runs ?? '74' },
    { label: 'S/R', value: stats?.sr ?? '138' },
    { label: '4s', value: stats?.fours ?? '12' },
    { label: '6s', value: stats?.sixes ?? '08' },
    { label: 'WKT', value: stats?.wickets ?? '02' },
    { label: 'ECO', value: stats?.eco ?? '7.5' },
  ];

  return (
    <div className="fut-card-wrapper" onClick={onClick}>
      <div className="fut-card gold-card">
        {/* Top Section: Position, Flag, Club */}
        <div className="fut-card-top">
          <div className="fut-card-meta">
            <div className="fut-position">{getRoleAbbr(role)}</div>
            <div className="fut-flag">🇮🇳</div>
            <div className="fut-club">🏏</div>
          </div>
          
          <div className="fut-player-image">
            <svg viewBox="0 0 495.996 495.996" className="fut-player-svg-custom" xmlns="http://www.w3.org/2000/svg">
              <g>
                <path d="m456.114 406.405-.116.052v-7.534c0-35.591-23.513-66.902-57.692-76.827l-62.308-18.092a535.626 535.626 0 0 1-3.372 3.456c-11.416-10.372-12.696-31.422-12.714-43.686 10.899-11.858 19.563-26.181 26.004-41.591 16.124 10.733 30.082-23.27 30.082-38.111 0-10.909-6.446-17.166-16.681-16.694.454-5.169.681-10.286.681-15.306 0-64.065-50.144-80.009-112-80.009s-112 15.944-112 80.009c0 5.063.232 10.225.693 15.439-10.188-1.195-16.693 5.117-16.693 16.561 0 15.462 13.88 51.714 29.424 36.513 6.499 16.003 15.378 30.888 26.638 43.149-.067 12.218-1.45 33.204-12.791 43.623a503.857 503.857 0 0 1-3.271-3.354l-62.307 18.093c-34.179 9.925-57.692 41.236-57.692 76.827v7.534l-.116-.052c-3.692-1.678-7.884 1.021-7.884 5.077v10.676c0 4.281 2.502 8.166 6.399 9.938l9.601 4.364v35.536c0 13.255 10.745 24 24 24h352c13.255 0 24-10.745 24-24V436.46l9.601-4.364a10.916 10.916 0 0 0 6.399-9.938v-10.676c-.001-4.056-4.193-6.756-7.885-5.077z" fill="#e6b47d"></path>
                <path d="m303.998 344.004 31.671-34.197c-17.891-11.519-15.671-45.803-15.671-53.803h-144c10.332 29.703 78.667 80.666 128 88z" fill="#d2a073"></path>
                <path d="M359.318 167.378c.454-5.169.681-10.286.681-15.306 0-64.065-50.144-80.009-112-80.009s-112 15.944-112 80.009c0 5.063.232 10.225.693 15.439-10.188-1.195-16.693 5.117-16.693 16.561 0 15.462 13.88 51.714 29.424 36.513 16.834 41.451 49.566 75.487 98.576 75.487 48.379 0 80.897-33.165 97.918-73.889 16.124 10.733 30.082-23.27 30.082-38.111-.001-10.909-6.446-17.165-16.681-16.694z" fill="#f0c891"></path>
                <path d="M335.998 304.004c-47.662 49.343-88 72-88 72s-40.338-22.657-88-72l-62.307 18.092c-34.179 9.924-57.692 41.236-57.692 76.827v20.717l80 36.364v39.991h256v-39.991l80-36.364v-20.717c0-35.591-23.513-66.902-57.692-76.827l-62.309-18.092z" fill="#f97316"></path>
                <path d="M447.998 424.004h-16v-25.082c0-24.758-16.605-46.875-40.383-53.777l-53.137-15.43 4.461-15.367 53.137 15.43c30.57 8.879 51.922 37.313 51.922 69.145v25.081zm-383.999 0h-16v-25.082c0-31.832 21.352-60.266 51.922-69.145l53.137-15.43 4.461 15.367-53.137 15.43c-23.777 6.902-40.383 29.02-40.383 53.777v25.083z" fill="#1c1917" opacity="0.72"></path>
                <path d="m38.397 432.095 81.601 37.092v-26.365l-80.116-36.417c-3.692-1.678-7.884 1.021-7.884 5.077v10.676a10.918 10.918 0 0 0 6.399 9.937zM457.6 432.095l-81.601 37.092v-26.365l80.116-36.417c3.692-1.678 7.884 1.021 7.884 5.077v10.676a10.918 10.918 0 0 1-6.399 9.937zM335.998 304.004c-47.662 49.343-88 72-88 72s-40.338-22.657-88-72l-26.537 7.706c54.978 57.081 100.496 83.894 102.482 85.048l12.055 7 12.055-7c1.986-1.154 47.504-27.968 102.482-85.048l-26.537-7.706z" fill="#f97316"></path>
                <path d="M335.998 439.995h-48a8 8 0 0 0-8 8v8c0 18.755 5.337 31.452 11.639 40h40.723c6.301-8.548 11.639-21.245 11.639-40v-8a8.001 8.001 0 0 0-8.001-8z" fill="#1c1917" opacity="0.72"></path>
                <path d="M317.096 495.995c8.332-15.066 10.902-32.132 10.902-40h-32c0 7.868 2.571 24.934 10.902 40h10.196z" fill="#f97316"></path>
                <path d="M359.998 16.063c-52.896 0-135.503-40.997-167.805 8h-8.195c-30.928 0-56 25.356-56 56.284 0 28.716 8 71.725 8 71.725s9-40.5 48-56l.033-.015-.033.299c78.667 42.667 152 15.716 152 15.716l24 40c13.5-45.5 8-124.509 0-136.009z" fill="#64464b"></path>
              </g>
            </svg>
          </div>
        </div>

        {/* Name Section */}
        <div className="fut-player-name">
          <span>{playername.toUpperCase()}</span>
        </div>

        {/* Bottom Section: 6 Stats Grid */}
        <div className="fut-stats-grid">
          {displayStats.map((stat, i) => (
            <div key={i} className="fut-stat">
              <span className="fut-stat-value">{stat.value}</span>
              <span className="fut-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Card Shine/Texture Overlay */}
        <div className="fut-card-shine"></div>
      </div>
    </div>
  );
};

export default PlayerCard;
