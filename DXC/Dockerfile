# === First stage: Build the JAR ===
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app

COPY . .

# Give execute permission to the Maven wrapper
RUN chmod +x mvnw

# Build the application
RUN ./mvnw clean package -DskipTests

# === Second stage: Run the JAR ===
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
