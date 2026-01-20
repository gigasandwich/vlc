FROM maven:3.9.4-eclipse-temurin-21

WORKDIR /app

COPY pom.xml .

RUN mvn -B -f pom.xml -DskipTests dependency:go-offline

COPY . .

EXPOSE 8080

CMD ["mvn", "spring-boot:run", "-Dspring-boot.run.fork=false"]
