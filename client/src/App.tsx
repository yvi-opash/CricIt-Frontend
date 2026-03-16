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

function App() {


  return (


    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/team" element={<Team/>}/>
        <Route path="/player" element={<Player/>}/>
        <Route path="/match" element={<CreateMatch/>}/>
        {/* <Route path="/play" element={<PlayingTeam/>} /> */}
        {/* <Route path="/playing-team/:matchId" element={<PlayingTeam />} /> */}
        <Route path="/playing-team/:matchId" element={<PlayingTeamPage />} />
        <Route path='/toss/:matchId' element={<Toss/>} />
        <Route path="/all" element={<AllMatch/>}/>
        <Route path="/startInning/:matchId" element={<StartInning/>}/>
      </Routes>
      <Footer />
    </BrowserRouter>
    


    
  )
}

export default App