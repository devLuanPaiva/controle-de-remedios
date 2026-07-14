package com.devluanpaiva.controle_de_remedios.modules.medicine.mapper;

import org.springframework.stereotype.Component;

import com.devluanpaiva.controle_de_remedios.modules.medicine.dto.MedicineResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.medicine.entity.Medicine;

@Component
public class MedicineMapper {
    public MedicineResponseDTO toResponseDTO(Medicine medicine) {
        return new MedicineResponseDTO(
                medicine.getId(),
                medicine.getName(),
                medicine.getEanCode(),
                medicine.getImageUrl(),
                medicine.getCompany().getId(),
                medicine.getCreatedAt(),
                medicine.getUpdatedAt());
    }
}
