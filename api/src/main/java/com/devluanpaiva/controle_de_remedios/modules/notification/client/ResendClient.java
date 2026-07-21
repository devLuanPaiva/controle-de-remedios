package com.devluanpaiva.controle_de_remedios.modules.notification.client;

import java.time.Duration;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class ResendClient {
    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    private final RestClient restClient;
    private final String apiKey;
    private final String fromEmail;

    public ResendClient(
            @Value("${resend.api-key}") String apiKey,
            @Value("${resend.from-email}") String fromEmail) {

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout((int) Duration.ofSeconds(5).toMillis());
        requestFactory.setReadTimeout((int) Duration.ofSeconds(10).toMillis());

        this.restClient = RestClient.builder().requestFactory(requestFactory).build();
        this.apiKey = apiKey;
        this.fromEmail = fromEmail;
    }

    public void send(String to, String subject, String html) {
        try {
            restClient.post()
                    .uri(RESEND_API_URL)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .body(new ResendEmailRequest(fromEmail, List.of(to), subject, html))
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException ex) {
            log.error("Falha ao enviar e-mail via Resend para o destinatário informado", ex);
            throw emailDeliveryFailed();
        }
    }

    private BusinessException emailDeliveryFailed() {
        return new BusinessException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "Falha ao enviar e-mail",
                "EMAIL_DELIVERY_FAILED",
                "email",
                "Não foi possível enviar o e-mail no momento. Tente novamente mais tarde.");
    }

    private record ResendEmailRequest(String from, List<String> to, String subject, String html) {
    }
}
