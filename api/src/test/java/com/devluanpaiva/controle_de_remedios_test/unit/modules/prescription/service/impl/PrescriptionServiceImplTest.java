package com.devluanpaiva.controle_de_remedios_test.unit.modules.prescription.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.assertj.core.api.ThrowableAssert.ThrowingCallable;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;

import com.devluanpaiva.controle_de_remedios.modules.company.entity.Company;
import com.devluanpaiva.controle_de_remedios.modules.company.repository.CompanyRepository;
import com.devluanpaiva.controle_de_remedios.modules.delivery.service.DeliveryEligibilityService;
import com.devluanpaiva.controle_de_remedios.modules.medicine.entity.Medicine;
import com.devluanpaiva.controle_de_remedios.modules.medicine.mapper.MedicineMapper;
import com.devluanpaiva.controle_de_remedios.modules.medicine.repository.MedicineRepository;
import com.devluanpaiva.controle_de_remedios.modules.medicine.service.MedicineResolutionService;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.service.MedicineMovementService;
import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;
import com.devluanpaiva.controle_de_remedios.modules.patient.mapper.PatientMapper;
import com.devluanpaiva.controle_de_remedios.modules.patient.repository.PatientRepository;
import com.devluanpaiva.controle_de_remedios.modules.prescription.dto.CreatePrescriptionRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription.dto.PrescriptionDetailResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription.dto.PrescriptionListItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription.dto.PrescriptionResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription.dto.UpdatePrescriptionRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription.entity.Prescription;
import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;
import com.devluanpaiva.controle_de_remedios.modules.prescription.filter.PrescriptionFilter;
import com.devluanpaiva.controle_de_remedios.modules.prescription.mapper.PrescriptionMapper;
import com.devluanpaiva.controle_de_remedios.modules.prescription.repository.PrescriptionRepository;
import com.devluanpaiva.controle_de_remedios.modules.prescription.service.impl.PrescriptionServiceImpl;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.dto.CreatePrescriptionItemRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.FrequencyType;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.TreatmentType;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.UnityType;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.mapper.PrescriptionItemMapper;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.security.AuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

@ExtendWith(MockitoExtension.class)
@DisplayName("PrescriptionServiceImpl")
class PrescriptionServiceImplTest {

    @Mock
    private PrescriptionRepository prescriptionRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private MedicineRepository medicineRepository;

    @Mock
    private MedicineResolutionService medicineResolutionService;

    @Mock
    private DeliveryEligibilityService deliveryEligibilityService;

    @Mock
    private MedicineMovementService medicineMovementService;

    @Mock
    private SecurityContextHelper securityContextHelper;

    private PrescriptionServiceImpl prescriptionService;

    @BeforeEach
    void setUp() {
        PrescriptionMapper prescriptionMapper = new PrescriptionMapper(
                new PatientMapper(), new PrescriptionItemMapper(new MedicineMapper()));

        prescriptionService = new PrescriptionServiceImpl(
                prescriptionRepository, patientRepository, companyRepository, medicineRepository,
                medicineResolutionService, deliveryEligibilityService, medicineMovementService,
                prescriptionMapper, securityContextHelper, new AuthorizationPolicy());
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

    private Patient buildPatient(Company company) {
        return Patient.builder()
                .id(UUID.randomUUID())
                .name("John Doe")
                .cpf("52998224725")
                .birthdate(LocalDateTime.of(1950, 1, 1, 0, 0))
                .company(company)
                .build();
    }

    private Medicine buildMedicine(Company company) {
        return Medicine.builder()
                .id(UUID.randomUUID())
                .name("Dipirona")
                .eanCode("7891234567895")
                .imageUrl("https://example.com/dipirona.png")
                .company(company)
                .build();
    }

    private Prescription buildPrescription(Patient patient) {
        return Prescription.builder()
                .id(UUID.randomUUID())
                .status(PrescriptionStatus.PENDING)
                .issueDate(LocalDate.now())
                .patient(patient)
                .build();
    }

    private CreatePrescriptionItemRequestDTO buildItemDto(UUID medicineId) {
        return new CreatePrescriptionItemRequestDTO(
                medicineId, null, "10mg", 30, UnityType.TABLET, 2, FrequencyType.PER_DAY,
                TreatmentType.CONTINUOUS, 15);
    }

    private void assertForbidden(ThrowingCallable callable) {
        assertThatThrownBy(callable)
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> {
                    BusinessException businessException = (BusinessException) ex;
                    assertThat(businessException.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                    assertThat(businessException.getCode()).isEqualTo("AUTH_FORBIDDEN");
                });
    }

    private void assertFailsWith(ThrowingCallable callable, HttpStatus status, String expectedCode) {
        assertThatThrownBy(callable)
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> {
                    BusinessException businessException = (BusinessException) ex;
                    assertThat(businessException.getStatus()).isEqualTo(status);
                    assertThat(businessException.getCode()).isEqualTo(expectedCode);
                });
    }

    @Nested
    @DisplayName("createPrescription")
    class CreatePrescription {

        @Test
        @DisplayName("should allow an ADMIN to create a prescription with an existing medicine")
        void shouldAllowAdminToCreatePrescriptionWithExistingMedicine() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            Patient patient = buildPatient(company);
            Medicine medicine = buildMedicine(company);
            CreatePrescriptionRequestDTO dto = new CreatePrescriptionRequestDTO(
                    null, LocalDate.now(), patient.getId(), List.of(buildItemDto(medicine.getId())));

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(patientRepository.findById(patient.getId())).thenReturn(Optional.of(patient));
            when(medicineRepository.findById(medicine.getId())).thenReturn(Optional.of(medicine));
            when(prescriptionRepository.save(any(Prescription.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            PrescriptionResponseDTO response = prescriptionService.createPrescription(dto);

            assertThat(response.status()).isEqualTo(PrescriptionStatus.PENDING);
            assertThat(response.patientId()).isEqualTo(patient.getId());
        }

        @Test
        @DisplayName("should deny a non-member MANAGER from creating a prescription")
        void shouldDenyNonMemberManagerFromCreatingPrescription() {
            User manager = buildUser(UserRole.MANAGER);
            Company company = buildCompany();
            Patient patient = buildPatient(company);
            CreatePrescriptionRequestDTO dto = new CreatePrescriptionRequestDTO(
                    null, LocalDate.now(), patient.getId(), List.of(buildItemDto(UUID.randomUUID())));

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(patientRepository.findById(patient.getId())).thenReturn(Optional.of(patient));
            when(companyRepository.existsByIdAndUsers_Id(company.getId(), manager.getId())).thenReturn(false);

            assertForbidden(() -> prescriptionService.createPrescription(dto));

            verify(prescriptionRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw 404 when the patient does not exist")
        void shouldThrowNotFoundWhenPatientDoesNotExist() {
            User admin = buildUser(UserRole.ADMIN);
            UUID patientId = UUID.randomUUID();
            CreatePrescriptionRequestDTO dto = new CreatePrescriptionRequestDTO(
                    null, LocalDate.now(), patientId, List.of(buildItemDto(UUID.randomUUID())));

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(patientRepository.findById(patientId)).thenReturn(Optional.empty());

            assertFailsWith(
                    () -> prescriptionService.createPrescription(dto), HttpStatus.NOT_FOUND, "PATIENT_NOT_FOUND");

            verify(prescriptionRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw 422 when an item has neither a medicineId nor medicine data")
        void shouldThrowUnprocessableWhenItemHasNoMedicineReference() {
            User admin = buildUser(UserRole.ADMIN);
            Patient patient = buildPatient(buildCompany());
            CreatePrescriptionItemRequestDTO itemWithoutMedicine = new CreatePrescriptionItemRequestDTO(
                    null, null, "10mg", 30, UnityType.TABLET, 2, FrequencyType.PER_DAY,
                    TreatmentType.CONTINUOUS, 15);
            CreatePrescriptionRequestDTO dto = new CreatePrescriptionRequestDTO(
                    null, LocalDate.now(), patient.getId(), List.of(itemWithoutMedicine));

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(patientRepository.findById(patient.getId())).thenReturn(Optional.of(patient));

            assertFailsWith(
                    () -> prescriptionService.createPrescription(dto),
                    HttpStatus.UNPROCESSABLE_CONTENT, "MEDICINE_REQUIRED");

            verify(prescriptionRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw 422 when the referenced medicine belongs to a different company")
        void shouldThrowUnprocessableWhenMedicineBelongsToDifferentCompany() {
            User admin = buildUser(UserRole.ADMIN);
            Patient patient = buildPatient(buildCompany());
            Medicine medicineFromAnotherCompany = buildMedicine(buildCompany());
            CreatePrescriptionRequestDTO dto = new CreatePrescriptionRequestDTO(
                    null, LocalDate.now(), patient.getId(),
                    List.of(buildItemDto(medicineFromAnotherCompany.getId())));

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(patientRepository.findById(patient.getId())).thenReturn(Optional.of(patient));
            when(medicineRepository.findById(medicineFromAnotherCompany.getId()))
                    .thenReturn(Optional.of(medicineFromAnotherCompany));

            assertFailsWith(
                    () -> prescriptionService.createPrescription(dto),
                    HttpStatus.UNPROCESSABLE_CONTENT, "MEDICINE_COMPANY_MISMATCH");

            verify(prescriptionRepository, never()).save(any());
        }

        @Test
        @DisplayName("should fail the whole prescription when one item is still within a previous treatment period")
        void shouldFailWholePrescriptionWhenOneItemIsNotEligible() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            Patient patient = buildPatient(company);
            Medicine eligibleMedicine = buildMedicine(company);
            Medicine blockedMedicine = buildMedicine(company);
            CreatePrescriptionRequestDTO dto = new CreatePrescriptionRequestDTO(
                    null, LocalDate.now(), patient.getId(),
                    List.of(buildItemDto(eligibleMedicine.getId()), buildItemDto(blockedMedicine.getId())));

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(patientRepository.findById(patient.getId())).thenReturn(Optional.of(patient));
            when(medicineRepository.findById(eligibleMedicine.getId())).thenReturn(Optional.of(eligibleMedicine));
            when(medicineRepository.findById(blockedMedicine.getId())).thenReturn(Optional.of(blockedMedicine));
            doNothing().when(deliveryEligibilityService).assertEligible(patient, eligibleMedicine);
            doThrow(new BusinessException(
                    HttpStatus.CONFLICT, "Remédio ainda está no prazo de tratamento anterior",
                    "MEDICINE_STILL_IN_TREATMENT_PERIOD", "medicineId", "detail"))
                    .when(deliveryEligibilityService).assertEligible(patient, blockedMedicine);

            assertFailsWith(
                    () -> prescriptionService.createPrescription(dto),
                    HttpStatus.CONFLICT, "MEDICINE_STILL_IN_TREATMENT_PERIOD");

            verify(prescriptionRepository, never()).save(any());
            verify(medicineMovementService, never()).recordRequested(any());
        }

        @Test
        @DisplayName("should set requestedAt and record a REQUESTED movement for each created item")
        void shouldSetRequestedAtAndRecordRequestedMovementForEachItem() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            Patient patient = buildPatient(company);
            Medicine medicine = buildMedicine(company);
            CreatePrescriptionRequestDTO dto = new CreatePrescriptionRequestDTO(
                    null, LocalDate.now(), patient.getId(), List.of(buildItemDto(medicine.getId())));

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(patientRepository.findById(patient.getId())).thenReturn(Optional.of(patient));
            when(medicineRepository.findById(medicine.getId())).thenReturn(Optional.of(medicine));
            when(prescriptionRepository.save(any(Prescription.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            prescriptionService.createPrescription(dto);

            ArgumentCaptor<Prescription> captor = ArgumentCaptor.forClass(Prescription.class);
            verify(prescriptionRepository).save(captor.capture());
            assertThat(captor.getValue().getItems()).hasSize(1);
            assertThat(captor.getValue().getItems().get(0).getRequestedAt()).isNotNull();
            verify(medicineMovementService, times(1)).recordRequested(any());
        }
    }

    @Nested
    @DisplayName("getPrescriptionById")
    class GetPrescriptionById {

        @Test
        @DisplayName("should allow the linked PATIENT user to view their own prescription")
        void shouldAllowLinkedPatientToViewOwnPrescription() {
            User patientUser = buildUser(UserRole.PATIENT);
            Patient patient = buildPatient(buildCompany());
            patient.setUser(patientUser);
            Prescription prescription = buildPrescription(patient);

            when(securityContextHelper.getCurrentUser()).thenReturn(patientUser);
            when(prescriptionRepository.findById(prescription.getId())).thenReturn(Optional.of(prescription));

            PrescriptionDetailResponseDTO response = prescriptionService.getPrescriptionById(prescription.getId());

            assertThat(response.id()).isEqualTo(prescription.getId());
        }

        @Test
        @DisplayName("should deny a PATIENT user from viewing a prescription linked to someone else")
        void shouldDenyPatientFromViewingSomeoneElsesPrescription() {
            User patientUser = buildUser(UserRole.PATIENT);
            Patient patient = buildPatient(buildCompany());
            patient.setUser(buildUser(UserRole.PATIENT));
            Prescription prescription = buildPrescription(patient);

            when(securityContextHelper.getCurrentUser()).thenReturn(patientUser);
            when(prescriptionRepository.findById(prescription.getId())).thenReturn(Optional.of(prescription));

            assertForbidden(() -> prescriptionService.getPrescriptionById(prescription.getId()));
        }
    }

    @Nested
    @DisplayName("getPrescriptions")
    class GetPrescriptions {

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("should allow an ASSISTANT role to list prescriptions scoped to their company")
        void shouldAllowAssistantRoleToListPrescriptions() {
            User user = buildUser(UserRole.ASSISTANT);
            Pageable pageable = PageRequest.of(0, 20);
            PrescriptionFilter noFilter = new PrescriptionFilter(null, null, null, null, null);
            Page<Prescription> emptyPage = new PageImpl<>(List.of(), pageable, 0);

            when(securityContextHelper.getCurrentUser()).thenReturn(user);
            when(prescriptionRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(emptyPage);

            Page<PrescriptionListItemResponseDTO> result = prescriptionService.getPrescriptions(noFilter, pageable);

            assertThat(result.getContent()).isEmpty();
            verify(prescriptionRepository).findAll(any(Specification.class), eq(pageable));
        }
    }

    @Nested
    @DisplayName("updatePrescription")
    class UpdatePrescription {

        @Test
        @DisplayName("should update only the provided fields and keep the rest unchanged")
        void shouldPartiallyUpdateOnlyProvidedFields() {
            User admin = buildUser(UserRole.ADMIN);
            Patient patient = buildPatient(buildCompany());
            Prescription prescription = buildPrescription(patient);
            LocalDate originalIssueDate = prescription.getIssueDate();
            UpdatePrescriptionRequestDTO dto = new UpdatePrescriptionRequestDTO(
                    PrescriptionStatus.APPROVED, null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(prescriptionRepository.findById(prescription.getId())).thenReturn(Optional.of(prescription));
            when(prescriptionRepository.save(prescription)).thenReturn(prescription);

            PrescriptionResponseDTO response = prescriptionService.updatePrescription(prescription.getId(), dto);

            assertThat(response.status()).isEqualTo(PrescriptionStatus.APPROVED);
            assertThat(response.issueDate()).isEqualTo(originalIssueDate);
        }
    }

    @Nested
    @DisplayName("deletePrescription")
    class DeletePrescription {

        @Test
        @DisplayName("should deny a non-member MANAGER from deleting the prescription")
        void shouldDenyNonMemberManagerFromDeletingPrescription() {
            User manager = buildUser(UserRole.MANAGER);
            Company company = buildCompany();
            Patient patient = buildPatient(company);
            Prescription prescription = buildPrescription(patient);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(prescriptionRepository.findById(prescription.getId())).thenReturn(Optional.of(prescription));
            when(companyRepository.existsByIdAndUsers_Id(company.getId(), manager.getId())).thenReturn(false);

            assertForbidden(() -> prescriptionService.deletePrescription(prescription.getId()));

            verify(prescriptionRepository, never()).delete(any(Prescription.class));
        }
    }
}
