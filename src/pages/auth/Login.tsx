import { ShieldCheck } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import { useToast } from "../../context/ToastContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

export default function LoginPage() {
  const { loginWithRedirect, isLoading } = useAuth0();
  const { push } = useToast();

  const handleLogin = async () => {
    try {
      await loginWithRedirect({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          redirect_uri: window.location.origin,
        },
        appState: {
          returnTo: "/app",
        },
      });
    } catch {
      push("error", "login failed");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-400">
        loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Card className="w-full max-w-md p-10 bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-2xl">
        {/* header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 mb-3">
            <ShieldCheck size={26} />
          </div>

          <h1 className="text-3xl font-bold text-white">
            RBAC Manager
          </h1>

          <p className="text-sm text-slate-400 mt-1">
            secure access control platform
          </p>
        </div>

        {/* login button */}
        <Button
          onClick={handleLogin}
          className="w-full bg-indigo-600 hover:bg-indigo-500"
        >
          continue with auth0
        </Button>
      </Card>
    </div>
  );
}