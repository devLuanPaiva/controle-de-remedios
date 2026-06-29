package com.devluanpaiva.controle_de_remedios.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {
    @Value("${spring.security.jwt.secret}")
    private String jwtSecret;

    private SecretKey getSignInKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    private String buildToken(JwtParamsDTO jwtParams) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + jwtParams.expirationMillis());

        return Jwts.builder()
                .subject(jwtParams.userId().toString())
                .claim("email", jwtParams.email())
                .claim("name", jwtParams.name())
                .claim("role", jwtParams.role().name())
                .claim("cpf", jwtParams.cpf())
                .claim("type", jwtParams.type())
                .issuedAt(now)
                .expiration(expiration)
                .signWith(getSignInKey())
                .compact();
    }

    public String generateToken(JwtParamsDTO jwtParams) {

        long expiration = "refresh".equalsIgnoreCase(jwtParams.type()) ? 24 * 60 * 60 * 1000
                : jwtParams.expirationMillis();

        JwtParamsDTO updatedJwtParams = new JwtParamsDTO(
                jwtParams.userId(),
                jwtParams.email(),
                jwtParams.name(),
                jwtParams.role(),
                jwtParams.cpf(),
                jwtParams.type(),
                expiration);

        return buildToken(updatedJwtParams);
    }

    public String generateAccessToken(JwtParamsDTO jwtParams) {
        return generateToken(new JwtParamsDTO(
                jwtParams.userId(),
                jwtParams.email(),
                jwtParams.name(),
                jwtParams.role(),
                jwtParams.cpf(),
                "access", 1000L * 60 * 60));
    }

    public String generateRefreshToken(JwtParamsDTO jwtParams) {
        return generateToken(new JwtParamsDTO(
                jwtParams.userId(),
                jwtParams.email(),
                jwtParams.name(),
                jwtParams.role(),
                jwtParams.cpf(),
                "refresh", 1000L * 60 * 60 * 24 * 7));
    }

     public UUID extractUserId(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return UUID.fromString(claims.getSubject());
    }

    public Claims parseClaims(String refreshToken) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(refreshToken)
                .getPayload();
    }

    public boolean isRefreshToken(
            String token) {

        return "refresh".equals(
                parseClaims(token)
                        .get(
                                "type",
                                String.class));
    }

    public boolean isAccessToken(
            String token) {

        return "access".equals(
                parseClaims(token)
                        .get(
                                "type",
                                String.class));
    }

    public String extractRole(
            String token) {

        return parseClaims(token)
                .get(
                        "role",
                        String.class);
    }
}
