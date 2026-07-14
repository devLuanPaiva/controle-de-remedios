package com.devluanpaiva.controle_de_remedios.modules.prescription_item.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;

public interface PrescriptionItemRepository extends JpaRepository<PrescriptionItem, UUID> {
}
