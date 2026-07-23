package com.devluanpaiva.controle_de_remedios_test.unit.modules.assistant.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;

import com.devluanpaiva.controle_de_remedios.modules.assistant.dto.DeliverySummaryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.assistant.dto.PatientDeliveriesResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.assistant.service.impl.AssistantQueryServiceImpl;
import com.devluanpaiva.controle_de_remedios.modules.company.entity.Company;
import com.devluanpaiva.controle_de_remedios.modules.delivery.entity.Delivery;
import com.devluanpaiva.controle_de_remedios.modules.delivery.mapper.DeliveryMapper;
import com.devluanpaiva.controle_de_remedios.modules.delivery.mapper.PendingDeliveryItemMapper;
import com.devluanpaiva.controle_de_remedios.modules.delivery.repository.DeliveryRepository;
import com.devluanpaiva.controle_de_remedios.modules.medicine.entity.Medicine;
import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;
import com.devluanpaiva.controle_de_remedios.modules.patient.repository.PatientRepository;
import com.devluanpaiva.controle_de_remedios.modules.prescription.entity.Prescription;
import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.FrequencyType;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.TreatmentType;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.UnityType;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.repository.PrescriptionItemRepository;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

@ExtendWith(MockitoExtension.class)
@DisplayName("AssistantQueryServiceImpl")
class AssistantQueryServiceImplTest {

    @Mock
    private DeliveryRepository deliveryRepository;

    @Mock
    private PrescriptionItemRepository prescriptionItemRepository;

    @Mock
    private PatientRepository patientRepository;

    private AssistantQueryServiceImpl assistantQueryService;

    @BeforeEach
    void setUp() {
        assistantQueryService = new AssistantQueryServiceImpl(
                deliveryRepository, prescriptionItemRepository, patientRepository,
                new DeliveryMapper(), new PendingDeliveryItemMapper());
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

    private Patient buildPatient(Company company, String name) {
        return Patient.builder()
                .id(UUID.randomUUID())
                .name(name)
                .cpf("52998224725")
                .birthdate(LocalDateTime.of(1950, Month.JANUARY, 1, 0, 0))
                .company(company)
                .build();
    }

    private Medicine buildMedicine(Company company) {
        return Medicine.builder()
                .id(UUID.randomUUID())
                .name("Dipirona")
                .imageUrl("https://example.com/dipirona.png")
                .company(company)
                .build();
    }

    private PrescriptionItem buildItem(Patient patient, Medicine medicine, PrescriptionStatus status) {
        Prescription prescription = Prescription.builder()
                .id(UUID.randomUUID())
                .patient(patient)
                .status(status)
                .issueDate(LocalDate.of(2024, Month.JANUARY, 1))
                .build();

        return PrescriptionItem.builder()
                .id(UUID.randomUUID())
                .prescription(prescription)
                .medicine(medicine)
                .status(status)
                .dosage("10mg")
                .prescribedQuantity(30)
                .unityType(UnityType.TABLET)
                .frequency(2)
                .frequencyType(FrequencyType.PER_DAY)
                .treatmentType(TreatmentType.CONTINUOUS)
                .treatmentDays(15)
                .receivedQuantity(0)
                .deliveredQuantity(0)
                .requestedAt(LocalDateTime.of(2024, Month.JANUARY, 2, 10, 0))
                .build();
    }

    private Delivery buildDelivery(Company company, Patient patient, PrescriptionItem item) {
        return Delivery.builder()
                .id(UUID.randomUUID())
                .company(company)
                .patient(patient)
                .prescriptionItem(item)
                .deliveryDate(LocalDate.of(2024, Month.JANUARY, 5))
                .nextAvailableDate(LocalDate.of(2024, Month.FEBRUARY, 5))
                .deliveryQuantity(30)
                .createdAt(LocalDateTime.of(2024, Month.JANUARY, 5, 8, 0))
                .build();
    }

    @Nested
    @DisplayName("getDeliveriesSummary")
    class GetDeliveriesSummary {

        @Test
        @DisplayName("should return the pending count and the mapped lists, ordered as expected")
        void shouldReturnPendingCountAndMappedLists() {
            UUID companyId = UUID.randomUUID();
            Company company = buildCompany();
            Patient patient = buildPatient(company, "Maria da Silva");
            Medicine medicine = buildMedicine(company);

            PrescriptionItem pendingItem = buildItem(patient, medicine, PrescriptionStatus.PENDING);
            PrescriptionItem deliveredItem = buildItem(patient, medicine, PrescriptionStatus.DELIVERED);
            Delivery delivery = buildDelivery(company, patient, deliveredItem);

            when(prescriptionItemRepository.count(any(Specification.class))).thenReturn(5L);
            when(prescriptionItemRepository.findAll(any(Specification.class), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of(pendingItem)));
            when(deliveryRepository.findAll(any(Specification.class), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of(delivery)));

            DeliverySummaryResponseDTO response = assistantQueryService.getDeliveriesSummary(companyId);

            assertThat(response.pendingCount()).isEqualTo(5L);
            assertThat(response.pendingItems()).hasSize(1);
            assertThat(response.pendingItems().get(0).patientName()).isEqualTo("Maria da Silva");
            assertThat(response.recentDeliveries()).hasSize(1);
            assertThat(response.recentDeliveries().get(0).medicineName()).isEqualTo("Dipirona");
        }

        @Test
        @DisplayName("should request pending items sorted ascending by requestedAt, limited to 10")
        void shouldRequestPendingItemsOrderedByRequestedAtAscending() {
            UUID companyId = UUID.randomUUID();

            when(prescriptionItemRepository.count(any(Specification.class))).thenReturn(0L);
            when(prescriptionItemRepository.findAll(any(Specification.class), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of()));
            when(deliveryRepository.findAll(any(Specification.class), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of()));

            assistantQueryService.getDeliveriesSummary(companyId);

            ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
            verify(prescriptionItemRepository).findAll(any(Specification.class), pageableCaptor.capture());

            Pageable pending = pageableCaptor.getValue();
            assertThat(pending.getPageSize()).isEqualTo(10);
            assertThat(pending.getSort().getOrderFor("requestedAt")).isNotNull();
            assertThat(pending.getSort().getOrderFor("requestedAt").getDirection()).isEqualTo(Sort.Direction.ASC);
        }

        @Test
        @DisplayName("should request recent deliveries sorted descending by createdAt, limited to 10")
        void shouldRequestRecentDeliveriesOrderedByCreatedAtDescending() {
            UUID companyId = UUID.randomUUID();

            when(prescriptionItemRepository.count(any(Specification.class))).thenReturn(0L);
            when(prescriptionItemRepository.findAll(any(Specification.class), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of()));
            when(deliveryRepository.findAll(any(Specification.class), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of()));

            assistantQueryService.getDeliveriesSummary(companyId);

            ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
            verify(deliveryRepository).findAll(any(Specification.class), pageableCaptor.capture());

            Pageable recent = pageableCaptor.getValue();
            assertThat(recent.getPageSize()).isEqualTo(10);
            assertThat(recent.getSort().getOrderFor("createdAt")).isNotNull();
            assertThat(recent.getSort().getOrderFor("createdAt").getDirection()).isEqualTo(Sort.Direction.DESC);
        }

        @Test
        @DisplayName("should return empty lists and zero count when there is nothing pending or delivered")
        void shouldReturnEmptyListsWhenNothingToReport() {
            UUID companyId = UUID.randomUUID();

            when(prescriptionItemRepository.count(any(Specification.class))).thenReturn(0L);
            when(prescriptionItemRepository.findAll(any(Specification.class), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of()));
            when(deliveryRepository.findAll(any(Specification.class), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of()));

            DeliverySummaryResponseDTO response = assistantQueryService.getDeliveriesSummary(companyId);

            assertThat(response.pendingCount()).isZero();
            assertThat(response.pendingItems()).isEmpty();
            assertThat(response.recentDeliveries()).isEmpty();
        }
    }

    @Nested
    @DisplayName("getPatientDeliveries")
    class GetPatientDeliveries {

        @Test
        @DisplayName("should return deliveries and pending items when exactly one patient matches the name")
        void shouldReturnDeliveriesForUniquePatientMatch() {
            UUID companyId = UUID.randomUUID();
            Company company = buildCompany();
            Patient patient = buildPatient(company, "Maria da Silva");
            Medicine medicine = buildMedicine(company);

            PrescriptionItem deliveredItem = buildItem(patient, medicine, PrescriptionStatus.DELIVERED);
            Delivery delivery = buildDelivery(company, patient, deliveredItem);
            PrescriptionItem pendingItem = buildItem(patient, medicine, PrescriptionStatus.PENDING);

            when(patientRepository.findAll(any(Specification.class))).thenReturn(List.of(patient));
            when(deliveryRepository.findAll(any(Specification.class), any(Sort.class))).thenReturn(List.of(delivery));
            when(prescriptionItemRepository.findAll(any(Specification.class))).thenReturn(List.of(pendingItem));

            PatientDeliveriesResponseDTO response = assistantQueryService.getPatientDeliveries(companyId,
                    "Maria da Silva");

            assertThat(response.patientId()).isEqualTo(patient.getId());
            assertThat(response.patientName()).isEqualTo("Maria da Silva");
            assertThat(response.deliveries()).hasSize(1);
            assertThat(response.pendingItems()).hasSize(1);
        }

        @Test
        @DisplayName("should throw 404 when no patient matches the given name")
        void shouldThrowNotFoundWhenNoPatientMatches() {
            UUID companyId = UUID.randomUUID();

            when(patientRepository.findAll(any(Specification.class))).thenReturn(List.of());

            assertThatThrownBy(() -> assistantQueryService.getPatientDeliveries(companyId, "Ninguém"))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
                        assertThat(businessException.getCode()).isEqualTo("PATIENT_NOT_FOUND");
                    });

            verifyNoInteractions(deliveryRepository, prescriptionItemRepository);
        }

        @Test
        @DisplayName("should throw 409 when more than one patient matches the given name")
        void shouldThrowConflictWhenPatientNameIsAmbiguous() {
            UUID companyId = UUID.randomUUID();
            Company company = buildCompany();
            Patient first = buildPatient(company, "Ana Souza");
            Patient second = buildPatient(company, "Ana Souza Lima");

            when(patientRepository.findAll(any(Specification.class))).thenReturn(List.of(first, second));

            assertThatThrownBy(() -> assistantQueryService.getPatientDeliveries(companyId, "Ana"))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.CONFLICT);
                        assertThat(businessException.getCode()).isEqualTo("PATIENT_NAME_AMBIGUOUS");
                    });

            verifyNoInteractions(deliveryRepository, prescriptionItemRepository);
        }

        @Test
        @DisplayName("should not call the delivery or pending-item repositories before resolving the patient")
        void shouldResolvePatientBeforeQueryingDeliveries() {
            UUID companyId = UUID.randomUUID();

            when(patientRepository.findAll(any(Specification.class))).thenReturn(List.of());

            assertThatThrownBy(() -> assistantQueryService.getPatientDeliveries(companyId, "Ninguém"))
                    .isInstanceOf(BusinessException.class);

            verify(deliveryRepository, never()).findAll(any(Specification.class), any(Sort.class));
            verify(prescriptionItemRepository, never()).findAll(any(Specification.class));
        }
    }
}
