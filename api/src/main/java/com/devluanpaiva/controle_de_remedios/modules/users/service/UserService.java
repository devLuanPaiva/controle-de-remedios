package com.devluanpaiva.controle_de_remedios.modules.users.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.devluanpaiva.controle_de_remedios.modules.users.dto.ChangePasswordRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.users.dto.CreateUserRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.users.dto.ResetPasswordRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.users.dto.UpdateUserRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.users.dto.UserResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.users.filter.UserFilter;

public interface UserService {
    UserResponseDTO createUser(CreateUserRequestDTO createUserResponseDTO);

    UserResponseDTO getUserById(UUID id);

    UserResponseDTO updateUser(UUID id, UpdateUserRequestDTO updateUserRequestDTO);

    Page<UserResponseDTO> getAllUsers(UserFilter filter, Pageable pageable);

    void deleteUser(UUID id);

    void resetPassword(ResetPasswordRequestDTO resetPasswordRequestDTO);

    void changePassword(ChangePasswordRequestDTO changePasswordRequestDTO);
}
