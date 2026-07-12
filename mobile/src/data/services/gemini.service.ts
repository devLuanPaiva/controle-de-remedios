import { GEMINI_API_KEY } from "@/lib/env";

const GEMINI_MODEL = "gemini-flash-latest";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const REQUEST_TIMEOUT_MS = 25_000;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type PrescriptionType = "DIGITAL" | "HANDWRITTEN";

export interface ExtractedMedication {
    name: string;
    quantity: string | null;
    usage: string | null;
    duration: string | null;
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
    quantidade?: unknown;
    uso?: unknown;
    duracao?: unknown;
}

interface RawExtraction {
    paciente?: unknown;
    data_emissao?: unknown;
    medicamentos?: unknown;
}

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
                    quantidade: { type: "STRING", nullable: true },
                    uso: { type: "STRING", nullable: true },
                    duracao: { type: "STRING", nullable: true },
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
    "   - quantidade: a quantidade total prescrita (ex: 60 comprimidos).\n" +
    "   - uso: a forma ou frequência de uso (ex: 1 comprimido a cada 8 horas, via oral).\n" +
    "   - duracao: o tempo de tratamento (ex: durante 14 dias).\n" +
    "Caso um campo não seja identificável, use null nesse campo (nunca invente valores).\n\n";

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

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
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
        name: medication.nome.trim(),
        quantity: typeof medication.quantidade === "string" ? medication.quantidade : null,
        usage: typeof medication.uso === "string" ? medication.uso : null,
        duration: typeof medication.duracao === "string" ? medication.duracao : null,
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
    if (!GEMINI_API_KEY || pages.length === 0) {
        return { status: "unavailable" };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: buildPrompt(type) },
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
            }),
        });

        if (!response.ok) {
            return { status: "unavailable" };
        }

        const body = await response.json();
        const text = body?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (typeof text !== "string") {
            return { status: "unavailable" };
        }

        const parsed = parseExtraction(JSON.parse(text));
        return parsed ? { status: "success", data: parsed } : { status: "unavailable" };
    } catch {
        return { status: "unavailable" };
    } finally {
        clearTimeout(timeout);
    }
}
