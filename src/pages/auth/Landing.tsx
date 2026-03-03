import { useNavigate } from "react-router-dom"

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center 
    bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white overflow-hidden">

    
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.25),_transparent_60%)]" />

      {/* Content */}
      <div className="relative z-10 text-center max-w-xl px-6">

        <div className="flex items-center justify-center mb-6 space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="font-bold">🔐</span>
          </div>
          <h1 className="text-2xl font-semibold">RBAC Manager</h1>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Secure User <br /> Management
        </h2>

        <p className="text-slate-400 mb-10">
          Efficiently manage Admin, Manager, and Viewer roles with granular control,
          real-time auditing, and enhanced infrastructure security.
        </p>

        {/* Feature Badges */}
        <div className="flex justify-center gap-4 mb-10">
          <span className="px-4 py-2 bg-slate-800 rounded-full text-sm border border-blue-600">
            Secure
          </span>
          <span className="px-4 py-2 bg-slate-800 rounded-full text-sm border border-blue-600">
            Scalable
          </span>
          <span className="px-4 py-2 bg-slate-800 rounded-full text-sm border border-blue-600">
            Audit
          </span>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-blue-600 py-3 rounded-xl text-lg hover:bg-blue-700 transition duration-300 shadow-lg"
          >
            Sign In
          </button>

          <button
            onClick={() => navigate("/signup")}
            className="w-full bg-slate-800 py-3 rounded-xl text-lg hover:bg-slate-700 transition duration-300 border border-slate-700"
          >
            Create Account
          </button>
        </div>

        <p className="text-slate-500 mt-12 text-sm">
          Enterprise-grade RBAC Solutions © 2024
        </p>
      </div>
    </div>
  )
}