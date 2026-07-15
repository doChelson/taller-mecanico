# ---- Etapa 1: compilar el frontend (React + Vite) ----
FROM node:20 AS frontend
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ---- Etapa 2: compilar el backend (Spring Boot) con el frontend adentro ----
FROM maven:3.9-eclipse-temurin-17 AS backend
WORKDIR /backend
COPY backend/pom.xml ./
COPY backend/src ./src
# copiar el frontend ya compilado dentro de los recursos estáticos del backend
COPY --from=frontend /frontend/dist ./src/main/resources/static
RUN mvn -B package -DskipTests

# ---- Etapa 3: imagen final que se ejecuta (trae Java 17 adentro) ----
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=backend /backend/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
