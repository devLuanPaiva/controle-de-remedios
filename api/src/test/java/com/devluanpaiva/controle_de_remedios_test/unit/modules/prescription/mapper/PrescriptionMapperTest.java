package com.devluanpaiva.controle_de_remedios_test.unit.modules.prescription.mapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import com.devluanpaiva.controle_de_remedios.modules.company.entity.Company;
import com.devluanpaiva.controle_de_remedios.modules.medicine.entity.Medicine;
import com.devluanpaiva.controle_de_remedios.modules.medicine.mapper.MedicineMapper;
import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;
import com.devluanpaiva.controle_de_remedios.modules.patient.mapper.PatientMapper;
import com.devluanpaiva.controle_de_remedios.modules.prescription.dto.PrescriptionDetailResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription.dto.PrescriptionListItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription.dto.PrescriptionResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription.entity.Prescription;
import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;
import com.devluanpaiva.controle_de_remedios.modules.prescription.mapper.PrescriptionMapper;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.FrequencyType;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.TreatmentType;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.UnityType;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.mapper.PrescriptionItemMapper;

@DisplayName("PrescriptionMapper")
class PrescriptionMapperTest {

    private PrescriptionMapper prescriptionMapper;

    @BeforeEach
    void setUp() {
        prescriptionMapper = new PrescriptionMapper(new PatientMapper(), new PrescriptionItemMapper(new MedicineMapper()));
    }

    private Company buildCompany() {
        return Company.builder()
                .id(UUID.randomUUID())
                .name("Acme")
                .slug("acme")
                .cnpj("11222333000181")
                .active(true)
                .build();
    }

    private Patient buildPatient(Company company) {
        return Patient.builder()
                .id(UUID.randomUUID())
                .name("John Doe")
                .cpf("52998224725")
                .birthdate(LocalDateTime.of(1950, 1, 1, 0, 0))
                .company(company)
                .build();
    }

    private Medicine buildMedicine(Company company, String name) {
        return Medicine.builder()
                .id(UUID.randomUUID())
                .name(name)
                .eanCode("7891234567895")
                .imageUrl("https://example.com/medicine.png")
                .company(company)
                .build();
    }

    private PrescriptionItem buildItem(Prescription prescription, Medicine medicine, String dosage) {
        return PrescriptionItem.builder()
                .id(UUID.randomUUID())
                .prescription(prescription)
                .medicine(medicine)
                .status(PrescriptionStatus.PENDING)
                .dosage(dosage)
                .prescribedQuantity(10)
                .unityType(UnityType.TABLET)
                .frequency(1)
                .frequencyType(FrequencyType.PER_DAY)
                .treatmentType(TreatmentType.CONTINUOUS)
                .treatmentDays(7)
                .receivedQuantity(0)
                .deliveredQuantity(0)
                .build();
    }

    private Prescription buildPrescription(Patient patient, List<String> imageUrls) {
        return Prescription.builder()
                .id(UUID.randomUUID())
                .status(PrescriptionStatus.PENDING)
                .imageUrls(imageUrls)
                .issueDate(LocalDate.of(2026, 1, 10))
                .patient(patient)
                .createdAt(LocalDateTime.of(2026, 1, 10, 8, 0))
                .updatedAt(LocalDateTime.of(2026, 1, 11, 9, 0))
                .build();
    }

    @Nested
    @DisplayName("toResponseDTO")
    class ToResponseDTO {

        @Test
        @DisplayName("should map scalar fields from the entity")
        void shouldMapScalarFieldsFromEntity() {
            Patient patient = buildPatient(buildCompany());
            Prescription prescription = buildPrescription(patient, new ArrayList<>());

            PrescriptionResponseDTO response = prescriptionMapper.toResponseDTO(prescription);

            assertThat(response.id()).isEqualTo(prescription.getId());
            assertThat(response.status()).isEqualTo(PrescriptionStatus.PENDING);
            assertThat(response.issueDate()).isEqualTo(prescription.getIssueDate());
            assertThat(response.patientId()).isEqualTo(patient.getId());
            assertThat(response.createdAt()).isEqualTo(prescription.getCreatedAt());
            assertThat(response.updatedAt()).isEqualTo(prescription.getUpdatedAt());
        }

        @Test
        @DisplayName("should return an immutable copy of imageUrls independent from the entity's list")
        void shouldReturnImmutableCopyOfImageUrls() {
            Patient patient = buildPatient(buildCompany());
            List<String> originalImageUrls = new ArrayList<>(List.of("https://example.com/image-1.png"));
            Prescription prescription = buildPrescription(patient, originalImageUrls);

            PrescriptionResponseDTO response = prescriptionMapper.toResponseDTO(prescription);
            originalImageUrls.add("https://example.com/image-2.png");

            assertThat(response.imageUrls()).containsExactly("https://example.com/image-1.png");
            assertThatThrownBy(() -> response.imageUrls().add("https://example.com/image-3.png"))
                    .isInstanceOf(UnsupportedOperationException.class);
        }

        @Test
        @DisplayName("should map an empty imageUrls list to an empty list, not null")
        void shouldMapEmptyImageUrlsToEmptyList() {
            Patient patient = buildPatient(buildCompany());
            Prescription prescription = buildPrescription(patient, new ArrayList<>());

            PrescriptionResponseDTO response = prescriptionMapper.toResponseDTO(prescription);

            assertThat(response.imageUrls()).isNotNull().isEmpty();
        }
    }

    @Nested
    @DisplayName("toDetailResponseDTO")
    class ToDetailResponseDTO {

        @Test
        @DisplayName("should include the complete unmasked patient response DTO")
        void shouldIncludeCompleteUnmaskedPatientResponseDTO() {
            Patient patient = buildPatient(buildCompany());
            Prescription prescription = buildPrescription(patient, new ArrayList<>());

            PrescriptionDetailResponseDTO response = prescriptionMapper.toDetailResponseDTO(prescription);

            assertThat(response.patient().id()).isEqualTo(patient.getId());
            assertThat(response.patient().name()).isEqualTo(patient.getName());
            assertThat(response.patient().cpf()).isEqualTo("52998224725");
        }

        @Test
        @DisplayName("should map items preserving the entity's order")
        void shouldMapItemsPreservingEntityOrder() {
            Company company = buildCompany();
            Patient patient = buildPatient(company);
            Prescription prescription = buildPrescription(patient, new ArrayList<>());
            PrescriptionItem firstItem = buildItem(prescription, buildMedicine(company, "Dipirona"), "10mg");
            PrescriptionItem secondItem = buildItem(prescription, buildMedicine(company, "Paracetamol"), "20mg");
            prescription.setItems(List.of(firstItem, secondItem));

            PrescriptionDetailResponseDTO response = prescriptionMapper.toDetailResponseDTO(prescription);

            assertThat(response.items())
                    .extracting("dosage")
                    .containsExactly("10mg", "20mg");
        }

        @Test
        @DisplayName("should include the nested medicine data for each item")
        void shouldIncludeNestedMedicineDataForEachItem() {
            Company company = buildCompany();
            Patient patient = buildPatient(company);
            Prescription prescription = buildPrescription(patient, new ArrayList<>());
            Medicine medicine = buildMedicine(company, "Dipirona");
            prescription.setItems(List.of(buildItem(prescription, medicine, "10mg")));

            PrescriptionDetailResponseDTO response = prescriptionMapper.toDetailResponseDTO(prescription);

            assertThat(response.items()).hasSize(1);
            assertThat(response.items().get(0).medicine().id()).isEqualTo(medicine.getId());
            assertThat(response.items().get(0).medicine().name()).isEqualTo("Dipirona");
        }

        @Test
        @DisplayName("should map to an empty items list when the prescription has no items")
        void shouldMapToEmptyItemsListWhenPrescriptionHasNoItems() {
            Patient patient = buildPatient(buildCompany());
            Prescription prescription = buildPrescription(patient, new ArrayList<>());

            PrescriptionDetailResponseDTO response = prescriptionMapper.toDetailResponseDTO(prescription);

            assertThat(response.items()).isNotNull().isEmpty();
        }
    }

    @Nested
    @DisplayName("toListItemResponseDTO")
    class ToListItemResponseDTO {

        @Test
        @DisplayName("should build a patient summary with only id and name")
        void shouldBuildPatientSummaryWithOnlyIdAndName() {
            Patient patient = buildPatient(buildCompany());
            Prescription prescription = buildPrescription(patient, new ArrayList<>());

            PrescriptionListItemResponseDTO response = prescriptionMapper.toListItemResponseDTO(prescription);

            assertThat(response.patient().id()).isEqualTo(patient.getId());
            assertThat(response.patient().name()).isEqualTo(patient.getName());
        }

        @Test
        @DisplayName("should keep the top-level patientId consistent with the nested summary id")
        void shouldKeepTopLevelPatientIdConsistentWithNestedSummaryId() {
            Patient patient = buildPatient(buildCompany());
            Prescription prescription = buildPrescription(patient, new ArrayList<>());

            PrescriptionListItemResponseDTO response = prescriptionMapper.toListItemResponseDTO(prescription);

            assertThat(response.patientId()).isEqualTo(response.patient().id());
        }

        @Test
        @DisplayName("should map an empty imageUrls list to an empty list, not null")
        void shouldMapEmptyImageUrlsToEmptyList() {
            Patient patient = buildPatient(buildCompany());
            Prescription prescription = buildPrescription(patient, new ArrayList<>());

            PrescriptionListItemResponseDTO response = prescriptionMapper.toListItemResponseDTO(prescription);

            assertThat(response.imageUrls()).isNotNull().isEmpty();
        }
    }
}
