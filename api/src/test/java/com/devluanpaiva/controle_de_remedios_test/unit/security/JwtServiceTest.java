package com.devluanpaiva.controle_de_remedios_test.unit.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Date;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.security.JwtService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;

@DisplayName("JwtService")
class JwtServiceTest {

    private static final String TEST_SECRET = "unit-test-jwt-secret-0123456789-0123456789-0123456789-0123456789";

    private JwtService jwtService;
    private SecretKey signInKey;

    private User user;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "jwtSecret", TEST_SECRET);

        signInKey = Keys.hmacShaKeyFor(TEST_SECRET.getBytes());

        user = User.builder()
                .id(UUID.randomUUID())
                .name("Luan Alves")
                .email("luan@example.com")
                .password("encoded-password")
                .cpf("12345678901")
                .active(true)
                .role(UserRole.ADMIN)
                .imageUrl("https://example.com/avatar.png")
                .build();
    }

    @Nested
    @DisplayName("generateAccessToken")
    class GenerateAccessToken {

        @Test
        @DisplayName("should generate a token identified as access, not refresh, carrying the correct claims")
        void shouldGenerateTokenWithCorrectTypeAndClaims() {
            String token = jwtService.generateAccessToken(user);

            assertThat(jwtService.isAccessToken(token)).isTrue();
            assertThat(jwtService.isRefreshToken(token)).isFalse();
            assertThat(jwtService.extractUserId(token)).isEqualTo(user.getId());

            Claims claims = jwtService.parseClaims(token);

            assertThat(claims.get("name", String.class)).isEqualTo(user.getName());
            assertThat(claims.get("email", String.class)).isEqualTo(user.getEmail());
            assertThat(claims.get("role", String.class)).isEqualTo(user.getRole().name());
            assertThat(claims.get("imageUrl", String.class)).isEqualTo(user.getImageUrl());
            assertThat(claims.get("isActive", Boolean.class)).isEqualTo(user.getActive());
        }
    }

    @Nested
    @DisplayName("generateRefreshToken")
    class GenerateRefreshToken {

        @Test
        @DisplayName("should generate a token identified as refresh, not access, carrying the correct claims")
        void shouldGenerateTokenWithCorrectTypeAndClaims() {
            String token = jwtService.generateRefreshToken(user);

            assertThat(jwtService.isRefreshToken(token)).isTrue();
            assertThat(jwtService.isAccessToken(token)).isFalse();
            assertThat(jwtService.extractUserId(token)).isEqualTo(user.getId());

            Claims claims = jwtService.parseClaims(token);

            assertThat(claims.get("name", String.class)).isEqualTo(user.getName());
            assertThat(claims.get("email", String.class)).isEqualTo(user.getEmail());
            assertThat(claims.get("role", String.class)).isEqualTo(user.getRole().name());
            assertThat(claims.get("imageUrl", String.class)).isEqualTo(user.getImageUrl());
            assertThat(claims.get("isActive", Boolean.class)).isEqualTo(user.getActive());
        }
    }

    @Nested
    @DisplayName("token validation")
    class TokenValidation {

        @Test
        @DisplayName("should throw ExpiredJwtException when the token is expired")
        void shouldThrowExpiredJwtExceptionWhenTokenIsExpired() {
            String expiredToken = Jwts.builder()
                    .subject(user.getId().toString())
                    .claim("type", "access")
                    .issuedAt(new Date(System.currentTimeMillis() - 10_000))
                    .expiration(new Date(System.currentTimeMillis() - 5_000))
                    .signWith(signInKey)
                    .compact();

            assertThatThrownBy(() -> jwtService.extractUserId(expiredToken))
                    .isInstanceOf(ExpiredJwtException.class);
        }

        @Test
        @DisplayName("should throw MalformedJwtException when the token is not a valid JWT")
        void shouldThrowMalformedJwtExceptionWhenTokenIsMalformed() {
            assertThatThrownBy(() -> jwtService.extractUserId("not-a-valid-jwt-token"))
                    .isInstanceOf(MalformedJwtException.class);
        }

        @Test
        @DisplayName("should throw SignatureException when the token is signed with a different secret")
        void shouldThrowSignatureExceptionWhenSignedWithDifferentSecret() {
            SecretKey otherKey = Keys.hmacShaKeyFor(
                    "a-completely-different-secret-0123456789-0123456789-0123456789".getBytes());

            String tokenSignedWithOtherKey = Jwts.builder()
                    .subject(user.getId().toString())
                    .claim("type", "access")
                    .issuedAt(new Date())
                    .expiration(new Date(System.currentTimeMillis() + 60_000))
                    .signWith(otherKey)
                    .compact();

            assertThatThrownBy(() -> jwtService.extractUserId(tokenSignedWithOtherKey))
                    .isInstanceOf(SignatureException.class);
        }

        @Test
        @DisplayName("should return false for both isAccessToken and isRefreshToken when the type claim is missing")
        void shouldReturnFalseForBothTypeChecksWhenTypeClaimIsMissing() {
            String tokenWithoutTypeClaim = Jwts.builder()
                    .subject(user.getId().toString())
                    .issuedAt(new Date())
                    .expiration(new Date(System.currentTimeMillis() + 60_000))
                    .signWith(signInKey)
                    .compact();

            assertThat(jwtService.isAccessToken(tokenWithoutTypeClaim)).isFalse();
            assertThat(jwtService.isRefreshToken(tokenWithoutTypeClaim)).isFalse();
        }
    }
}