const BASE = '/api';

export async function signIn(empresa, password) {
  let res;
  try {
    res = await fetch(`${BASE}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ empresa, password }),
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor');
  }
  // El backend devuelve el cuerpo con { success, message } incluso en errores 400/401/403
  const data = await res.json().catch(() => ({}));
  return data;
}
