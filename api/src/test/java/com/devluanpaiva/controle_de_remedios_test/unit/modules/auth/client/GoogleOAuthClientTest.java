package com.devluanpaiva.controle_de_remedios_test.unit.modules.auth.client;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import com.devluanpaiva.controle_de_remedios.modules.auth.client.GoogleOAuthClient;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

@DisplayName("GoogleOAuthClient")
class GoogleOAuthClientTest {

    private static final String TOKEN_URI = "https://oauth2.googleapis.com/token";

    private MockRestServiceServer mockServer;
    private GoogleOAuthClient googleOAuthClient;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        mockServer = MockRestServiceServer.bindTo(builder).build();
        googleOAuthClient = new GoogleOAuthClient(builder, TOKEN_URI, "client-id", "client-secret");
    }

    @Test
    @DisplayName("should return the id_token when Google accepts the exchange")
    void shouldReturnIdTokenWhenExchangeSucceeds() {
        mockServer.expect(requestTo(TOKEN_URI))
                .andExpect(method(HttpMethod.POST))
                .andExpect(content().contentType(MediaType.APPLICATION_FORM_URLENCODED))
                .andRespond(withSuccess(
                        "{\"id_token\":\"google-id-token\",\"access_token\":\"ignored\"}",
                        MediaType.APPLICATION_JSON));

        String idToken = googleOAuthClient.exchangeAuthorizationCodeForIdToken(
                "auth-code", "verifier", "http://127.0.0.1:5173");

        assertThat(idToken).isEqualTo("google-id-token");
    }

    @Test
    @DisplayName("should throw 401 when Google rejects the authorization code")
    void shouldThrowWhenGoogleRejectsCode() {
        mockServer.expect(requestTo(TOKEN_URI))
                .andRespond(withStatus(HttpStatus.BAD_REQUEST)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("{\"error\":\"invalid_grant\"}"));

        assertThatThrownBy(() -> googleOAuthClient.exchangeAuthorizationCodeForIdToken(
                "auth-code", "verifier", "http://127.0.0.1:5173"))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getCode()).isEqualTo("AUTH_GOOGLE_EXCHANGE_FAILED"));
    }

    @Test
    @DisplayName("should throw 401 when the response has no id_token")
    void shouldThrowWhenResponseHasNoIdToken() {
        mockServer.expect(requestTo(TOKEN_URI))
                .andRespond(withSuccess("{\"access_token\":\"only-access\"}", MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> googleOAuthClient.exchangeAuthorizationCodeForIdToken(
                "auth-code", "verifier", "http://127.0.0.1:5173"))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getCode()).isEqualTo("AUTH_GOOGLE_EXCHANGE_FAILED"));
    }
}
