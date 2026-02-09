import { useEffect, useState } from "react";

export default function App() {
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState("Checking backend connection...");

  useEffect(() => {
    fetch("http://localhost:3001/health")
      .then((res) => {
        if (!res.ok) throw new Error("Backend error");
        return res.json();
      })
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

      <h1 className="text-3xl md:text-4xl font-semibold text-white text-center">
        User Management Application
      </h1>

      <p className="mt-3 text-gray-400 text-center max-w-md">
        A scalable platform for managing users, roles, and permissions.
      </p>

    </div>
  );
}
