let getToken: (() => Promise<string>) | null = null;

export function setAuth0TokenGetter(fn: () => Promise<string>) {
  getToken = fn;
}

export async function getAuth0Token(): Promise<string | null> {
  if (!getToken) return null;

  try {
    return await getToken();
  } catch {
    return null;
  }
}