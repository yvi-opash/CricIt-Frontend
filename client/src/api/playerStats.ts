import axios from "axios";
 
const API = axios.create({
  baseURL: "http://localhost:8000/api",
});
 
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
 
export const getPlayerQuickStats = (playerId: string) => {
  return API.get(`/playerstats/quick/${playerId}`);
};
 
export const getPlayerAllMatches = (playerId: string) => {
  return API.get(`/playerstats/all/${playerId}`);
};
 
export const getPlayerMatchDetails = (
  playerId: string,
  matchId: string
) => {
  return API.get(`/playerstats/match/${playerId}/${matchId}`);
};
 
export default API;