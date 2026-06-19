# Multi-stage build for the BFF. Build context = PROJECT ROOT (so ../knowledge-base is available,
# because the pom copies ${basedir}/../knowledge-base/*.json into the classpath).
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY knowledge-base ./knowledge-base
COPY bff ./bff
WORKDIR /app/bff
RUN mvn -q -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/bff/target/system-design-lab-bff-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
