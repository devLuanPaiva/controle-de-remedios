package com.devluanpaiva.controle_de_remedios.modules.auth.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import com.devluanpaiva.controle_de_remedios.modules.auth.dto.AuthResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.auth.dto.LoginRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.auth.dto.RefreshTokenRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.auth.service.AuthService;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public AuthResponseDTO login(
            @RequestBody @Valid LoginRequestDTO dto) {
        return authService.login(dto);
    }

    @PostMapping("/refresh")
    public AuthResponseDTO refresh(
            @RequestBody @Valid RefreshTokenRequestDTO dto) {

        return authService.refresh(dto);
    }
}
