import Register from "./pages/auth/Register";
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

import StartInning from "./pages/Inning/StartInning";
import LiveScoring from "./pages/Ball/LiveScore";
import LiveHeader from "./components/LiveHeader";

import Profile from "./pages/User/Profile";
import SecondInningSetup from "./pages/Inning/SecondInning";
import MatchDetails from "./pages/MatchDetails";
import PlayerHistory from "./pages/Player/PlayerHistory";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MyMatches from "./pages/Match/MyMatches";
import Admin from "./pages/admin/Admin";
import BcciMatches from "./pages/BcciMatches";
import BcciMatchInfo from "./pages/BcciMatchInfo";

function App() {
  return (
    <BrowserRouter>
     <ToastContainer position="top-right" autoClose={3000} />
      <Header />
      <LiveHeader />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bcci-matches" element={<BcciMatches />} />
        <Route path="/bcci-match-info/:id" element={<BcciMatchInfo />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/77777" element={<OneMatchCard/>}/> */}
        <Route path="/team" element={<Team />} />
        <Route path="/player" element={<Player />} />
        <Route path="/match" element={<CreateMatch />} />
        <Route path="/playing-team/:matchId" element={<PlayingTeamPage />} />
        <Route path="/toss/:matchId" element={<Toss />} />
        <Route path="/startInning/:matchId" element={<StartInning />} />
        <Route path="/live-score/:matchId/:inningId" element={<LiveScoring />}/>
        <Route path="/profile" element={<Profile />} />
        <Route path="/second-inning-setup/:matchId/:inningId" element={<SecondInningSetup/>}/>

        <Route path="/match-details/:matchId" element={<MatchDetails />} />

        <Route path="/player-history/:playerId" element={<PlayerHistory />} />
        <Route path="/my-matches" element={<MyMatches />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
