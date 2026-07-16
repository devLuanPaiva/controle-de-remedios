package com.devluanpaiva.controle_de_remedios.modules.prescription_item.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;

public interface PrescriptionItemRepository extends JpaRepository<PrescriptionItem, UUID> {
    List<PrescriptionItem> findByMedicine_IdAndStatusInAndDeliveryIsNullOrderByCreatedAtAsc(
            UUID medicineId, List<PrescriptionStatus> statuses);
}
