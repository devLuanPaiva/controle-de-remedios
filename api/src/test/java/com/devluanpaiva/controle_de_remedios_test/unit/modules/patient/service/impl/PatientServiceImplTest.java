package com.devluanpaiva.controle_de_remedios_test.unit.modules.patient.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.Month;
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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.devluanpaiva.controle_de_remedios.modules.company.entity.Company;
import com.devluanpaiva.controle_de_remedios.modules.company.repository.CompanyRepository;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.CreatePatientAccountRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.CreatePatientRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.CreatePatientWithAccountRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.PatientResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.UpdatePatientRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;
import com.devluanpaiva.controle_de_remedios.modules.patient.filter.PatientFilter;
import com.devluanpaiva.controle_de_remedios.modules.patient.mapper.PatientMapper;
import com.devluanpaiva.controle_de_remedios.modules.patient.repository.PatientRepository;
import com.devluanpaiva.controle_de_remedios.modules.patient.service.impl.PatientServiceImpl;
import com.devluanpaiva.controle_de_remedios.modules.user.dto.UserResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.modules.user.mapper.UserMapper;
import com.devluanpaiva.controle_de_remedios.modules.user.repository.UserRepository;
import com.devluanpaiva.controle_de_remedios.security.AuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

@ExtendWith(MockitoExtension.class)
@DisplayName("PatientServiceImpl")
class PatientServiceImplTest {

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityContextHelper securityContextHelper;

    @Mock
    private PasswordEncoder passwordEncoder;

    private PatientServiceImpl patientService;

    @BeforeEach
    void setUp() {
        patientService = new PatientServiceImpl(
                patientRepository, companyRepository, userRepository, new PatientMapper(), new UserMapper(),
                passwordEncoder, securityContextHelper, new AuthorizationPolicy());
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
                .birthdate(LocalDate.of(1950, Month.JANUARY, 1).atStartOfDay())
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
    @DisplayName("createPatient")
    class CreatePatient {

        @Test
        @DisplayName("should allow an ADMIN to create a patient in any company")
        void shouldAllowAdminToCreatePatientInAnyCompany() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            CreatePatientRequestDTO dto = new CreatePatientRequestDTO(
                    "John Doe", "52998224725", LocalDate.of(1950, Month.JANUARY, 1), company.getId(), null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(patientRepository.save(any(Patient.class))).thenAnswer(invocation -> invocation.getArgument(0));

            PatientResponseDTO response = patientService.createPatient(dto);

            assertThat(response.name()).isEqualTo("John Doe");
            assertThat(response.cpf()).isEqualTo("52998224725");
            assertThat(response.companyId()).isEqualTo(company.getId());
            verify(companyRepository, never()).existsByIdAndUsers_Id(any(), any());
        }

        @Test
        @DisplayName("should allow a member MANAGER to create a patient in their own company")
        void shouldAllowMemberManagerToCreatePatientInOwnCompany() {
            User manager = buildUser(UserRole.MANAGER);
            Company company = buildCompany();
            CreatePatientRequestDTO dto = new CreatePatientRequestDTO(
                    "John Doe", "52998224725", LocalDate.of(1950, Month.JANUARY, 1), company.getId(), null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(companyRepository.existsByIdAndUsers_Id(company.getId(), manager.getId())).thenReturn(true);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(patientRepository.save(any(Patient.class))).thenAnswer(invocation -> invocation.getArgument(0));

            PatientResponseDTO response = patientService.createPatient(dto);

            assertThat(response.companyId()).isEqualTo(company.getId());
        }

        @Test
        @DisplayName("should deny a PATIENT actor from creating a patient")
        void shouldDenyPatientActorFromCreatingPatient() {
            User patientUser = buildUser(UserRole.PATIENT);
            UUID companyId = UUID.randomUUID();
            CreatePatientRequestDTO dto = new CreatePatientRequestDTO(
                    "John Doe", "52998224725", LocalDate.of(1950, Month.JANUARY, 1), companyId, null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(patientUser);

            assertForbidden(() -> patientService.createPatient(dto));

            verify(companyRepository, never()).findById(any());
            verify(patientRepository, never()).save(any());
        }

        @Test
        @DisplayName("should deny a non-member MANAGER from creating a patient")
        void shouldDenyNonMemberManagerFromCreatingPatient() {
            User manager = buildUser(UserRole.MANAGER);
            UUID companyId = UUID.randomUUID();
            CreatePatientRequestDTO dto = new CreatePatientRequestDTO(
                    "John Doe", "52998224725", LocalDate.of(1950, Month.JANUARY, 1), companyId, null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(companyRepository.existsByIdAndUsers_Id(companyId, manager.getId())).thenReturn(false);

            assertForbidden(() -> patientService.createPatient(dto));

            verify(companyRepository, never()).findById(any());
            verify(patientRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw 409 when the CPF is already registered in the same company")
        void shouldThrowConflictWhenCpfAlreadyRegisteredInCompany() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            CreatePatientRequestDTO dto = new CreatePatientRequestDTO(
                    "John Doe", "52998224725", LocalDate.of(1950, Month.JANUARY, 1), company.getId(), null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(patientRepository.existsByCompanyIdAndCpf(company.getId(), "52998224725")).thenReturn(true);

            assertFailsWith(() -> patientService.createPatient(dto), HttpStatus.CONFLICT, "PATIENT_CPF_ALREADY_EXISTS");

            verify(patientRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw 404 when the company does not exist")
        void shouldThrowNotFoundWhenCompanyDoesNotExist() {
            User admin = buildUser(UserRole.ADMIN);
            UUID companyId = UUID.randomUUID();
            CreatePatientRequestDTO dto = new CreatePatientRequestDTO(
                    "John Doe", "52998224725", LocalDate.of(1950, Month.JANUARY, 1), companyId, null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.findById(companyId)).thenReturn(Optional.empty());

            assertFailsWith(() -> patientService.createPatient(dto), HttpStatus.NOT_FOUND, "COMPANY_NOT_FOUND");
        }
    }

    @Nested
    @DisplayName("getPatientById")
    class GetPatientById {

        @Test
        @DisplayName("should allow an ADMIN to view any patient")
        void shouldAllowAdminToViewAnyPatient() {
            User admin = buildUser(UserRole.ADMIN);
            Patient patient = buildPatient(buildCompany());

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(patientRepository.findById(patient.getId())).thenReturn(Optional.of(patient));

            PatientResponseDTO response = patientService.getPatientById(patient.getId());

            assertThat(response.id()).isEqualTo(patient.getId());
        }

        @Test
        @DisplayName("should allow the linked PATIENT user to view their own record")
        void shouldAllowLinkedPatientToViewOwnRecord() {
            User patientUser = buildUser(UserRole.PATIENT);
            Patient patient = buildPatient(buildCompany());
            patient.setUser(patientUser);

            when(securityContextHelper.getCurrentUser()).thenReturn(patientUser);
            when(patientRepository.findById(patient.getId())).thenReturn(Optional.of(patient));

            PatientResponseDTO response = patientService.getPatientById(patient.getId());

            assertThat(response.id()).isEqualTo(patient.getId());
        }

        @Test
        @DisplayName("should deny a PATIENT user from viewing a record linked to someone else")
        void shouldDenyPatientFromViewingSomeoneElsesRecord() {
            User patientUser = buildUser(UserRole.PATIENT);
            Patient patient = buildPatient(buildCompany());
            patient.setUser(buildUser(UserRole.PATIENT));

            when(securityContextHelper.getCurrentUser()).thenReturn(patientUser);
            when(patientRepository.findById(patient.getId())).thenReturn(Optional.of(patient));

            assertForbidden(() -> patientService.getPatientById(patient.getId()));
        }

        @Test
        @DisplayName("should deny a non-member MANAGER from viewing the patient")
        void shouldDenyNonMemberManagerFromViewingPatient() {
            User manager = buildUser(UserRole.MANAGER);
            Company company = buildCompany();
            Patient patient = buildPatient(company);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(patientRepository.findById(patient.getId())).thenReturn(Optional.of(patient));
            when(companyRepository.existsByIdAndUsers_Id(company.getId(), manager.getId())).thenReturn(false);

            assertForbidden(() -> patientService.getPatientById(patient.getId()));
        }

        @Test
        @DisplayName("should throw 404 when the patient does not exist")
        void shouldThrowNotFoundWhenPatientDoesNotExist() {
            User admin = buildUser(UserRole.ADMIN);
            UUID id = UUID.randomUUID();

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(patientRepository.findById(id)).thenReturn(Optional.empty());

            assertFailsWith(() -> patientService.getPatientById(id), HttpStatus.NOT_FOUND, "PATIENT_NOT_FOUND");
        }
    }

    @Nested
    @DisplayName("getPatients")
    class GetPatients {

        private final PatientFilter noFilter = new PatientFilter(null, null, null);

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("should query the repository with an unrestricted specification for an ADMIN")
        void shouldReturnUnrestrictedResultsForAdmin() {
            User admin = buildUser(UserRole.ADMIN);
            Pageable pageable = PageRequest.of(0, 20);
            Page<Patient> page = new PageImpl<>(List.of(buildPatient(buildCompany())), pageable, 1);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(patientRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);

            Page<PatientResponseDTO> result = patientService.getPatients(noFilter, pageable);

            assertThat(result.getTotalElements()).isEqualTo(1);
            assertThat(result.getContent().get(0).cpf()).isEqualTo("529.***.***-**");

            ArgumentCaptor<Specification<Patient>> captor = ArgumentCaptor.forClass(Specification.class);
            verify(patientRepository).findAll(captor.capture(), eq(pageable));

            Root<Patient> root = mock(Root.class);
            CriteriaQuery<?> query = mock(CriteriaQuery.class);
            CriteriaBuilder builder = mock(CriteriaBuilder.class);

            captor.getValue().toPredicate(root, query, builder);

            verify(root, never()).join(org.mockito.ArgumentMatchers.anyString());
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("should scope the specification to patients of companies the actor belongs to when not ADMIN")
        void shouldScopeSpecificationForNonAdmin() {
            User manager = buildUser(UserRole.MANAGER);
            Pageable pageable = PageRequest.of(0, 20);
            Page<Patient> page = new PageImpl<>(List.of(), pageable, 0);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(patientRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);

            patientService.getPatients(noFilter, pageable);

            ArgumentCaptor<Specification<Patient>> captor = ArgumentCaptor.forClass(Specification.class);
            verify(patientRepository).findAll(captor.capture(), eq(pageable));

            Root<Patient> root = mock(Root.class);
            CriteriaQuery<?> query = mock(CriteriaQuery.class);
            CriteriaBuilder builder = mock(CriteriaBuilder.class);
            Join<Patient, Company> companyJoin = mock(Join.class);
            Join<Company, User> userJoin = mock(Join.class);
            Path<UUID> idPath = mock(Path.class);
            Predicate predicate = mock(Predicate.class);

            when(root.<Patient, Company>join("company")).thenReturn(companyJoin);
            when(companyJoin.<Company, User>join("users")).thenReturn(userJoin);
            when(userJoin.<UUID>get("id")).thenReturn(idPath);
            when(builder.equal(idPath, manager.getId())).thenReturn(predicate);

            captor.getValue().toPredicate(root, query, builder);

            verify(root).join("company");
            verify(companyJoin).join("users");
            verify(builder).equal(idPath, manager.getId());
        }

        @Test
        @DisplayName("should deny a PATIENT actor from listing patients")
        void shouldDenyPatientActorFromListingPatients() {
            User patientUser = buildUser(UserRole.PATIENT);
            Pageable pageable = PageRequest.of(0, 20);

            when(securityContextHelper.getCurrentUser()).thenReturn(patientUser);

            assertForbidden(() -> patientService.getPatients(noFilter, pageable));

            verify(patientRepository, never()).findAll(any(Specification.class), eq(pageable));
        }
    }

    @Nested
    @DisplayName("updatePatient")
    class UpdatePatient {

        @Test
        @DisplayName("should update only the provided fields and keep the rest unchanged")
        void shouldPartiallyUpdateOnlyProvidedFields() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            Patient patient = buildPatient(company);
            String originalCpf = patient.getCpf();
            UpdatePatientRequestDTO dto = new UpdatePatientRequestDTO("Jane Doe", null, null, null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(patientRepository.findById(patient.getId())).thenReturn(Optional.of(patient));
            when(patientRepository.save(patient)).thenReturn(patient);

            PatientResponseDTO response = patientService.updatePatient(patient.getId(), dto);

            assertThat(response.name()).isEqualTo("Jane Doe");
            assertThat(response.cpf()).isEqualTo(originalCpf);
            verify(patientRepository, never()).existsByCompanyIdAndCpf(any(), any());
        }

        @Test
        @DisplayName("should re-validate CPF uniqueness within the company when the CPF changes")
        void shouldRevalidateCpfUniquenessWhenCpfChanges() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            Patient patient = buildPatient(company);
            UpdatePatientRequestDTO dto = new UpdatePatientRequestDTO(null, "11144477735", null, null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(patientRepository.findById(patient.getId())).thenReturn(Optional.of(patient));
            when(patientRepository.existsByCompanyIdAndCpf(company.getId(), "11144477735")).thenReturn(true);

            assertFailsWith(
                    () -> patientService.updatePatient(patient.getId(), dto),
                    HttpStatus.CONFLICT, "PATIENT_CPF_ALREADY_EXISTS");

            verify(patientRepository, never()).save(any());
        }

        @Test
        @DisplayName("should deny a non-member MANAGER from updating the patient")
        void shouldDenyNonMemberManagerFromUpdatingPatient() {
            User manager = buildUser(UserRole.MANAGER);
            Company company = buildCompany();
            Patient patient = buildPatient(company);
            UpdatePatientRequestDTO dto = new UpdatePatientRequestDTO("Jane Doe", null, null, null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(patientRepository.findById(patient.getId())).thenReturn(Optional.of(patient));
            when(companyRepository.existsByIdAndUsers_Id(company.getId(), manager.getId())).thenReturn(false);

            assertForbidden(() -> patientService.updatePatient(patient.getId(), dto));

            verify(patientRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw 404 when the patient does not exist")
        void shouldThrowNotFoundWhenPatientDoesNotExist() {
            User admin = buildUser(UserRole.ADMIN);
            UUID id = UUID.randomUUID();
            UpdatePatientRequestDTO dto = new UpdatePatientRequestDTO("Jane Doe", null, null, null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(patientRepository.findById(id)).thenReturn(Optional.empty());

            assertFailsWith(() -> patientService.updatePatient(id, dto), HttpStatus.NOT_FOUND, "PATIENT_NOT_FOUND");
        }
    }

    @Nested
    @DisplayName("deletePatient")
    class DeletePatient {

        @Test
        @DisplayName("should allow a member MANAGER to delete a patient from their own company")
        void shouldAllowMemberManagerToDeletePatient() {
            User manager = buildUser(UserRole.MANAGER);
            Company company = buildCompany();
            Patient patient = buildPatient(company);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(patientRepository.findById(patient.getId())).thenReturn(Optional.of(patient));
            when(companyRepository.existsByIdAndUsers_Id(company.getId(), manager.getId())).thenReturn(true);

            patientService.deletePatient(patient.getId());

            verify(patientRepository).delete(patient);
        }

        @Test
        @DisplayName("should deny a non-member MANAGER from deleting the patient")
        void shouldDenyNonMemberManagerFromDeletingPatient() {
            User manager = buildUser(UserRole.MANAGER);
            Company company = buildCompany();
            Patient patient = buildPatient(company);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(patientRepository.findById(patient.getId())).thenReturn(Optional.of(patient));
            when(companyRepository.existsByIdAndUsers_Id(company.getId(), manager.getId())).thenReturn(false);

            assertForbidden(() -> patientService.deletePatient(patient.getId()));

            verify(patientRepository, never()).delete(any(Patient.class));
        }
    }

    @Nested
    @DisplayName("createPatientAccount")
    class CreatePatientAccount {

        @Test
        @DisplayName("should create a PATIENT user replicating the patient's name and CPF, then link it")
        void shouldCreateAccountReplicatingPatientDataAndLinkIt() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            Patient patient = buildPatient(company);
            CreatePatientAccountRequestDTO dto = new CreatePatientAccountRequestDTO(
                    "patient@example.com", "password123");

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(patientRepository.findById(patient.getId())).thenReturn(Optional.of(patient));
            when(userRepository.existsByEmail(dto.email())).thenReturn(false);
            when(userRepository.existsByCpf(patient.getCpf())).thenReturn(false);
            when(passwordEncoder.encode(dto.password())).thenReturn("encoded-password");
            when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(patientRepository.save(patient)).thenReturn(patient);

            UserResponseDTO response = patientService.createPatientAccount(patient.getId(), dto);

            assertThat(response.name()).isEqualTo(patient.getName());
            assertThat(response.cpf()).isEqualTo(patient.getCpf());
            assertThat(response.email()).isEqualTo("patient@example.com");
            assertThat(response.role()).isEqualTo(UserRole.PATIENT);
            assertThat(patient.getUser()).isNotNull();
            assertThat(patient.getUser().getCompanies()).contains(company);
        }

        @Test
        @DisplayName("should throw 409 when the patient already has a linked account")
        void shouldThrowConflictWhenPatientAlreadyHasAccount() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            Patient patient = buildPatient(company);
            patient.setUser(buildUser(UserRole.PATIENT));
            CreatePatientAccountRequestDTO dto = new CreatePatientAccountRequestDTO(
                    "patient@example.com", "password123");

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(patientRepository.findById(patient.getId())).thenReturn(Optional.of(patient));

            assertFailsWith(
                    () -> patientService.createPatientAccount(patient.getId(), dto),
                    HttpStatus.CONFLICT, "PATIENT_ACCOUNT_ALREADY_EXISTS");

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw 409 when the e-mail is already registered")
        void shouldThrowConflictWhenEmailAlreadyExists() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            Patient patient = buildPatient(company);
            CreatePatientAccountRequestDTO dto = new CreatePatientAccountRequestDTO(
                    "patient@example.com", "password123");

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(patientRepository.findById(patient.getId())).thenReturn(Optional.of(patient));
            when(userRepository.existsByEmail(dto.email())).thenReturn(true);

            assertFailsWith(
                    () -> patientService.createPatientAccount(patient.getId(), dto),
                    HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS");

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("should deny a non-member MANAGER from creating the account")
        void shouldDenyNonMemberManagerFromCreatingAccount() {
            User manager = buildUser(UserRole.MANAGER);
            Company company = buildCompany();
            Patient patient = buildPatient(company);
            CreatePatientAccountRequestDTO dto = new CreatePatientAccountRequestDTO(
                    "patient@example.com", "password123");

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(patientRepository.findById(patient.getId())).thenReturn(Optional.of(patient));
            when(companyRepository.existsByIdAndUsers_Id(company.getId(), manager.getId())).thenReturn(false);

            assertForbidden(() -> patientService.createPatientAccount(patient.getId(), dto));

            verify(userRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("createPatientWithAccount")
    class CreatePatientWithAccount {

        @Test
        @DisplayName("should create the patient and the account together, already linked")
        void shouldCreatePatientAndAccountTogether() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            CreatePatientWithAccountRequestDTO dto = new CreatePatientWithAccountRequestDTO(
                    "John Doe", "52998224725", LocalDate.of(1950, Month.JANUARY, 1), company.getId(),
                    "patient@example.com", "password123", null, null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(userRepository.existsByEmail(dto.email())).thenReturn(false);
            when(userRepository.existsByCpf(dto.cpf())).thenReturn(false);
            when(passwordEncoder.encode(dto.password())).thenReturn("encoded-password");
            when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
                User user = invocation.getArgument(0);
                user.setId(UUID.randomUUID());
                return user;
            });
            when(patientRepository.save(any(Patient.class))).thenAnswer(invocation -> invocation.getArgument(0));

            PatientResponseDTO response = patientService.createPatientWithAccount(dto);

            assertThat(response.name()).isEqualTo("John Doe");
            assertThat(response.userId()).isNotNull();
            assertThat(response.companyId()).isEqualTo(company.getId());
        }

        @Test
        @DisplayName("should throw 409 when the patient CPF already exists in the company")
        void shouldThrowConflictWhenPatientCpfAlreadyExistsInCompany() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            CreatePatientWithAccountRequestDTO dto = new CreatePatientWithAccountRequestDTO(
                    "John Doe", "52998224725", LocalDate.of(1950, Month.JANUARY, 1), company.getId(),
                    "patient@example.com", "password123", null, null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(patientRepository.existsByCompanyIdAndCpf(company.getId(), dto.cpf())).thenReturn(true);

            assertFailsWith(
                    () -> patientService.createPatientWithAccount(dto),
                    HttpStatus.CONFLICT, "PATIENT_CPF_ALREADY_EXISTS");

            verify(userRepository, never()).save(any());
            verify(patientRepository, never()).save(any());
        }

        @Test
        @DisplayName("should deny a non-member MANAGER from creating patient and account together")
        void shouldDenyNonMemberManagerFromCreatingPatientWithAccount() {
            User manager = buildUser(UserRole.MANAGER);
            UUID companyId = UUID.randomUUID();
            CreatePatientWithAccountRequestDTO dto = new CreatePatientWithAccountRequestDTO(
                    "John Doe", "52998224725", LocalDate.of(1950, Month.JANUARY, 1), companyId,
                    "patient@example.com", "password123", null, null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(companyRepository.existsByIdAndUsers_Id(companyId, manager.getId())).thenReturn(false);

            assertForbidden(() -> patientService.createPatientWithAccount(dto));

            verify(companyRepository, never()).findById(any());
            verify(patientRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("removePatientAccount")
    class RemovePatientAccount {

        @Test
        @DisplayName("should unlink the account without touching its company association")
        void shouldUnlinkAccountWithoutTouchingCompanyAssociation() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            Patient patient = buildPatient(company);
            User linkedUser = buildUser(UserRole.PATIENT);
            linkedUser.assignToCompany(company);
            patient.setUser(linkedUser);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(patientRepository.findById(patient.getId())).thenReturn(Optional.of(patient));
            when(patientRepository.save(patient)).thenReturn(patient);

            patientService.removePatientAccount(patient.getId());

            assertThat(patient.getUser()).isNull();
            assertThat(linkedUser.getCompanies()).contains(company);
            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw 404 when the patient has no linked account")
        void shouldThrowNotFoundWhenPatientHasNoLinkedAccount() {
            User admin = buildUser(UserRole.ADMIN);
            Patient patient = buildPatient(buildCompany());

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(patientRepository.findById(patient.getId())).thenReturn(Optional.of(patient));

            assertFailsWith(
                    () -> patientService.removePatientAccount(patient.getId()),
                    HttpStatus.NOT_FOUND, "PATIENT_ACCOUNT_NOT_FOUND");

            verify(patientRepository, never()).save(any());
        }

        @Test
        @DisplayName("should deny a non-member MANAGER from removing the account")
        void shouldDenyNonMemberManagerFromRemovingAccount() {
            User manager = buildUser(UserRole.MANAGER);
            Company company = buildCompany();
            Patient patient = buildPatient(company);
            patient.setUser(buildUser(UserRole.PATIENT));

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(patientRepository.findById(patient.getId())).thenReturn(Optional.of(patient));
            when(companyRepository.existsByIdAndUsers_Id(company.getId(), manager.getId())).thenReturn(false);

            assertForbidden(() -> patientService.removePatientAccount(patient.getId()));

            verify(patientRepository, never()).save(any());
        }
    }
}
