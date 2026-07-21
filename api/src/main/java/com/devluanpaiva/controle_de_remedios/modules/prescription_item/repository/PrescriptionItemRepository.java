package com.devluanpaiva.controle_de_remedios.modules.prescription_item.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;

public interface PrescriptionItemRepository
        extends JpaRepository<PrescriptionItem, UUID>, JpaSpecificationExecutor<PrescriptionItem> {
    List<PrescriptionItem> findByMedicine_IdAndStatusInAndDeliveryIsNullOrderByCreatedAtAsc(
            UUID medicineId, List<PrescriptionStatus> statuses);

    @Query("select i.requestedAt from PrescriptionItem i "
            + "where i.prescription.patient.company.id = :companyId "
            + "and i.status in :statuses and i.delivery is null")
    List<LocalDateTime> findRequestedAtForPendingItems(
            @Param("companyId") UUID companyId, @Param("statuses") List<PrescriptionStatus> statuses);

    @Query("select i from PrescriptionItem i "
            + "join fetch i.medicine "
            + "join fetch i.prescription pr "
            + "join fetch pr.patient pat "
            + "where pat.company.id = :companyId "
            + "and i.status in :statuses and i.delivery is null "
            + "order by i.requestedAt asc")
    List<PrescriptionItem> findOldestPendingByCompany(
            @Param("companyId") UUID companyId, @Param("statuses") List<PrescriptionStatus> statuses, Pageable pageable);

    @Query("select i.status as status, count(i) as count, "
            + "coalesce(sum(i.deliveredQuantity), 0) as deliveredQuantityTotal, "
            + "coalesce(sum(i.prescribedQuantity), 0) as prescribedQuantityTotal "
            + "from PrescriptionItem i "
            + "where i.prescription.patient.company.id = :companyId "
            + "and i.delivery is not null and i.delivery.deliveryDate between :from and :to "
            + "and i.status in :statuses "
            + "group by i.status")
    List<PrescriptionItemFulfillmentAggregate> aggregateFulfillmentByCompanyAndDeliveryDateBetween(
            @Param("companyId") UUID companyId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("statuses") List<PrescriptionStatus> statuses);
}
