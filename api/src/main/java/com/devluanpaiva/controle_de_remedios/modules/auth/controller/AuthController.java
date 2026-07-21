package com.devluanpaiva.controle_de_remedios.modules.auth.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import com.devluanpaiva.controle_de_remedios.modules.auth.dto.AuthResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.auth.dto.ForgotPasswordRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.auth.dto.LoginRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.auth.dto.RefreshTokenRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.auth.dto.ResetPasswordRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.auth.service.AuthService;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponse;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponseFactory;

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

    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgotPassword(@RequestBody @Valid ForgotPasswordRequestDTO dto) {
        authService.forgotPassword(dto);
        return ApiResponseFactory.success(
                "Se o e-mail informado estiver cadastrado, você receberá as instruções para redefinição de senha",
                null);
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@RequestBody @Valid ResetPasswordRequestDTO dto) {
        authService.resetPassword(dto);
        return ApiResponseFactory.success("Senha redefinida com sucesso", null);
    }
}
