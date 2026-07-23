package com.devluanpaiva.controle_de_remedios_test.unit.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.devluanpaiva.controle_de_remedios.security.InternalServiceAuthenticationFilter;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.ApiExceptionResponse;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.FilterChain;

@DisplayName("InternalServiceAuthenticationFilter")
class InternalServiceAuthenticationFilterTest {

    private static final String SECRET = "s3cr3t-internal-value";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final FilterChain filterChain = mock(FilterChain.class);

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private InternalServiceAuthenticationFilter newFilter(String configuredSecret) {
        return new InternalServiceAuthenticationFilter(configuredSecret, objectMapper);
    }

    private void assertUnauthorized(MockHttpServletResponse response) throws Exception {
        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(response.getContentType()).isEqualTo(MediaType.APPLICATION_JSON_VALUE);

        ApiExceptionResponse body = objectMapper.readValue(response.getContentAsString(), ApiExceptionResponse.class);

        assertThat(body.status()).isEqualTo("error");
        assertThat(body.errors()).hasSize(1);
        assertThat(body.errors().get(0).code()).isEqualTo("INTERNAL_UNAUTHORIZED");
    }

    @Nested
    @DisplayName("paths outside /internal/")
    class NonInternalPaths {

        @Test
        @DisplayName("should skip secret validation entirely and continue the chain")
        void shouldSkipValidationForNonInternalPath() throws Exception {
            MockHttpServletRequest request = new MockHttpServletRequest("GET", "/assistant/chat");
            MockHttpServletResponse response = new MockHttpServletResponse();

            newFilter(SECRET).doFilter(request, response, filterChain);

            verify(filterChain).doFilter(request, response);
            assertThat(response.getStatus()).isEqualTo(200);
        }
    }

    @Nested
    @DisplayName("paths under /internal/")
    class InternalPaths {

        @Test
        @DisplayName("should authenticate as ROLE_INTERNAL_SERVICE and continue the chain when the secret is valid")
        void shouldAuthenticateAndContinueWhenSecretIsValid() throws Exception {
            MockHttpServletRequest request = new MockHttpServletRequest("GET", "/internal/assistant/deliveries-summary");
            request.addHeader("X-Internal-Secret", SECRET);
            MockHttpServletResponse response = new MockHttpServletResponse();

            newFilter(SECRET).doFilter(request, response, filterChain);

            verify(filterChain).doFilter(request, response);

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            assertThat(authentication).isNotNull();
            assertThat(authentication.getPrincipal()).isEqualTo("internal-service");
            assertThat(authentication.getAuthorities())
                    .extracting(Object::toString)
                    .containsExactly("ROLE_INTERNAL_SERVICE");
        }

        @Test
        @DisplayName("should reject with 401 when the header is missing")
        void shouldRejectWhenHeaderIsMissing() throws Exception {
            MockHttpServletRequest request = new MockHttpServletRequest("GET", "/internal/assistant/deliveries-summary");
            MockHttpServletResponse response = new MockHttpServletResponse();

            newFilter(SECRET).doFilter(request, response, filterChain);

            assertUnauthorized(response);
            verify(filterChain, never()).doFilter(request, response);
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        }

        @Test
        @DisplayName("should reject with 401 when the header value is incorrect")
        void shouldRejectWhenHeaderIsIncorrect() throws Exception {
            MockHttpServletRequest request = new MockHttpServletRequest("GET", "/internal/assistant/deliveries-summary");
            request.addHeader("X-Internal-Secret", "wrong-value");
            MockHttpServletResponse response = new MockHttpServletResponse();

            newFilter(SECRET).doFilter(request, response, filterChain);

            assertUnauthorized(response);
            verify(filterChain, never()).doFilter(request, response);
        }

        @Test
        @DisplayName("should reject even a matching empty header when no secret is configured")
        void shouldRejectWhenConfiguredSecretIsBlank() throws Exception {
            MockHttpServletRequest request = new MockHttpServletRequest("GET", "/internal/assistant/deliveries-summary");
            request.addHeader("X-Internal-Secret", "");
            MockHttpServletResponse response = new MockHttpServletResponse();

            newFilter("").doFilter(request, response, filterChain);

            assertUnauthorized(response);
            verify(filterChain, never()).doFilter(request, response);
        }
    }
}
