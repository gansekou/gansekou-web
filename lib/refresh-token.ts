const KEY = "gansekou_refresh_token";

export function saveRefreshToken(token: string) {
  localStorage.setItem(KEY, token);
}

export function getRefreshToken() {
  return localStorage.getItem(KEY);
}

export function removeRefreshToken() {
  localStorage.removeItem(KEY);
}
