package com.devluanpaiva.controle_de_remedios_test.unit.modules.medicine_movement.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import com.devluanpaiva.controle_de_remedios.modules.company.entity.Company;
import com.devluanpaiva.controle_de_remedios.modules.company.repository.CompanyRepository;
import com.devluanpaiva.controle_de_remedios.modules.delivery.entity.Delivery;
import com.devluanpaiva.controle_de_remedios.modules.medicine.entity.Medicine;
import com.devluanpaiva.controle_de_remedios.modules.medicine.repository.MedicineRepository;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.dto.CreateMedicineMovementRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.dto.MedicineBalanceResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.dto.MedicineMovementResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.entity.MedicineMovement;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.enums.MovementType;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.mapper.MedicineMovementMapper;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.repository.MedicineMovementRepository;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.repository.MovementTypeTotal;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.service.impl.MedicineMovementServiceImpl;
import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;
import com.devluanpaiva.controle_de_remedios.modules.prescription.entity.Prescription;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.security.AuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

@ExtendWith(MockitoExtension.class)
@DisplayName("MedicineMovementServiceImpl")
class MedicineMovementServiceImplTest {

    @Mock
    private MedicineMovementRepository medicineMovementRepository;

    @Mock
    private MedicineRepository medicineRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private SecurityContextHelper securityContextHelper;

    private MedicineMovementServiceImpl medicineMovementService;

    @BeforeEach
    void setUp() {
        medicineMovementService = new MedicineMovementServiceImpl(
                medicineMovementRepository, medicineRepository, companyRepository,
                new MedicineMovementMapper(), securityContextHelper, new AuthorizationPolicy());
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

    private Medicine buildMedicine(Company company) {
        return Medicine.builder()
                .id(UUID.randomUUID())
                .name("Losartana")
                .imageUrl("https://example.com/losartana.png")
                .company(company)
                .build();
    }

    private PrescriptionItem buildPrescriptionItem(Medicine medicine, Integer prescribedQuantity) {
        Patient patient = Patient.builder().id(UUID.randomUUID()).company(medicine.getCompany()).build();
        Prescription prescription = Prescription.builder().id(UUID.randomUUID()).patient(patient).build();

        return PrescriptionItem.builder()
                .id(UUID.randomUUID())
                .prescription(prescription)
                .medicine(medicine)
                .prescribedQuantity(prescribedQuantity)
                .requestedAt(LocalDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("registerReceived")
    class RegisterReceived {

        @Test
        @DisplayName("should register a RECEIVED movement when the actor manages the medicine's company")
        void shouldRegisterReceivedMovement() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            Medicine medicine = buildMedicine(company);
            CreateMedicineMovementRequestDTO dto = new CreateMedicineMovementRequestDTO(medicine.getId(), 50,
                    LocalDate.now());

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(medicineRepository.findById(medicine.getId())).thenReturn(Optional.of(medicine));
            when(medicineMovementRepository.save(any(MedicineMovement.class)))
                    .thenAnswer(invocation -> {
                        MedicineMovement movement = invocation.getArgument(0);
                        movement.setId(UUID.randomUUID());
                        movement.setCreatedAt(LocalDateTime.now());
                        return movement;
                    });

            MedicineMovementResponseDTO response = medicineMovementService.registerReceived(dto);

            assertThat(response.movementType()).isEqualTo(MovementType.RECEIVED);
            assertThat(response.quantity()).isEqualTo(50);
            assertThat(response.prescriptionItemId()).isNull();
        }

        @Test
        @DisplayName("should throw 404 when the medicine does not exist")
        void shouldThrowNotFoundWhenMedicineDoesNotExist() {
            User admin = buildUser(UserRole.ADMIN);
            UUID medicineId = UUID.randomUUID();
            CreateMedicineMovementRequestDTO dto = new CreateMedicineMovementRequestDTO(medicineId, 50,
                    LocalDate.now());

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(medicineRepository.findById(medicineId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> medicineMovementService.registerReceived(dto))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
                        assertThat(businessException.getCode()).isEqualTo("MEDICINE_NOT_FOUND");
                    });
        }
    }

    @Nested
    @DisplayName("recordRequested / recordDelivered")
    class RecordMovements {

        @Test
        @DisplayName("should save a REQUESTED movement referencing the prescription item")
        void shouldSaveRequestedMovement() {
            Company company = buildCompany();
            Medicine medicine = buildMedicine(company);
            PrescriptionItem item = buildPrescriptionItem(medicine, 30);

            medicineMovementService.recordRequested(item);

            ArgumentCaptor<MedicineMovement> captor = ArgumentCaptor.forClass(MedicineMovement.class);
            verify(medicineMovementRepository).save(captor.capture());
            assertThat(captor.getValue().getMovementType()).isEqualTo(MovementType.REQUESTED);
            assertThat(captor.getValue().getPrescriptionItem()).isEqualTo(item);
            assertThat(captor.getValue().getQuantity()).isEqualTo(30);
        }

        @Test
        @DisplayName("should save a DELIVERED movement referencing the delivery's prescription item")
        void shouldSaveDeliveredMovement() {
            Company company = buildCompany();
            Medicine medicine = buildMedicine(company);
            PrescriptionItem item = buildPrescriptionItem(medicine, 30);
            Delivery delivery = Delivery.builder()
                    .id(UUID.randomUUID())
                    .company(company)
                    .patient(item.getPrescription().getPatient())
                    .prescriptionItem(item)
                    .deliveryDate(LocalDate.now())
                    .deliveryQuantity(30)
                    .build();

            medicineMovementService.recordDelivered(delivery);

            ArgumentCaptor<MedicineMovement> captor = ArgumentCaptor.forClass(MedicineMovement.class);
            verify(medicineMovementRepository).save(captor.capture());
            assertThat(captor.getValue().getMovementType()).isEqualTo(MovementType.DELIVERED);
            assertThat(captor.getValue().getPrescriptionItem()).isEqualTo(item);
            assertThat(captor.getValue().getQuantity()).isEqualTo(30);
        }
    }

    @Nested
    @DisplayName("getBalance")
    class GetBalance {

        @Test
        @DisplayName("should compute available balance and pending demand from the aggregated totals")
        void shouldComputeBalanceFromAggregatedTotals() {
            Company company = buildCompany();
            Medicine medicine = buildMedicine(company);

            when(medicineRepository.findById(medicine.getId())).thenReturn(Optional.of(medicine));
            when(medicineMovementRepository.sumQuantityByMedicineGroupedByType(medicine.getId()))
                    .thenReturn(List.of(
                            totalOf(MovementType.RECEIVED, 100L),
                            totalOf(MovementType.DELIVERED, 60L),
                            totalOf(MovementType.REQUESTED, 90L)));

            MedicineBalanceResponseDTO balance = medicineMovementService.getBalance(medicine.getId());

            assertThat(balance.totalReceived()).isEqualTo(100L);
            assertThat(balance.totalDelivered()).isEqualTo(60L);
            assertThat(balance.totalRequested()).isEqualTo(90L);
            assertThat(balance.availableBalance()).isEqualTo(40L);
            assertThat(balance.pendingDemand()).isEqualTo(30L);
        }

        private MovementTypeTotal totalOf(MovementType type, Long total) {
            return new MovementTypeTotal() {
                @Override
                public MovementType getMovementType() {
                    return type;
                }

                @Override
                public Long getTotal() {
                    return total;
                }
            };
        }
    }
}
