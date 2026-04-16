  import React from 'react'
  import { useState, useEffect } from 'react'
  import { useNavigate, useParams } from "react-router-dom";
  const URL = import.meta.env.VITE_API_URL;
  import './style/Toss.css'
import Coin from  '../../components/Coin'
import { toast } from "react-toastify";



  interface Match {
    _id: string;
    teamA: {
      _id: string;
      teamname: string;
    };
    teamB: {
      _id: string;
      teamname: string;
    };
  }

  const Toss = () => {

    const navigate = useNavigate();
    const token = localStorage.getItem("token");
      const { matchId } = useParams();


    const [match, setMatch] = useState<Match | null>(null);  
    const [tossWinner, setTossWinner] = useState("");
    const [tossDecision, settossDecision] = useState("");




    const fetchMatch = async () => {

      

      const responce = await fetch(`${URL}/api/match/detail/${matchId}`, {
        headers: {Authorization : `Bearer ${token}`}
      });

      const data = await responce.json();
      setMatch(data);
    }

      useEffect(() => {
      fetchMatch();
    }, []);


    const handlSubmit = async(e: React.FormEvent) => {
      e.preventDefault();

      if (!tossWinner) {
        toast.error("Please select who won the toss");
        return;
      }

      if (!tossDecision) {
        toast.error("Please select a decision (Bat or Bowl)");
        return;
      }

      const reasponce = await fetch(`${URL}/api/match/toss/${matchId}`, {
        method : "POST",
        headers : {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body : JSON.stringify({tossWinner, tossDecision})
      })

      const data = await reasponce.json();

      if (!reasponce.ok) {
        
      toast.error(data.message || "Error");
      return;
    }


      navigate(`/startInning/${matchId}`)
      console.log({tossWinner, tossDecision});
    }
      
    return (
     
      <div className="toss-page">

  <div className="toss-card">

    <h1 className="toss-title">MATCH TOSS</h1>

      <h2 className="coin-heading">Tap To Flip a Coin</h2>
    <div className="coin"><Coin/></div>

    <form onSubmit={handlSubmit}>

      <h2 className="toss-heading">Who Won The Toss?</h2>

      {match && (
        <div>

          <label className="team-option">
            <span className="team-name">{match.teamA.teamname}</span>
            <input type="radio" name="tossWinner"
              value={match.teamA._id}
              onChange={(e)=>setTossWinner(e.target.value)}
            />
          </label>

          <label className="team-option">
            <span className="team-name">{match.teamB.teamname}</span>
            <input type="radio" name="tossWinner"
              value={match.teamB._id}
              onChange={(e)=>setTossWinner(e.target.value)}
            />
          </label>

        </div>
      )}

      <h2 className="toss-heading">Decision</h2>

      <div className="decision-box">

        <label className="decision-option">
          Bat
          <input type="radio" name="Choose" value="bat"
            className="ml-2"
            onChange={(e)=>settossDecision(e.target.value)}
          />
        </label>

        <label className="decision-option">
          Bowl
          <input type="radio" name="Choose" value="bowl"
            className="ml-2"
            onChange={(e)=>settossDecision(e.target.value)}
          />
        </label>

      </div>

      <button className="play-btn">LET'S PLAY</button>

    </form>

  </div>

</div>
    )
  }

  export default Toss;

