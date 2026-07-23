package com.devluanpaiva.controle_de_remedios_test.unit.modules.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.devluanpaiva.controle_de_remedios.modules.auth.dto.AuthResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.auth.dto.ForgotPasswordRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.auth.dto.LoginRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.auth.dto.RefreshTokenRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.auth.dto.ResetPasswordRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.auth.entity.PasswordResetToken;
import com.devluanpaiva.controle_de_remedios.modules.auth.enums.RequestContext;
import com.devluanpaiva.controle_de_remedios.modules.auth.repository.PasswordResetTokenRepository;
import com.devluanpaiva.controle_de_remedios.modules.auth.service.AuthService;
import com.devluanpaiva.controle_de_remedios.modules.notification.service.EmailService;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.modules.user.repository.UserRepository;
import com.devluanpaiva.controle_de_remedios.security.JwtService;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService")
class AuthServiceTest {

    private static final String DESKTOP_URL = "chegamed-desktop://reset-password";
    private static final String MOBILE_URL = "chegamed://reset-password";

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(UUID.randomUUID())
                .name("Luan Alves")
                .email("luan@example.com")
                .password("encoded-password")
                .cpf("12345678901")
                .active(true)
                .role(UserRole.ASSISTANT)
                .imageUrl("https://example.com/avatar.png")
                .build();

        ReflectionTestUtils.setField(authService, "desktopResetPasswordUrl", DESKTOP_URL);
        ReflectionTestUtils.setField(authService, "mobileResetPasswordUrl", MOBILE_URL);
        ReflectionTestUtils.setField(authService, "tokenExpirationMinutes", 60L);
    }

    @Nested
    @DisplayName("login")
    class Login {

        private final LoginRequestDTO dto = new LoginRequestDTO("luan@example.com", "raw-password");

        @Test
        @DisplayName("should return tokens when credentials are valid")
        void shouldReturnTokensWhenCredentialsAreValid() {
            when(userRepository.findByEmail(dto.email())).thenReturn(Optional.of(user));
            when(passwordEncoder.matches(dto.password(), user.getPassword())).thenReturn(true);
            when(jwtService.generateAccessToken(user))
                    .thenReturn("access-token");
            when(jwtService.generateRefreshToken(user))
                    .thenReturn("refresh-token");

            AuthResponseDTO response = authService.login(dto);

            assertThat(response.accessToken()).isEqualTo("access-token");
            assertThat(response.refreshToken()).isEqualTo("refresh-token");

            verify(jwtService).generateAccessToken(user);
            verify(jwtService).generateRefreshToken(user);

        }

        @Test
        @DisplayName("should throw 401 when email is not found, without checking password")
        void shouldThrowUnauthorizedWhenEmailNotFound() {
            when(userRepository.findByEmail(dto.email())).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.login(dto))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);
                        assertThat(businessException.getCode()).isEqualTo("AUTH_UNAUTHORIZED");
                        assertThat(businessException.getMessage()).isEqualTo("Credenciais inválidas");
                    });

            verify(passwordEncoder, never()).matches(anyString(), anyString());
            verify(jwtService, never()).generateAccessToken(any());
        }

        @Test
        @DisplayName("should throw 401 when password is incorrect")
        void shouldThrowUnauthorizedWhenPasswordDoesNotMatch() {
            when(userRepository.findByEmail(dto.email())).thenReturn(Optional.of(user));
            when(passwordEncoder.matches(dto.password(), user.getPassword())).thenReturn(false);

            assertThatThrownBy(() -> authService.login(dto))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);
                        assertThat(businessException.getCode()).isEqualTo("AUTH_UNAUTHORIZED");
                        assertThat(businessException.getMessage()).isEqualTo("Credenciais inválidas");
                    });

            verify(jwtService, never()).generateAccessToken(any());
        }

        @Test
        @DisplayName("should return the same error message for unknown email and wrong password (anti-enumeration)")
        void shouldReturnSameErrorMessageForBothFailureCases() {
            when(userRepository.findByEmail(dto.email())).thenReturn(Optional.empty());
            String emailNotFoundMessage = catchBusinessException(() -> authService.login(dto)).getMessage();

            when(userRepository.findByEmail(dto.email())).thenReturn(Optional.of(user));
            when(passwordEncoder.matches(dto.password(), user.getPassword())).thenReturn(false);
            String wrongPasswordMessage = catchBusinessException(() -> authService.login(dto)).getMessage();

            assertThat(emailNotFoundMessage).isEqualTo(wrongPasswordMessage);
        }
    }

    @Nested
    @DisplayName("refresh")
    class Refresh {

        private final RefreshTokenRequestDTO dto = new RefreshTokenRequestDTO("valid-refresh-token");

        @Test
        @DisplayName("should generate a new token pair when refresh token is valid")
        void shouldRotateTokensWhenRefreshTokenIsValid() {
            when(jwtService.isRefreshToken(dto.refreshToken())).thenReturn(true);
            when(jwtService.extractUserId(dto.refreshToken())).thenReturn(user.getId());
            when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
            when(jwtService.generateAccessToken(user)).thenReturn("new-access-token");
            when(jwtService.generateRefreshToken(user)).thenReturn("new-refresh-token");

            AuthResponseDTO response = authService.refresh(dto);

            assertThat(response.accessToken()).isEqualTo("new-access-token");
            assertThat(response.refreshToken()).isEqualTo("new-refresh-token");

            verify(jwtService, times(1)).generateAccessToken(user);
            verify(jwtService, times(1)).generateRefreshToken(user);
        }

        @Test
        @DisplayName("should throw 401 when token is expired or malformed")
        void shouldThrowUnauthorizedWhenTokenTypeCheckFails() {
            when(jwtService.isRefreshToken(dto.refreshToken())).thenThrow(new RuntimeException("expired"));

            assertThatThrownBy(() -> authService.refresh(dto))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);
                        assertThat(businessException.getField()).isEqualTo("refreshToken");
                    });

            verify(userRepository, never()).findById(any());
        }

        @Test
        @DisplayName("should throw 401 when provided token is not a refresh token")
        void shouldThrowUnauthorizedWhenTokenIsNotARefreshToken() {
            when(jwtService.isRefreshToken(dto.refreshToken())).thenReturn(false);

            assertThatThrownBy(() -> authService.refresh(dto))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);
                        assertThat(businessException.getField()).isEqualTo("refreshToken");
                    });

            verify(jwtService, never()).extractUserId(anyString());
        }

        @Test
        @DisplayName("should throw 401 when user cannot be extracted from token")
        void shouldThrowUnauthorizedWhenUserIdExtractionFails() {
            when(jwtService.isRefreshToken(dto.refreshToken())).thenReturn(true);
            when(jwtService.extractUserId(dto.refreshToken())).thenThrow(new RuntimeException("malformed"));

            assertThatThrownBy(() -> authService.refresh(dto))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(
                            ex -> assertThat(((BusinessException) ex).getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED));

            verify(userRepository, never()).findById(any());
        }

        @Test
        @DisplayName("should throw 401 when token user no longer exists")
        void shouldThrowUnauthorizedWhenUserNoLongerExists() {
            when(jwtService.isRefreshToken(dto.refreshToken())).thenReturn(true);
            when(jwtService.extractUserId(dto.refreshToken())).thenReturn(user.getId());
            when(userRepository.findById(user.getId())).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.refresh(dto))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(
                            ex -> assertThat(((BusinessException) ex).getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED));

            verify(jwtService, never()).generateAccessToken(any());
        }
    }

    @Nested
    @DisplayName("forgotPassword")
    class ForgotPassword {

        private final ForgotPasswordRequestDTO desktopDto = new ForgotPasswordRequestDTO(
                "luan@example.com", RequestContext.DESKTOP);

        @Test
        @DisplayName("should issue a token and send an e-mail with the desktop URL when the e-mail exists")
        void shouldIssueTokenAndSendEmailWithDesktopUrl() {
            when(userRepository.findByEmail(desktopDto.email())).thenReturn(Optional.of(user));

            authService.forgotPassword(desktopDto);

            verify(passwordResetTokenRepository).deleteByUserId(user.getId());
            verify(passwordResetTokenRepository).save(any(PasswordResetToken.class));

            ArgumentCaptor<String> resetUrlCaptor = ArgumentCaptor.forClass(String.class);
            verify(emailService).sendPasswordResetEmail(eq(user), resetUrlCaptor.capture(), eq(60L));

            assertThat(resetUrlCaptor.getValue()).startsWith(DESKTOP_URL + "?token=");
        }

        @Test
        @DisplayName("should send an e-mail with the mobile URL when the context is MOBILE")
        void shouldSendEmailWithMobileUrl() {
            ForgotPasswordRequestDTO mobileDto = new ForgotPasswordRequestDTO(
                    "luan@example.com", RequestContext.MOBILE);
            when(userRepository.findByEmail(mobileDto.email())).thenReturn(Optional.of(user));

            authService.forgotPassword(mobileDto);

            ArgumentCaptor<String> resetUrlCaptor = ArgumentCaptor.forClass(String.class);
            verify(emailService).sendPasswordResetEmail(eq(user), resetUrlCaptor.capture(), eq(60L));

            assertThat(resetUrlCaptor.getValue()).startsWith(MOBILE_URL + "?token=");
        }

        @Test
        @DisplayName("should do nothing and not throw when the e-mail does not exist (anti-enumeration)")
        void shouldDoNothingWhenEmailDoesNotExist() {
            when(userRepository.findByEmail(desktopDto.email())).thenReturn(Optional.empty());

            authService.forgotPassword(desktopDto);

            verify(passwordResetTokenRepository, never()).save(any());
            verify(emailService, never()).sendPasswordResetEmail(any(), anyString(), anyLong());
        }

        @Test
        @DisplayName("should not propagate an exception when the e-mail fails to be sent")
        void shouldNotPropagateWhenEmailSendingFails() {
            when(userRepository.findByEmail(desktopDto.email())).thenReturn(Optional.of(user));
            doThrow(new BusinessException(
                    HttpStatus.SERVICE_UNAVAILABLE, "Falha", "EMAIL_DELIVERY_FAILED", "email", "Falha"))
                    .when(emailService).sendPasswordResetEmail(any(), anyString(), anyLong());

            authService.forgotPassword(desktopDto);

            verify(passwordResetTokenRepository).save(any(PasswordResetToken.class));
        }
    }

    @Nested
    @DisplayName("resetPassword")
    class ResetPassword {

        private final String rawToken = "raw-reset-token";

        private PasswordResetToken buildToken(UUID userId, LocalDateTime expiresAt) {
            return PasswordResetToken.builder()
                    .id(UUID.randomUUID())
                    .userId(userId)
                    .tokenHash("any-hash")
                    .expiresAt(expiresAt)
                    .build();
        }

        @Test
        @DisplayName("should update the user's password when the token is valid")
        void shouldUpdatePasswordWhenTokenIsValid() {
            ResetPasswordRequestDTO dto = new ResetPasswordRequestDTO(rawToken, "new-password", "new-password");
            PasswordResetToken token = buildToken(user.getId(), LocalDateTime.now().plusMinutes(30));

            when(passwordResetTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));
            when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
            when(passwordEncoder.encode(dto.newPassword())).thenReturn("encoded-new-password");

            authService.resetPassword(dto);

            assertThat(user.getPassword()).isEqualTo("encoded-new-password");
            verify(userRepository).save(user);
            verify(passwordResetTokenRepository).deleteByUserId(user.getId());
        }

        @Test
        @DisplayName("should throw 400 when new password and confirmation do not match")
        void shouldThrowWhenPasswordsDoNotMatch() {
            ResetPasswordRequestDTO dto = new ResetPasswordRequestDTO(rawToken, "new-password", "different");

            assertThatThrownBy(() -> authService.resetPassword(dto))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                        assertThat(businessException.getCode()).isEqualTo("PASSWORD_MISMATCH");
                    });

            verify(passwordResetTokenRepository, never()).findByTokenHash(anyString());
        }

        @Test
        @DisplayName("should throw 400 when the token does not exist")
        void shouldThrowWhenTokenDoesNotExist() {
            ResetPasswordRequestDTO dto = new ResetPasswordRequestDTO(rawToken, "new-password", "new-password");
            when(passwordResetTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.resetPassword(dto))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                        assertThat(businessException.getCode()).isEqualTo("PASSWORD_RESET_TOKEN_INVALID");
                    });
        }

        @Test
        @DisplayName("should delete and reject an expired token")
        void shouldDeleteAndRejectExpiredToken() {
            ResetPasswordRequestDTO dto = new ResetPasswordRequestDTO(rawToken, "new-password", "new-password");
            PasswordResetToken token = buildToken(user.getId(), LocalDateTime.now().minusMinutes(1));
            when(passwordResetTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));

            assertThatThrownBy(() -> authService.resetPassword(dto))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> assertThat(((BusinessException) ex).getCode())
                            .isEqualTo("PASSWORD_RESET_TOKEN_INVALID"));

            verify(passwordResetTokenRepository).delete(token);
            verify(userRepository, never()).findById(any());
        }

        @Test
        @DisplayName("should throw 400 when the token's user no longer exists")
        void shouldThrowWhenUserNoLongerExists() {
            ResetPasswordRequestDTO dto = new ResetPasswordRequestDTO(rawToken, "new-password", "new-password");
            PasswordResetToken token = buildToken(UUID.randomUUID(), LocalDateTime.now().plusMinutes(30));
            when(passwordResetTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));
            when(userRepository.findById(token.getUserId())).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.resetPassword(dto))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> assertThat(((BusinessException) ex).getCode())
                            .isEqualTo("PASSWORD_RESET_TOKEN_INVALID"));

            verify(userRepository, never()).save(any());
        }
    }

    private BusinessException catchBusinessException(Runnable runnable) {
        try {
            runnable.run();
        } catch (BusinessException ex) {
            return ex;
        }
        throw new AssertionError("Expected a BusinessException to be thrown");
    }
}
