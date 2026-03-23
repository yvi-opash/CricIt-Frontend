import Register from "./pages/auth/Register"
import Login from "./pages/auth/Login";
import Team from "./pages/Team/Team";
import Player from "./pages/Player/Player";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import CreateMatch from "./pages/Match/CreateMatch";
import Header from "./components/Header";
import Footer from "./components/Footer";
//import PlayingTeam from "./pages/Match/PlayingTeam";
import PlayingTeamPage from "./pages/Match/PlayingTeam";
import Toss from "./pages/Match/Toss";
//import PlayingTeam from "./pages/Match/PlayingTeam";
import AllMatch from "./pages/Match/AllMatch";
import StartInning from "./pages/Inning/StartInning";
import LiveScoring from "./pages/Ball/LiveScore";
import  LiveHeader  from "./components/LiveHeader";
import OneMatchCard from "./components/OneMatchCard";
import Profile from "./pages/User/Profile";

function App() {


  return (


    <BrowserRouter>
      <Header />
      <LiveHeader/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/77777" element={<OneMatchCard/>}/>
        <Route path="/team" element={<Team/>}/>
        <Route path="/player" element={<Player/>}/>
        <Route path="/match" element={<CreateMatch/>}/>
        <Route path="/playing-team/:matchId" element={<PlayingTeamPage />} />
        <Route path='/toss/:matchId' element={<Toss/>} />
        <Route path="/all" element={<AllMatch/>}/>
        <Route path="/startInning/:matchId" element={<StartInning/>}/>
       <Route path="/live-score/:matchId/:inningId" element={<LiveScoring />} />
       <Route path="/profile" element={<Profile/>}/>
      </Routes>
      <Footer />
    </BrowserRouter>
    


    
  )
}

export default App