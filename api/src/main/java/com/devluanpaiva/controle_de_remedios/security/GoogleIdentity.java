package com.devluanpaiva.controle_de_remedios.security;

public record GoogleIdentity(
        String subject,
        String email,
        boolean emailVerified,
        String name,
        String pictureUrl) {

}
