package com.devluanpaiva.controle_de_remedios.modules.medicine.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.devluanpaiva.controle_de_remedios.modules.medicine.entity.Medicine;

public interface MedicineRepository extends JpaRepository<Medicine, UUID>, JpaSpecificationExecutor<Medicine> {
    Optional<Medicine> findByCompany_IdAndEanCode(UUID companyId, String eanCode);

    List<Medicine> findByCompany_Id(UUID companyId);

    List<Medicine> findByCompany_IdAndNameContainingIgnoreCase(UUID companyId, String name);
}
