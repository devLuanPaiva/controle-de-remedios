package com.devluanpaiva.controle_de_remedios.modules.delivery.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.devluanpaiva.controle_de_remedios.modules.company.entity.Company;
import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;

@Entity
@Table(name = "deliveries")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Delivery {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "prescription_item_id", nullable = false, unique = true)
    private PrescriptionItem prescriptionItem;

    @Column(name = "delivery_date")
    private LocalDate deliveryDate;

    @Column(name = "next_available_date")
    private LocalDate nextAvailableDate;

    @Column(name = "delivery_quantity", nullable = false)
    private Integer deliveryQuantity;

    @CreatedDate
    @Column(nullable = false, updatable = false, name = "created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

}
