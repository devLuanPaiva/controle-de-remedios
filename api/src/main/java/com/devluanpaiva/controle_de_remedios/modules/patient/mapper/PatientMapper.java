package com.devluanpaiva.controle_de_remedios.modules.patient.mapper;

import org.springframework.stereotype.Component;

import com.devluanpaiva.controle_de_remedios.modules.patient.dto.PatientResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;
import com.devluanpaiva.controle_de_remedios.shared.utils.CpfMasker;

@Component
public class PatientMapper {
    public PatientResponseDTO toResponseDTO(Patient patient) {
        return new PatientResponseDTO(
                patient.getId(),
                patient.getName(),
                patient.getCpf(),
                patient.getBirthdate().toLocalDate(),
                patient.getCompany().getId(),
                patient.getUser() != null ? patient.getUser().getId() : null,
                patient.getCreatedAt(),
                patient.getUpdatedAt());
    }

    public PatientResponseDTO toMaskedResponseDTO(Patient patient) {
        PatientResponseDTO dto = toResponseDTO(patient);

        return new PatientResponseDTO(
                dto.id(),
                dto.name(),
                CpfMasker.mask(dto.cpf()),
                dto.birthDate(),
                dto.companyId(),
                dto.userId(),
                dto.createdAt(),
                dto.updatedAt());
    }
}
