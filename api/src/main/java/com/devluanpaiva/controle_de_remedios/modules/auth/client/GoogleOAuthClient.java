package com.devluanpaiva.controle_de_remedios.modules.auth.client;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class GoogleOAuthClient {

    private final RestClient restClient;
    private final String tokenUri;
    private final String clientId;
    private final String clientSecret;

    public GoogleOAuthClient(
            @Qualifier("googleOAuthRestClientBuilder") RestClient.Builder restClientBuilder,
            @Value("${google.oauth.token-uri}") String tokenUri,
            @Value("${google.oauth.client-id-desktop}") String clientId,
            @Value("${google.oauth.client-secret}") String clientSecret) {

        this.restClient = restClientBuilder.build();
        this.tokenUri = tokenUri;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    public String exchangeAuthorizationCodeForIdToken(String code, String codeVerifier, String redirectUri) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "authorization_code");
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("code", code);
        form.add("code_verifier", codeVerifier);
        form.add("redirect_uri", redirectUri);

        try {
            GoogleTokenResponse response = restClient.post()
                    .uri(tokenUri)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(GoogleTokenResponse.class);

            if (response == null || response.idToken() == null || response.idToken().isBlank()) {
                throw exchangeFailed();
            }

            return response.idToken();
        } catch (RestClientException ex) {
            log.warn("Falha ao trocar o authorization code do Google por um id_token", ex);
            throw exchangeFailed();
        }
    }

    private BusinessException exchangeFailed() {
        return new BusinessException(
                HttpStatus.UNAUTHORIZED,
                "Não foi possível validar a autenticação com o Google",
                "AUTH_GOOGLE_EXCHANGE_FAILED",
                "code",
                "O código de autorização informado é inválido, expirado ou já foi utilizado.");
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record GoogleTokenResponse(
            @JsonProperty("id_token") String idToken) {
    }
}
