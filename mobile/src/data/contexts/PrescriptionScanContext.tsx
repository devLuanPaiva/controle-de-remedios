import {
    PropsWithChildren,
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

import { uploadImagesSequentially } from "@/data/services/upload.service";
import { ExtractionResult, PrescriptionType, extractPrescriptionData } from "@/data/services/gemini.service";

export interface CapturedPage {
    id: string;
    localUri: string;
    base64: string;
}

interface PrescriptionScanContextType {
    prescriptionType: PrescriptionType | null;
    pages: CapturedPage[];
    isProcessing: boolean;
    uploadProgressLabel: string | null;
    uploadedImageUrls: string[] | null;
    extraction: ExtractionResult | null;
    processError: string | null;
    setPrescriptionType: (type: PrescriptionType) => void;
    addPage: (page: CapturedPage) => void;
    removePage: (id: string) => void;
    reset: () => void;
    processAndContinue: () => Promise<boolean>;
}

const PrescriptionScanContext = createContext<PrescriptionScanContextType | null>(null);

export function PrescriptionScanProvider({ children }: Readonly<PropsWithChildren>) {
    const [prescriptionType, setPrescriptionType] = useState<PrescriptionType | null>(null);
    const [pages, setPages] = useState<CapturedPage[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadProgressLabel, setUploadProgressLabel] = useState<string | null>(null);
    const [uploadedImageUrls, setUploadedImageUrls] = useState<string[] | null>(null);
    const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
    const [processError, setProcessError] = useState<string | null>(null);

    const addPage = useCallback((page: CapturedPage) => {
        setPages((current) => [...current, page]);
    }, []);

    const removePage = useCallback((id: string) => {
        setPages((current) => current.filter((page) => page.id !== id));
    }, []);

    const reset = useCallback(() => {
        setPrescriptionType(null);
        setPages([]);
        setIsProcessing(false);
        setUploadProgressLabel(null);
        setUploadedImageUrls(null);
        setExtraction(null);
        setProcessError(null);
    }, []);

    const processAndContinue = useCallback(async (): Promise<boolean> => {
        if (!prescriptionType || pages.length === 0) {
            setProcessError("Selecione o tipo de receita e tire ao menos uma foto.");
            return false;
        }

        setIsProcessing(true);
        setProcessError(null);
        setUploadProgressLabel(`Enviando imagem 1 de ${pages.length}...`);

        const uploadTask = uploadImagesSequentially(
            pages.map((page) => page.localUri),
            "PRESCRIPTION",
            (completed, total) => setUploadProgressLabel(`Enviando imagem ${completed} de ${total}...`),
        );

        const extractionTask = extractPrescriptionData(
            pages.map((page) => ({ base64: page.base64 })),
            prescriptionType,
        );

        const [uploadResult, extractionResult] = await Promise.allSettled([uploadTask, extractionTask]);

        setIsProcessing(false);
        setUploadProgressLabel(null);

        if (uploadResult.status === "rejected") {
            setProcessError("Não foi possível enviar as imagens. Tente novamente.");
            return false;
        }

        setUploadedImageUrls(uploadResult.value);
        setExtraction(extractionResult.status === "fulfilled" ? extractionResult.value : { status: "unavailable" });

        return true;
    }, [prescriptionType, pages]);

    const contextValue = useMemo(
        () => ({
            prescriptionType,
            pages,
            isProcessing,
            uploadProgressLabel,
            uploadedImageUrls,
            extraction,
            processError,
            setPrescriptionType,
            addPage,
            removePage,
            reset,
            processAndContinue,
        }),
        [
            prescriptionType,
            pages,
            isProcessing,
            uploadProgressLabel,
            uploadedImageUrls,
            extraction,
            processError,
            addPage,
            removePage,
            reset,
            processAndContinue,
        ],
    );

    return (
        <PrescriptionScanContext.Provider value={contextValue}>
            {children}
        </PrescriptionScanContext.Provider>
    );
}

export function usePrescriptionScan(): PrescriptionScanContextType {
    const context = useContext(PrescriptionScanContext);

    if (!context) {
        throw new Error("usePrescriptionScan deve ser usado dentro de um PrescriptionScanProvider.");
    }

    return context;
}
