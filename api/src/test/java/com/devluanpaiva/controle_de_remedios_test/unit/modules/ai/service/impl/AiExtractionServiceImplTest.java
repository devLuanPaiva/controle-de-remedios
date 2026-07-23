package com.devluanpaiva.controle_de_remedios_test.unit.modules.ai.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.UUID;

import org.assertj.core.api.ThrowableAssert.ThrowingCallable;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import com.devluanpaiva.controle_de_remedios.modules.ai.client.GeminiClient;
import com.devluanpaiva.controle_de_remedios.modules.ai.dto.BarcodeExtractionResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.dto.ImageExtractionRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.dto.MedicineNameExtractionResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.dto.PrescriptionExtractionRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.dto.PrescriptionExtractionResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.service.impl.AiExtractionServiceImpl;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.security.AuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@ExtendWith(MockitoExtension.class)
@DisplayName("AiExtractionServiceImpl")
class AiExtractionServiceImplTest {

        private static final String ESUS_MODEL = "gemini-3.1-flash-lite";
        private static final String HANDWRITTEN_MODEL = "gemini-2.5-flash";

        @Mock
        private GeminiClient geminiClient;

        @Mock
        private SecurityContextHelper securityContextHelper;

        private AiExtractionServiceImpl aiExtractionService;

        @BeforeEach
        void setUp() {
                ObjectMapper objectMapper = JsonMapper.builder().build();

                aiExtractionService = new AiExtractionServiceImpl(
                                geminiClient, securityContextHelper, new AuthorizationPolicy(), objectMapper);
        }

        private User buildUser(UserRole role) {
                return User.builder()
                                .id(UUID.randomUUID())
                                .name("User " + role.name())
                                .email(role.name().toLowerCase() + "." + UUID.randomUUID() + "@example.com")
                                .password("encoded-password")
                                .cpf("11144477735")
                                .role(role)
                                .build();
        }

        private void mockActor(UserRole role) {
                when(securityContextHelper.getCurrentUser()).thenReturn(buildUser(role));
        }

        private void assertForbidden(ThrowingCallable callable) {
                assertThatThrownBy(callable)
                                .isInstanceOf(BusinessException.class)
                                .satisfies(ex -> {
                                        BusinessException businessException = (BusinessException) ex;
                                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                                        assertThat(businessException.getCode()).isEqualTo("AUTH_FORBIDDEN");
                                });
        }

        private void stubGeminiResponse(String jsonText) {
                when(geminiClient.generateContent(anyString(), anyString(), anyList(), anyMap())).thenReturn(jsonText);
        }

        @Nested
        @DisplayName("extractEsusPrescription")
        class ExtractEsusPrescription {

                @Test
                @DisplayName("should extract a complete prescription with multiple medications")
                void shouldExtractCompletePrescriptionSuccessfully() {
                        mockActor(UserRole.MANAGER);
                        stubGeminiResponse("""
                                        {
                                          "paciente": "Maria da Silva",
                                          "data_emissao": "2024-03-10",
                                          "medicamentos": [
                                            {
                                              "nome": "Dipirona",
                                              "codigo_ean": "7891234567890",
                                              "dosagem": "500mg",
                                              "quantidade_prescrita": 30,
                                              "unidade": "TABLET",
                                              "frequencia": 2,
                                              "tipo_frequencia": "PER_DAY",
                                              "tipo_tratamento": "SHORT_TERM",
                                              "dias_tratamento": 15
                                            },
                                            {
                                              "nome": "Losartana",
                                              "codigo_ean": null,
                                              "dosagem": "50mg",
                                              "quantidade_prescrita": 60,
                                              "unidade": "TABLET",
                                              "frequencia": 1,
                                              "tipo_frequencia": "PER_DAY",
                                              "tipo_tratamento": "CONTINUOUS",
                                              "dias_tratamento": 30
                                            }
                                          ]
                                        }
                                        """);

                        PrescriptionExtractionRequestDTO dto = new PrescriptionExtractionRequestDTO(
                                        List.of("base64page1"));

                        PrescriptionExtractionResponseDTO response = aiExtractionService.extractEsusPrescription(dto);

                        assertThat(response.available()).isTrue();
                        assertThat(response.patientName()).isEqualTo("Maria da Silva");
                        assertThat(response.issueDate()).isEqualTo("2024-03-10");
                        assertThat(response.medications()).hasSize(2);
                        assertThat(response.medications().get(0).name()).isEqualTo("Dipirona");
                        assertThat(response.medications().get(0).eanCode()).isEqualTo("7891234567890");
                        assertThat(response.medications().get(1).eanCode()).isNull();
                }

                @Test
                @DisplayName("should call Gemini with the e-SUS model")
                void shouldUseEsusModel() {
                        mockActor(UserRole.MANAGER);
                        stubGeminiResponse(
                                        """
                                                        {"paciente":"Ana","data_emissao":"2024-01-01","medicamentos":[{"nome":"Dipirona"}]}
                                                        """);

                        PrescriptionExtractionRequestDTO dto = new PrescriptionExtractionRequestDTO(
                                        List.of("base64page1"));
                        aiExtractionService.extractEsusPrescription(dto);

                        verify(geminiClient).generateContent(eq(ESUS_MODEL), anyString(), eq(dto.images()), anyMap());
                }

                @Test
                @DisplayName("should return unavailable when Gemini returns null")
                void shouldReturnUnavailableWhenGeminiReturnsNull() {
                        mockActor(UserRole.MANAGER);
                        stubGeminiResponse(null);

                        PrescriptionExtractionResponseDTO response = aiExtractionService.extractEsusPrescription(
                                        new PrescriptionExtractionRequestDTO(List.of("base64page1")));

                        assertThat(response.available()).isFalse();
                        assertThat(response.patientName()).isNull();
                        assertThat(response.issueDate()).isNull();
                        assertThat(response.medications()).isEmpty();
                }

                @Test
                @DisplayName("should return unavailable when Gemini response is not valid JSON")
                void shouldReturnUnavailableWhenResponseIsNotJson() {
                        mockActor(UserRole.MANAGER);
                        stubGeminiResponse("isso não é JSON");

                        PrescriptionExtractionResponseDTO response = aiExtractionService.extractEsusPrescription(
                                        new PrescriptionExtractionRequestDTO(List.of("base64page1")));

                        assertThat(response.available()).isFalse();
                }

                @Test
                @DisplayName("should return unavailable when every field is empty even though the JSON parses")
                void shouldReturnUnavailableWhenAllFieldsAreEmpty() {
                        mockActor(UserRole.MANAGER);
                        stubGeminiResponse("""
                                        {"paciente": null, "data_emissao": null, "medicamentos": []}
                                        """);

                        PrescriptionExtractionResponseDTO response = aiExtractionService.extractEsusPrescription(
                                        new PrescriptionExtractionRequestDTO(List.of("base64page1")));

                        assertThat(response.available()).isFalse();
                }

                @Test
                @DisplayName("should return unavailable when medicamentos is not an array and nothing else was extracted")
                void shouldReturnUnavailableWhenMedicationsFieldIsNotAnArray() {
                        mockActor(UserRole.MANAGER);
                        stubGeminiResponse("""
                                        {"paciente": null, "data_emissao": null, "medicamentos": null}
                                        """);

                        PrescriptionExtractionResponseDTO response = aiExtractionService.extractEsusPrescription(
                                        new PrescriptionExtractionRequestDTO(List.of("base64page1")));

                        assertThat(response.available()).isFalse();
                        assertThat(response.medications()).isEmpty();
                }

                @Test
                @DisplayName("should normalize a non-ISO issue date to null without discarding the rest")
                void shouldNormalizeInvalidIsoDateToNull() {
                        mockActor(UserRole.MANAGER);
                        stubGeminiResponse(
                                        """
                                                        {"paciente": "João", "data_emissao": "10/03/2024", "medicamentos": [{"nome":"Dipirona"}]}
                                                        """);

                        PrescriptionExtractionResponseDTO response = aiExtractionService.extractEsusPrescription(
                                        new PrescriptionExtractionRequestDTO(List.of("base64page1")));

                        assertThat(response.available()).isTrue();
                        assertThat(response.patientName()).isEqualTo("João");
                        assertThat(response.issueDate()).isNull();
                }

                @Test
                @DisplayName("should skip medication items without a name")
                void shouldSkipMedicationItemMissingName() {
                        mockActor(UserRole.MANAGER);
                        stubGeminiResponse("""
                                        {
                                          "paciente": "Ana",
                                          "data_emissao": "2024-01-01",
                                          "medicamentos": [
                                            {"nome": "Dipirona"},
                                            {"codigo_ean": "12345678"}
                                          ]
                                        }
                                        """);

                        PrescriptionExtractionResponseDTO response = aiExtractionService.extractEsusPrescription(
                                        new PrescriptionExtractionRequestDTO(List.of("base64page1")));

                        assertThat(response.medications()).hasSize(1);
                        assertThat(response.medications().get(0).name()).isEqualTo("Dipirona");
                }

                @Test
                @DisplayName("should map an unknown/hallucinated enum value to null instead of failing")
                void shouldMapUnknownEnumValueToNull() {
                        mockActor(UserRole.MANAGER);
                        stubGeminiResponse("""
                                        {
                                          "paciente": "Ana",
                                          "data_emissao": "2024-01-01",
                                          "medicamentos": [{"nome": "Xarope", "unidade": "GARRAFAO"}]
                                        }
                                        """);

                        PrescriptionExtractionResponseDTO response = aiExtractionService.extractEsusPrescription(
                                        new PrescriptionExtractionRequestDTO(List.of("base64page1")));

                        assertThat(response.medications()).hasSize(1);
                        assertThat(response.medications().get(0).unityType()).isNull();
                }

                @Test
                @DisplayName("should map a non-numeric quantity to null instead of failing")
                void shouldMapNonNumericQuantityToNull() {
                        mockActor(UserRole.MANAGER);
                        stubGeminiResponse("""
                                        {
                                          "paciente": "Ana",
                                          "data_emissao": "2024-01-01",
                                          "medicamentos": [{"nome": "Xarope", "quantidade_prescrita": "trinta"}]
                                        }
                                        """);

                        PrescriptionExtractionResponseDTO response = aiExtractionService.extractEsusPrescription(
                                        new PrescriptionExtractionRequestDTO(List.of("base64page1")));

                        assertThat(response.medications()).hasSize(1);
                        assertThat(response.medications().get(0).prescribedQuantity()).isNull();
                }

                @Test
                @DisplayName("should deny a PATIENT user without calling Gemini")
                void shouldDenyPatientRole() {
                        mockActor(UserRole.PATIENT);

                        assertForbidden(() -> aiExtractionService.extractEsusPrescription(
                                        new PrescriptionExtractionRequestDTO(List.of("base64page1"))));

                        verifyNoInteractions(geminiClient);
                }
        }

        @Nested
        @DisplayName("extractDigitalizedPrescription")
        class ExtractDigitalizedPrescription {

                @Test
                @DisplayName("should call Gemini with the handwritten model, different from the e-SUS model")
                void shouldUseHandwrittenModel() {
                        mockActor(UserRole.MANAGER);
                        stubGeminiResponse(
                                        """
                                                        {"paciente":"Ana","data_emissao":"2024-01-01","medicamentos":[{"nome":"Dipirona"}]}
                                                        """);

                        PrescriptionExtractionRequestDTO dto = new PrescriptionExtractionRequestDTO(
                                        List.of("base64page1"));
                        aiExtractionService.extractDigitalizedPrescription(dto);

                        verify(geminiClient).generateContent(eq(HANDWRITTEN_MODEL), anyString(), eq(dto.images()),
                                        anyMap());
                }

                @Test
                @DisplayName("should return unavailable when Gemini returns null")
                void shouldReturnUnavailableWhenGeminiReturnsNull() {
                        mockActor(UserRole.MANAGER);
                        stubGeminiResponse(null);

                        PrescriptionExtractionResponseDTO response = aiExtractionService.extractDigitalizedPrescription(
                                        new PrescriptionExtractionRequestDTO(List.of("base64page1")));

                        assertThat(response.available()).isFalse();
                }

                @Test
                @DisplayName("should deny a PATIENT user without calling Gemini")
                void shouldDenyPatientRole() {
                        mockActor(UserRole.PATIENT);

                        assertForbidden(() -> aiExtractionService.extractDigitalizedPrescription(
                                        new PrescriptionExtractionRequestDTO(List.of("base64page1"))));

                        verifyNoInteractions(geminiClient);
                }
        }

        @Nested
        @DisplayName("extractBarcode")
        class ExtractBarcode {

                @Test
                @DisplayName("should accept an 8-digit EAN")
                void shouldReturnAvailableForValid8DigitEan() {
                        mockActor(UserRole.MANAGER);
                        stubGeminiResponse("""
                                        {"codigo_ean": "12345678"}
                                        """);

                        BarcodeExtractionResponseDTO response = aiExtractionService.extractBarcode(
                                        new ImageExtractionRequestDTO("base64img"));

                        assertThat(response.available()).isTrue();
                        assertThat(response.eanCode()).isEqualTo("12345678");
                }

                @Test
                @DisplayName("should accept a 13-digit EAN")
                void shouldReturnAvailableForValid13DigitEan() {
                        mockActor(UserRole.MANAGER);
                        stubGeminiResponse("""
                                        {"codigo_ean": "1234567890128"}
                                        """);

                        BarcodeExtractionResponseDTO response = aiExtractionService.extractBarcode(
                                        new ImageExtractionRequestDTO("base64img"));

                        assertThat(response.available()).isTrue();
                        assertThat(response.eanCode()).isEqualTo("1234567890128");
                }

                @Test
                @DisplayName("should reject a code that does not match the EAN length pattern")
                void shouldReturnUnavailableForInvalidEanFormat() {
                        mockActor(UserRole.MANAGER);
                        stubGeminiResponse("""
                                        {"codigo_ean": "123456789"}
                                        """);

                        BarcodeExtractionResponseDTO response = aiExtractionService.extractBarcode(
                                        new ImageExtractionRequestDTO("base64img"));

                        assertThat(response.available()).isFalse();
                        assertThat(response.eanCode()).isNull();
                }

                @Test
                @DisplayName("should return unavailable when codigo_ean is null")
                void shouldReturnUnavailableWhenEanIsNull() {
                        mockActor(UserRole.MANAGER);
                        stubGeminiResponse("""
                                        {"codigo_ean": null}
                                        """);

                        BarcodeExtractionResponseDTO response = aiExtractionService.extractBarcode(
                                        new ImageExtractionRequestDTO("base64img"));

                        assertThat(response.available()).isFalse();
                }

                @Test
                @DisplayName("should return unavailable when Gemini returns null")
                void shouldReturnUnavailableWhenGeminiReturnsNull() {
                        mockActor(UserRole.MANAGER);
                        stubGeminiResponse(null);

                        BarcodeExtractionResponseDTO response = aiExtractionService.extractBarcode(
                                        new ImageExtractionRequestDTO("base64img"));

                        assertThat(response.available()).isFalse();
                        assertThat(response.eanCode()).isNull();
                }

                @Test
                @DisplayName("should allow ADMIN, MANAGER and ASSISTANT roles")
                void shouldAllowAuthorizedRoles() {
                        for (UserRole role : List.of(UserRole.ADMIN, UserRole.MANAGER, UserRole.ASSISTANT)) {
                                when(securityContextHelper.getCurrentUser()).thenReturn(buildUser(role));
                                when(geminiClient.generateContent(anyString(), anyString(), anyList(), anyMap()))
                                                .thenReturn("{\"codigo_ean\": \"12345678\"}");

                                BarcodeExtractionResponseDTO response = aiExtractionService.extractBarcode(
                                                new ImageExtractionRequestDTO("base64img"));

                                assertThat(response.available())
                                                .as("role %s should be authorized", role)
                                                .isTrue();
                        }
                }

                @Test
                @DisplayName("should deny a PATIENT user without calling Gemini")
                void shouldDenyPatientRole() {
                        mockActor(UserRole.PATIENT);

                        assertForbidden(() -> aiExtractionService
                                        .extractBarcode(new ImageExtractionRequestDTO("base64img")));

                        verifyNoInteractions(geminiClient);
                }
        }

        @Nested
        @DisplayName("extractMedicineName")
        class ExtractMedicineName {

                @Test
                @DisplayName("should return the extracted medicine name")
                void shouldReturnAvailableWhenNameExtractedSuccessfully() {
                        mockActor(UserRole.MANAGER);
                        stubGeminiResponse("""
                                        {"nome": "Paracetamol"}
                                        """);

                        MedicineNameExtractionResponseDTO response = aiExtractionService.extractMedicineName(
                                        new ImageExtractionRequestDTO("base64img"));

                        assertThat(response.available()).isTrue();
                        assertThat(response.name()).isEqualTo("Paracetamol");
                }

                @Test
                @DisplayName("should treat a blank name as unavailable")
                void shouldReturnUnavailableWhenNameIsBlank() {
                        mockActor(UserRole.MANAGER);
                        stubGeminiResponse("""
                                        {"nome": "   "}
                                        """);

                        MedicineNameExtractionResponseDTO response = aiExtractionService.extractMedicineName(
                                        new ImageExtractionRequestDTO("base64img"));

                        assertThat(response.available()).isFalse();
                        assertThat(response.name()).isNull();
                }

                @Test
                @DisplayName("should return unavailable when Gemini returns null")
                void shouldReturnUnavailableWhenGeminiReturnsNull() {
                        mockActor(UserRole.MANAGER);
                        stubGeminiResponse(null);

                        MedicineNameExtractionResponseDTO response = aiExtractionService.extractMedicineName(
                                        new ImageExtractionRequestDTO("base64img"));

                        assertThat(response.available()).isFalse();
                }

                @Test
                @DisplayName("should deny a PATIENT user without calling Gemini")
                void shouldDenyPatientRole() {
                        mockActor(UserRole.PATIENT);

                        assertForbidden(() -> aiExtractionService
                                        .extractMedicineName(new ImageExtractionRequestDTO("base64img")));

                        verifyNoInteractions(geminiClient);
                }
        }
}
