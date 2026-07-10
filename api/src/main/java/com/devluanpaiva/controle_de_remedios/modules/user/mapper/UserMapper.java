package com.devluanpaiva.controle_de_remedios.modules.user.mapper;

import org.springframework.stereotype.Component;

import com.devluanpaiva.controle_de_remedios.modules.user.dto.UserResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.shared.utils.CpfMasker;

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

    public UserResponseDTO toMaskedResponseDTO(User user) {
        UserResponseDTO dto = toResponseDTO(user);

        return new UserResponseDTO(
                dto.id(),
                dto.name(),
                dto.email(),
                dto.imageUrl(),
                CpfMasker.mask(dto.cpf()),
                dto.role(),
                dto.createdAt(),
                dto.updatedAt());
    }
}
