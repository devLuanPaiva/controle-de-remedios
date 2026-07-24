package com.devluanpaiva.controle_de_remedios.modules.user.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.devluanpaiva.controle_de_remedios.modules.user.dto.ChangePasswordRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.user.dto.CreateUserRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.user.dto.DataDeletionRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.user.dto.DeleteAccountRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.user.dto.UpdateUserRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.user.dto.UserResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.user.filter.UserFilter;

public interface UserService {
    UserResponseDTO createUser(CreateUserRequestDTO createUserResponseDTO);

    UserResponseDTO getUserById(UUID id);

    UserResponseDTO updateUser(UUID id, UpdateUserRequestDTO updateUserRequestDTO);

    Page<UserResponseDTO> getAllUsers(UserFilter filter, Pageable pageable);

    void deleteUser(UUID id);

    void deleteOwnAccount(DeleteAccountRequestDTO deleteAccountRequestDTO);

    void changePassword(ChangePasswordRequestDTO changePasswordRequestDTO);

    void requestDataDeletion(DataDeletionRequestDTO dataDeletionRequestDTO);
}
