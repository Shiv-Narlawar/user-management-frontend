import { useEffect, useState } from "react";
import axios from "axios";

export default function App() {
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState("Checking backend connection...");

  useEffect(() => {
    axios
      .get("http://localhost:3001/health")
      .then(() => {
        setConnected(true);
        setStatus("Backend connected successfully");
      })
      .catch(() => {
        setConnected(false);
        setStatus("Backend not reachable");
      });
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