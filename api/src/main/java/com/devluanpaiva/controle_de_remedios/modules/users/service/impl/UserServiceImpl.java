package com.devluanpaiva.controle_de_remedios.modules.users.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.devluanpaiva.controle_de_remedios.modules.users.dto.ChangePasswordRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.users.dto.CreateUserRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.users.dto.ResetPasswordRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.users.dto.UpdateUserRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.users.dto.UserResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.users.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.users.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.modules.users.mapper.UserMapper;
import com.devluanpaiva.controle_de_remedios.modules.users.repository.UserRepository;
import com.devluanpaiva.controle_de_remedios.modules.users.service.UserService;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponseDTO createUser(CreateUserRequestDTO dto) {
        if (userRepository.existsByEmail(dto.email())) {
            throw new BusinessException(
                    HttpStatus.CONFLICT,
                    "E-mail já cadastrado",
                    "EMAIL_ALREADY_EXISTS",
                    "email",
                    "Já existe um usuário cadastrado com o e-mail '" + dto.email() + "'.");
        }

        if (userRepository.existsByCpf(dto.cpf())) {
            throw new BusinessException(
                    HttpStatus.CONFLICT,
                    "CPF já cadastrado",
                    "CPF_ALREADY_EXISTS",
                    "cpf",
                    "Já existe um usuário cadastrado com o CPF '" + dto.cpf() + "'.");
        }

        User user = User.builder()
                .name(dto.name())
                .email(dto.email())
                .role(UserRole.USER)
                .cpf(dto.cpf())
                .imageUrl(dto.imageUrl())
                .password(passwordEncoder.encode(dto.password()))
                .build();

        User savedUser = userRepository.save(user);

        return userMapper.toResponseDTO(savedUser);
    }

    @Override
    public UserResponseDTO getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND,
                        "Usuário não encontrado",
                        "USER_NOT_FOUND",
                        "id",
                        "Não foi possível encontrar um usuário com o ID '" + id + "'."));

        return userMapper.toResponseDTO(user);
    }

    @Override
    public List<UserResponseDTO> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(userMapper::toResponseDTO)
                .toList();
    }

    @Override
    public void deleteUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND,
                        "Usuário não encontrado",
                        "USER_NOT_FOUND",
                        "id",
                        "Não foi possível encontrar um usuário com o ID '" + id + "'."));

        userRepository.delete(user);
    }

    @Override
    public UserResponseDTO updateUser(UUID id, UpdateUserRequestDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND,
                        "Usuário não encontrado",
                        "USER_NOT_FOUND",
                        "id",
                        "Não foi possível encontrar um usuário com o ID '" + id + "'."));

        if (dto.name() != null) {
            user.setName(dto.name());
        }

        if (dto.cpf() != null) {
            user.setCpf(dto.cpf());
        }

        if (dto.imageUrl() != null) {
            user.setImageUrl(dto.imageUrl());
        }

        User updatedUser = userRepository.save(user);
        return userMapper.toResponseDTO(updatedUser);
    }

    @Override
    public void resetPassword(ResetPasswordRequestDTO resetPasswordRequestDTO) {
        // Implementação do método de redefinição de senha
    }

    @Override
    public void changePassword(ChangePasswordRequestDTO changePasswordRequestDTO) {
        // Implementação do método de alteração de senha
    }
}
