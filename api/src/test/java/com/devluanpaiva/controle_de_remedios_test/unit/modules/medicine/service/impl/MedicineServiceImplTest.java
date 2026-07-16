package com.devluanpaiva.controle_de_remedios_test.unit.modules.medicine.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
import com.devluanpaiva.controle_de_remedios.modules.medicine.dto.CreateMedicineRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.medicine.dto.MedicineResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.medicine.entity.Medicine;
import com.devluanpaiva.controle_de_remedios.modules.medicine.mapper.MedicineMapper;
import com.devluanpaiva.controle_de_remedios.modules.medicine.repository.MedicineRepository;
import com.devluanpaiva.controle_de_remedios.modules.medicine.service.MedicineResolutionService;
import com.devluanpaiva.controle_de_remedios.modules.medicine.service.impl.MedicineServiceImpl;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.security.AuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

@ExtendWith(MockitoExtension.class)
@DisplayName("MedicineServiceImpl")
class MedicineServiceImplTest {

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private MedicineRepository medicineRepository;

    @Mock
    private MedicineResolutionService medicineResolutionService;

    @Mock
    private SecurityContextHelper securityContextHelper;

    private MedicineServiceImpl medicineService;

    @BeforeEach
    void setUp() {
        medicineService = new MedicineServiceImpl(
                companyRepository, medicineRepository, new MedicineMapper(), medicineResolutionService,
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

    private Medicine buildMedicine(Company company) {
        return Medicine.builder()
                .id(UUID.randomUUID())
                .name("Dipirona")
                .eanCode("7891234567895")
                .imageUrl("https://example.com/dipirona.png")
                .company(company)
                .build();
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

    @Nested
    @DisplayName("createMedicine")
    class CreateMedicine {

        @Test
        @DisplayName("should allow an ADMIN to create a medicine for any company")
        void shouldAllowAdminToCreateMedicineForAnyCompany() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            Medicine created = buildMedicine(company);
            CreateMedicineRequestDTO dto = new CreateMedicineRequestDTO(
                    "Dipirona", "7891234567895", "https://example.com/dipirona.png", company.getId());

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(medicineResolutionService.resolveOrCreate(
                    company, "Dipirona", "7891234567895", "https://example.com/dipirona.png"))
                    .thenReturn(created);

            MedicineResponseDTO response = medicineService.createMedicine(dto);

            assertThat(response.id()).isEqualTo(created.getId());
            assertThat(response.companyId()).isEqualTo(company.getId());
        }

        @Test
        @DisplayName("should allow a member MANAGER to create a medicine, delegating to resolveOrCreate")
        void shouldAllowMemberManagerToCreateMedicine() {
            User manager = buildUser(UserRole.MANAGER);
            Company company = buildCompany();
            Medicine created = buildMedicine(company);
            CreateMedicineRequestDTO dto = new CreateMedicineRequestDTO(
                    "Dipirona", "7891234567895", "https://example.com/dipirona.png", company.getId());

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(companyRepository.existsByIdAndUsers_Id(company.getId(), manager.getId())).thenReturn(true);
            when(medicineResolutionService.resolveOrCreate(
                    company, "Dipirona", "7891234567895", "https://example.com/dipirona.png"))
                    .thenReturn(created);

            medicineService.createMedicine(dto);

            verify(medicineResolutionService).resolveOrCreate(
                    company, "Dipirona", "7891234567895", "https://example.com/dipirona.png");
        }

        @Test
        @DisplayName("should deny a non-member ASSISTANT from creating a medicine")
        void shouldDenyNonMemberAssistantFromCreatingMedicine() {
            User assistant = buildUser(UserRole.ASSISTANT);
            Company company = buildCompany();
            CreateMedicineRequestDTO dto = new CreateMedicineRequestDTO(
                    "Dipirona", "7891234567895", "https://example.com/dipirona.png", company.getId());

            when(securityContextHelper.getCurrentUser()).thenReturn(assistant);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(companyRepository.existsByIdAndUsers_Id(company.getId(), assistant.getId())).thenReturn(false);

            assertForbidden(() -> medicineService.createMedicine(dto));

            verify(medicineResolutionService, never()).resolveOrCreate(any(), any(), any(), any());
        }

        @Test
        @DisplayName("should deny a PATIENT from creating a medicine")
        void shouldDenyPatientFromCreatingMedicine() {
            User patientUser = buildUser(UserRole.PATIENT);
            Company company = buildCompany();
            CreateMedicineRequestDTO dto = new CreateMedicineRequestDTO(
                    "Dipirona", "7891234567895", "https://example.com/dipirona.png", company.getId());

            when(securityContextHelper.getCurrentUser()).thenReturn(patientUser);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));

            assertForbidden(() -> medicineService.createMedicine(dto));

            verify(medicineResolutionService, never()).resolveOrCreate(any(), any(), any(), any());
        }

        @Test
        @DisplayName("should throw 404 when the company does not exist")
        void shouldThrowNotFoundWhenCompanyDoesNotExist() {
            User admin = buildUser(UserRole.ADMIN);
            UUID companyId = UUID.randomUUID();
            CreateMedicineRequestDTO dto = new CreateMedicineRequestDTO(
                    "Dipirona", "7891234567895", "https://example.com/dipirona.png", companyId);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.findById(companyId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> medicineService.createMedicine(dto))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
                        assertThat(businessException.getCode()).isEqualTo("COMPANY_NOT_FOUND");
                    });
        }
    }

    @Nested
    @DisplayName("getMedicineById")
    class GetMedicineById {

        @Test
        @DisplayName("should allow an ADMIN to view any medicine")
        void shouldAllowAdminToViewAnyMedicine() {
            User admin = buildUser(UserRole.ADMIN);
            Medicine medicine = buildMedicine(buildCompany());

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(medicineRepository.findById(medicine.getId())).thenReturn(Optional.of(medicine));

            MedicineResponseDTO response = medicineService.getMedicineById(medicine.getId());

            assertThat(response.id()).isEqualTo(medicine.getId());
        }

        @Test
        @DisplayName("should allow a member ASSISTANT to view the medicine")
        void shouldAllowMemberAssistantToViewMedicine() {
            User assistant = buildUser(UserRole.ASSISTANT);
            Company company = buildCompany();
            Medicine medicine = buildMedicine(company);

            when(securityContextHelper.getCurrentUser()).thenReturn(assistant);
            when(medicineRepository.findById(medicine.getId())).thenReturn(Optional.of(medicine));
            when(companyRepository.existsByIdAndUsers_Id(company.getId(), assistant.getId())).thenReturn(true);

            MedicineResponseDTO response = medicineService.getMedicineById(medicine.getId());

            assertThat(response.id()).isEqualTo(medicine.getId());
        }

        @Test
        @DisplayName("should deny a non-member MANAGER from viewing the medicine")
        void shouldDenyNonMemberManagerFromViewingMedicine() {
            User manager = buildUser(UserRole.MANAGER);
            Company company = buildCompany();
            Medicine medicine = buildMedicine(company);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(medicineRepository.findById(medicine.getId())).thenReturn(Optional.of(medicine));
            when(companyRepository.existsByIdAndUsers_Id(company.getId(), manager.getId())).thenReturn(false);

            assertForbidden(() -> medicineService.getMedicineById(medicine.getId()));
        }

        @Test
        @DisplayName("should deny a PATIENT from viewing the medicine")
        void shouldDenyPatientFromViewingMedicine() {
            User patientUser = buildUser(UserRole.PATIENT);
            Medicine medicine = buildMedicine(buildCompany());

            when(securityContextHelper.getCurrentUser()).thenReturn(patientUser);
            when(medicineRepository.findById(medicine.getId())).thenReturn(Optional.of(medicine));

            assertForbidden(() -> medicineService.getMedicineById(medicine.getId()));
        }

        @Test
        @DisplayName("should throw 404 when the medicine does not exist")
        void shouldThrowNotFoundWhenMedicineDoesNotExist() {
            User admin = buildUser(UserRole.ADMIN);
            UUID id = UUID.randomUUID();

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(medicineRepository.findById(id)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> medicineService.getMedicineById(id))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
                        assertThat(businessException.getCode()).isEqualTo("MEDICINE_NOT_FOUND");
                    });
        }
    }
}
