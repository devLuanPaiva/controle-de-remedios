import { GEMINI_API_KEY } from "@/lib/env";
import { createLocalId } from "@/lib/createLocalId";
import { FrequencyType, TreatmentType, UnityType } from "@/data/models/prescription-item.model";

const MAX_ATTEMPTS = 5;
const RETRY_BACKOFF_MS = 1_500;
const RETRYABLE_STATUSES = new Set([429, 503]);
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const EAN_PATTERN = /^\d{8}$|^\d{12,14}$/;
const LOG_PREFIX = "[Gemini]";

const MEDICINE_MODEL = "gemini-3.1-flash-lite";
const MEDICINE_TIMEOUT_MS = 10_000;

export type PrescriptionType = "DIGITAL" | "HANDWRITTEN";

const EXTRACTION_MODEL_BY_TYPE: Record<PrescriptionType, string> = {
    DIGITAL: "gemini-3.1-flash-lite",
    HANDWRITTEN: "gemini-3.5-flash",
};

const EXTRACTION_TIMEOUT_MS_BY_TYPE: Record<PrescriptionType, number> = {
    DIGITAL: 15_000,
    HANDWRITTEN: 25_000,
};

function buildEndpoint(model: string): string {
    return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

export interface ExtractedMedication {
    localId: string;
    name: string;
    eanCode: string | null;
    dosage: string | null;
    prescribedQuantity: number | null;
    unityType: UnityType | null;
    frequency: number | null;
    frequencyType: FrequencyType | null;
    treatmentType: TreatmentType | null;
    treatmentDays: number | null;
}

export interface ExtractedPrescriptionData {
    patientName: string | null;
    issueDate: string | null;
    medications: ExtractedMedication[];
}

export type ExtractionResult =
    | { status: "success"; data: ExtractedPrescriptionData }
    | { status: "unavailable" };

interface RawMedication {
    nome?: unknown;
    codigo_ean?: unknown;
    dosagem?: unknown;
    quantidade_prescrita?: unknown;
    unidade?: unknown;
    frequencia?: unknown;
    tipo_frequencia?: unknown;
    tipo_tratamento?: unknown;
    dias_tratamento?: unknown;
}

interface RawExtraction {
    paciente?: unknown;
    data_emissao?: unknown;
    medicamentos?: unknown;
}

const UNITY_TYPE_VALUES = Object.values(UnityType);
const FREQUENCY_TYPE_VALUES = Object.values(FrequencyType);
const TREATMENT_TYPE_VALUES = Object.values(TreatmentType);

const RESPONSE_SCHEMA = {
    type: "OBJECT",
    properties: {
        paciente: { type: "STRING", nullable: true },
        data_emissao: { type: "STRING", nullable: true },
        medicamentos: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    nome: { type: "STRING" },
                    codigo_ean: { type: "STRING", nullable: true },
                    dosagem: { type: "STRING", nullable: true },
                    quantidade_prescrita: { type: "INTEGER", nullable: true },
                    unidade: { type: "STRING", enum: UNITY_TYPE_VALUES, nullable: true },
                    frequencia: { type: "INTEGER", nullable: true },
                    tipo_frequencia: { type: "STRING", enum: FREQUENCY_TYPE_VALUES, nullable: true },
                    tipo_tratamento: { type: "STRING", enum: TREATMENT_TYPE_VALUES, nullable: true },
                    dias_tratamento: { type: "INTEGER", nullable: true },
                },
                required: ["nome"],
            },
        },
    },
    required: ["medicamentos"],
};

const BASE_INSTRUCTIONS =
    "Atue como um assistente de extração de dados médicos. Analise a(s) imagem(ns) desta receita médica " +
    "e extraia as informações solicitadas em JSON. Cada imagem pode ser uma página diferente do mesmo " +
    "receituário: combine as informações de todas as páginas em um único resultado, sem duplicar " +
    "medicamentos que apareçam repetidos.\n\n" +
    "Regras de extração:\n" +
    "1. paciente: nome completo do paciente (ignore números de documentos, endereços ou CPFs que venham junto).\n" +
    "2. data_emissao: data em que a receita foi emitida, sempre normalizada para o formato ISO yyyy-MM-dd. " +
    "Se a data estiver incompleta ou ilegível, retorne null.\n" +
    "3. medicamentos: lista de objetos, um por medicamento prescrito. Para cada um, extraia:\n" +
    "   - nome: o nome do medicamento.\n" +
    "   - codigo_ean: código de barras/EAN do medicamento, apenas se estiver explicitamente impresso na receita.\n" +
    "   - dosagem: a forma, concentração ou instrução de uso resumida (ex: '1 comprimido de 500mg a cada 8 horas').\n" +
    "   - quantidade_prescrita: a quantidade total prescrita, como número inteiro (ex: 60).\n" +
    "   - unidade: classifique a unidade da quantidade prescrita em um destes valores: " +
    `${UNITY_TYPE_VALUES.join(", ")}.\n` +
    "   - frequencia: o número de vezes que o medicamento deve ser usado por dia/semana/mês, como número inteiro.\n" +
    "   - tipo_frequencia: classifique o período da frequência em um destes valores: " +
    `${FREQUENCY_TYPE_VALUES.join(", ")}.\n` +
    "   - tipo_tratamento: classifique a duração do tratamento em um destes valores: " +
    `${TREATMENT_TYPE_VALUES.join(", ")}.\n` +
    "   - dias_tratamento: a quantidade de dias de tratamento, como número inteiro. Se o tratamento for contínuo " +
    "e não houver prazo definido, estime um valor razoável (ex: 30).\n" +
    "Sempre que um campo estruturado (unidade, quantidade_prescrita, frequencia, tipo_frequencia, tipo_tratamento, " +
    "dias_tratamento) não puder ser lido diretamente da receita, faça sua melhor estimativa clínica com base no " +
    "texto disponível em vez de retornar null — esses campos serão revisados por um farmacêutico antes de " +
    "confirmar o cadastro. Use null apenas quando realmente não houver nenhuma informação para basear uma " +
    "estimativa.\n\n";

const TYPE_INSTRUCTIONS: Record<PrescriptionType, string> = {
    DIGITAL:
        "A receita é digitalizada, no modelo e-SUS. O nome do paciente normalmente está na primeira linha do " +
        "bloco CIDADÃO. A data de emissão costuma aparecer próxima à assinatura do médico ou no rodapé.",
    HANDWRITTEN:
        "A receita é escrita à mão por um médico. O nome do paciente normalmente aparece logo após o campo " +
        "impresso 'Nome:'. A data normalmente aparece no campo 'Data:' na parte inferior da página. A caligrafia " +
        "pode ser difícil de ler — faça o melhor possível e use null quando não tiver certeza.",
};

function buildPrompt(type: PrescriptionType): string {
    return `${BASE_INSTRUCTIONS}${TYPE_INSTRUCTIONS[type]}`;
}

function redactKey(url: string): string {
    return url.replace(/key=[^&]+/, "key=***");
}

function elapsedMs(startedAt: number): number {
    return Date.now() - startedAt;
}

async function readResponseBody(response: Response): Promise<unknown> {
    const raw = await response.text();

    try {
        return JSON.parse(raw);
    } catch {
        return raw;
    }
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

interface GeminiCallParams {
    label: string;
    url: string;
    body: unknown;
    timeoutMs: number;
    maxAttempts?: number;
}

type GeminiAttemptOutcome =
    | { outcome: "success"; text: string }
    | { outcome: "retry" }
    | { outcome: "fail" };

async function attemptGeminiCall(
    label: string,
    url: string,
    body: unknown,
    timeoutMs: number,
    attempt: number,
    maxAttempts: number,
): Promise<GeminiAttemptOutcome> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const startedAt = Date.now();

    console.log(`${LOG_PREFIX} ${label} request -> attempt ${attempt}/${maxAttempts} POST ${redactKey(url)}`);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify(body),
        });

        console.log(
            `${LOG_PREFIX} ${label} response <- HTTP ${response.status} ` +
                `(${elapsedMs(startedAt)}ms, attempt ${attempt}/${maxAttempts})`,
            Object.fromEntries(response.headers.entries()),
        );

        if (!response.ok) {
            console.error(`${LOG_PREFIX} ${label} response <- error body`, await readResponseBody(response));
            return RETRYABLE_STATUSES.has(response.status) ? { outcome: "retry" } : { outcome: "fail" };
        }

        const responseBody = await response.json();
        console.log(`${LOG_PREFIX} ${label} response <- raw body`, JSON.stringify(responseBody));

        const finishReason = responseBody?.candidates?.[0]?.finishReason;

        if (finishReason) {
            console.log(`${LOG_PREFIX} ${label} response <- finishReason`, finishReason);
        }

        const text = responseBody?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (typeof text !== "string") {
            console.error(`${LOG_PREFIX} ${label} response <- missing text payload`, responseBody);
            return { outcome: "fail" };
        }

        console.log(`${LOG_PREFIX} ${label} response <- text`, text);

        return { outcome: "success", text };
    } catch (error) {
        console.error(
            `${LOG_PREFIX} ${label} failed after ${elapsedMs(startedAt)}ms (attempt ${attempt}/${maxAttempts})`,
            error,
        );

        return { outcome: "retry" };
    } finally {
        clearTimeout(timeout);
    }
}

async function callGeminiWithRetry({
    label,
    url,
    body,
    timeoutMs,
    maxAttempts = MAX_ATTEMPTS,
}: GeminiCallParams): Promise<string | null> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const result = await attemptGeminiCall(label, url, body, timeoutMs, attempt, maxAttempts);

        if (result.outcome === "success") {
            return result.text;
        }

        if (result.outcome === "retry" && attempt < maxAttempts) {
            await delay(RETRY_BACKOFF_MS * attempt);
            continue;
        }

        return null;
    }

    return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function parseEnum<T extends string>(value: unknown, allowed: readonly T[]): T | null {
    return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : null;
}

function parseInteger(value: unknown): number | null {
    return typeof value === "number" && Number.isFinite(value) ? Math.round(value) : null;
}

function parseMedication(raw: unknown): ExtractedMedication | null {
    if (!isRecord(raw)) {
        return null;
    }

    const medication = raw as RawMedication;

    if (typeof medication.nome !== "string" || !medication.nome.trim()) {
        return null;
    }

    return {
        localId: createLocalId("medication"),
        name: medication.nome.trim(),
        eanCode: typeof medication.codigo_ean === "string" && medication.codigo_ean.trim()
            ? medication.codigo_ean.trim()
            : null,
        dosage: typeof medication.dosagem === "string" && medication.dosagem.trim()
            ? medication.dosagem.trim()
            : null,
        prescribedQuantity: parseInteger(medication.quantidade_prescrita),
        unityType: parseEnum(medication.unidade, UNITY_TYPE_VALUES),
        frequency: parseInteger(medication.frequencia),
        frequencyType: parseEnum(medication.tipo_frequencia, FREQUENCY_TYPE_VALUES),
        treatmentType: parseEnum(medication.tipo_tratamento, TREATMENT_TYPE_VALUES),
        treatmentDays: parseInteger(medication.dias_tratamento),
    };
}

function parseExtraction(raw: unknown): ExtractedPrescriptionData | null {
    if (!isRecord(raw)) {
        return null;
    }

    const extraction = raw as RawExtraction;

    const medications = Array.isArray(extraction.medicamentos)
        ? extraction.medicamentos.map(parseMedication).filter((item): item is ExtractedMedication => item !== null)
        : [];

    const patientName = typeof extraction.paciente === "string" && extraction.paciente.trim()
        ? extraction.paciente.trim()
        : null;

    const issueDate = typeof extraction.data_emissao === "string" && ISO_DATE_PATTERN.test(extraction.data_emissao)
        ? extraction.data_emissao
        : null;

    if (!patientName && !issueDate && medications.length === 0) {
        return null;
    }

    return { patientName, issueDate, medications };
}

export async function extractPrescriptionData(
    pages: { base64: string }[],
    type: PrescriptionType,
): Promise<ExtractionResult> {
    if (!GEMINI_API_KEY) {
        console.warn(`${LOG_PREFIX} extraction skipped -> GEMINI_API_KEY is not configured`);
        return { status: "unavailable" };
    }

    if (pages.length === 0) {
        console.warn(`${LOG_PREFIX} extraction skipped -> no pages provided`);
        return { status: "unavailable" };
    }

    const model = EXTRACTION_MODEL_BY_TYPE[type];
    const timeoutMs = EXTRACTION_TIMEOUT_MS_BY_TYPE[type];
    const url = `${buildEndpoint(model)}?key=${GEMINI_API_KEY}`;
    const prompt = buildPrompt(type);
    const requestBody = {
        contents: [
            {
                role: "user",
                parts: [
                    { text: prompt },
                    ...pages.map((page) => ({
                        inline_data: { mime_type: "image/jpeg", data: page.base64 },
                    })),
                ],
            },
        ],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA,
        },
    };

    console.log(`${LOG_PREFIX} extraction request -> model`, model);
    console.log(`${LOG_PREFIX} extraction request -> prompt`, prompt);
    console.log(`${LOG_PREFIX} extraction request -> pages`, pages.map((page, index) => ({
        index,
        base64Length: page.base64.length,
        approxKB: Math.round(page.base64.length / 1024),
    })));
    console.log(`${LOG_PREFIX} extraction request -> generationConfig`, requestBody.generationConfig);
    console.log(`${LOG_PREFIX} extraction request -> timeoutMs`, timeoutMs);

    const text = await callGeminiWithRetry({
        label: `extraction (${model})`,
        url,
        body: requestBody,
        timeoutMs,
    });

    if (!text) {
        return { status: "unavailable" };
    }

    let parsed: ExtractedPrescriptionData | null;

    try {
        parsed = parseExtraction(JSON.parse(text));
    } catch (error) {
        console.error(`${LOG_PREFIX} extraction response <- invalid JSON text`, error);
        return { status: "unavailable" };
    }

    console.log(`${LOG_PREFIX} extraction parsed ->`, parsed);

    return parsed ? { status: "success", data: parsed } : { status: "unavailable" };
}

export type BarcodeExtractionResult = { status: "success"; eanCode: string } | { status: "unavailable" };

export type MedicineNameExtractionResult = { status: "success"; name: string } | { status: "unavailable" };

const BARCODE_RESPONSE_SCHEMA = {
    type: "OBJECT",
    properties: {
        codigo_ean: { type: "STRING", nullable: true },
    },
};

const MEDICINE_NAME_RESPONSE_SCHEMA = {
    type: "OBJECT",
    properties: {
        nome: { type: "STRING", nullable: true },
    },
};

const BARCODE_PROMPT =
    "Atue como um leitor de código de barras. Esta imagem mostra o código de barras (EAN) impresso na caixa " +
    "de um medicamento. Leia o número impresso em texto logo abaixo ou ao lado das barras e retorne apenas os " +
    "dígitos desse código em JSON. Se não for possível ler o número com confiança, retorne null.";

const MEDICINE_NAME_PROMPT =
    "Atue como um assistente de identificação de medicamentos. Esta imagem mostra a caixa de um medicamento. " +
    "Leia o nome comercial do medicamento impresso na caixa (ignore fabricante, dosagem, código de barras e " +
    "outras informações) e retorne em JSON. Se não for possível identificar o nome com confiança, retorne null.";

async function callMedicineGemini(label: string, prompt: string, schema: object, base64: string): Promise<string | null> {
    if (!GEMINI_API_KEY) {
        console.warn(`${LOG_PREFIX} ${label} skipped -> GEMINI_API_KEY is not configured`);
        return null;
    }

    const url = `${buildEndpoint(MEDICINE_MODEL)}?key=${GEMINI_API_KEY}`;
    const requestBody = {
        contents: [
            {
                role: "user",
                parts: [{ text: prompt }, { inline_data: { mime_type: "image/jpeg", data: base64 } }],
            },
        ],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    };

    return callGeminiWithRetry({
        label: `${label} (${MEDICINE_MODEL})`,
        url,
        body: requestBody,
        timeoutMs: MEDICINE_TIMEOUT_MS,
    });
}

export async function extractBarcodeValue(base64: string): Promise<BarcodeExtractionResult> {
    const text = await callMedicineGemini("barcode extraction", BARCODE_PROMPT, BARCODE_RESPONSE_SCHEMA, base64);

    if (!text) {
        return { status: "unavailable" };
    }

    let parsed: unknown;

    try {
        parsed = JSON.parse(text);
    } catch (error) {
        console.error(`${LOG_PREFIX} barcode extraction response <- invalid JSON text`, error);
        return { status: "unavailable" };
    }

    const eanCode = isRecord(parsed) && typeof parsed.codigo_ean === "string" ? parsed.codigo_ean.trim() : null;

    return eanCode && EAN_PATTERN.test(eanCode) ? { status: "success", eanCode } : { status: "unavailable" };
}

export async function extractMedicineName(base64: string): Promise<MedicineNameExtractionResult> {
    const text = await callMedicineGemini("medicine name extraction", MEDICINE_NAME_PROMPT, MEDICINE_NAME_RESPONSE_SCHEMA, base64);

    if (!text) {
        return { status: "unavailable" };
    }

    let parsed: unknown;

    try {
        parsed = JSON.parse(text);
    } catch (error) {
        console.error(`${LOG_PREFIX} medicine name extraction response <- invalid JSON text`, error);
        return { status: "unavailable" };
    }

    const name = isRecord(parsed) && typeof parsed.nome === "string" ? parsed.nome.trim() : null;

    return name ? { status: "success", name } : { status: "unavailable" };
}
