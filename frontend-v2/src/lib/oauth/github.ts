export function startGithubLoginFlow() {
  const { clientId, redirectUri, scope } = getGithubConfig();
  const state = crypto.randomUUID();
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
  return url;
}

export function getGithubConfig() {
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI;
  const scope = "user:email read:user";
  return { clientId, redirectUri, scope };
}
