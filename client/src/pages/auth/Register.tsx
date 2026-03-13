import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
const URL = import.meta.env.VITE_API_URL;
import '../styles/Register.css'


const Register = () => {

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    age: "",
    phone : "",
    password : ""
  })


const navigate = useNavigate();



  const handleRegister = async(e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`${URL}/api/users/register`, {
        method : "POST",
        body : JSON.stringify(formData),
        headers : {"Content-Type" : "application/json" }
      })
      const data = await response.json()
      if (response.ok) {
        alert("Registration successful!");
        setFormData({ username: "", email: "", age: "", phone: "", password: "" })
        navigate('/login');
      } else {
        alert(data.msg || "Registration failed")
      }
    } catch (error) {
      alert("Error: " + error)
    }
  }

  return (
    <div className="register-page">

  <div className="register-card">
    <h2 className="register-title">Register</h2>

    <form className="register-form" onSubmit={handleRegister}>

      <div className="form-group">
        <label>Name</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
        />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
        />
      </div>

      <div className="form-group">
        <label>Mobile</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) =>
            setFormData({ ...formData, phone: e.target.value })
          }
        />
      </div>

      <div className="form-group">
        <label>Age</label>
        <input
          type="number"
          value={formData.age}
          onChange={(e) =>
            setFormData({ ...formData, age: e.target.value })
          }
        />
      </div>

      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
      </div>

      <button className="register-btn" type="submit">
        Register
      </button>

    </form>
  </div>

</div>
  )
}

export default Register;