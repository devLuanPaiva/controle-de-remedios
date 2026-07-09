package com.devluanpaiva.controle_de_remedios.modules.user.service.impl;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devluanpaiva.controle_de_remedios.modules.company.entity.Company;
import com.devluanpaiva.controle_de_remedios.modules.company.repository.CompanyRepository;
import com.devluanpaiva.controle_de_remedios.modules.user.dto.ChangePasswordRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.user.dto.CreateUserRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.user.dto.ResetPasswordRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.user.dto.UpdateUserRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.user.dto.UserResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.filter.UserFilter;
import com.devluanpaiva.controle_de_remedios.modules.user.filter.UserSpecification;
import com.devluanpaiva.controle_de_remedios.modules.user.mapper.UserMapper;
import com.devluanpaiva.controle_de_remedios.modules.user.repository.UserRepository;
import com.devluanpaiva.controle_de_remedios.modules.user.service.UserService;
import com.devluanpaiva.controle_de_remedios.security.AuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final SecurityContextHelper securityContextHelper;
    private final AuthorizationPolicy authorizationPolicy;

    @Override
    @Transactional
    public UserResponseDTO createUser(CreateUserRequestDTO dto) {
        User actor = securityContextHelper.getCurrentUser();

        authorizationPolicy.requireManageableRole(actor, dto.role());

        if (userRepository.existsByEmail(dto.email())) {
            throw new BusinessException(
                    HttpStatus.CONFLICT,
                    "E-mail já cadastrado",
                    "EMAIL_ALREADY_EXISTS",
                    "email",
                    "Já existe um usuário cadastrado com o e-mail '" + dto.email() + "'.");
        }

        if (userRepository.existsByCpf(dto.cpf())) {
            throw new BusinessException(
                    HttpStatus.CONFLICT,
                    "CPF já cadastrado",
                    "CPF_ALREADY_EXISTS",
                    "cpf",
                    "Já existe um usuário cadastrado com o CPF '" + dto.cpf() + "'.");
        }

        User user = User.builder()
                .name(dto.name())
                .email(dto.email())
                .role(dto.role())
                .cpf(dto.cpf())
                .imageUrl(dto.imageUrl())
                .password(passwordEncoder.encode(dto.password()))
                .build();

        if (dto.companyId() != null) {
            assertBelongsToCompany(actor, dto.companyId());
            user.assignToCompany(findCompanyOrThrow(dto.companyId()));
        }

        User savedUser = userRepository.save(user);

        return userMapper.toResponseDTO(savedUser);
    }

    @Override
    public UserResponseDTO getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND,
                        "Usuário não encontrado",
                        "USER_NOT_FOUND",
                        "id",
                        "Não foi possível encontrar um usuário com o ID '" + id + "'."));

        assertCanManage(securityContextHelper.getCurrentUser(), user);

        return userMapper.toResponseDTO(user);
    }

    @Override
    public Page<UserResponseDTO> getAllUsers(UserFilter filter, Pageable pageable) {
        User actor = securityContextHelper.getCurrentUser();
        var manageableRoles = actor.getRole().manageableRoles();

        authorizationPolicy.requireCondition(!manageableRoles.isEmpty());

        if (filter.role() != null) {
            authorizationPolicy.requireCondition(manageableRoles.contains(filter.role()));
        }

        if (filter.companyId() != null) {
            assertBelongsToCompany(actor, filter.companyId());
        }

        Specification<User> specification = UserSpecification.hasRoleIn(manageableRoles)
                .and(UserSpecification.hasRole(filter.role()))
                .and(UserSpecification.associatedWithCompany(filter.companyId()))
                .and(UserSpecification.hasName(filter.name()))
                .and(UserSpecification.hasEmail(filter.email()))
                .and(UserSpecification.hasCpf(filter.cpf()))
                .and(UserSpecification.isActive(filter.active()));

        return userRepository.findAll(specification, pageable)
                .map(userMapper::toResponseDTO);
    }

    @Override
    public void deleteUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND,
                        "Usuário não encontrado",
                        "USER_NOT_FOUND",
                        "id",
                        "Não foi possível encontrar um usuário com o ID '" + id + "'."));

        assertCanManage(securityContextHelper.getCurrentUser(), user);

        userRepository.delete(user);
    }

    @Override
    public UserResponseDTO updateUser(UUID id, UpdateUserRequestDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND,
                        "Usuário não encontrado",
                        "USER_NOT_FOUND",
                        "id",
                        "Não foi possível encontrar um usuário com o ID '" + id + "'."));

        assertCanManage(securityContextHelper.getCurrentUser(), user);

        if (dto.name() != null) {
            user.setName(dto.name());
        }

        if (dto.cpf() != null) {
            user.setCpf(dto.cpf());
        }

        if (dto.imageUrl() != null) {
            user.setImageUrl(dto.imageUrl());
        }

        User updatedUser = userRepository.save(user);
        return userMapper.toResponseDTO(updatedUser);
    }

    @Override
    public void resetPassword(ResetPasswordRequestDTO resetPasswordRequestDTO) {
        // Implementação do método de redefinição de senha
    }

    @Override
    public void changePassword(ChangePasswordRequestDTO changePasswordRequestDTO) {
        // Implementação do método de alteração de senha
    }

    private void assertCanManage(User actor, User target) {
        authorizationPolicy.requireSelfOrManageable(actor, target);
    }

    private void assertBelongsToCompany(User actor, UUID companyId) {
        authorizationPolicy.requireAdminOrCondition(
                actor, () -> companyRepository.existsByIdAndUsers_Id(companyId, actor.getId()));
    }

    private Company findCompanyOrThrow(UUID id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND,
                        "Empresa não encontrada",
                        "COMPANY_NOT_FOUND",
                        "id",
                        "Não foi possível encontrar uma empresa com o ID '" + id + "'."));
    }
}
