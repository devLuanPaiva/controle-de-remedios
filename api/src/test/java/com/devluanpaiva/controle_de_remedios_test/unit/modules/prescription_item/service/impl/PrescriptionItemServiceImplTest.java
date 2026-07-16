package com.devluanpaiva.controle_de_remedios_test.unit.modules.prescription_item.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.assertj.core.api.ThrowableAssert.ThrowingCallable;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import com.devluanpaiva.controle_de_remedios.modules.company.entity.Company;
import com.devluanpaiva.controle_de_remedios.modules.company.repository.CompanyRepository;
import com.devluanpaiva.controle_de_remedios.modules.medicine.entity.Medicine;
import com.devluanpaiva.controle_de_remedios.modules.medicine.mapper.MedicineMapper;
import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;
import com.devluanpaiva.controle_de_remedios.modules.prescription.entity.Prescription;
import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.dto.PrescriptionItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.dto.UpdatePrescriptionItemRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.FrequencyType;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.TreatmentType;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.UnityType;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.mapper.PrescriptionItemMapper;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.repository.PrescriptionItemRepository;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.service.impl.PrescriptionItemServiceImpl;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.security.AuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

@ExtendWith(MockitoExtension.class)
@DisplayName("PrescriptionItemServiceImpl")
class PrescriptionItemServiceImplTest {

    @Mock
    private PrescriptionItemRepository prescriptionItemRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private SecurityContextHelper securityContextHelper;

    private PrescriptionItemServiceImpl prescriptionItemService;

    @BeforeEach
    void setUp() {
        prescriptionItemService = new PrescriptionItemServiceImpl(
                prescriptionItemRepository, companyRepository, new PrescriptionItemMapper(new MedicineMapper()),
                securityContextHelper, new AuthorizationPolicy());
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

    private PrescriptionItem buildItem(Patient patient) {
        Company company = patient.getCompany();
        Medicine medicine = Medicine.builder()
                .id(UUID.randomUUID())
                .name("Dipirona")
                .imageUrl("https://example.com/dipirona.png")
                .company(company)
                .build();
        Prescription prescription = Prescription.builder().id(UUID.randomUUID()).patient(patient).build();

        return PrescriptionItem.builder()
                .id(UUID.randomUUID())
                .prescription(prescription)
                .medicine(medicine)
                .status(PrescriptionStatus.PENDING)
                .dosage("10mg")
                .prescribedQuantity(30)
                .unityType(UnityType.TABLET)
                .frequency(2)
                .frequencyType(FrequencyType.PER_DAY)
                .treatmentType(TreatmentType.CONTINUOUS)
                .treatmentDays(15)
                .receivedQuantity(0)
                .deliveredQuantity(0)
                .build();
    }

    private UpdatePrescriptionItemRequestDTO emptyUpdateDto() {
        return new UpdatePrescriptionItemRequestDTO(
                null, null, null, null, null, null, null, null, null, null, null, null, null);
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

    private void assertNotFound(ThrowingCallable callable) {
        assertThatThrownBy(callable)
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> {
                    BusinessException businessException = (BusinessException) ex;
                    assertThat(businessException.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
                    assertThat(businessException.getCode()).isEqualTo("PRESCRIPTION_ITEM_NOT_FOUND");
                });
    }

    @Nested
    @DisplayName("getPrescriptionItemById")
    class GetPrescriptionItemById {

        @Test
        @DisplayName("should allow the linked PATIENT user to view their own prescription item")
        void shouldAllowLinkedPatientToViewOwnItem() {
            User patientUser = buildUser(UserRole.PATIENT);
            Patient patient = buildPatient(buildCompany());
            patient.setUser(patientUser);
            PrescriptionItem item = buildItem(patient);

            when(securityContextHelper.getCurrentUser()).thenReturn(patientUser);
            when(prescriptionItemRepository.findById(item.getId())).thenReturn(Optional.of(item));

            PrescriptionItemResponseDTO response = prescriptionItemService.getPrescriptionItemById(item.getId());

            assertThat(response.id()).isEqualTo(item.getId());
        }

        @Test
        @DisplayName("should deny a PATIENT user from viewing an item linked to someone else")
        void shouldDenyPatientFromViewingSomeoneElsesItem() {
            User patientUser = buildUser(UserRole.PATIENT);
            Patient patient = buildPatient(buildCompany());
            patient.setUser(buildUser(UserRole.PATIENT));
            PrescriptionItem item = buildItem(patient);

            when(securityContextHelper.getCurrentUser()).thenReturn(patientUser);
            when(prescriptionItemRepository.findById(item.getId())).thenReturn(Optional.of(item));

            assertForbidden(() -> prescriptionItemService.getPrescriptionItemById(item.getId()));
        }

        @Test
        @DisplayName("should deny a non-member MANAGER from viewing the item")
        void shouldDenyNonMemberManagerFromViewingItem() {
            User manager = buildUser(UserRole.MANAGER);
            Company company = buildCompany();
            Patient patient = buildPatient(company);
            PrescriptionItem item = buildItem(patient);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(prescriptionItemRepository.findById(item.getId())).thenReturn(Optional.of(item));
            when(companyRepository.existsByIdAndUsers_Id(company.getId(), manager.getId())).thenReturn(false);

            assertForbidden(() -> prescriptionItemService.getPrescriptionItemById(item.getId()));
        }

        @Test
        @DisplayName("should throw 404 when the prescription item does not exist")
        void shouldThrowNotFoundWhenItemDoesNotExist() {
            User admin = buildUser(UserRole.ADMIN);
            UUID id = UUID.randomUUID();

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(prescriptionItemRepository.findById(id)).thenReturn(Optional.empty());

            assertNotFound(() -> prescriptionItemService.getPrescriptionItemById(id));
        }
    }

    @Nested
    @DisplayName("updatePrescriptionItem")
    class UpdatePrescriptionItem {

        @Test
        @DisplayName("should update only the provided fields and keep the rest unchanged")
        void shouldUpdateOnlyProvidedFields() {
            User admin = buildUser(UserRole.ADMIN);
            Patient patient = buildPatient(buildCompany());
            PrescriptionItem item = buildItem(patient);
            UpdatePrescriptionItemRequestDTO dto = new UpdatePrescriptionItemRequestDTO(
                    PrescriptionStatus.APPROVED, null, null, null, null, null, null, null, null, null, null, null,
                    null);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(prescriptionItemRepository.findById(item.getId())).thenReturn(Optional.of(item));
            when(prescriptionItemRepository.save(item)).thenReturn(item);

            PrescriptionItemResponseDTO response = prescriptionItemService.updatePrescriptionItem(item.getId(), dto);

            assertThat(response.status()).isEqualTo(PrescriptionStatus.APPROVED);
            assertThat(response.dosage()).isEqualTo("10mg");
            assertThat(response.prescribedQuantity()).isEqualTo(30);
        }

        @Test
        @DisplayName("should update receivedQuantity and deliveredQuantity when provided")
        void shouldUpdateReceivedAndDeliveredQuantity() {
            User admin = buildUser(UserRole.ADMIN);
            Patient patient = buildPatient(buildCompany());
            PrescriptionItem item = buildItem(patient);
            UpdatePrescriptionItemRequestDTO dto = new UpdatePrescriptionItemRequestDTO(
                    null, null, null, null, null, null, null, null, null, null, 20, 10, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(prescriptionItemRepository.findById(item.getId())).thenReturn(Optional.of(item));
            when(prescriptionItemRepository.save(item)).thenReturn(item);

            PrescriptionItemResponseDTO response = prescriptionItemService.updatePrescriptionItem(item.getId(), dto);

            assertThat(response.receivedQuantity()).isEqualTo(20);
            assertThat(response.deliveredQuantity()).isEqualTo(10);
            assertThat(response.status()).isEqualTo(PrescriptionStatus.PENDING);
        }

        @Test
        @DisplayName("should deny a non-member ASSISTANT from updating the item")
        void shouldDenyNonMemberAssistantFromUpdatingItem() {
            User assistant = buildUser(UserRole.ASSISTANT);
            Company company = buildCompany();
            Patient patient = buildPatient(company);
            PrescriptionItem item = buildItem(patient);

            when(securityContextHelper.getCurrentUser()).thenReturn(assistant);
            when(prescriptionItemRepository.findById(item.getId())).thenReturn(Optional.of(item));
            when(companyRepository.existsByIdAndUsers_Id(company.getId(), assistant.getId())).thenReturn(false);

            assertForbidden(() -> prescriptionItemService.updatePrescriptionItem(item.getId(), emptyUpdateDto()));

            verify(prescriptionItemRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw 404 when the prescription item does not exist")
        void shouldThrowNotFoundWhenItemDoesNotExist() {
            User admin = buildUser(UserRole.ADMIN);
            UUID id = UUID.randomUUID();

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(prescriptionItemRepository.findById(id)).thenReturn(Optional.empty());

            assertNotFound(() -> prescriptionItemService.updatePrescriptionItem(id, emptyUpdateDto()));

            verify(prescriptionItemRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("deletePrescriptionItem")
    class DeletePrescriptionItem {

        @Test
        @DisplayName("should allow a member MANAGER to delete the prescription item")
        void shouldAllowMemberManagerToDeleteItem() {
            User manager = buildUser(UserRole.MANAGER);
            Company company = buildCompany();
            Patient patient = buildPatient(company);
            PrescriptionItem item = buildItem(patient);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(prescriptionItemRepository.findById(item.getId())).thenReturn(Optional.of(item));
            when(companyRepository.existsByIdAndUsers_Id(company.getId(), manager.getId())).thenReturn(true);

            prescriptionItemService.deletePrescriptionItem(item.getId());

            verify(prescriptionItemRepository).delete(item);
        }

        @Test
        @DisplayName("should deny an ASSISTANT from deleting the item, even as a company member")
        void shouldDenyAssistantFromDeletingItemEvenAsMember() {
            User assistant = buildUser(UserRole.ASSISTANT);
            Patient patient = buildPatient(buildCompany());
            PrescriptionItem item = buildItem(patient);

            when(securityContextHelper.getCurrentUser()).thenReturn(assistant);
            when(prescriptionItemRepository.findById(item.getId())).thenReturn(Optional.of(item));

            assertForbidden(() -> prescriptionItemService.deletePrescriptionItem(item.getId()));

            verify(companyRepository, never()).existsByIdAndUsers_Id(any(), any());
            verify(prescriptionItemRepository, never()).delete(any(PrescriptionItem.class));
        }
    }
}
