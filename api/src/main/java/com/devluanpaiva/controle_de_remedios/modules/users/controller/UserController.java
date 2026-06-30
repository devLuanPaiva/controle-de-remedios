package com.devluanpaiva.controle_de_remedios.modules.users.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.UUID;

import com.devluanpaiva.controle_de_remedios.modules.users.dto.ChangePasswordRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.users.dto.CreateUserRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.users.dto.ResetPasswordRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.users.dto.UpdateUserRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.users.dto.UserResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.users.service.UserService;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponse;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponseFactory;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<UserResponseDTO> createUser(@RequestBody @Valid CreateUserRequestDTO dto) {
        return ApiResponseFactory.success("Usuário Criado com Sucesso", userService.createUser(dto));
    }

    @GetMapping
    public ApiResponse<List<UserResponseDTO>> getAllUsers() {
        return ApiResponseFactory.success("Lista de usuários obtida com sucesso", userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ApiResponse<UserResponseDTO> getUserById(@PathVariable UUID id) {
        return ApiResponseFactory.success("Usuário encontrado com sucesso", userService.getUserById(id));
    }

    @PatchMapping("/{id}")
    public ApiResponse<UserResponseDTO> updateUser(@PathVariable UUID id,
            @RequestBody @Valid UpdateUserRequestDTO dto) {
        return ApiResponseFactory.success("Usuário atualizado com sucesso", userService.updateUser(id, dto));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ApiResponseFactory.success("Usuário deletado com sucesso", null);
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@RequestBody @Valid ResetPasswordRequestDTO dto) {
        userService.resetPassword(dto);
        return ApiResponseFactory.success("Senha resetada com sucesso", null);
    }

    @PostMapping("/change-password")
    public ApiResponse<Void> changePassword(@RequestBody @Valid ChangePasswordRequestDTO dto) {
        userService.changePassword(dto);
        return ApiResponseFactory.success("Senha alterada com sucesso", null);
    }
}
