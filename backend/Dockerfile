# Multi-stage build for Ingoboka backend
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S ingoboka && adduser -S ingoboka -G ingoboka
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
RUN chown -R ingoboka:ingoboka /app
USER ingoboka
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
