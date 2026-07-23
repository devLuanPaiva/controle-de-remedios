package com.devluanpaiva.controle_de_remedios.security;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

@Configuration
public class GoogleIdTokenVerifierConfig {

    @Bean
    public GoogleIdTokenVerifier googleIdTokenVerifier(
            @Value("${google.oauth.client-id-web}") String webClientId,
            @Value("${google.oauth.client-id-mobile}") String mobileClientId,
            @Value("${google.oauth.client-id-desktop}") String desktopClientId)
            throws GeneralSecurityException, IOException {

        List<String> audiences = List.of(webClientId, mobileClientId, desktopClientId)
                .stream()
                .filter(clientId -> !clientId.isBlank())
                .toList();

        return new GoogleIdTokenVerifier.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance())
                .setAudience(audiences)
                .build();
    }
}
