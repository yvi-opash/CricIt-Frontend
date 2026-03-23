import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Style/Header.css'
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const URL = import.meta.env.VITE_API_URL;

const Header = () => {
  const navigate = useNavigate();
  const [isLogedIn, setIsLogedIn] = useState(false);
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const token = localStorage.getItem('token')

  useEffect(() => {
    setIsLogedIn(!!token);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${URL}/api/users/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      localStorage.removeItem('token');
      setIsLogedIn(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const closeDropdowns = () => {
    setIsNavDropdownOpen(false);
    setIsProfileDropdownOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        
        
        <div className="logo-section">
          <Link to="/" className="logo" onClick={closeDropdowns}>
            <img src="/Cric_It.svg" alt="cric.it" className="logo-icon" />
            Cric<span>.It</span>
          </Link>
          <p className="tagline">Live Cricket Score </p>
        </div>

        
        <nav className="nav-menu">
          <Link to="/">Dashboard</Link>
          <Link to="/team">Teams</Link>
          <Link to="/player">Players</Link>
          <Link to="/match">Matches</Link>
        </nav>

        
        <div className="user-section">

          {isLogedIn && (<div className="dropdown-wrapper">
            <button 
              className={`menu-btn ${isNavDropdownOpen ? 'active' : ''}`}
              onClick={() => {
                setIsNavDropdownOpen(!isNavDropdownOpen);
                setIsProfileDropdownOpen(false);
              }}
            >
              <MenuIcon/>
            </button>

            {isNavDropdownOpen && (
              <div className="dropdown-menu nav-dropdown">
                <Link to="/" className="dropdown-item" onClick={closeDropdowns}>
                  Dashboard
                </Link>
                <Link to="/team" className="dropdown-item" onClick={closeDropdowns}>
                  Teams
                </Link>
                <Link to="/player" className="dropdown-item" onClick={closeDropdowns}>
                  Players
                </Link>
                <Link to="/match" className="dropdown-item" onClick={closeDropdowns}>
                  Matches
                </Link>
              </div>
            )}
          </div>)}




          
          {isLogedIn && (
            <div className="dropdown-wrapper">
              <button 
                className="profile-btn"
                onClick={() => {
                  setIsProfileDropdownOpen(!isProfileDropdownOpen);
                  setIsNavDropdownOpen(false);
                }}
              >
                <AccountCircleIcon/>
              </button>
              {isProfileDropdownOpen && (
                <div className="dropdown-menu profile-dropdown">
                  <Link to="/profile" className="dropdown-item" onClick={closeDropdowns}>
                    My Profile
                  </Link>
                  
                  
                  <button className="dropdown-item logout-item" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {!isLogedIn && (
            <>
              <Link to="/login" className="auth-btn">Login</Link>
              <Link to="/register" className="auth-btn">Register</Link>
            </>
          )}

          
        </div>

      </div>
    </header>
  );
};

export default Header;