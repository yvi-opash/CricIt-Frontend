

import './styles/Home.css';

const Home = () => {
  // const navigate = useNavigate();

  // const handleLogin = (): void => {
  //   navigate("/login");
  // };

  // const handleRegister = (): void => {
  //   navigate("/register");
  // };

  return (
    <div className="home-bg">

      
      <div className="ticker">
        <div className="animate-marquee">
          <span className="ticker-text"> IND vs AUS - India 245/4 (45.2 overs)</span>
          <span className="ticker-text"> ENG vs PAK - England won by 5 wickets</span>
        </div>
      </div>

      
      <div className="hero-container">
        <h1 className="hero-title">
          Welcome to <span className="hero-highlight">Cric.It</span>
        </h1>

        <p className="hero-subtitle">
          Live Cricket Scoring & Match Management Platform
        </p>

       
        <div className="score-wrapper">
          <div className="score-card">
            <div className="score-overlay"></div>

            <div className="score-row">
              <div className="team-box">
                <h3 className="team-name">India</h3>
                <p className="team-score-lime">245/4</p>
                <p className="team-overs">45.2 Overs</p>
              </div>

              <div className="vs-text">VS</div>

              <div className="team-box">
                <h3 className="team-name">Australia</h3>
                <p className="team-score-cyan">198/10</p>
                <p className="team-overs">42.5 Overs</p>
              </div>
            </div>

            <div className="text-center">
              <span className="result-badge">
                🏆 India Won by 47 Runs
              </span>
            </div>
          </div>
        </div>

        
        <div className="features">

          <div className="feature-card border-cyan-500/30 hover:border-cyan-500">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">Live Scoring</h3>
            <p className="feature-text">
              Real-time match updates and ball-by-ball commentary
            </p>
          </div>

          <div className="feature-card border-lime-500/30 hover:border-lime-500">
            <div className="feature-icon">👥</div>
            <h3 className="feature-title">Team Management</h3>
            <p className="feature-text">
              Create and manage your cricket teams effortlessly
            </p>
          </div>

          <div className="feature-card border-orange-500/30 hover:border-orange-500">
            <div className="feature-icon">🏏</div>
            <h3 className="feature-title">Match Analytics</h3>
            <p className="feature-text">
              Detailed statistics and performance insights
            </p>
          </div>

        </div>

        
        {/* <div className="cta">
          <button onClick={handleLogin} className="btn-login">
            Login
          </button>

          <button onClick={handleRegister} className="btn-register">
            Register
          </button>
        </div> */}

      </div>
    </div>
  );
};

export default Home;