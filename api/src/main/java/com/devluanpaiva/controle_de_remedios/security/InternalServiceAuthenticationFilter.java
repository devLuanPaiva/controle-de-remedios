package com.devluanpaiva.controle_de_remedios.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.devluanpaiva.controle_de_remedios.shared.exceptions.ApiError;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.ApiExceptionResponse;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class InternalServiceAuthenticationFilter extends OncePerRequestFilter {
    private static final String INTERNAL_PATH_PREFIX = "/internal/";
    private static final String SECRET_HEADER = "X-Internal-Secret";

    private final String internalSecret;
    private final ObjectMapper objectMapper;

    public InternalServiceAuthenticationFilter(
            @Value("${assistant.internal-secret}") String internalSecret,
            ObjectMapper objectMapper) {

        this.internalSecret = internalSecret;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (!request.getRequestURI().startsWith(INTERNAL_PATH_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        if (!isValidSecret(request.getHeader(SECRET_HEADER))) {
            writeUnauthorizedResponse(response);
            return;
        }

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                "internal-service", null, List.of(new SimpleGrantedAuthority("ROLE_INTERNAL_SERVICE")));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        filterChain.doFilter(request, response);
    }

    private boolean isValidSecret(String providedSecret) {
        if (!StringUtils.hasText(internalSecret) || !StringUtils.hasText(providedSecret)) {
            return false;
        }

        byte[] expected = internalSecret.getBytes(StandardCharsets.UTF_8);
        byte[] provided = providedSecret.getBytes(StandardCharsets.UTF_8);

        return MessageDigest.isEqual(expected, provided);
    }

    private void writeUnauthorizedResponse(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ApiExceptionResponse responseBody = new ApiExceptionResponse(
                "error",
                "Não autorizado",
                null,
                List.of(new ApiError(
                        "INTERNAL_UNAUTHORIZED",
                        "X-Internal-Secret",
                        "O segredo interno informado é inválido ou está ausente.")));

        objectMapper.writeValue(response.getWriter(), responseBody);
    }
}
