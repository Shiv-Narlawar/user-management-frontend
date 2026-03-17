let getToken: (() => Promise<string>) | null = null;

export function setAuth0TokenGetter(fn: () => Promise<string>) {
  getToken = fn;
}

export async function getAuth0Token(): Promise<string | null> {

  if (!getToken) return null;

  try {

    const token = await getToken();

    if (!token) {
      return null;
    }

    return token;

  } catch (error) {

    console.warn("Auth0 token fetch failed:", error);
    return null;

  }
}