package com.devluanpaiva.controle_de_remedios.modules.auth.service;

import lombok.RequiredArgsConstructor;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.devluanpaiva.controle_de_remedios.modules.auth.dto.AuthResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.auth.dto.LoginRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.auth.dto.RefreshTokenRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.users.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.users.repository.UserRepository;
import com.devluanpaiva.controle_de_remedios.security.JwtService;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponseDTO login(LoginRequestDTO dto) {
        User user = userRepository.findByEmail(dto.email())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Credenciais inválidos"));

        boolean passwordMatches = passwordEncoder.matches(
                dto.password(),
                user.getPassword());

        if (!passwordMatches) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Credenciais inválidos");
        }

        String accessToken = jwtService.generateAccessToken(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole(),
                user.getImageUrl());

        String refreshToken = jwtService.generateRefreshToken(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getImageUrl());

        return new AuthResponseDTO(
                accessToken,
                refreshToken);
    }

    public AuthResponseDTO refresh(
            RefreshTokenRequestDTO dto) {

        if (!jwtService.isRefreshToken(
                dto.refreshToken())) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Refresh token inválido");
        }

        UUID userId = jwtService.extractUserId(
                dto.refreshToken());

        User user = userRepository.findById(userId)
                .orElseThrow();

        String accessToken = jwtService.generateAccessToken(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getImageUrl());

        String refreshToken = jwtService.generateRefreshToken(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getImageUrl());

        return new AuthResponseDTO(
                accessToken,
                refreshToken);
    }
}
