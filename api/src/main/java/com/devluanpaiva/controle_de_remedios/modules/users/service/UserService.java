package com.devluanpaiva.controle_de_remedios.modules.users.service;

import java.util.List;
import java.util.UUID;

import com.devluanpaiva.controle_de_remedios.modules.users.dto.ChangePasswordRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.users.dto.CreateUserRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.users.dto.ResetPasswordRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.users.dto.UpdateUserRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.users.dto.UserResponseDTO;

public interface UserService {
    UserResponseDTO createUser(CreateUserRequestDTO createUserResponseDTO);

    UserResponseDTO getUserById(UUID id);

    UserResponseDTO updateUser(UUID id, UpdateUserRequestDTO updateUserRequestDTO);

    List<UserResponseDTO> getAllUsers();

    void deleteUser(UUID id);

    void resetPassword(ResetPasswordRequestDTO resetPasswordRequestDTO);

    void changePassword(ChangePasswordRequestDTO changePasswordRequestDTO);
}
