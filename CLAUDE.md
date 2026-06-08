# AutoFix SpA — Taller Mecánico

## Contexto del proyecto
Proyecto universitario: sistema de gestión para un taller mecánico llamado **AutoFix SpA**.
El equipo está dividido: un integrante construyó el backend (Spring Boot), otro (yo) construye el frontend (React).

## Stack

### Backend (ya construido, en `/backend`)
- Spring Boot + JPA + PostgreSQL (`autofix_db` en `localhost:5432`)
- Corre en `http://localhost:8080`

### Frontend (en `/frontend`)
- React 18 + Vite 5
- React Router v6 para navegación
- Tailwind CSS para estilos
- El proxy de Vite redirige `/api` → `http://localhost:8080`

## Endpoints reales del backend (base `/api`)

### Auth
- `POST /api/auth/signin` → body `{email, password}` → responde `{email, message, success}`
  - Login simulado, sin token. Si `success=true` → permitir acceso al dashboard.

### Clientes (ClienteDTO: `id, rut, nombre, telefono, email, direccion, createdAt`)
- `GET    /api/clientes`
- `POST   /api/clientes`         body: `{rut, nombre, telefono, email, direccion}`
- `GET    /api/clientes/{id}`
- `PUT    /api/clientes/{id}`    body: `{rut, nombre, telefono, email, direccion}`
- `DELETE /api/clientes/{id}`    → 204 No Content
- `GET    /api/clientes/{clienteId}/vehiculos`
- `POST   /api/clientes/{clienteId}/vehiculos`  body: `{patente, marca, modelo, anio, kilometraje}`

### Vehículos (VehiculoDTO: `id, clienteId, patente, marca, modelo, anio, kilometraje`)
- `GET  /api/vehiculos`
- `POST /api/vehiculos`  body: `{clienteId, patente, marca, modelo, anio, kilometraje}`
- Nota: en las respuestas el campo `cliente` está excluido (`@JsonBackReference`)

### Órdenes de trabajo
Respuesta incluye `{id, numero, fechaIngreso, estado, diagnosticoPreliminar, vehiculo{...}}`
- `GET    /api/ordenes`
- `GET    /api/ordenes/{id}`
- `GET    /api/ordenes/vehiculo/{vehiculoId}`
- `GET    /api/ordenes/estado/{estado}`       estados: `CREADA | EN_PROCESO | FINALIZADA`
- `POST   /api/ordenes`                       body: `{estado, diagnosticoPreliminar, vehiculoId}`
- `DELETE /api/ordenes/{id}`                  → 204 No Content

### Reservas
Respuesta incluye `{id, fecha, hora, motivo, estado, cliente{...}, vehiculo{...}}`
- `GET  /api/reservas`
- `POST /api/reservas`  body: `{fecha(yyyy-MM-dd), hora(HH:mm:ss), motivo, estado, clienteId, vehiculoId}`

## Estructura del frontend (`/frontend/src`)

```
src/
├── api/           ← llamadas centralizadas a la API (fetch, no axios)
├── components/
│   ├── ui/        ← Button, Input, Badge, Card, Table, Modal
│   └── layout/    ← Sidebar, Header, Layout
├── context/       ← AuthContext (estado de auth en React, NO localStorage)
└── pages/         ← Login, Dashboard, Clientes, Vehiculos, Ordenes, Reservas
```

## Notas de implementación importantes
- `hora` en reservas: el input type="time" devuelve `HH:mm`, el backend espera `HH:mm:ss`. Appendear `:00`.
- DELETE 204: no intentar parsear JSON en las respuestas vacías.
- Auth en React state solamente: refresh de página cierra sesión (aceptable para el proyecto).
- El proxy de Vite ya está configurado en `vite.config.js` — no modificar.

---

**Instrucción permanente:** Al final de cada respuesta, da una opinión personal sincera y honesta.
