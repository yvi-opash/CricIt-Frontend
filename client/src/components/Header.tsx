import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Style/Header.css'
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { toast } from "react-toastify";


const URL = import.meta.env.VITE_API_URL;

const Header = () => {
  const navigate = useNavigate();
  const [isLogedIn, setIsLogedIn] = useState(false);
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const token = localStorage.getItem('token')

  useEffect(() => {
    setIsLogedIn(!!token);
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${URL}/api/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.user) {
        if (data.user.username) setUserName(data.user.username);
        if (data.user.role === 'admin') setIsAdmin(true);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

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
      toast.error('Logout error:' + error);
    }
  };

  const closeDropdowns = () => {
    setIsNavDropdownOpen(false);
    setIsProfileDropdownOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">


          <Link to="/" className="logo-link" onClick={closeDropdowns}>
            <img src="/fav4.webp" alt="Cric.It" className="main-logo" />
          </Link>

        <nav className="nav-menu match-source-tabs" aria-label="Match source">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? 'active' : undefined
            }
          >
            Local matches
          </NavLink>
          <NavLink
            to="/bcci-matches"
            className={({ isActive }) =>
              isActive ? 'active' : undefined
            }
          >
            BCCI matches
          </NavLink>
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
              <MenuIcon />
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
                  Create Match
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="dropdown-item" onClick={closeDropdowns}>
                    Admin Panel
                  </Link>
                )}
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
                <AccountCircleIcon />
                <span>{userName || 'Profile'}</span>
              </button>
              {isProfileDropdownOpen && (
                <div className="dropdown-menu profile-dropdown">
                  <Link to="/profile" className="dropdown-item" onClick={closeDropdowns}>
                    My Profile
                  </Link>
                  <Link to="/my-matches" className="dropdown-item" onClick={closeDropdowns}>
                    My Matches
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