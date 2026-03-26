const URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const token = localStorage.getItem('token');
export const startSecondInning = async (matchId: string) => {
  const res = await fetch(`${URL}/api/inning/secstart/${matchId}`, {
    method: "POST",
   headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
  });

  if (!res.ok) {
    throw new Error("Failed to start second inning");
  }

  return res.json();
};