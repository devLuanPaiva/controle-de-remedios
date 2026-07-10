package com.devluanpaiva.controle_de_remedios.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.http.MediaType;

import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.repository.UserRepository;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.ApiError;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.ApiExceptionResponse;

import java.io.IOException;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final String INVALID_TOKEN_MESSAGE = "Token inválido";

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = authHeader.substring(7);

            if (!jwtService.isAccessToken(token)) {
                writeUnauthorizedResponse(
                        response,
                        INVALID_TOKEN_MESSAGE,
                        "O token informado não é um access token");
                return;
            }

            UUID userId = jwtService.extractUserId(token);

            User user = userRepository.findById(userId)
                    .orElse(null);

            if (user != null) {
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(user, null,
                        user.getAuthorities());

                SecurityContextHolder.getContext().setAuthentication(authentication);
            } else {
                writeUnauthorizedResponse(
                        response,
                        INVALID_TOKEN_MESSAGE,
                        "Usuário associado ao token não foi encontrado");
                return;
            }
        } catch (Exception e) {
            SecurityContextHolder.clearContext();
            writeUnauthorizedResponse(
                    response,
                    INVALID_TOKEN_MESSAGE,
                    "O token está inválido, expirado ou malformado");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void writeUnauthorizedResponse(HttpServletResponse response, String message, String detail)
            throws IOException {

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ApiExceptionResponse responseBody = new ApiExceptionResponse(
                "error",
                message,
                null,
                new ApiError(
                        "AUTH_UNAUTHORIZED",
                        "authorization",
                        detail));

        objectMapper.writeValue(response.getWriter(), responseBody);
    }
}
