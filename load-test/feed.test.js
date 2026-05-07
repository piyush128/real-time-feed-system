import http from 'k6/http';

export const options = {
  vus: 50,
  duration: '30s',
};

export function setup() {
  const res = http.post(
    'http://34.93.229.248/api/auth/login',
    JSON.stringify({ identifier: 'loadtest@test.com', password: 'password123' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  return { token: res.json('token') };
}

export default function(data) {
  http.get('http://34.93.229.248/api/feed', {
    headers: { Authorization: `Bearer ${data.token}` },
  });
}
