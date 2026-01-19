FROM maven:3.9.4-eclipse-temurin-21

WORKDIR /app

# copy mvnw so we can use it (keeps same behaviour as local dev)
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

RUN chmod +x mvnw && mvn -B -f pom.xml -DskipTests dependency:go-offline

# copy the rest of the project
COPY . .

EXPOSE 8080

# Run using maven wrapper - run in the foreground and disable forking so devtools restart works
CMD ["./mvnw", "spring-boot:run", "-Dspring-boot.run.fork=false"]
