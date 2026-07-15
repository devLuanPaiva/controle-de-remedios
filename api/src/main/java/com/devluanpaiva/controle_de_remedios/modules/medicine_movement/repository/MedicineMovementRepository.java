package com.devluanpaiva.controle_de_remedios.modules.medicine_movement.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.entity.MedicineMovement;

public interface MedicineMovementRepository
                extends JpaRepository<MedicineMovement, UUID>, JpaSpecificationExecutor<MedicineMovement> {

        @Query("select m.movementType as movementType, coalesce(sum(m.quantity), 0) as total "
                        + "from MedicineMovement m where m.medicine.id = :medicineId group by m.movementType")
        List<MovementTypeTotal> sumQuantityByMedicineGroupedByType(@Param("medicineId") UUID medicineId);
}
