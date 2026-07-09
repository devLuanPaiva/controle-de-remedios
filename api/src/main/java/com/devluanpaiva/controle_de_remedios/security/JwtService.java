package com.devluanpaiva.controle_de_remedios.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.devluanpaiva.controle_de_remedios.modules.users.entity.User;

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

        private String buildToken(User user, long expirationMillis, String type) {
                Date now = new Date();
                Date exp = new Date(System.currentTimeMillis() + expirationMillis);

                return Jwts.builder()
                                .subject(user.getId().toString())
                                .claim("name", user.getName())
                                .claim("email", user.getEmail())
                                .claim("type", type)
                                .claim("role", user.getRole().name())
                                .claim("imageUrl", user.getImageUrl())
                                .claim("isActive", user.getActive())
                                .issuedAt(now)
                                .expiration(exp)
                                .signWith(getSignInKey())
                                .compact();
        }

        public String generateAccessToken(User user) {
                return buildToken(user, 1000L * 60 * 60, "access");
        }

        public String generateRefreshToken(User user) {
                return buildToken(user, 1000L * 60 * 60 * 24 * 7, "refresh");
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

                return "refresh".equals(parseClaims(token).get("type", String.class));
        }

        public boolean isAccessToken(String token) {

                return "access".equals(parseClaims(token).get("type", String.class));
        }
}
