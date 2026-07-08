package com.devluanpaiva.controle_de_remedios.modules.users.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.UUID;

import com.devluanpaiva.controle_de_remedios.modules.users.dto.ChangePasswordRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.users.dto.CreateUserRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.users.dto.ResetPasswordRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.users.dto.UpdateUserRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.users.dto.UserResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.users.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.modules.users.filter.UserFilter;
import com.devluanpaiva.controle_de_remedios.modules.users.service.UserService;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponse;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponseFactory;
import com.devluanpaiva.controle_de_remedios.shared.utils.PageableFactory;

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
    public ApiResponse<List<UserResponseDTO>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) UUID companyId,
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String cpf,
            @RequestParam(required = false) Boolean active) {

        Pageable pageable = PageableFactory.build(page, size);
        UserFilter filter = new UserFilter(companyId, role, name, email, cpf, active);
        Page<UserResponseDTO> result = userService.getAllUsers(filter, pageable);

        String next = result.hasNext() ? buildPageUri(page + 1, size) : null;
        String previous = result.hasPrevious() ? buildPageUri(page - 1, size) : null;

        return ApiResponseFactory.paginated(
                "Lista de usuários obtida com sucesso", result, next, previous);
    }

    private String buildPageUri(int page, int size) {
        return ServletUriComponentsBuilder.fromCurrentRequestUri()
                .replaceQueryParam("page", page)
                .replaceQueryParam("size", size)
                .toUriString();
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
