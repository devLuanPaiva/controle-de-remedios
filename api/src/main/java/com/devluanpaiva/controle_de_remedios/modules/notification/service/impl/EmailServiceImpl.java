package com.devluanpaiva.controle_de_remedios.modules.notification.service.impl;

import java.time.Year;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.devluanpaiva.controle_de_remedios.modules.notification.client.ResendClient;
import com.devluanpaiva.controle_de_remedios.modules.notification.service.EmailService;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.shared.utils.TemplateRenderer;

@Service
public class EmailServiceImpl implements EmailService {
    private static final String PASSWORD_RESET_TEMPLATE = "templates/email/password-reset.html";
    private static final String WELCOME_TEMPLATE = "templates/email/welcome.html";

    private final ResendClient resendClient;
    private final String logoUrl;

    public EmailServiceImpl(
            ResendClient resendClient,
            @Value("${app.branding.logo-url}") String logoUrl) {

        this.resendClient = resendClient;
        this.logoUrl = logoUrl;
    }

    @Override
    public void sendPasswordResetEmail(User user, String resetUrl, long expirationMinutes) {
        String html = TemplateRenderer.render(PASSWORD_RESET_TEMPLATE, Map.of(
                "logoUrl", logoUrl,
                "name", user.getName(),
                "resetUrl", resetUrl,
                "expirationMinutes", String.valueOf(expirationMinutes),
                "year", currentYear()));

        resendClient.send(user.getEmail(), "Redefinição de senha - ChegaMed", html);
    }

    @Override
    public void sendWelcomeEmail(User user, String rawPassword, String loginUrl) {
        String html = TemplateRenderer.render(WELCOME_TEMPLATE, Map.of(
                "logoUrl", logoUrl,
                "name", user.getName(),
                "email", user.getEmail(),
                "password", rawPassword,
                "loginUrl", loginUrl,
                "year", currentYear()));

        resendClient.send(user.getEmail(), "Bem-vindo(a) ao ChegaMed", html);
    }

    private String currentYear() {
        return String.valueOf(Year.now().getValue());
    }
}
