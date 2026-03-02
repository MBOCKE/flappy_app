const API_URL = 'https://flappy-app.onrender.com';

function getToken() {
  return localStorage.getItem('token');
}

function setAuth(data) {
  if (!data || !data.token || !data.user) return;
  localStorage.setItem('token', data.token);
  localStorage.setItem('username', data.user.username);
  localStorage.setItem('best_score', data.user.best_score ?? 0);
}

function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('best_score');
}

async function apiRegister(username, password) {
  const res = await fetch(`${API_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  return data;
}

async function apiLogin(username, password) {
  const res = await fetch(`${API_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data;
}

async function apiMe() {
  const token = getToken();
  const res = await fetch(`${API_URL}/api/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load user');
  return data;
}

async function apiLeaderboard() {
  const res = await fetch(`${API_URL}/api/leaderboard`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load leaderboard');
  return data;
}

async function apiSubmitScore(score) {
  const token = getToken();
  const res = await fetch(`${API_URL}/api/score`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ score }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to submit score');
  return data;
}
