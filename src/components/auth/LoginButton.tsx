import { useAuth0 } from "@auth0/auth0-react";

export default function LoginButton() {
  const { loginWithRedirect, isLoading } = useAuth0();

  if (isLoading) return null;

  return (
    <button onClick={() => loginWithRedirect()}>
      Login with Auth0
    </button>
  );
}