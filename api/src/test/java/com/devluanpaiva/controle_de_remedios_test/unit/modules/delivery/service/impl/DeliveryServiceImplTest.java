package com.devluanpaiva.controle_de_remedios_test.unit.modules.delivery.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;

import com.devluanpaiva.controle_de_remedios.modules.company.entity.Company;
import com.devluanpaiva.controle_de_remedios.modules.company.repository.CompanyRepository;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.CreateDeliveryRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.DeliveryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.PendingDeliveryItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.ReserveStockRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.entity.Delivery;
import com.devluanpaiva.controle_de_remedios.modules.delivery.filter.DeliveryFilter;
import com.devluanpaiva.controle_de_remedios.modules.delivery.filter.PendingDeliveryItemFilter;
import com.devluanpaiva.controle_de_remedios.modules.delivery.mapper.DeliveryMapper;
import com.devluanpaiva.controle_de_remedios.modules.delivery.repository.DeliveryRepository;
import com.devluanpaiva.controle_de_remedios.modules.delivery.service.impl.DeliveryServiceImpl;
import com.devluanpaiva.controle_de_remedios.modules.medicine.entity.Medicine;
import com.devluanpaiva.controle_de_remedios.modules.medicine.mapper.MedicineMapper;
import com.devluanpaiva.controle_de_remedios.modules.medicine.repository.MedicineRepository;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.service.MedicineMovementService;
import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;
import com.devluanpaiva.controle_de_remedios.modules.patient.repository.PatientRepository;
import com.devluanpaiva.controle_de_remedios.modules.prescription.entity.Prescription;
import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;
import com.devluanpaiva.controle_de_remedios.modules.prescription.repository.PrescriptionRepository;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.dto.PrescriptionItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.mapper.PrescriptionItemMapper;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.repository.PrescriptionItemRepository;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.security.AuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

@ExtendWith(MockitoExtension.class)
@DisplayName("DeliveryServiceImpl")
class DeliveryServiceImplTest {

    @Mock
    private DeliveryRepository deliveryRepository;

    @Mock
    private PrescriptionItemRepository prescriptionItemRepository;

    @Mock
    private PrescriptionRepository prescriptionRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private MedicineRepository medicineRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private MedicineMovementService medicineMovementService;

    @Mock
    private SecurityContextHelper securityContextHelper;

    private DeliveryServiceImpl deliveryService;

    @BeforeEach
    void setUp() {
        deliveryService = new DeliveryServiceImpl(
                deliveryRepository, prescriptionItemRepository, prescriptionRepository, patientRepository,
                medicineRepository, companyRepository, new DeliveryMapper(),
                new PrescriptionItemMapper(new MedicineMapper()), medicineMovementService, securityContextHelper,
                new AuthorizationPolicy());
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

    private User buildUser(UserRole role) {
        return User.builder()
                .id(UUID.randomUUID())
                .name("User " + role.name())
                .email(role.name().toLowerCase() + "." + UUID.randomUUID() + "@example.com")
                .password("encoded-password")
                .cpf("11144477735")
                .role(role)
                .build();
    }

    private PrescriptionItem buildItem(Company company, int prescribedQuantity, int treatmentDays) {
        Patient patient = Patient.builder().id(UUID.randomUUID()).company(company).build();
        Medicine medicine = Medicine.builder()
                .id(UUID.randomUUID()).name("Glifage XR").company(company).build();
        Prescription prescription = Prescription.builder().id(UUID.randomUUID()).patient(patient).build();

        PrescriptionItem item = PrescriptionItem.builder()
                .id(UUID.randomUUID())
                .prescription(prescription)
                .medicine(medicine)
                .status(PrescriptionStatus.PENDING)
                .prescribedQuantity(prescribedQuantity)
                .treatmentDays(treatmentDays)
                .receivedQuantity(0)
                .deliveredQuantity(0)
                .build();

        prescription.getItems().add(item);

        return item;
    }

    @Nested
    @DisplayName("createDelivery")
    class CreateDelivery {

        @Test
        @DisplayName("should compute nextAvailableDate as deliveryDate plus treatmentDays and mark item as DELIVERED")
        void shouldComputeNextAvailableDateAndMarkAsDelivered() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            PrescriptionItem item = buildItem(company, 30, 30);
            LocalDate deliveryDate = LocalDate.now();
            CreateDeliveryRequestDTO dto = new CreateDeliveryRequestDTO(item.getId(), deliveryDate, 30);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(prescriptionItemRepository.findById(item.getId())).thenReturn(Optional.of(item));
            when(deliveryRepository.save(any(Delivery.class))).thenAnswer(invocation -> invocation.getArgument(0));

            DeliveryResponseDTO response = deliveryService.createDelivery(dto);

            assertThat(response.nextAvailableDate()).isEqualTo(deliveryDate.plusDays(30));
            assertThat(item.getStatus()).isEqualTo(PrescriptionStatus.DELIVERED);
            assertThat(item.getDeliveredQuantity()).isEqualTo(30);
            assertThat(item.getPrescription().getStatus()).isEqualTo(PrescriptionStatus.DELIVERED);
        }

        @Test
        @DisplayName("should mark item as PARTIAL_DELIVERED when the delivered quantity is less than prescribed")
        void shouldMarkAsPartialDeliveredWhenQuantityIsLower() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            PrescriptionItem item = buildItem(company, 30, 30);
            CreateDeliveryRequestDTO dto = new CreateDeliveryRequestDTO(item.getId(), LocalDate.now(), 10);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(prescriptionItemRepository.findById(item.getId())).thenReturn(Optional.of(item));
            when(deliveryRepository.save(any(Delivery.class))).thenAnswer(invocation -> invocation.getArgument(0));

            deliveryService.createDelivery(dto);

            assertThat(item.getStatus()).isEqualTo(PrescriptionStatus.PARTIAL_DELIVERED);
            assertThat(item.getPrescription().getStatus()).isEqualTo(PrescriptionStatus.PARTIAL_DELIVERED);
        }

        @Test
        @DisplayName("should mark prescription as PARTIAL_DELIVERED when other items are still pending")
        void shouldMarkPrescriptionAsPartialDeliveredWhenOtherItemsArePending() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            PrescriptionItem item = buildItem(company, 30, 30);
            PrescriptionItem otherItem = PrescriptionItem.builder()
                    .id(UUID.randomUUID())
                    .prescription(item.getPrescription())
                    .medicine(item.getMedicine())
                    .status(PrescriptionStatus.PENDING)
                    .prescribedQuantity(10)
                    .treatmentDays(10)
                    .receivedQuantity(0)
                    .deliveredQuantity(0)
                    .build();
            item.getPrescription().getItems().add(otherItem);
            CreateDeliveryRequestDTO dto = new CreateDeliveryRequestDTO(item.getId(), LocalDate.now(), 30);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(prescriptionItemRepository.findById(item.getId())).thenReturn(Optional.of(item));
            when(deliveryRepository.save(any(Delivery.class))).thenAnswer(invocation -> invocation.getArgument(0));

            deliveryService.createDelivery(dto);

            assertThat(item.getStatus()).isEqualTo(PrescriptionStatus.DELIVERED);
            assertThat(item.getPrescription().getStatus()).isEqualTo(PrescriptionStatus.PARTIAL_DELIVERED);
        }

        @Test
        @DisplayName("should throw 422 when the delivery quantity exceeds the prescribed quantity")
        void shouldThrowWhenDeliveryQuantityExceedsPrescribed() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            PrescriptionItem item = buildItem(company, 30, 30);
            CreateDeliveryRequestDTO dto = new CreateDeliveryRequestDTO(item.getId(), LocalDate.now(), 40);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(prescriptionItemRepository.findById(item.getId())).thenReturn(Optional.of(item));

            assertThatThrownBy(() -> deliveryService.createDelivery(dto))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.UNPROCESSABLE_CONTENT);
                        assertThat(businessException.getCode())
                                .isEqualTo("DELIVERY_QUANTITY_EXCEEDS_PRESCRIBED_QUANTITY");
                    });
        }

        @Test
        @DisplayName("should throw 409 when the item's status is not deliverable")
        void shouldThrowWhenItemIsNotDeliverable() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            PrescriptionItem item = buildItem(company, 30, 30);
            item.setStatus(PrescriptionStatus.REJECTED);
            CreateDeliveryRequestDTO dto = new CreateDeliveryRequestDTO(item.getId(), LocalDate.now(), 30);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(prescriptionItemRepository.findById(item.getId())).thenReturn(Optional.of(item));

            assertThatThrownBy(() -> deliveryService.createDelivery(dto))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.CONFLICT);
                        assertThat(businessException.getCode()).isEqualTo("PRESCRIPTION_ITEM_NOT_DELIVERABLE");
                    });
        }
    }

    @Nested
    @DisplayName("reserveStock")
    class ReserveStock {

        @Test
        @DisplayName("should increment the item's receivedQuantity")
        void shouldIncrementReceivedQuantity() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            PrescriptionItem item = buildItem(company, 30, 30);
            ReserveStockRequestDTO dto = new ReserveStockRequestDTO(20);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(prescriptionItemRepository.findById(item.getId())).thenReturn(Optional.of(item));
            when(prescriptionItemRepository.save(item)).thenReturn(item);

            PrescriptionItemResponseDTO response = deliveryService.reserveStock(item.getId(), dto);

            assertThat(response.receivedQuantity()).isEqualTo(20);
        }

        @Test
        @DisplayName("should throw 422 when the reservation would exceed the prescribed quantity")
        void shouldThrowWhenReservationExceedsPrescribedQuantity() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            PrescriptionItem item = buildItem(company, 30, 30);
            item.setReceivedQuantity(25);
            ReserveStockRequestDTO dto = new ReserveStockRequestDTO(10);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(prescriptionItemRepository.findById(item.getId())).thenReturn(Optional.of(item));

            assertThatThrownBy(() -> deliveryService.reserveStock(item.getId(), dto))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.UNPROCESSABLE_CONTENT);
                        assertThat(businessException.getCode()).isEqualTo("RESERVATION_EXCEEDS_PRESCRIBED_QUANTITY");
                    });
        }
    }

    @Nested
    @DisplayName("listDeliveries")
    class ListDeliveries {

        @Test
        @DisplayName("should throw 400 when companyId is not provided")
        void shouldThrowWhenCompanyIdIsMissing() {
            User admin = buildUser(UserRole.ADMIN);
            DeliveryFilter filter = new DeliveryFilter(null, null, null, null, null, null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);

            assertThatThrownBy(() -> deliveryService.listDeliveries(filter, PageRequest.of(0, 20)))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                        assertThat(businessException.getCode()).isEqualTo("COMPANY_ID_REQUIRED");
                    });

            verify(deliveryRepository, never()).findAll(any(Specification.class), any(Pageable.class));
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("should list deliveries scoped by the provided companyId")
        void shouldListDeliveriesScopedByCompany() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            PrescriptionItem item = buildItem(company, 30, 30);
            Delivery delivery = Delivery.builder()
                    .id(UUID.randomUUID())
                    .company(company)
                    .patient(item.getPrescription().getPatient())
                    .prescriptionItem(item)
                    .deliveryDate(LocalDate.now())
                    .deliveryQuantity(30)
                    .build();
            DeliveryFilter filter = new DeliveryFilter(company.getId(), null, null, null, null, null, null);
            Pageable pageable = PageRequest.of(0, 20);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(deliveryRepository.findAll(any(Specification.class), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of(delivery)));

            Page<DeliveryResponseDTO> result = deliveryService.listDeliveries(filter, pageable);

            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).companyId()).isEqualTo(company.getId());
        }
    }

    @Nested
    @DisplayName("listPendingDeliveryItems")
    class ListPendingDeliveryItems {

        @Test
        @DisplayName("should throw 400 when companyId is not provided")
        void shouldThrowWhenCompanyIdIsMissing() {
            User admin = buildUser(UserRole.ADMIN);
            PendingDeliveryItemFilter filter = new PendingDeliveryItemFilter(null, null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);

            assertThatThrownBy(() -> deliveryService.listPendingDeliveryItems(filter, PageRequest.of(0, 20)))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                        assertThat(businessException.getCode()).isEqualTo("COMPANY_ID_REQUIRED");
                    });

            verify(prescriptionItemRepository, never()).findAll(any(Specification.class), any(Pageable.class));
        }

        @Test
        @DisplayName("should throw 403 when the actor is not a member of the company")
        void shouldThrowWhenActorIsNotMemberOfCompany() {
            User manager = buildUser(UserRole.MANAGER);
            Company company = buildCompany();
            PendingDeliveryItemFilter filter = new PendingDeliveryItemFilter(company.getId(), null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(companyRepository.existsByIdAndUsers_Id(company.getId(), manager.getId())).thenReturn(false);

            assertThatThrownBy(() -> deliveryService.listPendingDeliveryItems(filter, PageRequest.of(0, 20)))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                        assertThat(businessException.getCode()).isEqualTo("AUTH_FORBIDDEN");
                    });
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("should list pending items scoped by the provided companyId")
        void shouldListPendingItemsScopedByCompany() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            PrescriptionItem item = buildItem(company, 30, 30);
            item.getPrescription().setIssueDate(LocalDate.of(2026, 1, 10));
            PendingDeliveryItemFilter filter = new PendingDeliveryItemFilter(company.getId(), null, null);
            Pageable pageable = PageRequest.of(0, 20);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(prescriptionItemRepository.findAll(any(Specification.class), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of(item)));

            Page<PendingDeliveryItemResponseDTO> result = deliveryService.listPendingDeliveryItems(filter, pageable);

            assertThat(result.getContent()).hasSize(1);

            PendingDeliveryItemResponseDTO dto = result.getContent().get(0);
            assertThat(dto.prescriptionItemId()).isEqualTo(item.getId());
            assertThat(dto.prescriptionId()).isEqualTo(item.getPrescription().getId());
            assertThat(dto.patientId()).isEqualTo(item.getPrescription().getPatient().getId());
            assertThat(dto.issueDate()).isEqualTo(LocalDate.of(2026, 1, 10));
            assertThat(dto.medicineName()).isEqualTo(item.getMedicine().getName());
            assertThat(dto.prescribedQuantity()).isEqualTo(30);
        }
    }
}
