package com.devluanpaiva.controle_de_remedios_test.unit.modules.users.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.assertj.core.api.ThrowableAssert.ThrowingCallable;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.devluanpaiva.controle_de_remedios.modules.users.dto.CreateUserRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.users.dto.UpdateUserRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.users.dto.UserResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.users.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.users.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.modules.users.mapper.UserMapper;
import com.devluanpaiva.controle_de_remedios.modules.users.repository.UserRepository;
import com.devluanpaiva.controle_de_remedios.modules.users.service.impl.UserServiceImpl;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserServiceImpl")
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private SecurityContextHelper securityContextHelper;

    private UserServiceImpl userService;

    @BeforeEach
    void setUp() {
        userService = new UserServiceImpl(userRepository, new UserMapper(), passwordEncoder, securityContextHelper);
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

    private void assertNotFound(ThrowingCallable callable) {
        assertThatThrownBy(callable)
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> {
                    BusinessException businessException = (BusinessException) ex;
                    assertThat(businessException.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
                    assertThat(businessException.getCode()).isEqualTo("USER_NOT_FOUND");
                });
    }

    @Nested
    @DisplayName("createUser")
    class CreateUser {

        private final CreateUserRequestDTO dto = new CreateUserRequestDTO(
                "Jane Doe", "jane@example.com", "raw-password", "12345678901", null, UserRole.USER);

        @Test
        @DisplayName("should save the user with an encoded password when email and cpf are unique")
        void shouldSaveUserWithEncodedPasswordWhenEmailAndCpfAreUnique() {
            when(userRepository.existsByEmail(dto.email())).thenReturn(false);
            when(userRepository.existsByCpf(dto.cpf())).thenReturn(false);
            when(passwordEncoder.encode(dto.password())).thenReturn("hashed-password");
            when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

            UserResponseDTO response = userService.createUser(dto);

            assertThat(response.name()).isEqualTo(dto.name());
            assertThat(response.email()).isEqualTo(dto.email());
            assertThat(response.cpf()).isEqualTo(dto.cpf());

            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());
            assertThat(userCaptor.getValue().getPassword()).isEqualTo("hashed-password");
        }

        @ParameterizedTest(name = "should force role to USER even when the request specifies {0}")
        @EnumSource(value = UserRole.class, names = "USER", mode = EnumSource.Mode.EXCLUDE)
        @DisplayName("should force role to USER regardless of the role requested")
        void shouldForceRoleToUserRegardlessOfRequestedRole(UserRole requestedRole) {
            CreateUserRequestDTO privilegedDto = new CreateUserRequestDTO(
                    "Jane Doe", "jane@example.com", "raw-password", "12345678901", null, requestedRole);

            when(userRepository.existsByEmail(privilegedDto.email())).thenReturn(false);
            when(userRepository.existsByCpf(privilegedDto.cpf())).thenReturn(false);
            when(passwordEncoder.encode(privilegedDto.password())).thenReturn("hashed-password");
            when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

            UserResponseDTO response = userService.createUser(privilegedDto);

            assertThat(response.role()).isEqualTo(UserRole.USER);
        }

        @Test
        @DisplayName("should throw 409 when the email already exists")
        void shouldThrowConflictWhenEmailAlreadyExists() {
            when(userRepository.existsByEmail(dto.email())).thenReturn(true);

            assertThatThrownBy(() -> userService.createUser(dto))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.CONFLICT);
                        assertThat(businessException.getCode()).isEqualTo("EMAIL_ALREADY_EXISTS");
                    });

            verify(userRepository, never()).existsByCpf(any());
            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw 409 when the cpf already exists")
        void shouldThrowConflictWhenCpfAlreadyExists() {
            when(userRepository.existsByEmail(dto.email())).thenReturn(false);
            when(userRepository.existsByCpf(dto.cpf())).thenReturn(true);

            assertThatThrownBy(() -> userService.createUser(dto))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.CONFLICT);
                        assertThat(businessException.getCode()).isEqualTo("CPF_ALREADY_EXISTS");
                    });

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw the email conflict before checking the cpf when both already exist")
        void shouldThrowEmailConflictBeforeCheckingCpfWhenBothExist() {
            when(userRepository.existsByEmail(dto.email())).thenReturn(true);
            lenient().when(userRepository.existsByCpf(dto.cpf())).thenReturn(true);

            assertThatThrownBy(() -> userService.createUser(dto))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> assertThat(((BusinessException) ex).getCode()).isEqualTo("EMAIL_ALREADY_EXISTS"));

            verify(userRepository, never()).existsByCpf(any());
        }
    }

    @Nested
    @DisplayName("getUserById")
    class GetUserById {

        @Test
        @DisplayName("should allow an ADMIN to access a MANAGER")
        void shouldAllowAdminToAccessManager() {
            User admin = buildUser(UserRole.ADMIN);
            User manager = buildUser(UserRole.MANAGER);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(userRepository.findById(manager.getId())).thenReturn(Optional.of(manager));

            UserResponseDTO response = userService.getUserById(manager.getId());

            assertThat(response.id()).isEqualTo(manager.getId());
        }

        @Test
        @DisplayName("should allow an ADMIN to access a USER")
        void shouldAllowAdminToAccessUser() {
            User admin = buildUser(UserRole.ADMIN);
            User regularUser = buildUser(UserRole.USER);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(userRepository.findById(regularUser.getId())).thenReturn(Optional.of(regularUser));

            UserResponseDTO response = userService.getUserById(regularUser.getId());

            assertThat(response.id()).isEqualTo(regularUser.getId());
        }

        @Test
        @DisplayName("should allow a MANAGER to access a USER")
        void shouldAllowManagerToAccessUser() {
            User manager = buildUser(UserRole.MANAGER);
            User regularUser = buildUser(UserRole.USER);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(userRepository.findById(regularUser.getId())).thenReturn(Optional.of(regularUser));

            UserResponseDTO response = userService.getUserById(regularUser.getId());

            assertThat(response.id()).isEqualTo(regularUser.getId());
        }

        @ParameterizedTest(name = "should allow a {0} to access itself")
        @EnumSource(UserRole.class)
        @DisplayName("should allow any role to access itself")
        void shouldAllowAnyRoleToAccessSelf(UserRole role) {
            User self = buildUser(role);

            when(securityContextHelper.getCurrentUser()).thenReturn(self);
            when(userRepository.findById(self.getId())).thenReturn(Optional.of(self));

            UserResponseDTO response = userService.getUserById(self.getId());

            assertThat(response.id()).isEqualTo(self.getId());
        }

        @Test
        @DisplayName("should deny a USER accessing another USER")
        void shouldDenyUserAccessingAnotherUser() {
            User actor = buildUser(UserRole.USER);
            User target = buildUser(UserRole.USER);

            when(securityContextHelper.getCurrentUser()).thenReturn(actor);
            when(userRepository.findById(target.getId())).thenReturn(Optional.of(target));

            assertForbidden(() -> userService.getUserById(target.getId()));
        }

        @Test
        @DisplayName("should deny a MANAGER accessing an ADMIN")
        void shouldDenyManagerAccessingAdmin() {
            User manager = buildUser(UserRole.MANAGER);
            User admin = buildUser(UserRole.ADMIN);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(userRepository.findById(admin.getId())).thenReturn(Optional.of(admin));

            assertForbidden(() -> userService.getUserById(admin.getId()));
        }

        @Test
        @DisplayName("should deny an ADMIN accessing another ADMIN")
        void shouldDenyAdminAccessingAnotherAdmin() {
            User admin = buildUser(UserRole.ADMIN);
            User otherAdmin = buildUser(UserRole.ADMIN);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(userRepository.findById(otherAdmin.getId())).thenReturn(Optional.of(otherAdmin));

            assertForbidden(() -> userService.getUserById(otherAdmin.getId()));
        }

        @Test
        @DisplayName("should throw 404 before checking permission when id does not exist")
        void shouldThrowNotFoundBeforeCheckingPermission() {
            UUID id = UUID.randomUUID();
            when(userRepository.findById(id)).thenReturn(Optional.empty());

            assertNotFound(() -> userService.getUserById(id));

            verify(securityContextHelper, never()).getCurrentUser();
        }
    }

    @Nested
    @DisplayName("updateUser")
    class UpdateUser {

        @Test
        @DisplayName("should allow an ADMIN to update a MANAGER")
        void shouldAllowAdminToUpdateManager() {
            User admin = buildUser(UserRole.ADMIN);
            User manager = buildUser(UserRole.MANAGER);
            UpdateUserRequestDTO dto = new UpdateUserRequestDTO("New Name", null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(userRepository.findById(manager.getId())).thenReturn(Optional.of(manager));
            when(userRepository.save(manager)).thenReturn(manager);

            UserResponseDTO response = userService.updateUser(manager.getId(), dto);

            assertThat(response.name()).isEqualTo("New Name");
        }

        @Test
        @DisplayName("should allow a MANAGER to update a USER")
        void shouldAllowManagerToUpdateUser() {
            User manager = buildUser(UserRole.MANAGER);
            User regularUser = buildUser(UserRole.USER);
            UpdateUserRequestDTO dto = new UpdateUserRequestDTO("New Name", null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(userRepository.findById(regularUser.getId())).thenReturn(Optional.of(regularUser));
            when(userRepository.save(regularUser)).thenReturn(regularUser);

            UserResponseDTO response = userService.updateUser(regularUser.getId(), dto);

            assertThat(response.name()).isEqualTo("New Name");
        }

        @Test
        @DisplayName("should allow any role to update itself even when it could not manage its own role")
        void shouldAllowSelfUpdateEvenWhenRoleCannotManageItself() {
            User admin = buildUser(UserRole.ADMIN);
            UpdateUserRequestDTO dto = new UpdateUserRequestDTO("Self Update", null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(userRepository.findById(admin.getId())).thenReturn(Optional.of(admin));
            when(userRepository.save(admin)).thenReturn(admin);

            UserResponseDTO response = userService.updateUser(admin.getId(), dto);

            assertThat(response.name()).isEqualTo("Self Update");
        }

        @Test
        @DisplayName("should deny a USER updating another USER")
        void shouldDenyUserUpdatingAnotherUser() {
            User actor = buildUser(UserRole.USER);
            User target = buildUser(UserRole.USER);
            UpdateUserRequestDTO dto = new UpdateUserRequestDTO("New Name", null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(actor);
            when(userRepository.findById(target.getId())).thenReturn(Optional.of(target));

            assertForbidden(() -> userService.updateUser(target.getId(), dto));

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("should deny a MANAGER updating an ADMIN")
        void shouldDenyManagerUpdatingAdmin() {
            User manager = buildUser(UserRole.MANAGER);
            User admin = buildUser(UserRole.ADMIN);
            UpdateUserRequestDTO dto = new UpdateUserRequestDTO("New Name", null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(userRepository.findById(admin.getId())).thenReturn(Optional.of(admin));

            assertForbidden(() -> userService.updateUser(admin.getId(), dto));

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("should deny an ADMIN updating another ADMIN")
        void shouldDenyAdminUpdatingAnotherAdmin() {
            User admin = buildUser(UserRole.ADMIN);
            User otherAdmin = buildUser(UserRole.ADMIN);
            UpdateUserRequestDTO dto = new UpdateUserRequestDTO("New Name", null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(userRepository.findById(otherAdmin.getId())).thenReturn(Optional.of(otherAdmin));

            assertForbidden(() -> userService.updateUser(otherAdmin.getId(), dto));

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw 404 before checking permission when id does not exist")
        void shouldThrowNotFoundBeforeCheckingPermission() {
            UUID id = UUID.randomUUID();
            UpdateUserRequestDTO dto = new UpdateUserRequestDTO("New Name", null, null);
            when(userRepository.findById(id)).thenReturn(Optional.empty());

            assertNotFound(() -> userService.updateUser(id, dto));

            verify(securityContextHelper, never()).getCurrentUser();
        }

        @Test
        @DisplayName("should update only the provided fields and keep the rest unchanged")
        void shouldPartiallyUpdateOnlyProvidedFields() {
            User admin = buildUser(UserRole.ADMIN);
            User target = buildUser(UserRole.USER);
            String originalCpf = target.getCpf();
            String originalImageUrl = target.getImageUrl();
            UpdateUserRequestDTO dto = new UpdateUserRequestDTO("Updated Name", null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(userRepository.findById(target.getId())).thenReturn(Optional.of(target));
            when(userRepository.save(target)).thenReturn(target);

            UserResponseDTO response = userService.updateUser(target.getId(), dto);

            assertThat(response.name()).isEqualTo("Updated Name");
            assertThat(response.cpf()).isEqualTo(originalCpf);
            assertThat(response.imageUrl()).isEqualTo(originalImageUrl);
        }

        @Test
        @DisplayName("should update all fields when all are provided")
        void shouldUpdateAllFieldsWhenAllAreProvided() {
            User admin = buildUser(UserRole.ADMIN);
            User target = buildUser(UserRole.USER);
            UpdateUserRequestDTO dto = new UpdateUserRequestDTO(
                    "New Name", "98765432100", "https://new.example.com/pic.png");

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(userRepository.findById(target.getId())).thenReturn(Optional.of(target));
            when(userRepository.save(target)).thenReturn(target);

            UserResponseDTO response = userService.updateUser(target.getId(), dto);

            assertThat(response.name()).isEqualTo("New Name");
            assertThat(response.cpf()).isEqualTo("98765432100");
            assertThat(response.imageUrl()).isEqualTo("https://new.example.com/pic.png");
        }

        @Test
        @DisplayName("should save the user unchanged when all requested fields are null (no-op update)")
        void shouldPerformNoOpUpdateWhenAllFieldsAreNull() {
            User admin = buildUser(UserRole.ADMIN);
            User target = buildUser(UserRole.USER);
            String originalName = target.getName();
            String originalCpf = target.getCpf();
            String originalImageUrl = target.getImageUrl();
            UpdateUserRequestDTO dto = new UpdateUserRequestDTO(null, null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(userRepository.findById(target.getId())).thenReturn(Optional.of(target));
            when(userRepository.save(target)).thenReturn(target);

            UserResponseDTO response = userService.updateUser(target.getId(), dto);

            assertThat(response.name()).isEqualTo(originalName);
            assertThat(response.cpf()).isEqualTo(originalCpf);
            assertThat(response.imageUrl()).isEqualTo(originalImageUrl);
            verify(userRepository).save(target);
        }
    }

    @Nested
    @DisplayName("deleteUser")
    class DeleteUser {

        @Test
        @DisplayName("should allow an ADMIN to delete a MANAGER")
        void shouldAllowAdminToDeleteManager() {
            User admin = buildUser(UserRole.ADMIN);
            User manager = buildUser(UserRole.MANAGER);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(userRepository.findById(manager.getId())).thenReturn(Optional.of(manager));

            userService.deleteUser(manager.getId());

            verify(userRepository).delete(manager);
        }

        @Test
        @DisplayName("should allow a MANAGER to delete a USER")
        void shouldAllowManagerToDeleteUser() {
            User manager = buildUser(UserRole.MANAGER);
            User regularUser = buildUser(UserRole.USER);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(userRepository.findById(regularUser.getId())).thenReturn(Optional.of(regularUser));

            userService.deleteUser(regularUser.getId());

            verify(userRepository).delete(regularUser);
        }

        @Test
        @DisplayName("should allow an ADMIN to delete its own account")
        void shouldAllowAdminToDeleteOwnAccount() {
            User admin = buildUser(UserRole.ADMIN);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(userRepository.findById(admin.getId())).thenReturn(Optional.of(admin));

            userService.deleteUser(admin.getId());

            verify(userRepository).delete(admin);
        }

        @Test
        @DisplayName("should deny a USER deleting another USER")
        void shouldDenyUserDeletingAnotherUser() {
            User actor = buildUser(UserRole.USER);
            User target = buildUser(UserRole.USER);

            when(securityContextHelper.getCurrentUser()).thenReturn(actor);
            when(userRepository.findById(target.getId())).thenReturn(Optional.of(target));

            assertForbidden(() -> userService.deleteUser(target.getId()));

            verify(userRepository, never()).delete(any());
        }

        @Test
        @DisplayName("should deny a MANAGER deleting an ADMIN")
        void shouldDenyManagerDeletingAdmin() {
            User manager = buildUser(UserRole.MANAGER);
            User admin = buildUser(UserRole.ADMIN);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(userRepository.findById(admin.getId())).thenReturn(Optional.of(admin));

            assertForbidden(() -> userService.deleteUser(admin.getId()));

            verify(userRepository, never()).delete(any());
        }

        @Test
        @DisplayName("should deny an ADMIN deleting another ADMIN")
        void shouldDenyAdminDeletingAnotherAdmin() {
            User admin = buildUser(UserRole.ADMIN);
            User otherAdmin = buildUser(UserRole.ADMIN);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(userRepository.findById(otherAdmin.getId())).thenReturn(Optional.of(otherAdmin));

            assertForbidden(() -> userService.deleteUser(otherAdmin.getId()));

            verify(userRepository, never()).delete(any());
        }

        @Test
        @DisplayName("should throw 404 before checking permission when id does not exist")
        void shouldThrowNotFoundBeforeCheckingPermission() {
            UUID id = UUID.randomUUID();
            when(userRepository.findById(id)).thenReturn(Optional.empty());

            assertNotFound(() -> userService.deleteUser(id));

            verify(securityContextHelper, never()).getCurrentUser();
        }
    }

    @Nested
    @DisplayName("getAllUsers")
    class GetAllUsers {

        @Test
        @DisplayName("should query manageable roles MANAGER and USER when the actor is ADMIN")
        void shouldQueryManagerAndUserRolesForAdmin() {
            User admin = buildUser(UserRole.ADMIN);
            Pageable pageable = PageRequest.of(0, 20);
            Page<User> page = new PageImpl<>(
                    List.of(buildUser(UserRole.MANAGER), buildUser(UserRole.USER)), pageable, 2);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(userRepository.findByRoleIn(Set.of(UserRole.MANAGER, UserRole.USER), pageable)).thenReturn(page);

            Page<UserResponseDTO> result = userService.getAllUsers(pageable);

            assertThat(result.getTotalElements()).isEqualTo(2);
            verify(userRepository).findByRoleIn(Set.of(UserRole.MANAGER, UserRole.USER), pageable);
        }

        @Test
        @DisplayName("should query manageable role USER when the actor is MANAGER")
        void shouldQueryUserRoleForManager() {
            User manager = buildUser(UserRole.MANAGER);
            Pageable pageable = PageRequest.of(0, 20);
            Page<User> page = new PageImpl<>(List.of(buildUser(UserRole.USER)), pageable, 1);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(userRepository.findByRoleIn(Set.of(UserRole.USER), pageable)).thenReturn(page);

            Page<UserResponseDTO> result = userService.getAllUsers(pageable);

            assertThat(result.getTotalElements()).isEqualTo(1);
            verify(userRepository).findByRoleIn(Set.of(UserRole.USER), pageable);
        }

        @Test
        @DisplayName("should deny a USER from listing users and never query the repository")
        void shouldDenyUserFromListingUsers() {
            User regularUser = buildUser(UserRole.USER);
            Pageable pageable = PageRequest.of(0, 20);

            when(securityContextHelper.getCurrentUser()).thenReturn(regularUser);

            assertForbidden(() -> userService.getAllUsers(pageable));

            verify(userRepository, never()).findByRoleIn(any(), any());
        }

        @Test
        @DisplayName("should return an empty page without throwing when there are no matching users")
        void shouldReturnEmptyPageWhenNoUsersMatch() {
            User admin = buildUser(UserRole.ADMIN);
            Pageable pageable = PageRequest.of(0, 20);
            Page<User> emptyPage = new PageImpl<>(List.of(), pageable, 0);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(userRepository.findByRoleIn(Set.of(UserRole.MANAGER, UserRole.USER), pageable))
                    .thenReturn(emptyPage);

            Page<UserResponseDTO> result = userService.getAllUsers(pageable);

            assertThat(result.getContent()).isEmpty();
            assertThat(result.getTotalElements()).isZero();
        }

        @Test
        @DisplayName("should forward the given Pageable unchanged to the repository")
        void shouldForwardPageableUnchangedToRepository() {
            User admin = buildUser(UserRole.ADMIN);
            Pageable pageable = PageRequest.of(2, 5);
            Page<User> page = new PageImpl<>(List.of(), pageable, 0);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(userRepository.findByRoleIn(anySet(), eq(pageable))).thenReturn(page);

            userService.getAllUsers(pageable);

            verify(userRepository).findByRoleIn(anySet(), eq(pageable));
        }
    }

}
