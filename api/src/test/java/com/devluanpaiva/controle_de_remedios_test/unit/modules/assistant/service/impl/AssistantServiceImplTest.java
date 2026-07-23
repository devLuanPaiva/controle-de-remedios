package com.devluanpaiva.controle_de_remedios_test.unit.modules.assistant.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

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

import com.devluanpaiva.controle_de_remedios.modules.assistant.client.N8nAssistantClient;
import com.devluanpaiva.controle_de_remedios.modules.assistant.dto.ChatRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.assistant.dto.ChatResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.assistant.service.impl.AssistantServiceImpl;
import com.devluanpaiva.controle_de_remedios.modules.company.repository.CompanyRepository;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.security.AuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

@ExtendWith(MockitoExtension.class)
@DisplayName("AssistantServiceImpl")
class AssistantServiceImplTest {

    @Mock
    private SecurityContextHelper securityContextHelper;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private N8nAssistantClient n8nAssistantClient;

    private AssistantServiceImpl assistantService;

    @BeforeEach
    void setUp() {
        assistantService = new AssistantServiceImpl(
                securityContextHelper, new AuthorizationPolicy(), companyRepository, n8nAssistantClient);
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
    @DisplayName("chat")
    class Chat {

        @Test
        @DisplayName("should return the assistant's answer for a MANAGER member of the company")
        void shouldReturnAnswerForMemberManager() {
            UUID companyId = UUID.randomUUID();
            User manager = buildUser(UserRole.MANAGER);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(companyRepository.existsByIdAndUsers_Id(companyId, manager.getId())).thenReturn(true);
            when(n8nAssistantClient.ask(eq("Olá"), eq(companyId), any(UUID.class))).thenReturn("Resposta do assistente");

            ChatResponseDTO response = assistantService.chat(new ChatRequestDTO(companyId, "Olá", null));

            assertThat(response.answer()).isEqualTo("Resposta do assistente");
            assertThat(response.conversationId()).isNotNull();
        }

        @Test
        @DisplayName("should reuse the provided conversationId instead of generating a new one")
        void shouldReuseProvidedConversationId() {
            UUID companyId = UUID.randomUUID();
            UUID conversationId = UUID.randomUUID();
            User manager = buildUser(UserRole.MANAGER);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(companyRepository.existsByIdAndUsers_Id(companyId, manager.getId())).thenReturn(true);
            when(n8nAssistantClient.ask("Olá", companyId, conversationId)).thenReturn("Resposta");

            ChatResponseDTO response = assistantService.chat(new ChatRequestDTO(companyId, "Olá", conversationId));

            assertThat(response.conversationId()).isEqualTo(conversationId);
            verify(n8nAssistantClient).ask("Olá", companyId, conversationId);
        }

        @Test
        @DisplayName("should generate a different conversationId on each call when none is provided")
        void shouldGenerateDifferentConversationIdsAcrossCalls() {
            UUID companyId = UUID.randomUUID();
            User manager = buildUser(UserRole.MANAGER);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(companyRepository.existsByIdAndUsers_Id(companyId, manager.getId())).thenReturn(true);
            when(n8nAssistantClient.ask(any(), any(), any())).thenReturn("Resposta");

            ChatRequestDTO dto = new ChatRequestDTO(companyId, "Olá", null);

            ChatResponseDTO first = assistantService.chat(dto);
            ChatResponseDTO second = assistantService.chat(dto);

            assertThat(first.conversationId()).isNotEqualTo(second.conversationId());
        }

        @Test
        @DisplayName("should allow ADMIN without checking company membership")
        void shouldAllowAdminWithoutCheckingMembership() {
            UUID companyId = UUID.randomUUID();
            User admin = buildUser(UserRole.ADMIN);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(n8nAssistantClient.ask(any(), any(), any())).thenReturn("Resposta");

            ChatResponseDTO response = assistantService.chat(new ChatRequestDTO(companyId, "Olá", null));

            assertThat(response.answer()).isEqualTo("Resposta");
            verify(companyRepository, never()).existsByIdAndUsers_Id(any(), any());
        }

        @Test
        @DisplayName("should deny a MANAGER that is not a member of the company")
        void shouldDenyNonMemberManager() {
            UUID companyId = UUID.randomUUID();
            User manager = buildUser(UserRole.MANAGER);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(companyRepository.existsByIdAndUsers_Id(companyId, manager.getId())).thenReturn(false);

            ChatRequestDTO dto = new ChatRequestDTO(companyId, "Olá", null);

            assertForbidden(() -> assistantService.chat(dto));
            verifyNoInteractions(n8nAssistantClient);
        }

        @Test
        @DisplayName("should deny a PATIENT even if they belong to the company")
        void shouldDenyPatientEvenIfMember() {
            UUID companyId = UUID.randomUUID();
            User patient = buildUser(UserRole.PATIENT);

            when(securityContextHelper.getCurrentUser()).thenReturn(patient);

            ChatRequestDTO dto = new ChatRequestDTO(companyId, "Olá", null);

            assertForbidden(() -> assistantService.chat(dto));
            verifyNoInteractions(companyRepository, n8nAssistantClient);
        }

        @Test
        @DisplayName("should propagate the ASSISTANT_UNAVAILABLE exception raised by the n8n client")
        void shouldPropagateAssistantUnavailableException() {
            UUID companyId = UUID.randomUUID();
            User manager = buildUser(UserRole.MANAGER);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(companyRepository.existsByIdAndUsers_Id(companyId, manager.getId())).thenReturn(true);
            when(n8nAssistantClient.ask(any(), any(), any())).thenThrow(new BusinessException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Assistente indisponível",
                    "ASSISTANT_UNAVAILABLE",
                    "message",
                    "Não foi possível obter uma resposta do assistente no momento."));

            ChatRequestDTO dto = new ChatRequestDTO(companyId, "Olá", null);

            assertThatThrownBy(() -> assistantService.chat(dto))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> assertThat(((BusinessException) ex).getCode()).isEqualTo("ASSISTANT_UNAVAILABLE"));
        }
    }
}
