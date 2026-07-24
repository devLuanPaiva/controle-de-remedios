package com.devluanpaiva.controle_de_remedios.modules.user.service.impl;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devluanpaiva.controle_de_remedios.modules.company.entity.Company;
import com.devluanpaiva.controle_de_remedios.modules.company.repository.CompanyRepository;
import com.devluanpaiva.controle_de_remedios.modules.notification.service.EmailService;
import com.devluanpaiva.controle_de_remedios.modules.user.dto.ChangePasswordRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.user.dto.CreateUserRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.user.dto.DataDeletionRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.user.dto.DeleteAccountRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.user.dto.UpdateUserRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.user.dto.UserResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.DataDeletionRequest;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.filter.UserFilter;
import com.devluanpaiva.controle_de_remedios.modules.user.filter.UserSpecification;
import com.devluanpaiva.controle_de_remedios.modules.user.mapper.UserMapper;
import com.devluanpaiva.controle_de_remedios.modules.user.repository.DataDeletionRequestRepository;
import com.devluanpaiva.controle_de_remedios.modules.user.repository.UserRepository;
import com.devluanpaiva.controle_de_remedios.modules.user.service.UserService;
import com.devluanpaiva.controle_de_remedios.security.AuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final SecurityContextHelper securityContextHelper;
    private final AuthorizationPolicy authorizationPolicy;
    private final EmailService emailService;
    private final DataDeletionRequestRepository dataDeletionRequestRepository;

    @Value("${app.frontend.web-url}")
    private String webUrl;

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

        sendWelcomeEmail(savedUser, dto.password());

        return userMapper.toResponseDTO(savedUser);
    }

    private void sendWelcomeEmail(User user, String rawPassword) {
        try {
            emailService.sendWelcomeEmail(user, rawPassword, webUrl);
        } catch (RuntimeException ex) {
            log.error("Falha ao enviar e-mail de boas-vindas para o usuário '{}'", user.getId(), ex);
        }
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
                .map(userMapper::toMaskedResponseDTO);
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
    @Transactional
    public void deleteOwnAccount(DeleteAccountRequestDTO dto) {
        User user = securityContextHelper.getCurrentUser();

        if (!passwordEncoder.matches(dto.password(), user.getPassword())) {
            throw new BusinessException(
                    HttpStatus.BAD_REQUEST,
                    "Senha incorreta",
                    "CURRENT_PASSWORD_INVALID",
                    "password",
                    "A senha informada não confere com a senha cadastrada.");
        }

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
    @Transactional
    public void changePassword(ChangePasswordRequestDTO dto) {
        User user = securityContextHelper.getCurrentUser();

        if (!passwordEncoder.matches(dto.currentPassword(), user.getPassword())) {
            throw new BusinessException(
                    HttpStatus.BAD_REQUEST,
                    "Senha atual incorreta",
                    "CURRENT_PASSWORD_INVALID",
                    "currentPassword",
                    "A senha atual informada não confere com a senha cadastrada.");
        }

        if (!dto.newPassword().equals(dto.confirmPassword())) {
            throw new BusinessException(
                    HttpStatus.BAD_REQUEST,
                    "As senhas não coincidem",
                    "PASSWORD_MISMATCH",
                    "confirmPassword",
                    "A nova senha e a confirmação de senha precisam ser iguais.");
        }

        user.setPassword(passwordEncoder.encode(dto.newPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void requestDataDeletion(DataDeletionRequestDTO dto) {
        User user = securityContextHelper.getCurrentUser();

        DataDeletionRequest request = DataDeletionRequest.builder()
                .requesterName(user.getName())
                .requesterEmail(user.getEmail())
                .requesterCpf(user.getCpf())
                .message(dto.message())
                .build();

        dataDeletionRequestRepository.save(request);

        sendDataDeletionRequestEmails(user, dto.message());
    }

    private void sendDataDeletionRequestEmails(User user, String message) {
        try {
            emailService.sendDataDeletionRequestConfirmationEmail(user);
            emailService.sendDataDeletionRequestNotificationEmail(user, message);
        } catch (RuntimeException ex) {
            log.error("Falha ao enviar e-mails da solicitação de exclusão de dados do usuário '{}'", user.getId(),
                    ex);
        }
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
