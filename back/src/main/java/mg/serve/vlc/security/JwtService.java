package mg.serve.vlc.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import mg.serve.vlc.model.user.User;
import mg.serve.vlc.repository.ConfigRepository;
import mg.serve.vlc.util.RepositoryProvider;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;

@Component
public class JwtService {

    private final SecretKey key;
    private long expirationSeconds;

    @Autowired
    public JwtService(
        @Value("${app.security.jwt.secret}") String secret,
        ConfigRepository configRepository
    ) {
        byte[] bytes = secret.length() % 4 == 0 ? Decoders.BASE64.decode(secret) : secret.getBytes();
        this.key = Keys.hmacShaKeyFor(bytes);

        String expStr = configRepository.getLastValueByKey("TOKEN_EXPIRATION");
        try {
            this.expirationSeconds = Integer.parseInt(expStr);
        } catch (Exception e) {
            this.expirationSeconds = 180; // Fallback
        }
    }

    public String generateToken(String email) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(expirationSeconds);
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(exp))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String validateAndGetSubject(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid or expired token", e);
        }
    }

    public Instant getExpiryFromNow() {
        System.out.println("[CONFIG] getExpiryFromNow: " + expirationSeconds);
        return Instant.now().plusSeconds(expirationSeconds);
    }

    public String getTokenEmailFromHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        return validateAndGetSubject(token);
    }

    public User getUserFromAuthHeader(String authHeader) {
        String email = getTokenEmailFromHeader(authHeader);
        System.out.println("Email from header: " + email);
        return RepositoryProvider.userRepository.findByEmail(email);
    }
}