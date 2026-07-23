package com.devluanpaiva.controle_de_remedios_test.unit.modules.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import com.devluanpaiva.controle_de_remedios.modules.auth.client.GoogleOAuthClient;
import com.devluanpaiva.controle_de_remedios.modules.auth.dto.AuthResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.auth.dto.GoogleDesktopLoginRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.auth.dto.GoogleLoginRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.auth.service.GoogleAuthService;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.modules.user.repository.UserRepository;
import com.devluanpaiva.controle_de_remedios.security.GoogleIdentity;
import com.devluanpaiva.controle_de_remedios.security.GoogleIdentityVerifier;
import com.devluanpaiva.controle_de_remedios.security.JwtService;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

@ExtendWith(MockitoExtension.class)
@DisplayName("GoogleAuthService")
class GoogleAuthServiceTest {

    @Mock
    private GoogleIdentityVerifier googleIdentityVerifier;

    @Mock
    private GoogleOAuthClient googleOAuthClient;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtService jwtService;

    private GoogleAuthService googleAuthService;

    private User user;

    @BeforeEach
    void setUp() {
        googleAuthService = new GoogleAuthService(googleIdentityVerifier, googleOAuthClient, userRepository, jwtService);

        user = User.builder()
                .id(UUID.randomUUID())
                .name("Luan Alves")
                .email("luan@example.com")
                .password("encoded-password")
                .cpf("12345678901")
                .active(true)
                .role(UserRole.ASSISTANT)
                .build();
    }

    private GoogleIdentity verifiedIdentity(String email) {
        return new GoogleIdentity("google-sub-1", email, true, "Luan Alves", "https://example.com/avatar.png");
    }

    @Nested
    @DisplayName("loginWithIdToken")
    class LoginWithIdToken {

        private final GoogleLoginRequestDTO dto = new GoogleLoginRequestDTO("google-id-token");

        @Test
        @DisplayName("should issue tokens when the Google e-mail is registered and verified")
        void shouldIssueTokensWhenEmailIsRegisteredAndVerified() {
            when(googleIdentityVerifier.verify(dto.idToken())).thenReturn(verifiedIdentity("luan@example.com"));
            when(userRepository.findByEmail("luan@example.com")).thenReturn(Optional.of(user));
            when(jwtService.generateAccessToken(user)).thenReturn("access-token");
            when(jwtService.generateRefreshToken(user)).thenReturn("refresh-token");

            AuthResponseDTO response = googleAuthService.loginWithIdToken(dto);

            assertThat(response.accessToken()).isEqualTo("access-token");
            assertThat(response.refreshToken()).isEqualTo("refresh-token");
        }

        @Test
        @DisplayName("should throw 403 when no user is registered with the Google e-mail")
        void shouldThrowForbiddenWhenEmailIsNotRegistered() {
            when(googleIdentityVerifier.verify(dto.idToken())).thenReturn(verifiedIdentity("stranger@example.com"));
            when(userRepository.findByEmail("stranger@example.com")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> googleAuthService.loginWithIdToken(dto))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                        assertThat(businessException.getCode()).isEqualTo("AUTH_EMAIL_NOT_REGISTERED");
                    });

            verify(jwtService, never()).generateAccessToken(org.mockito.ArgumentMatchers.any());
        }

        @Test
        @DisplayName("should throw 403 without querying the database when the Google e-mail is not verified")
        void shouldThrowForbiddenWhenEmailIsNotVerified() {
            when(googleIdentityVerifier.verify(dto.idToken()))
                    .thenReturn(new GoogleIdentity("google-sub-1", "luan@example.com", false, "Luan Alves", null));

            assertThatThrownBy(() -> googleAuthService.loginWithIdToken(dto))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> assertThat(((BusinessException) ex).getCode()).isEqualTo("AUTH_GOOGLE_EMAIL_NOT_VERIFIED"));

            verify(userRepository, never()).findByEmail(anyString());
        }

        @Test
        @DisplayName("should propagate the verifier's exception when the ID token is invalid")
        void shouldPropagateVerifierException() {
            BusinessException tokenInvalid = new BusinessException(
                    HttpStatus.UNAUTHORIZED, "Token do Google inválido", "AUTH_GOOGLE_TOKEN_INVALID", "idToken", "detail");
            when(googleIdentityVerifier.verify(dto.idToken())).thenThrow(tokenInvalid);

            assertThatThrownBy(() -> googleAuthService.loginWithIdToken(dto))
                    .isSameAs(tokenInvalid);

            verify(userRepository, never()).findByEmail(anyString());
        }
    }

    @Nested
    @DisplayName("loginWithAuthorizationCode")
    class LoginWithAuthorizationCode {

        private final GoogleDesktopLoginRequestDTO dto =
                new GoogleDesktopLoginRequestDTO("auth-code", "code-verifier", "http://127.0.0.1:5173");

        @Test
        @DisplayName("should exchange the code, verify the resulting id_token and issue tokens")
        void shouldExchangeCodeAndIssueTokens() {
            when(googleOAuthClient.exchangeAuthorizationCodeForIdToken(
                    dto.code(), dto.codeVerifier(), dto.redirectUri()))
                    .thenReturn("google-id-token");
            when(googleIdentityVerifier.verify("google-id-token")).thenReturn(verifiedIdentity("luan@example.com"));
            when(userRepository.findByEmail("luan@example.com")).thenReturn(Optional.of(user));
            when(jwtService.generateAccessToken(user)).thenReturn("access-token");
            when(jwtService.generateRefreshToken(user)).thenReturn("refresh-token");

            AuthResponseDTO response = googleAuthService.loginWithAuthorizationCode(dto);

            assertThat(response.accessToken()).isEqualTo("access-token");
            assertThat(response.refreshToken()).isEqualTo("refresh-token");
        }

        @Test
        @DisplayName("should throw 403 when the exchanged identity's e-mail is not registered")
        void shouldThrowForbiddenWhenEmailIsNotRegistered() {
            when(googleOAuthClient.exchangeAuthorizationCodeForIdToken(
                    dto.code(), dto.codeVerifier(), dto.redirectUri()))
                    .thenReturn("google-id-token");
            when(googleIdentityVerifier.verify("google-id-token")).thenReturn(verifiedIdentity("stranger@example.com"));
            when(userRepository.findByEmail("stranger@example.com")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> googleAuthService.loginWithAuthorizationCode(dto))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> assertThat(((BusinessException) ex).getCode()).isEqualTo("AUTH_EMAIL_NOT_REGISTERED"));
        }
    }
}
