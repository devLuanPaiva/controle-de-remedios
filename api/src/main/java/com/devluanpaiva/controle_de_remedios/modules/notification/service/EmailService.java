package com.devluanpaiva.controle_de_remedios.modules.notification.service;

import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;

public interface EmailService {
    void sendPasswordResetEmail(User user, String resetUrl, long expirationMinutes);

    void sendWelcomeEmail(User user, String rawPassword, String loginUrl);
}
