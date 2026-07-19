package com.devluanpaiva.controle_de_remedios.modules.medicine.service;

import java.util.UUID;

import com.devluanpaiva.controle_de_remedios.modules.medicine.dto.CreateMedicineRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.medicine.dto.MedicineResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.medicine.dto.UpdateMedicineRequestDTO;

public interface MedicineService {
    MedicineResponseDTO createMedicine(CreateMedicineRequestDTO dto);

    MedicineResponseDTO getMedicineById(UUID id);

    MedicineResponseDTO updateMedicine(UUID id, UpdateMedicineRequestDTO dto);
}
