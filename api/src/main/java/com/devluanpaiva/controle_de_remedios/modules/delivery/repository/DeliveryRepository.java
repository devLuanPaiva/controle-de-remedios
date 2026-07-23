package com.devluanpaiva.controle_de_remedios.modules.delivery.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.devluanpaiva.controle_de_remedios.modules.delivery.entity.Delivery;

public interface DeliveryRepository extends JpaRepository<Delivery, UUID>, JpaSpecificationExecutor<Delivery> {
    boolean existsByPatient_IdAndPrescriptionItem_Medicine_IdAndNextAvailableDateAfter(
            UUID patientId, UUID medicineId, LocalDate date);

    Optional<Delivery> findTopByPatient_IdAndPrescriptionItem_Medicine_IdOrderByNextAvailableDateDesc(
            UUID patientId, UUID medicineId);

    @Query("select d from Delivery d "
            + "join fetch d.patient "
            + "join fetch d.prescriptionItem pi "
            + "join fetch pi.medicine "
            + "where d.company.id = :companyId "
            + "and d.nextAvailableDate between :from and :to "
            + "and d.nextAvailableDate = ("
            + "    select max(d2.nextAvailableDate) from Delivery d2 "
            + "    where d2.patient.id = d.patient.id and d2.prescriptionItem.medicine.id = pi.medicine.id"
            + ") "
            + "order by d.nextAvailableDate asc")
    List<Delivery> findActiveCycleDeliveriesByCompanyAndNextAvailableDateBetween(
            @Param("companyId") UUID companyId, @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("select d from Delivery d "
            + "join fetch d.patient "
            + "join fetch d.prescriptionItem pi "
            + "join fetch pi.medicine "
            + "where d.company.id = :companyId "
            + "and d.nextAvailableDate < :referenceDate "
            + "and d.nextAvailableDate = ("
            + "    select max(d2.nextAvailableDate) from Delivery d2 "
            + "    where d2.patient.id = d.patient.id and d2.prescriptionItem.medicine.id = pi.medicine.id"
            + ") "
            + "order by d.nextAvailableDate asc")
    List<Delivery> findActiveCycleDeliveriesByCompanyAndNextAvailableDateBefore(
            @Param("companyId") UUID companyId, @Param("referenceDate") LocalDate referenceDate);

    @Query("select d.deliveryDate as deliveryDate, count(d) as deliveriesCount, "
            + "coalesce(sum(d.deliveryQuantity), 0) as quantityTotal "
            + "from Delivery d "
            + "where d.company.id = :companyId and d.deliveryDate between :from and :to "
            + "group by d.deliveryDate "
            + "order by d.deliveryDate asc")
    List<DeliveryDailyAggregate> aggregateDailyByCompanyAndDeliveryDateBetween(
            @Param("companyId") UUID companyId, @Param("from") LocalDate from, @Param("to") LocalDate to);
}
