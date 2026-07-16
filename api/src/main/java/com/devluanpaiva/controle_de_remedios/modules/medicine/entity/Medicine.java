package com.devluanpaiva.controle_de_remedios.modules.medicine.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.devluanpaiva.controle_de_remedios.modules.company.entity.Company;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.entity.MedicineMovement;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;

@Entity
@Table(name = "medicines", uniqueConstraints = {
        @UniqueConstraint(name = "uk_medicines_company_ean_code", columnNames = { "company_id", "ean_code" })
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Medicine {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 14, name = "ean_code")
    private String eanCode;

    @Column(nullable = false, length = 200, name = "image_url")
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @OneToMany(mappedBy = "medicine")
    @Builder.Default
    private Set<PrescriptionItem> prescriptionItems = new HashSet<>();

    @OneToMany(mappedBy = "medicine")
    @Builder.Default
    private Set<MedicineMovement> medicineMovements = new HashSet<>();

    @CreatedDate
    @Column(nullable = false, updatable = false, name = "created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
