const BASE = '/api';

export async function signIn(email, password) {
  const res = await fetch(`${BASE}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Error al conectar con el servidor');
  return res.json();
}
