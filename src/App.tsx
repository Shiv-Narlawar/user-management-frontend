import { useEffect, useState } from "react";
import { API_BASE_URL, ENDPOINTS } from "./config";

export default function App() {
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState("Checking backend connection...");

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}${ENDPOINTS.HEALTH}`);
        if (response.ok) {
          setConnected(true);
          setStatus("Backend connected successfully");
        } else {
          setConnected(false);
          setStatus("Backend not reachable");
        }
      } catch (error) {
        setConnected(false);
        setStatus("Backend not reachable");
        console.error("Health check failed:", error);
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-6">
      <div
        className={`mb-8 px-5 py-2 rounded-md text-sm font-medium ${
          connected ? "bg-green-700 text-green-100" : "bg-red-700 text-red-100"
        }`}
      >
        {status}
      </div>

      <h1 className="text-3xl font-semibold text-white text-center">
        User Management Application
      </h1>
    </div>
  );
}
