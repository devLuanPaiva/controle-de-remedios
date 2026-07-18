package com.devluanpaiva.controle_de_remedios.modules.assistant.service.impl;

import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.devluanpaiva.controle_de_remedios.modules.assistant.client.N8nAssistantClient;
import com.devluanpaiva.controle_de_remedios.modules.assistant.dto.ChatRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.assistant.dto.ChatResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.assistant.service.AssistantService;
import com.devluanpaiva.controle_de_remedios.modules.company.repository.CompanyRepository;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.security.AuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AssistantServiceImpl implements AssistantService {
    private final SecurityContextHelper securityContextHelper;
    private final AuthorizationPolicy authorizationPolicy;
    private final CompanyRepository companyRepository;
    private final N8nAssistantClient n8nAssistantClient;

    @Override
    public ChatResponseDTO chat(ChatRequestDTO dto) {
        User actor = securityContextHelper.getCurrentUser();

        authorizationPolicy.requireAdminOrRolesWithCondition(
                actor, Set.of(UserRole.MANAGER, UserRole.ASSISTANT),
                () -> isMemberOf(dto.companyId(), actor));

        UUID conversationId = dto.conversationId() != null ? dto.conversationId() : UUID.randomUUID();
        String answer = n8nAssistantClient.ask(dto.message(), dto.companyId(), conversationId);

        return new ChatResponseDTO(conversationId, answer);
    }

    private boolean isMemberOf(UUID companyId, User user) {
        return companyRepository.existsByIdAndUsers_Id(companyId, user.getId());
    }
}
