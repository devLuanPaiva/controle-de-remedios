package com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalDateTime;

import java.util.UUID;

import org.hibernate.type.SqlTypes;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.JdbcTypeCode;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.devluanpaiva.controle_de_remedios.modules.prescription.entity.Prescription;
import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.FrequencyType;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.TreatmentType;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.UnityType;

@Entity
@Table(name = "prescription_items")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionItem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "prescription_item_status")
    private PrescriptionStatus status;

    @Column(nullable = false, length = 50)
    private String dosage;

    @Column(nullable = false)
    private Integer prescribedQuantity;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "unity_type")
    private UnityType unityType;

    @Column(nullable = false)
    private Integer frequency;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "frequency_type")
    private FrequencyType frequencyType;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "Treatment_type")
    private TreatmentType treatmentType;

    @Column(nullable = false)
    private Integer treatmentDays;

    @Column(nullable = false, length = 200)
    private String observations;

    @Column(nullable = false, name = "start_date")
    private LocalDate startDate;

    @Column(nullable = false, name = "received_quantity")
    private Integer receivedQuantity;

    @Column(nullable = false, name = "delivered_quantity")
    private Integer deliveredQuantity;

    @Column(name = "requested_at")
    private LocalDateTime requestedAt;
    
    @CreatedDate
    @Column(nullable = false, updatable = false, name = "created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
