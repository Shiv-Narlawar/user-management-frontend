import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function useRoleRedirect() {

  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {

    if (loading || !user) return;

    if (user.role === "ADMIN") {
      navigate("/admin", { replace: true });
    }

    if (user.role === "MANAGER") {
      navigate("/manager", { replace: true });
    }

    if (user.role === "USER") {
      navigate("/dashboard", { replace: true });
    }

  }, [user, loading, navigate]);

}