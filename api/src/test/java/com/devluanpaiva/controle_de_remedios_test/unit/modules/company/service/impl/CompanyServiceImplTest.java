package com.devluanpaiva.controle_de_remedios_test.unit.modules.company.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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

import com.devluanpaiva.controle_de_remedios.modules.company.dto.CompanyResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.company.dto.CreateCompanyRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.company.dto.UpdateCompanyRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.company.entity.Company;
import com.devluanpaiva.controle_de_remedios.modules.company.filter.CompanyFilter;
import com.devluanpaiva.controle_de_remedios.modules.company.mapper.CompanyMapper;
import com.devluanpaiva.controle_de_remedios.modules.company.repository.CompanyRepository;
import com.devluanpaiva.controle_de_remedios.modules.company.service.impl.CompanyServiceImpl;
import com.devluanpaiva.controle_de_remedios.modules.medicine.dto.MedicineResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.medicine.entity.Medicine;
import com.devluanpaiva.controle_de_remedios.modules.medicine.filter.MedicineFilter;
import com.devluanpaiva.controle_de_remedios.modules.medicine.mapper.MedicineMapper;
import com.devluanpaiva.controle_de_remedios.modules.medicine.repository.MedicineRepository;
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
@DisplayName("CompanyServiceImpl")
class CompanyServiceImplTest {

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MedicineRepository medicineRepository;

    @Mock
    private SecurityContextHelper securityContextHelper;

    private CompanyServiceImpl companyService;

    @BeforeEach
    void setUp() {
        companyService = new CompanyServiceImpl(
                companyRepository, userRepository, medicineRepository, new CompanyMapper(), new UserMapper(),
                new MedicineMapper(), securityContextHelper, new AuthorizationPolicy());
    }

    private Company buildCompany() {
        return Company.builder()
                .id(UUID.randomUUID())
                .name("Acme")
                .slug("acme")
                .cnpj("11222333000181")
                .imageUrl("https://example.com/logo.png")
                .active(true)
                .build();
    }

    private User buildUser(UserRole role) {
        return User.builder()
                .id(UUID.randomUUID())
                .name("User " + role.name())
                .email(role.name().toLowerCase() + "." + UUID.randomUUID() + "@example.com")
                .password("encoded-password")
                .cpf("12345678901")
                .role(role)
                .imageUrl("https://example.com/avatar.png")
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

    private void assertNotFound(ThrowingCallable callable, String expectedCode) {
        assertThatThrownBy(callable)
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> {
                    BusinessException businessException = (BusinessException) ex;
                    assertThat(businessException.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
                    assertThat(businessException.getCode()).isEqualTo(expectedCode);
                });
    }

    @Nested
    @DisplayName("createCompany")
    class CreateCompany {

        @Test
        @DisplayName("should create the company as active, generate its slug and attach the creator")
        void shouldCreateCompanyAndAttachCreator() {
            User admin = buildUser(UserRole.ADMIN);
            CreateCompanyRequestDTO dto = new CreateCompanyRequestDTO("Acme", "11222333000181", null);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.save(any(Company.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(userRepository.findById(admin.getId())).thenReturn(Optional.of(admin));

            CompanyResponseDTO response = companyService.createCompany(dto);

            assertThat(response.name()).isEqualTo("Acme");
            assertThat(response.cnpj()).isEqualTo("11222333000181");
            assertThat(response.slug()).isEqualTo("acme");
            assertThat(response.active()).isTrue();
            assertThat(response.imageUrl()).isNull();

            assertThat(admin.getCompanies()).extracting(Company::getSlug).contains("acme");
            verify(userRepository).save(admin);
        }

        @Test
        @DisplayName("should append an incrementing suffix while the generated slug is already taken")
        void shouldAppendSuffixWhenSlugIsTaken() {
            User admin = buildUser(UserRole.ADMIN);
            CreateCompanyRequestDTO dto = new CreateCompanyRequestDTO("Acme", "11222333000181", null);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.existsBySlug("acme")).thenReturn(true);
            when(companyRepository.existsBySlug("acme-1")).thenReturn(true);
            when(companyRepository.existsBySlug("acme-2")).thenReturn(false);
            when(companyRepository.save(any(Company.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(userRepository.findById(admin.getId())).thenReturn(Optional.of(admin));

            CompanyResponseDTO response = companyService.createCompany(dto);

            assertThat(response.slug()).isEqualTo("acme-2");
        }

        @Test
        @DisplayName("should deny a non-ADMIN from creating a company and never query the CNPJ")
        void shouldDenyNonAdminFromCreatingCompany() {
            User manager = buildUser(UserRole.MANAGER);
            CreateCompanyRequestDTO dto = new CreateCompanyRequestDTO("Acme", "11222333000181", null);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);

            assertForbidden(() -> companyService.createCompany(dto));

            verify(companyRepository, never()).existsByCnpj(any());
            verify(companyRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw 409 when the CNPJ already exists")
        void shouldThrowConflictWhenCnpjAlreadyExists() {
            User admin = buildUser(UserRole.ADMIN);
            CreateCompanyRequestDTO dto = new CreateCompanyRequestDTO("Acme", "11222333000181", null);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.existsByCnpj(dto.cnpj())).thenReturn(true);

            assertThatThrownBy(() -> companyService.createCompany(dto))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.CONFLICT);
                        assertThat(businessException.getCode()).isEqualTo("CNPJ_ALREADY_EXISTS");
                    });

            verify(companyRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("getCompanyById")
    class GetCompanyById {

        @Test
        @DisplayName("should allow an ADMIN to view any company")
        void shouldAllowAdminToViewAnyCompany() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));

            CompanyResponseDTO response = companyService.getCompanyById(company.getId());

            assertThat(response.id()).isEqualTo(company.getId());
            verify(companyRepository, never()).existsByIdAndUsers_Id(any(), any());
        }

        @Test
        @DisplayName("should allow a member to view their own company")
        void shouldAllowMemberToViewOwnCompany() {
            User manager = buildUser(UserRole.MANAGER);
            Company company = buildCompany();

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(companyRepository.existsByIdAndUsers_Id(company.getId(), manager.getId())).thenReturn(true);

            CompanyResponseDTO response = companyService.getCompanyById(company.getId());

            assertThat(response.id()).isEqualTo(company.getId());
        }

        @Test
        @DisplayName("should deny a non-member from viewing the company")
        void shouldDenyNonMemberFromViewingCompany() {
            User manager = buildUser(UserRole.MANAGER);
            Company company = buildCompany();

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(companyRepository.existsByIdAndUsers_Id(company.getId(), manager.getId())).thenReturn(false);

            assertForbidden(() -> companyService.getCompanyById(company.getId()));
        }

        @Test
        @DisplayName("should throw 404 when the company does not exist")
        void shouldThrowNotFoundWhenCompanyDoesNotExist() {
            User admin = buildUser(UserRole.ADMIN);
            UUID id = UUID.randomUUID();

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.findById(id)).thenReturn(Optional.empty());

            assertNotFound(() -> companyService.getCompanyById(id), "COMPANY_NOT_FOUND");
        }
    }

    @Nested
    @DisplayName("getCompanies")
    class GetCompanies {

        private final CompanyFilter noFilter = new CompanyFilter(null, null, null);

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("should query the repository with an unrestricted specification for an ADMIN")
        void shouldReturnUnrestrictedResultsForAdmin() {
            User admin = buildUser(UserRole.ADMIN);
            Pageable pageable = PageRequest.of(0, 20);
            Page<Company> page = new PageImpl<>(List.of(buildCompany(), buildCompany()), pageable, 2);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);

            Page<CompanyResponseDTO> result = companyService.getCompanies(noFilter, pageable);

            assertThat(result.getTotalElements()).isEqualTo(2);

            ArgumentCaptor<Specification<Company>> captor = ArgumentCaptor.forClass(Specification.class);
            verify(companyRepository).findAll(captor.capture(), eq(pageable));

            Root<Company> root = mock(Root.class);
            CriteriaQuery<?> query = mock(CriteriaQuery.class);
            CriteriaBuilder builder = mock(CriteriaBuilder.class);

            captor.getValue().toPredicate(root, query, builder);

            verify(root, never()).join(anyString());
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("should scope the specification to companies the actor belongs to when not ADMIN")
        void shouldScopeSpecificationForNonAdmin() {
            User manager = buildUser(UserRole.MANAGER);
            Pageable pageable = PageRequest.of(0, 20);
            Page<Company> page = new PageImpl<>(List.of(), pageable, 0);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(companyRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);

            companyService.getCompanies(noFilter, pageable);

            ArgumentCaptor<Specification<Company>> captor = ArgumentCaptor.forClass(Specification.class);
            verify(companyRepository).findAll(captor.capture(), eq(pageable));

            Root<Company> root = mock(Root.class);
            CriteriaQuery<?> query = mock(CriteriaQuery.class);
            CriteriaBuilder builder = mock(CriteriaBuilder.class);
            Join<Company, User> join = mock(Join.class);
            Path<UUID> idPath = mock(Path.class);
            Predicate predicate = mock(Predicate.class);

            when(root.<Company, User>join("users")).thenReturn(join);
            when(join.<UUID>get("id")).thenReturn(idPath);
            when(builder.equal(idPath, manager.getId())).thenReturn(predicate);

            captor.getValue().toPredicate(root, query, builder);

            verify(root).join("users");
            verify(builder).equal(idPath, manager.getId());
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("should return an empty page without throwing when a non-admin has no associated companies")
        void shouldReturnEmptyPageForNonAdminWithNoCompanies() {
            User user = buildUser(UserRole.USER);
            Pageable pageable = PageRequest.of(0, 20);
            Page<Company> emptyPage = new PageImpl<>(List.of(), pageable, 0);

            when(securityContextHelper.getCurrentUser()).thenReturn(user);
            when(companyRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(emptyPage);

            Page<CompanyResponseDTO> result = companyService.getCompanies(noFilter, pageable);

            assertThat(result.getContent()).isEmpty();
            assertThat(result.getTotalElements()).isZero();
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("should forward the given Pageable unchanged to the repository")
        void shouldForwardPageableUnchangedToRepository() {
            User admin = buildUser(UserRole.ADMIN);
            Pageable pageable = PageRequest.of(2, 5);
            Page<Company> page = new PageImpl<>(List.of(), pageable, 0);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);

            companyService.getCompanies(noFilter, pageable);

            verify(companyRepository).findAll(any(Specification.class), eq(pageable));
        }
    }

    @Nested
    @DisplayName("updateCompany")
    class UpdateCompany {

        @Test
        @DisplayName("should allow an ADMIN to update any company")
        void shouldAllowAdminToUpdateAnyCompany() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            UpdateCompanyRequestDTO dto = new UpdateCompanyRequestDTO("New Name", "https://new.example.com/pic.png",
                    false);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(companyRepository.save(company)).thenReturn(company);

            CompanyResponseDTO response = companyService.updateCompany(company.getId(), dto);

            assertThat(response.name()).isEqualTo("New Name");
            assertThat(response.slug()).isEqualTo("new-name");
            assertThat(response.imageUrl()).isEqualTo("https://new.example.com/pic.png");
            assertThat(response.active()).isFalse();
        }

        @Test
        @DisplayName("should allow a member MANAGER to update their own company")
        void shouldAllowMemberManagerToUpdateOwnCompany() {
            User manager = buildUser(UserRole.MANAGER);
            Company company = buildCompany();
            UpdateCompanyRequestDTO dto = new UpdateCompanyRequestDTO("New Name", null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(companyRepository.existsByIdAndUsers_Id(company.getId(), manager.getId())).thenReturn(true);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(companyRepository.save(company)).thenReturn(company);

            CompanyResponseDTO response = companyService.updateCompany(company.getId(), dto);

            assertThat(response.name()).isEqualTo("New Name");
        }

        @Test
        @DisplayName("should update only the provided fields and keep the rest unchanged")
        void shouldPartiallyUpdateOnlyProvidedFields() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            String originalImageUrl = company.getImageUrl();
            Boolean originalActive = company.getActive();
            UpdateCompanyRequestDTO dto = new UpdateCompanyRequestDTO("Updated Name", null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(companyRepository.save(company)).thenReturn(company);

            CompanyResponseDTO response = companyService.updateCompany(company.getId(), dto);

            assertThat(response.name()).isEqualTo("Updated Name");
            assertThat(response.imageUrl()).isEqualTo(originalImageUrl);
            assertThat(response.active()).isEqualTo(originalActive);
        }

        @Test
        @DisplayName("should save the company unchanged when all requested fields are null (no-op update)")
        void shouldPerformNoOpUpdateWhenAllFieldsAreNull() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            String originalName = company.getName();
            String originalSlug = company.getSlug();
            UpdateCompanyRequestDTO dto = new UpdateCompanyRequestDTO(null, null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(companyRepository.save(company)).thenReturn(company);

            CompanyResponseDTO response = companyService.updateCompany(company.getId(), dto);

            assertThat(response.name()).isEqualTo(originalName);
            assertThat(response.slug()).isEqualTo(originalSlug);
            verify(companyRepository).save(company);
        }

        @Test
        @DisplayName("should deny a USER from updating a company and never fetch it")
        void shouldDenyUserFromUpdatingCompanyAndNeverFetchIt() {
            User user = buildUser(UserRole.USER);
            UUID companyId = UUID.randomUUID();
            UpdateCompanyRequestDTO dto = new UpdateCompanyRequestDTO("New Name", null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(user);

            assertForbidden(() -> companyService.updateCompany(companyId, dto));

            verify(companyRepository, never()).findById(any());
            verify(companyRepository, never()).save(any());
        }

        @Test
        @DisplayName("should deny a non-member MANAGER — id existence is irrelevant, company is never fetched")
        void shouldDenyNonMemberManagerRegardlessOfWhetherCompanyExists() {
            User manager = buildUser(UserRole.MANAGER);
            UUID companyId = UUID.randomUUID();
            UpdateCompanyRequestDTO dto = new UpdateCompanyRequestDTO("New Name", null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(companyRepository.existsByIdAndUsers_Id(companyId, manager.getId())).thenReturn(false);

            assertForbidden(() -> companyService.updateCompany(companyId, dto));

            verify(companyRepository, never()).findById(any());
            verify(companyRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw 404 when an ADMIN updates a non-existent company")
        void shouldThrowNotFoundWhenAdminUpdatesNonExistentCompany() {
            User admin = buildUser(UserRole.ADMIN);
            UUID nonExistentId = UUID.randomUUID();
            UpdateCompanyRequestDTO dto = new UpdateCompanyRequestDTO("New Name", null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.findById(nonExistentId)).thenReturn(Optional.empty());

            assertNotFound(() -> companyService.updateCompany(nonExistentId, dto), "COMPANY_NOT_FOUND");

            verify(companyRepository, never()).save(any());
        }

        @Test
        @DisplayName("should exclude the company's own id when checking slug uniqueness on rename")
        void shouldExcludeOwnIdWhenCheckingSlugUniquenessOnRename() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            UpdateCompanyRequestDTO dto = new UpdateCompanyRequestDTO("Beta", null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(companyRepository.existsBySlugAndIdNot("beta", company.getId())).thenReturn(false);
            when(companyRepository.save(company)).thenReturn(company);

            CompanyResponseDTO response = companyService.updateCompany(company.getId(), dto);

            assertThat(response.slug()).isEqualTo("beta");
            verify(companyRepository, never()).existsBySlug(any());
        }
    }

    @Nested
    @DisplayName("deleteCompany")
    class DeleteCompany {

        @Test
        @DisplayName("should allow an ADMIN to delete an existing company")
        void shouldAllowAdminToDeleteExistingCompany() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));

            companyService.deleteCompany(company.getId());

            verify(companyRepository).delete(company);
        }

        @Test
        @DisplayName("should deny a non-ADMIN — id existence is irrelevant, company is never fetched")
        void shouldDenyNonAdminFromDeletingCompanyRegardlessOfExistence() {
            User manager = buildUser(UserRole.MANAGER);
            UUID randomId = UUID.randomUUID();

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);

            assertForbidden(() -> companyService.deleteCompany(randomId));

            verify(companyRepository, never()).findById(any());
            verify(companyRepository, never()).delete(any(Company.class));
        }

        @Test
        @DisplayName("should throw 404 when an ADMIN deletes a non-existent company")
        void shouldThrowNotFoundWhenAdminDeletesNonExistentCompany() {
            User admin = buildUser(UserRole.ADMIN);
            UUID nonExistentId = UUID.randomUUID();

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.findById(nonExistentId)).thenReturn(Optional.empty());

            assertNotFound(() -> companyService.deleteCompany(nonExistentId), "COMPANY_NOT_FOUND");

            verify(companyRepository, never()).delete(any(Company.class));
        }
    }

    @Nested
    @DisplayName("getCompanyUsers")
    class GetCompanyUsers {

        @Test
        @DisplayName("should allow an ADMIN to list users of any company")
        void shouldAllowAdminToListUsersOfAnyCompany() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            Pageable pageable = PageRequest.of(0, 20);
            Page<User> page = new PageImpl<>(List.of(buildUser(UserRole.USER)), pageable, 1);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(userRepository.findByCompanies_Id(company.getId(), pageable)).thenReturn(page);

            Page<UserResponseDTO> result = companyService.getCompanyUsers(company.getId(), pageable);

            assertThat(result.getTotalElements()).isEqualTo(1);
        }

        @Test
        @DisplayName("should allow a member to list users of their own company")
        void shouldAllowMemberToListUsersOfOwnCompany() {
            User manager = buildUser(UserRole.MANAGER);
            Company company = buildCompany();
            Pageable pageable = PageRequest.of(0, 20);
            Page<User> page = new PageImpl<>(List.of(), pageable, 0);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(companyRepository.existsByIdAndUsers_Id(company.getId(), manager.getId())).thenReturn(true);
            when(userRepository.findByCompanies_Id(company.getId(), pageable)).thenReturn(page);

            Page<UserResponseDTO> result = companyService.getCompanyUsers(company.getId(), pageable);

            assertThat(result.getContent()).isEmpty();
        }

        @Test
        @DisplayName("should deny a non-member from listing the company's users")
        void shouldDenyNonMemberFromListingCompanyUsers() {
            User manager = buildUser(UserRole.MANAGER);
            Company company = buildCompany();
            Pageable pageable = PageRequest.of(0, 20);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(companyRepository.existsByIdAndUsers_Id(company.getId(), manager.getId())).thenReturn(false);

            assertForbidden(() -> companyService.getCompanyUsers(company.getId(), pageable));

            verify(userRepository, never()).findByCompanies_Id(any(), any());
        }

        @Test
        @DisplayName("should throw 404 when the company does not exist")
        void shouldThrowNotFoundWhenCompanyDoesNotExist() {
            User admin = buildUser(UserRole.ADMIN);
            UUID id = UUID.randomUUID();
            Pageable pageable = PageRequest.of(0, 20);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.findById(id)).thenReturn(Optional.empty());

            assertNotFound(() -> companyService.getCompanyUsers(id, pageable), "COMPANY_NOT_FOUND");
        }
    }

    @Nested
    @DisplayName("getCompanyMedicines")
    class GetCompanyMedicines {

        private final MedicineFilter noFilter = new MedicineFilter(null, null);

        private Medicine buildMedicine(Company company) {
            return Medicine.builder()
                    .id(UUID.randomUUID())
                    .name("Dipirona")
                    .eanCode("7891234567895")
                    .imageUrl("https://example.com/dipirona.png")
                    .company(company)
                    .build();
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("should allow an ADMIN to list medicines of any company")
        void shouldAllowAdminToListMedicinesOfAnyCompany() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            Pageable pageable = PageRequest.of(0, 20);
            Page<Medicine> page = new PageImpl<>(List.of(buildMedicine(company)), pageable, 1);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(medicineRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);

            Page<MedicineResponseDTO> result = companyService.getCompanyMedicines(company.getId(), noFilter, pageable);

            assertThat(result.getTotalElements()).isEqualTo(1);
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("should allow a member to list medicines of their own company")
        void shouldAllowMemberToListMedicinesOfOwnCompany() {
            User manager = buildUser(UserRole.MANAGER);
            Company company = buildCompany();
            Pageable pageable = PageRequest.of(0, 20);
            Page<Medicine> page = new PageImpl<>(List.of(), pageable, 0);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(companyRepository.existsByIdAndUsers_Id(company.getId(), manager.getId())).thenReturn(true);
            when(medicineRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);

            Page<MedicineResponseDTO> result = companyService.getCompanyMedicines(company.getId(), noFilter, pageable);

            assertThat(result.getContent()).isEmpty();
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("should deny a non-member from listing the company's medicines")
        void shouldDenyNonMemberFromListingCompanyMedicines() {
            User manager = buildUser(UserRole.MANAGER);
            Company company = buildCompany();
            Pageable pageable = PageRequest.of(0, 20);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(companyRepository.existsByIdAndUsers_Id(company.getId(), manager.getId())).thenReturn(false);

            assertForbidden(() -> companyService.getCompanyMedicines(company.getId(), noFilter, pageable));

            verify(medicineRepository, never()).findAll(any(Specification.class), any(Pageable.class));
        }

        @Test
        @DisplayName("should throw 404 when the company does not exist")
        void shouldThrowNotFoundWhenCompanyDoesNotExist() {
            User admin = buildUser(UserRole.ADMIN);
            UUID id = UUID.randomUUID();
            Pageable pageable = PageRequest.of(0, 20);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.findById(id)).thenReturn(Optional.empty());

            assertNotFound(() -> companyService.getCompanyMedicines(id, noFilter, pageable), "COMPANY_NOT_FOUND");
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("should filter by name and eanCode when provided")
        void shouldFilterByNameAndEanCodeWhenProvided() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            Pageable pageable = PageRequest.of(0, 20);
            Page<Medicine> page = new PageImpl<>(List.of(buildMedicine(company)), pageable, 1);
            MedicineFilter filter = new MedicineFilter("Dipirona", "7891234567895");

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(medicineRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);

            Page<MedicineResponseDTO> result = companyService.getCompanyMedicines(company.getId(), filter, pageable);

            assertThat(result.getTotalElements()).isEqualTo(1);
            verify(medicineRepository).findAll(any(Specification.class), eq(pageable));
        }
    }

    @Nested
    @DisplayName("associateUser")
    class AssociateUser {

        @Test
        @DisplayName("should allow an ADMIN to associate a USER to any company")
        void shouldAllowAdminToAssociateUserToAnyCompany() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            User targetUser = buildUser(UserRole.USER);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(userRepository.findById(targetUser.getId())).thenReturn(Optional.of(targetUser));

            companyService.associateUser(company.getId(), targetUser.getId());

            assertThat(targetUser.getCompanies()).contains(company);
            verify(userRepository).save(targetUser);
        }

        @Test
        @DisplayName("should allow a member MANAGER to associate a USER to their own company")
        void shouldAllowMemberManagerToAssociateUserToOwnCompany() {
            User manager = buildUser(UserRole.MANAGER);
            Company company = buildCompany();
            User targetUser = buildUser(UserRole.USER);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(userRepository.findById(targetUser.getId())).thenReturn(Optional.of(targetUser));
            when(companyRepository.existsByIdAndUsers_Id(company.getId(), manager.getId())).thenReturn(true);

            companyService.associateUser(company.getId(), targetUser.getId());

            assertThat(targetUser.getCompanies()).contains(company);
        }

        @Test
        @DisplayName("should deny a MANAGER from associating another MANAGER, regardless of membership")
        void shouldDenyManagerAssociatingAnotherManager() {
            User manager = buildUser(UserRole.MANAGER);
            Company company = buildCompany();
            User targetManager = buildUser(UserRole.MANAGER);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(userRepository.findById(targetManager.getId())).thenReturn(Optional.of(targetManager));

            assertForbidden(() -> companyService.associateUser(company.getId(), targetManager.getId()));

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("should deny a non-member MANAGER from associating a USER")
        void shouldDenyNonMemberManagerFromAssociatingUser() {
            User manager = buildUser(UserRole.MANAGER);
            Company company = buildCompany();
            User targetUser = buildUser(UserRole.USER);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(userRepository.findById(targetUser.getId())).thenReturn(Optional.of(targetUser));
            when(companyRepository.existsByIdAndUsers_Id(company.getId(), manager.getId())).thenReturn(false);

            assertForbidden(() -> companyService.associateUser(company.getId(), targetUser.getId()));

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("should deny a USER from associating anyone")
        void shouldDenyUserFromAssociatingAnyone() {
            User user = buildUser(UserRole.USER);
            Company company = buildCompany();
            User targetUser = buildUser(UserRole.USER);

            when(securityContextHelper.getCurrentUser()).thenReturn(user);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(userRepository.findById(targetUser.getId())).thenReturn(Optional.of(targetUser));

            assertForbidden(() -> companyService.associateUser(company.getId(), targetUser.getId()));

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw 404 when the company does not exist")
        void shouldThrowNotFoundWhenCompanyDoesNotExist() {
            User admin = buildUser(UserRole.ADMIN);
            UUID companyId = UUID.randomUUID();
            UUID userId = UUID.randomUUID();

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.findById(companyId)).thenReturn(Optional.empty());

            assertNotFound(() -> companyService.associateUser(companyId, userId), "COMPANY_NOT_FOUND");

            verify(userRepository, never()).findById(any());
        }

        @Test
        @DisplayName("should throw 404 when the target user does not exist")
        void shouldThrowNotFoundWhenTargetUserDoesNotExist() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            UUID userId = UUID.randomUUID();

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            assertNotFound(() -> companyService.associateUser(company.getId(), userId), "USER_NOT_FOUND");
        }

        @Test
        @DisplayName("should not fail when associating a user who is already a member (idempotent)")
        void shouldNotFailWhenAssociatingAlreadyMemberUser() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            User targetUser = buildUser(UserRole.USER);
            targetUser.assignToCompany(company);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(userRepository.findById(targetUser.getId())).thenReturn(Optional.of(targetUser));

            companyService.associateUser(company.getId(), targetUser.getId());

            assertThat(targetUser.getCompanies()).containsExactly(company);
            verify(userRepository).save(targetUser);
        }
    }

    @Nested
    @DisplayName("removeUser")
    class RemoveUser {

        @Test
        @DisplayName("should allow an ADMIN to remove a USER from any company")
        void shouldAllowAdminToRemoveUserFromAnyCompany() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            User targetUser = buildUser(UserRole.USER);
            targetUser.assignToCompany(company);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(userRepository.findById(targetUser.getId())).thenReturn(Optional.of(targetUser));

            companyService.removeUser(company.getId(), targetUser.getId());

            assertThat(targetUser.getCompanies()).doesNotContain(company);
            verify(userRepository).save(targetUser);
        }

        @Test
        @DisplayName("should allow a member MANAGER to remove a USER from their own company")
        void shouldAllowMemberManagerToRemoveUserFromOwnCompany() {
            User manager = buildUser(UserRole.MANAGER);
            Company company = buildCompany();
            User targetUser = buildUser(UserRole.USER);
            targetUser.assignToCompany(company);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(userRepository.findById(targetUser.getId())).thenReturn(Optional.of(targetUser));
            when(companyRepository.existsByIdAndUsers_Id(company.getId(), manager.getId())).thenReturn(true);

            companyService.removeUser(company.getId(), targetUser.getId());

            assertThat(targetUser.getCompanies()).doesNotContain(company);
        }

        @Test
        @DisplayName("should deny a MANAGER from removing another MANAGER, even themselves")
        void shouldDenyManagerRemovingAnotherManagerIncludingSelf() {
            User manager = buildUser(UserRole.MANAGER);
            Company company = buildCompany();

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(userRepository.findById(manager.getId())).thenReturn(Optional.of(manager));

            assertForbidden(() -> companyService.removeUser(company.getId(), manager.getId()));

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("should deny an ADMIN from removing another ADMIN, even themselves")
        void shouldDenyAdminRemovingAnotherAdminIncludingSelf() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(userRepository.findById(admin.getId())).thenReturn(Optional.of(admin));

            assertForbidden(() -> companyService.removeUser(company.getId(), admin.getId()));

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("should deny a non-member MANAGER from removing a USER")
        void shouldDenyNonMemberManagerFromRemovingUser() {
            User manager = buildUser(UserRole.MANAGER);
            Company company = buildCompany();
            User targetUser = buildUser(UserRole.USER);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(userRepository.findById(targetUser.getId())).thenReturn(Optional.of(targetUser));
            when(companyRepository.existsByIdAndUsers_Id(company.getId(), manager.getId())).thenReturn(false);

            assertForbidden(() -> companyService.removeUser(company.getId(), targetUser.getId()));

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw 404 when the company does not exist")
        void shouldThrowNotFoundWhenCompanyDoesNotExist() {
            User admin = buildUser(UserRole.ADMIN);
            UUID companyId = UUID.randomUUID();
            UUID userId = UUID.randomUUID();

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.findById(companyId)).thenReturn(Optional.empty());

            assertNotFound(() -> companyService.removeUser(companyId, userId), "COMPANY_NOT_FOUND");

            verify(userRepository, never()).findById(any());
        }

        @Test
        @DisplayName("should not fail when removing a user who is not currently a member (idempotent)")
        void shouldNotFailWhenRemovingNonMemberUser() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            User targetUser = buildUser(UserRole.USER);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
            when(userRepository.findById(targetUser.getId())).thenReturn(Optional.of(targetUser));

            companyService.removeUser(company.getId(), targetUser.getId());

            assertThat(targetUser.getCompanies()).doesNotContain(company);
            verify(userRepository).save(targetUser);
        }
    }
}
