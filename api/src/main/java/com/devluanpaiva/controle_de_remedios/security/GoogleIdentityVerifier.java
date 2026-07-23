package com.devluanpaiva.controle_de_remedios.security;

import java.io.IOException;
import java.security.GeneralSecurityException;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleIdentityVerifier {

    private final GoogleIdTokenVerifier verifier;

    public GoogleIdentity verify(String idToken) {
        GoogleIdToken googleIdToken = parse(idToken);

        if (googleIdToken == null) {
            throw invalidToken();
        }

        GoogleIdToken.Payload payload = googleIdToken.getPayload();

        return new GoogleIdentity(
                payload.getSubject(),
                payload.getEmail(),
                Boolean.TRUE.equals(payload.getEmailVerified()),
                (String) payload.get("name"),
                (String) payload.get("picture"));
    }

    private GoogleIdToken parse(String idToken) {
        try {
            return verifier.verify(idToken);
        } catch (GeneralSecurityException | IOException | IllegalArgumentException ex) {
            log.warn("Falha ao verificar o ID token do Google", ex);
            throw invalidToken();
        }
    }

    private BusinessException invalidToken() {
        return new BusinessException(
                HttpStatus.UNAUTHORIZED,
                "Token do Google inválido",
                "AUTH_GOOGLE_TOKEN_INVALID",
                "idToken",
                "O token do Google informado é inválido, expirado ou não foi emitido para este aplicativo.");
    }
}
