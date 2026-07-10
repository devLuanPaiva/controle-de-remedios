package com.devluanpaiva.controle_de_remedios.modules.auth.service;

import lombok.RequiredArgsConstructor;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.devluanpaiva.controle_de_remedios.modules.auth.dto.AuthResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.auth.dto.LoginRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.auth.dto.RefreshTokenRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.repository.UserRepository;
import com.devluanpaiva.controle_de_remedios.security.JwtService;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

@Service
@RequiredArgsConstructor
public class AuthService {
        private static final String REFRESH_TOKEN_FIELD = "refreshToken";
        private static final String REFRESH_TOKEN_INVALID_MESSAGE = "Refresh token inválido";

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;

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

        private BusinessException unauthorized(String message, String field, String detail) {
                return new BusinessException(
                                HttpStatus.UNAUTHORIZED,
                                message,
                                "AUTH_UNAUTHORIZED",
                                field,
                                detail);
        }
}
