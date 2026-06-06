# Java + React/Vite SignIn Project

## Estructura
- `backend`: Java backend con Spring Boot
- `frontend`: React con Vite

## Requisitos
- Java 17 o superior
- Maven
- Node.js 18 o superior
- npm

## Pasos iniciales
1. Abrir la carpeta `c:\Users\Ezkol\java-react-signin` en VS Code.
2. Backend:
   - `cd backend`
   - `mvn spring-boot:run`
3. Frontend:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

## Desarrollo
- El frontend hace peticiones a `/api` y el proxy Vite redirige a `http://localhost:8080`.
- El backend expone un endpoint `POST /api/auth/signin`.

## Siguientes pasos
- Implementar autenticación real en el backend.
- Crear validaciones y diseño en el formulario de React.
