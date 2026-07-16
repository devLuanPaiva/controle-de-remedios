package com.devluanpaiva.controle_de_remedios.modules.medicine_movement.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.devluanpaiva.controle_de_remedios.modules.delivery.entity.Delivery;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.dto.CreateMedicineMovementRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.dto.MedicineBalanceResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.dto.MedicineMovementResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.filter.MedicineMovementFilter;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;

public interface MedicineMovementService {
    MedicineMovementResponseDTO registerReceived(CreateMedicineMovementRequestDTO dto);

    void recordRequested(PrescriptionItem item);

    void recordDelivered(Delivery delivery);

    MedicineBalanceResponseDTO getBalance(UUID medicineId);

    Page<MedicineMovementResponseDTO> listMovements(MedicineMovementFilter filter, Pageable pageable);
}
