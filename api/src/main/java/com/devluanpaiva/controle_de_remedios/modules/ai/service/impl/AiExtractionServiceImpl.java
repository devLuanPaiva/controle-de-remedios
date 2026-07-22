package com.devluanpaiva.controle_de_remedios.modules.ai.service.impl;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.devluanpaiva.controle_de_remedios.modules.ai.client.GeminiClient;
import com.devluanpaiva.controle_de_remedios.modules.ai.dto.BarcodeExtractionResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.dto.ExtractedMedicationDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.dto.ImageExtractionRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.dto.MedicineNameExtractionResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.dto.PrescriptionExtractionRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.dto.PrescriptionExtractionResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.service.AiExtractionService;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.FrequencyType;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.TreatmentType;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.UnityType;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.security.AuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiExtractionServiceImpl implements AiExtractionService {
    private static final String ESUS_MODEL = "gemini-3.1-flash-lite";
    private static final String HANDWRITTEN_MODEL = "gemini-3.5-flash";
    private static final String MEDICINE_MODEL = "gemini-3.1-flash-lite";

    private static final Pattern ISO_DATE_PATTERN = Pattern.compile("^\\d{4}-\\d{2}-\\d{2}$");
    private static final Pattern EAN_PATTERN = Pattern.compile("^\\d{8}$|^\\d{12,14}$");

    private static final List<String> UNITY_TYPE_VALUES = enumNames(UnityType.values());
    private static final List<String> FREQUENCY_TYPE_VALUES = enumNames(FrequencyType.values());
    private static final List<String> TREATMENT_TYPE_VALUES = enumNames(TreatmentType.values());

    private static final String ESUS_TYPE_INSTRUCTIONS =
            "A receita é digitalizada, no modelo e-SUS. O nome do paciente normalmente está na primeira linha do "
                    + "bloco CIDADÃO. A data de emissão costuma aparecer próxima à assinatura do médico ou no rodapé.";

    private static final String HANDWRITTEN_TYPE_INSTRUCTIONS =
            "A receita é escrita à mão por um médico. O nome do paciente normalmente aparece logo após o campo "
                    + "impresso 'Nome:'. A data normalmente aparece no campo 'Data:' na parte inferior da página. A "
                    + "caligrafia pode ser difícil de ler — faça o melhor possível e use null quando não tiver certeza.";

    private static final String BARCODE_PROMPT =
            "Atue como um leitor de código de barras. Esta imagem mostra o código de barras (EAN) impresso na caixa "
                    + "de um medicamento. Leia o número impresso em texto logo abaixo ou ao lado das barras e "
                    + "retorne apenas os dígitos desse código em JSON. Se não for possível ler o número com "
                    + "confiança, retorne null.";

    private static final String MEDICINE_NAME_PROMPT =
            "Atue como um assistente de identificação de medicamentos. Esta imagem mostra a caixa de um "
                    + "medicamento. Leia o nome comercial do medicamento impresso na caixa (ignore fabricante, "
                    + "dosagem, código de barras e outras informações) e retorne em JSON. Se não for possível "
                    + "identificar o nome com confiança, retorne null.";

    private static final Map<String, Object> BARCODE_RESPONSE_SCHEMA = Map.of(
            "type", "OBJECT",
            "properties", Map.of("codigo_ean", Map.of("type", "STRING", "nullable", true)));

    private static final Map<String, Object> MEDICINE_NAME_RESPONSE_SCHEMA = Map.of(
            "type", "OBJECT",
            "properties", Map.of("nome", Map.of("type", "STRING", "nullable", true)));

    private final GeminiClient geminiClient;
    private final SecurityContextHelper securityContextHelper;
    private final AuthorizationPolicy authorizationPolicy;
    private final ObjectMapper objectMapper;

    @Override
    public PrescriptionExtractionResponseDTO extractEsusPrescription(PrescriptionExtractionRequestDTO dto) {
        return extractPrescription(dto, ESUS_MODEL, buildPrescriptionPrompt(ESUS_TYPE_INSTRUCTIONS));
    }

    @Override
    public PrescriptionExtractionResponseDTO extractDigitalizedPrescription(PrescriptionExtractionRequestDTO dto) {
        return extractPrescription(dto, HANDWRITTEN_MODEL, buildPrescriptionPrompt(HANDWRITTEN_TYPE_INSTRUCTIONS));
    }

    @Override
    public BarcodeExtractionResponseDTO extractBarcode(ImageExtractionRequestDTO dto) {
        authorizeExtraction();

        String text = geminiClient.generateContent(
                MEDICINE_MODEL, BARCODE_PROMPT, List.of(dto.image()), BARCODE_RESPONSE_SCHEMA);

        JsonNode parsed = parseJson(text);

        if (parsed == null) {
            return new BarcodeExtractionResponseDTO(false, null);
        }

        String eanCode = textOrNull(parsed.path("codigo_ean"));

        return eanCode != null && EAN_PATTERN.matcher(eanCode).matches()
                ? new BarcodeExtractionResponseDTO(true, eanCode)
                : new BarcodeExtractionResponseDTO(false, null);
    }

    @Override
    public MedicineNameExtractionResponseDTO extractMedicineName(ImageExtractionRequestDTO dto) {
        authorizeExtraction();

        String text = geminiClient.generateContent(
                MEDICINE_MODEL, MEDICINE_NAME_PROMPT, List.of(dto.image()), MEDICINE_NAME_RESPONSE_SCHEMA);

        JsonNode parsed = parseJson(text);
        String name = parsed == null ? null : textOrNull(parsed.path("nome"));

        return name != null
                ? new MedicineNameExtractionResponseDTO(true, name)
                : new MedicineNameExtractionResponseDTO(false, null);
    }

    private PrescriptionExtractionResponseDTO extractPrescription(
            PrescriptionExtractionRequestDTO dto, String model, String prompt) {

        authorizeExtraction();

        String text = geminiClient.generateContent(model, prompt, dto.images(), prescriptionResponseSchema());
        JsonNode parsed = parseJson(text);

        if (parsed == null) {
            return unavailablePrescription();
        }

        String patientName = textOrNull(parsed.path("paciente"));
        String issueDate = isoDateOrNull(parsed.path("data_emissao"));
        List<ExtractedMedicationDTO> medications = parseMedications(parsed.path("medicamentos"));

        if (patientName == null && issueDate == null && medications.isEmpty()) {
            return unavailablePrescription();
        }

        return new PrescriptionExtractionResponseDTO(true, patientName, issueDate, medications);
    }

    private void authorizeExtraction() {
        User actor = securityContextHelper.getCurrentUser();
        authorizationPolicy.requireAdminOrRolesWithCondition(actor, Set.of(UserRole.MANAGER, UserRole.ASSISTANT), () -> true);
    }

    private List<ExtractedMedicationDTO> parseMedications(JsonNode medicamentos) {
        if (!medicamentos.isArray()) {
            return List.of();
        }

        List<ExtractedMedicationDTO> medications = new ArrayList<>();

        for (JsonNode medication : medicamentos) {
            String name = textOrNull(medication.path("nome"));

            if (name == null) {
                continue;
            }

            medications.add(new ExtractedMedicationDTO(
                    name,
                    textOrNull(medication.path("codigo_ean")),
                    textOrNull(medication.path("dosagem")),
                    integerOrNull(medication.path("quantidade_prescrita")),
                    enumOrNull(medication.path("unidade"), UnityType.class),
                    integerOrNull(medication.path("frequencia")),
                    enumOrNull(medication.path("tipo_frequencia"), FrequencyType.class),
                    enumOrNull(medication.path("tipo_tratamento"), TreatmentType.class),
                    integerOrNull(medication.path("dias_tratamento"))));
        }

        return medications;
    }

    private JsonNode parseJson(String text) {
        if (!StringUtils.hasText(text)) {
            return null;
        }

        try {
            return objectMapper.readTree(text);
        } catch (Exception ex) {
            log.error("Resposta do Gemini não é um JSON válido", ex);
            return null;
        }
    }

    private String textOrNull(JsonNode node) {
        String value = node.isTextual() ? node.asText().trim() : null;
        return StringUtils.hasText(value) ? value : null;
    }

    private String isoDateOrNull(JsonNode node) {
        String value = textOrNull(node);
        return value != null && ISO_DATE_PATTERN.matcher(value).matches() ? value : null;
    }

    private Integer integerOrNull(JsonNode node) {
        return node.isNumber() ? node.asInt() : null;
    }

    private <T extends Enum<T>> T enumOrNull(JsonNode node, Class<T> enumType) {
        String value = textOrNull(node);

        if (value == null) {
            return null;
        }

        try {
            return Enum.valueOf(enumType, value);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private PrescriptionExtractionResponseDTO unavailablePrescription() {
        return new PrescriptionExtractionResponseDTO(false, null, null, List.of());
    }

    private static String buildPrescriptionPrompt(String typeInstructions) {
        return "Atue como um assistente de extração de dados médicos. Analise a(s) imagem(ns) desta receita "
                + "médica e extraia as informações solicitadas em JSON. Cada imagem pode ser uma página diferente "
                + "do mesmo receituário: combine as informações de todas as páginas em um único resultado, sem "
                + "duplicar medicamentos que apareçam repetidos.\n\n"
                + "Regras de extração:\n"
                + "1. paciente: nome completo do paciente (ignore números de documentos, endereços ou CPFs que "
                + "venham junto).\n"
                + "2. data_emissao: data em que a receita foi emitida, sempre normalizada para o formato ISO "
                + "yyyy-MM-dd. Se a data estiver incompleta ou ilegível, retorne null.\n"
                + "3. medicamentos: lista de objetos, um por medicamento prescrito. Para cada um, extraia:\n"
                + "   - nome: o nome do medicamento.\n"
                + "   - codigo_ean: código de barras/EAN do medicamento, apenas se estiver explicitamente impresso "
                + "na receita.\n"
                + "   - dosagem: apenas a concentração do medicamento (ex: '500mg', '20mg/mL', '1g'). Não inclua "
                + "via de administração, frequência ou duração do tratamento — essas informações já são extraídas "
                + "separadamente nos campos quantidade_prescrita, unidade, frequencia, tipo_frequencia, "
                + "tipo_tratamento e dias_tratamento.\n"
                + "   - quantidade_prescrita: a quantidade total prescrita, como número inteiro (ex: 60).\n"
                + "   - unidade: classifique a unidade da quantidade prescrita em um destes valores: "
                + String.join(", ", UNITY_TYPE_VALUES) + ".\n"
                + "   - frequencia: o número de vezes que o medicamento deve ser usado por dia/semana/mês, como "
                + "número inteiro.\n"
                + "   - tipo_frequencia: classifique o período da frequência em um destes valores: "
                + String.join(", ", FREQUENCY_TYPE_VALUES) + ".\n"
                + "   - tipo_tratamento: classifique a duração do tratamento em um destes valores: "
                + String.join(", ", TREATMENT_TYPE_VALUES) + ".\n"
                + "   - dias_tratamento: a quantidade de dias de tratamento, como número inteiro. Se o tratamento "
                + "for contínuo e não houver prazo definido, estime um valor razoável (ex: 30).\n"
                + "Sempre que um campo estruturado (unidade, quantidade_prescrita, frequencia, tipo_frequencia, "
                + "tipo_tratamento, dias_tratamento) não puder ser lido diretamente da receita, faça sua melhor "
                + "estimativa clínica com base no texto disponível em vez de retornar null — esses campos serão "
                + "revisados por um farmacêutico antes de confirmar o cadastro. Use null apenas quando realmente "
                + "não houver nenhuma informação para basear uma estimativa.\n\n"
                + typeInstructions;
    }

    private static Map<String, Object> prescriptionResponseSchema() {
        Map<String, Object> medicationProperties = Map.of(
                "nome", Map.of("type", "STRING"),
                "codigo_ean", Map.of("type", "STRING", "nullable", true),
                "dosagem", Map.of("type", "STRING", "nullable", true),
                "quantidade_prescrita", Map.of("type", "INTEGER", "nullable", true),
                "unidade", Map.of("type", "STRING", "enum", UNITY_TYPE_VALUES, "nullable", true),
                "frequencia", Map.of("type", "INTEGER", "nullable", true),
                "tipo_frequencia", Map.of("type", "STRING", "enum", FREQUENCY_TYPE_VALUES, "nullable", true),
                "tipo_tratamento", Map.of("type", "STRING", "enum", TREATMENT_TYPE_VALUES, "nullable", true),
                "dias_tratamento", Map.of("type", "INTEGER", "nullable", true));

        Map<String, Object> medicationItem = Map.of(
                "type", "OBJECT",
                "properties", medicationProperties,
                "required", List.of("nome"));

        Map<String, Object> medicamentos = Map.of(
                "type", "ARRAY",
                "items", medicationItem);

        Map<String, Object> properties = Map.of(
                "paciente", Map.of("type", "STRING", "nullable", true),
                "data_emissao", Map.of("type", "STRING", "nullable", true),
                "medicamentos", medicamentos);

        return Map.of(
                "type", "OBJECT",
                "properties", properties,
                "required", List.of("medicamentos"));
    }

    private static List<String> enumNames(Enum<?>[] values) {
        return Arrays.stream(values).map(Enum::name).collect(Collectors.toUnmodifiableList());
    }
}
