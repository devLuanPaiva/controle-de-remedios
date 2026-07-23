package com.devluanpaiva.controle_de_remedios_test.unit.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.security.GeneralSecurityException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import com.devluanpaiva.controle_de_remedios.security.GoogleIdentity;
import com.devluanpaiva.controle_de_remedios.security.GoogleIdentityVerifier;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;

@ExtendWith(MockitoExtension.class)
@DisplayName("GoogleIdentityVerifier")
class GoogleIdentityVerifierTest {

    @Mock
    private GoogleIdTokenVerifier verifier;

    private GoogleIdentityVerifier googleIdentityVerifier;

    @BeforeEach
    void setUp() {
        googleIdentityVerifier = new GoogleIdentityVerifier(verifier);
    }

    private GoogleIdToken.Payload payloadWith(String subject, String email, Boolean emailVerified) {
        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        payload.setSubject(subject);
        payload.setEmail(email);
        payload.setEmailVerified(emailVerified);
        payload.set("name", "Luan Alves");
        payload.set("picture", "https://example.com/avatar.png");
        return payload;
    }

    @Test
    @DisplayName("should return the verified identity when the ID token is valid")
    void shouldReturnIdentityWhenTokenIsValid() throws GeneralSecurityException, IOException {
        GoogleIdToken googleIdToken = mock(GoogleIdToken.class);
        when(googleIdToken.getPayload()).thenReturn(payloadWith("sub-123", "luan@example.com", true));
        when(verifier.verify("valid-token")).thenReturn(googleIdToken);

        GoogleIdentity identity = googleIdentityVerifier.verify("valid-token");

        assertThat(identity.subject()).isEqualTo("sub-123");
        assertThat(identity.email()).isEqualTo("luan@example.com");
        assertThat(identity.emailVerified()).isTrue();
        assertThat(identity.name()).isEqualTo("Luan Alves");
        assertThat(identity.pictureUrl()).isEqualTo("https://example.com/avatar.png");
    }

    @Test
    @DisplayName("should treat a null emailVerified claim as not verified")
    void shouldTreatNullEmailVerifiedAsFalse() throws GeneralSecurityException, IOException {
        GoogleIdToken googleIdToken = mock(GoogleIdToken.class);
        when(googleIdToken.getPayload()).thenReturn(payloadWith("sub-123", "luan@example.com", null));
        when(verifier.verify("valid-token")).thenReturn(googleIdToken);

        GoogleIdentity identity = googleIdentityVerifier.verify("valid-token");

        assertThat(identity.emailVerified()).isFalse();
    }

    @Test
    @DisplayName("should throw 401 when the token fails verification (null result)")
    void shouldThrowUnauthorizedWhenTokenIsRejected() throws GeneralSecurityException, IOException {
        when(verifier.verify("invalid-token")).thenReturn(null);

        assertThatThrownBy(() -> googleIdentityVerifier.verify("invalid-token"))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> {
                    BusinessException businessException = (BusinessException) ex;
                    assertThat(businessException.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);
                    assertThat(businessException.getCode()).isEqualTo("AUTH_GOOGLE_TOKEN_INVALID");
                });
    }

    @Test
    @DisplayName("should throw 401 when the token is malformed")
    void shouldThrowUnauthorizedWhenTokenIsMalformed() throws GeneralSecurityException, IOException {
        when(verifier.verify("malformed-token")).thenThrow(new IllegalArgumentException("malformed"));

        assertThatThrownBy(() -> googleIdentityVerifier.verify("malformed-token"))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getCode()).isEqualTo("AUTH_GOOGLE_TOKEN_INVALID"));
    }

    @Test
    @DisplayName("should throw 401 when verification fails with an IO error")
    void shouldThrowUnauthorizedWhenVerificationThrowsIOException() throws GeneralSecurityException, IOException {
        when(verifier.verify("token")).thenThrow(new IOException("network error"));

        assertThatThrownBy(() -> googleIdentityVerifier.verify("token"))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getCode()).isEqualTo("AUTH_GOOGLE_TOKEN_INVALID"));
    }
}
