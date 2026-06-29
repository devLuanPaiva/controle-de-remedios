package com.devluanpaiva.controle_de_remedios.modules.users.mapper;

import org.springframework.stereotype.Component;

import com.devluanpaiva.controle_de_remedios.modules.users.dto.UserResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.users.entity.User;

@Component
public class UserMapper {
    public UserResponseDTO toResponseDTO(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getImageUrl(),
                user.getCpf(),
                user.getRole(),
                user.getCreatedAt(),
                user.getUpdatedAt());
    }
}
