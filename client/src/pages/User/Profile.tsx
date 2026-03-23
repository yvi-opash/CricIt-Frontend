import { useEffect, useState } from "react";
const URL = import.meta.env.VITE_API_URL;
import '../styles/Profile.css'

interface User {
  _id: string;
  username: string;
  age: number;
  email: string;
  phone: number;
  city: string;
}


const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
    const token = localStorage.getItem("token");
  
    const fetchUser = async () => {
      try {
        const res = await fetch(`${URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const data = await res.json();
  
        if (res.ok) {
          setUser(data.user);
        }
      } catch (error) {}
    };
  
    useEffect(() => {
      fetchUser();
    }, []);
  
    return (
      <div className="profile-page">
  <div className="profile-card">

    <h2 className="profile-title">My Profile</h2>
    <div className="profile-divider"></div>

    {user ? (
      <div className="profile-info">

        <div className="profile-row">
          <span className="profile-label">Name</span>
          <span className="profile-value">{user.username}</span>
        </div>

        <div className="profile-row">
          <span className="profile-label">Email</span>
          <span className="profile-value">{user.email}</span>
        </div>

        <div className="profile-row">
          <span className="profile-label">Phone</span>
          <span className="profile-value">{user.phone}</span>
        </div>

        <div className="profile-row">
          <span className="profile-label">Age</span>
          <span className="profile-value">{user.age}</span>
        </div>

        <div className="profile-row">
          <span className="profile-label">City</span>
          <span className="profile-value">{user.city}</span>
        </div>

      </div>
    ) : (
      <p className="profile-empty">No user found</p>
    )}

  </div>
</div>
    );
}

export default Profile;