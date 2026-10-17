
FROM gradle:8.14-jdk21 AS build

WORKDIR /app

COPY . .

RUN gradle clean bootJar --no-daemon

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

CMD ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
