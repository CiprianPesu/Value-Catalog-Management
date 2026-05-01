FROM eclipse-temurin:25-jdk-alpine

WORKDIR /app

COPY target/*.jar app.jar

COPY fullchain.pem /tmp/fullchain.pem

RUN keytool -importcert \
    -alias my-api \
    -file /tmp/fullchain.pem \
    -cacerts \
    -storepass changeit \
    -noprompt

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]