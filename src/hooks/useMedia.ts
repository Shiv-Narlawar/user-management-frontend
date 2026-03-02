import { useEffect, useState } from "react";
export function useMedia(query: string) {
  const [matches, setMatches] = useState(() => matchMedia(query).matches);
  useEffect(() => { const m = matchMedia(query); const onChange = () => setMatches(m.matches); m.addEventListener("change", onChange); return () => m.removeEventListener("change", onChange); }, [query]);
  return matches;
}
