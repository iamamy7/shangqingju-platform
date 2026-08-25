interface SqjUser { id: string; phone: string; displayName: string }

export function useSqjAuth() {
  const token = useState<string>("sqj-token", () => "");
  const user = useState<SqjUser | null>("sqj-user", () => null);
  if (import.meta.client && !token.value) {
    token.value = localStorage.getItem("sqj_token") || "";
    const saved = localStorage.getItem("sqj_user");
    if (saved) user.value = JSON.parse(saved) as SqjUser;
  }
  function setSession(nextToken: string, nextUser: SqjUser) {
    token.value = nextToken; user.value = nextUser;
    if (import.meta.client) { localStorage.setItem("sqj_token", nextToken); localStorage.setItem("sqj_user", JSON.stringify(nextUser)); }
  }
  function logout() {
    token.value = ""; user.value = null;
    if (import.meta.client) { localStorage.removeItem("sqj_token"); localStorage.removeItem("sqj_user"); }
  }
  function authHeaders() { return { Authorization: `Bearer ${token.value}` }; }
  return { token, user, setSession, logout, authHeaders };
}
