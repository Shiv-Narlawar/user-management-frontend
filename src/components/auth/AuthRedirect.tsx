import { useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useToast } from "../../context/ToastContext";

type AuthRedirectProps = {
  returnTo?: string;
};

export default function AuthRedirect({
  returnTo = "/app",
}: AuthRedirectProps) {
  const { loginWithRedirect, isLoading } = useAuth0();
  const { push } = useToast();
  const startedRef = useRef(false);

  useEffect(() => {
    if (isLoading || startedRef.current) {
      return;
    }

    startedRef.current = true;

    void loginWithRedirect({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        redirect_uri: window.location.origin,
        prompt: "login",
      },
      appState: {
        returnTo,
      },
    }).catch(() => {
      push("error", "Login failed");
      startedRef.current = false;
    });
  }, [isLoading, loginWithRedirect, push, returnTo]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-300">
      Redirecting to secure login...
    </div>
  );
}
