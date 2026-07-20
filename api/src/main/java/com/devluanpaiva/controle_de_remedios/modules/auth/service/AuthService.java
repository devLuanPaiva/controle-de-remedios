package com.devluanpaiva.controle_de_remedios.modules.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devluanpaiva.controle_de_remedios.modules.auth.dto.AuthResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.auth.dto.ForgotPasswordRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.auth.dto.LoginRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.auth.dto.RefreshTokenRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.auth.dto.ResetPasswordRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.auth.entity.PasswordResetToken;
import com.devluanpaiva.controle_de_remedios.modules.auth.enums.RequestContext;
import com.devluanpaiva.controle_de_remedios.modules.auth.repository.PasswordResetTokenRepository;
import com.devluanpaiva.controle_de_remedios.modules.notification.service.EmailService;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.repository.UserRepository;
import com.devluanpaiva.controle_de_remedios.security.JwtService;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
        private static final String REFRESH_TOKEN_FIELD = "refreshToken";
        private static final String REFRESH_TOKEN_INVALID_MESSAGE = "Refresh token inválido";
        private static final String HASH_ALGORITHM = "SHA-256";
        private static final SecureRandom SECURE_RANDOM = new SecureRandom();

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final PasswordResetTokenRepository passwordResetTokenRepository;
        private final EmailService emailService;

        @Value("${app.frontend.desktop-reset-password-url}")
        private String desktopResetPasswordUrl;

        @Value("${app.frontend.mobile-reset-password-url}")
        private String mobileResetPasswordUrl;

        @Value("${app.password-reset.token-expiration-minutes}")
        private long tokenExpirationMinutes;

        public AuthResponseDTO login(LoginRequestDTO dto) {
                User user = userRepository.findByEmail(dto.email())
                                .orElseThrow(() -> unauthorized(
                                                "Credenciais inválidas",
                                                "CREDENTIALS",
                                                "As credenciais informadas estão incorretas"));

                boolean passwordMatches = passwordEncoder.matches(
                                dto.password(),
                                user.getPassword());

                if (!passwordMatches) {
                        throw unauthorized(
                                        "Credenciais inválidas",
                                        "CREDENTIALS",
                                        "As credenciais informadas estão incorretas");
                }

                String accessToken = jwtService.generateAccessToken(user);

                String refreshToken = jwtService.generateRefreshToken(user);

                return new AuthResponseDTO(
                                accessToken,
                                refreshToken);
        }

        public AuthResponseDTO refresh(
                        RefreshTokenRequestDTO dto) {

                boolean isRefreshToken;

                try {
                        isRefreshToken = jwtService.isRefreshToken(dto.refreshToken());
                } catch (RuntimeException ex) {
                        throw unauthorized(
                                        REFRESH_TOKEN_INVALID_MESSAGE,
                                        REFRESH_TOKEN_FIELD,
                                        "O token está inválido, expirado ou malformado");
                }

                if (!isRefreshToken) {
                        throw unauthorized(
                                        REFRESH_TOKEN_INVALID_MESSAGE,
                                        REFRESH_TOKEN_FIELD,
                                        "O token informado não é um refresh token");
                }

                UUID userId;

                try {
                        userId = jwtService.extractUserId(dto.refreshToken());
                } catch (RuntimeException ex) {
                        throw unauthorized(
                                        REFRESH_TOKEN_INVALID_MESSAGE,
                                        REFRESH_TOKEN_FIELD,
                                        "Não foi possível extrair o usuário do token");
                }

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> unauthorized(
                                                REFRESH_TOKEN_INVALID_MESSAGE,
                                                REFRESH_TOKEN_FIELD,
                                                "Usuário associado ao token não encontrado"));

                String accessToken = jwtService.generateAccessToken(user);

                String refreshToken = jwtService.generateRefreshToken(user);

                return new AuthResponseDTO(accessToken, refreshToken);
        }

        @Transactional
        public void forgotPassword(ForgotPasswordRequestDTO dto) {
                userRepository.findByEmail(dto.email())
                                .ifPresent(user -> issuePasswordResetToken(user, dto.context()));
        }

        @Transactional
        public void resetPassword(ResetPasswordRequestDTO dto) {
                if (!dto.newPassword().equals(dto.confirmPassword())) {
                        throw passwordMismatch();
                }

                PasswordResetToken token = passwordResetTokenRepository.findByTokenHash(hash(dto.token()))
                                .orElseThrow(this::invalidToken);

                if (token.isExpired()) {
                        passwordResetTokenRepository.delete(token);
                        throw invalidToken();
                }

                User user = userRepository.findById(token.getUserId())
                                .orElseThrow(this::invalidToken);

                user.setPassword(passwordEncoder.encode(dto.newPassword()));
                userRepository.save(user);

                passwordResetTokenRepository.deleteByUserId(user.getId());
        }

        private void issuePasswordResetToken(User user, RequestContext context) {
                passwordResetTokenRepository.deleteByUserId(user.getId());

                String rawToken = generateRawToken();

                PasswordResetToken token = PasswordResetToken.builder()
                                .userId(user.getId())
                                .tokenHash(hash(rawToken))
                                .expiresAt(LocalDateTime.now().plusMinutes(tokenExpirationMinutes))
                                .build();

                passwordResetTokenRepository.save(token);

                String resetUrl = buildResetUrl(context, rawToken);

                try {
                        emailService.sendPasswordResetEmail(user, resetUrl, tokenExpirationMinutes);
                } catch (RuntimeException ex) {
                        log.error("Falha ao enviar e-mail de redefinição de senha para o usuário '{}'", user.getId(), ex);
                }
        }

        private String buildResetUrl(RequestContext context, String rawToken) {
                String baseUrl = context == RequestContext.MOBILE ? mobileResetPasswordUrl : desktopResetPasswordUrl;
                return baseUrl + "?token=" + rawToken;
        }

        private String generateRawToken() {
                byte[] randomBytes = new byte[32];
                SECURE_RANDOM.nextBytes(randomBytes);
                return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
        }

        private String hash(String value) {
                try {
                        MessageDigest digest = MessageDigest.getInstance(HASH_ALGORITHM);
                        byte[] hashed = digest.digest(value.getBytes(StandardCharsets.UTF_8));
                        return Base64.getEncoder().encodeToString(hashed);
                } catch (NoSuchAlgorithmException ex) {
                        throw new IllegalStateException("Algoritmo de hash indisponível", ex);
                }
        }

        private BusinessException invalidToken() {
                return new BusinessException(
                                HttpStatus.BAD_REQUEST,
                                "Token inválido ou expirado",
                                "PASSWORD_RESET_TOKEN_INVALID",
                                "token",
                                "O token informado é inválido, expirado ou já foi utilizado.");
        }

        private BusinessException passwordMismatch() {
                return new BusinessException(
                                HttpStatus.BAD_REQUEST,
                                "As senhas não coincidem",
                                "PASSWORD_MISMATCH",
                                "confirmPassword",
                                "A nova senha e a confirmação de senha precisam ser iguais.");
        }

        private BusinessException unauthorized(String message, String field, String detail) {
                return new BusinessException(
                                HttpStatus.UNAUTHORIZED,
                                message,
                                "AUTH_UNAUTHORIZED",
                                field,
                                detail);
        }
}
